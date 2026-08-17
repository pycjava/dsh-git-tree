/**
 * dsh-git-tree: show the git branch of the current DSH session and switch
 * branches by hand.
 *
 * Host half. The service resolves a session's working directory from its
 * immutable header (`session.header.cwd`), probes the enclosing git
 * repository with short-lived `git` child processes, and exposes two
 * surfaces:
 *
 *   - `ctx.gitTree` service (query/inspect/switch)
 *   - `/git-branch` loopback RPC channel for the browser half
 *   - `/git` human command (`/git status`, `/git switch <branch>`)
 *
 * All repository writes are explicit: the only mutating call is
 * `git switch` on a branch that was already present in `for-each-ref`.
 * There is no force flag, no stash, and no checkout of remote refs.
 *
 * @module dsh-git-tree
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { isAbsolute, resolve } from 'node:path'
import { Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import {
  branchNameProblem,
  detachedLabel,
  firstLine,
  parseBranchList,
  parseGraph,
  parseLogCommits,
  publicState,
} from './git-core.js'

const execFileAsync = promisify(execFile)

export const name = 'dsh-git-tree'

/** Plugin configuration; edited through this row's config in a patch layer. */

export const Config = z.object({
  /** The git executable. `git` is resolved through PATH by default. */
  gitPath: z.string().min(1).default('git'),
  /** Per-git-command timeout in milliseconds. */
  timeoutMs: z.number().step(1).min(100).default(8000),
  /** stdout/stderr buffer cap for one git command. */
  maxBuffer: z.number().step(1).min(1).default(4 * 1024 * 1024),
  /** How long a probe result stays fresh for the polling browser half. */
  cacheMs: z.number().step(1).min(0).default(3000),
})


/** Connection-RPC business failure in the wire shape the host expects. */
export function badRequest(message) {
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [] } } }
}

/** Whether a failed `git rev-parse` reads as "this directory is no repo". */
function isNotGitRepository(error) {
  const text = `${error?.stderr ?? ''} ${error?.message ?? ''}`.toLowerCase()
  return error?.code === 128 || text.includes('not a git repository') || text.includes('does not appear to be a git repository')
}

/**
 * Host-plane service: per-session git inspection plus explicit branch switch.
 */
export class GitTreeService extends Service {
  static inject = ['sessions']
  static Config = Config

  /** repo root (or cwd for non-repos) -> cached probe result. */
  cache = new Map()
  /** repo root -> in-flight switch chain (one checkout at a time per repo). */
  switchQueues = new Map()

  constructor(ctx, config) {
    super(ctx, 'gitTree')
    this.config = config
  }

  async [Service.init]() {
    // The browser half pulls state through a private loopback channel.
    // Profiles without a connection service never fire this injection and
    // the host half keeps working (the /git command stays available).
    this.ctx.inject(['connection'], (connCtx) => {
      connCtx.effect(
        () =>
          connCtx.connection.rpc.handle(
            '/git-branch',
            (endpoint, payload) => this.handleRpc(endpoint, payload),
            { authority: 'loopback' },
          ),
        'dsh-git-tree: /git-branch rpc channel',
      )
    })

    // Slash-command fallback for users who prefer the keyboard.
    this.ctx.inject(['commands'], (commandCtx) => {
      commandCtx.effect(
        () =>
          commandCtx.commands.register({
            name: 'git',
            description: 'show or switch the git branch of this session',
            input: { hint: '<status | branches | switch <branch>>' },
            recordInput: false,
            handler: (invocation) => this.handleCommand(invocation),
          }),
        'dsh-git-tree: /git command',
      )
    })

    this.ctx.logger.info('dsh-git-tree: git branch surface ready')
  }

  // ── RPC surface ──────────────────────────────────────────────────────────

  async handleRpc(endpoint, payload) {
    try {
      if (endpoint === 'state') {
        return { ok: true, value: await this.publicStateFor(payload?.sessionId, payload?.force === true) }
      }
      if (endpoint === 'switch') {
        const problem = branchNameProblem(payload?.branch)
        if (problem !== undefined) return badRequest(`invalid branch: ${problem}`)
        return {
          ok: true,
          value: await this.switchFor(payload?.sessionId, payload.branch),
        }
      }
      if (endpoint === 'graph') {
        const count = Number.isFinite(payload?.count) ? Math.floor(payload.count) : 100
        if (count < 1 || count > 500) return badRequest('graph count must be between 1 and 500')
        return {
          ok: true,
          value: await this.graphFor(payload?.sessionId, { count, all: payload?.all !== false }),
        }
      }
      return badRequest(`unknown endpoint ${endpoint}`)
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : String(error))
    }
  }

  // ── /git command surface ─────────────────────────────────────────────────

  async handleCommand(invocation) {
    const session = invocation?.agent?.session
    if (session === undefined) {
      return { kind: 'error', text: '/git is only available inside a session' }
    }

    const raw = String(invocation?.rawInput ?? '').trim()
    const parts = raw === '' ? ['status'] : raw.split(/\s+/)
    const [verb, ...rest] = parts

    if (verb === 'status' || verb === 'branches') {
      try {
        const state = await this.publicStateFor(session.id, true)
        if (!state.repo) return { kind: 'error', text: `No git repository at ${state.cwd ?? 'the session cwd'}.` }
        if (verb === 'branches') {
          return { kind: 'success', text: state.branches.join('\n') || '(no local branches)' }
        }
        const dirty = state.dirty ? ' (dirty)' : ''
        const branch = state.detached ? `detached (${state.branch ?? 'unknown'})` : (state.branch ?? 'unknown')
        return { kind: 'success', text: `${branch}${dirty}\n${state.cwd}` }
      } catch (error) {
        return { kind: 'error', text: error instanceof Error ? error.message : String(error) }
      }
    }

    if (verb === 'switch') {
      const branch = rest.join(' ').trim()
      const problem = branchNameProblem(branch)
      if (problem !== undefined) return { kind: 'error', text: `Invalid branch: ${problem}. Usage: /git switch <branch>` }
      try {
        const state = await this.switchFor(session.id, branch)
        return { kind: 'success', text: `Switched to ${state.branch} (${state.cwd})` }
      } catch (error) {
        return { kind: 'error', text: error instanceof Error ? error.message : String(error) }
      }
    }

    if (verb === 'graph') {
      let count = 100
      let all = true
      for (const token of rest) {
        if (token === '--no-all') {
          all = false
        } else if (/^[0-9]+$/.test(token)) {
          count = Number.parseInt(token, 10)
        } else {
          return { kind: 'error', text: 'Usage: /git graph [count] [--no-all]' }
        }
      }
      if (count < 1 || count > 500) return { kind: 'error', text: 'graph count must be between 1 and 500' }
      try {
        const value = await this.graphFor(session.id, { count, all })
        const tail = value.truncated ? '\n… (truncated to ' + value.count + ' commits)' : ''
        return { kind: 'success', text: value.lines.join('\n') + tail }
      } catch (error) {
        return { kind: 'error', text: error instanceof Error ? error.message : String(error) }
      }
    }

    return { kind: 'error', text: 'Usage: /git status | /git branches | /git switch <branch> | /git graph [count] [--no-all]' }
  }

  // ── public service face ──────────────────────────────────────────────────

  /** Resolve the directory a session works in. */
  resolveCwd(sessionId) {
    if (typeof sessionId === 'string' && sessionId !== '') {
      const session = this.ctx.sessions.get(sessionId)
      if (session === undefined) throw new Error(`unknown session "${sessionId}"`)
      const cwd = session.header?.cwd
      if (typeof cwd === 'string' && cwd !== '') return cwd
      throw new Error(`session "${sessionId}" carries no cwd`)
    }
    return process.cwd()
  }

  /** Public state for one session id (the browser's polling payload). */
  async publicStateFor(sessionId, force = false) {
    const cwd = this.resolveCwd(sessionId)
    return publicState(await this.inspect(cwd, { force }))
  }

  /** Render the commit graph of a session's repository.
   * Returns `{ cwd, all, count, lines, truncated, commits }` for the RPC and
   * browser: `lines` is the ASCII `--graph` view (used by the text command)
   * and `commits` is structured per-commit data the browser lays out as a
   * node-and-edge graph. The commands never walk more than 500 commits;
   * callers clamp beforehand.
   */
  async graphFor(sessionId, { count = 100, all = true } = {}) {
    const cwd = this.resolveCwd(sessionId)
    const root = await this.discoverRoot(cwd)
    if (root === undefined) throw new Error(`no git repository at ${cwd}`)

    const safeCount = Math.max(1, Math.min(500, Math.floor(Number.isFinite(count) ? count : 100)))
    const scope = all === true ? ['--all'] : []

    const ascii = await this.runGit(
      ['-C', root, 'log', '--graph', '--oneline', '--decorate', '--no-color', ...scope, `--max-count=${safeCount}`],
      root,
    )
    const parsed = parseGraph(ascii, safeCount)

    const structured = await this.runGit(
      [
        '-C', root, 'log', '--topo-order', ...scope, `--max-count=${safeCount}`,
        '--format=%x1f%H%x1f%h%x1f%P%x1f%an%x1f%aI%x1f%D%x1f%s',
      ],
      root,
    )

    return {
      cwd: root,
      all: all === true,
      count: safeCount,
      lines: parsed.lines,
      truncated: parsed.truncated,
      commits: parseLogCommits(structured),
    }
  }

  /** Explicitly switch a session's repository to a local branch. */
  async switchFor(sessionId, branch) {
    const cwd = this.resolveCwd(sessionId)
    const root = await this.discoverRoot(cwd)
    if (root === undefined) throw new Error(`no git repository at ${cwd}`)

    const before = await this.inspect(cwd, { force: true })
    if (!before.branches.includes(branch)) {
      throw new Error(`branch "${branch}" does not exist in ${root}`)
    }
    if (before.branch === branch && !before.detached) {
      return publicState(before)
    }

    const prior = this.switchQueues.get(root) ?? Promise.resolve()
    const task = prior
      .catch(() => {})
      .then(async () => {
        await this.runGit(['-C', root, 'switch', '--quiet', '--', branch], root)
        this.invalidateRepo(root)
        return publicState(await this.inspect(root, { force: true }))
      })
    this.switchQueues.set(root, task)
    try {
      return await task
    } finally {
      if (this.switchQueues.get(root) === task) this.switchQueues.delete(root)
    }
  }


  // ── git probes ───────────────────────────────────────────────────────────

  async runGit(args, cwd) {
    const env = {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GIT_PAGER: 'cat',
      LANG: 'C',
      LC_ALL: 'C',
    }
    try {
      const { stdout } = await execFileAsync(this.config.gitPath, args, {
        cwd,
        env,
        encoding: 'utf8',
        timeout: this.config.timeoutMs,
        maxBuffer: this.config.maxBuffer,
        windowsHide: true,
      })
      return stdout
    } catch (error) {
      const stderr = typeof error?.stderr === 'string' ? error.stderr.trim() : ''
      const message = stderr !== '' ? stderr : error instanceof Error ? error.message : String(error)
      const wrapped = new Error(message)
      wrapped.code = error?.code
      wrapped.stderr = stderr
      throw wrapped
    }
  }

  /** Find the repository root above `cwd`, or undefined when there is none. */
  async discoverRoot(cwd) {
    const absolute = isAbsolute(cwd) ? cwd : resolve(cwd)
    try {
      const top = firstLine(await this.runGit(['-C', absolute, 'rev-parse', '--show-toplevel'], absolute))
      if (top === '') return undefined
      return isAbsolute(top) ? top : resolve(absolute, top)
    } catch (error) {
      if (isNotGitRepository(error)) return undefined
      throw error
    }
  }

  /** Probe one working directory, cache-coherent. */
  async inspect(cwd, { force = false } = {}) {
    const absolute = isAbsolute(cwd) ? cwd : resolve(cwd)
    const key = absolute
    if (!force) {
      const hit = this.cache.get(key)
      if (hit !== undefined && Date.now() - hit.at < this.config.cacheMs) return hit.state
    }

    const root = await this.discoverRoot(absolute)
    const state = root === undefined
      ? { repo: false, cwd: absolute, branches: [], dirty: false, detached: false, branch: null }
      : await this.probe(root)

    this.cache.set(key, { at: Date.now(), state })
    return state
  }

  /** Drop every cached probe whose repository is `root`. */
  invalidateRepo(root) {
    for (const [key, entry] of this.cache) {
      if (entry.state?.repo === true && entry.state.cwd === root) this.cache.delete(key)
    }
  }

  async probe(root) {
    let branch = null
    let detached = false

    try {
      branch = firstLine(await this.runGit(['-C', root, 'symbolic-ref', '--short', '-q', 'HEAD'], root)) || null
    } catch {
      detached = true
      try {
        branch = detachedLabel(firstLine(await this.runGit(['-C', root, 'rev-parse', '--short', 'HEAD'], root)))
      } catch {
        branch = detachedLabel('')
      }
    }

    const branches = parseBranchList(
      await this.runGit(['-C', root, 'for-each-ref', '--format=%(refname:short)', 'refs/heads'], root),
    )
    const status = await this.runGit(['-C', root, 'status', '--porcelain=v1', '--untracked-files=normal'], root)
    const dirty = status.trim().length > 0

    return { repo: true, cwd: root, branch, detached, branches, dirty }
  }
}

export default GitTreeService
