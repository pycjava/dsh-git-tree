/**
 * Pure git-result helpers for dsh-git-tree. No harness imports and no child
 * processes here: these functions turn git stdout into the small state object
 * the host service and the browser consume, and keep branch-name validation
 * in one place. Pure modules like this one are the unit-test seam.
 *
 * @module dsh-git-tree/git-core
 */

/** A branch name that is safe to pass to `git switch` after an exact
 * membership check against `for-each-ref` output.
 *
 * Git accepts a wider character set than this, but branch pickers should not
 * need to express control characters, whitespace, or option-looking names.
 */


const BRANCH_NAME_RE = /^[^\u0000-\u0020\u007f][^\u0000-\u0020\u007f]{0,254}$/

/** Human-readable reason a branch name cannot be switched to. */
export function branchNameProblem(branch) {
  if (typeof branch !== 'string') return 'branch name must be a string'
  if (branch.length === 0) return 'branch name must not be empty'
  if (branch.length > 255) return 'branch name must not exceed 255 characters'
  if (branch === 'HEAD') return 'HEAD is a detached checkout, not a branch'
  if (branch.startsWith('-')) return 'branch name must not start with a dash'
  if (!BRANCH_NAME_RE.test(branch)) return 'branch name contains whitespace or control characters'
  return undefined
}

/** Split one `git for-each-ref` stdout into a deduplicated branch list.
 * @param stdout - raw stdout from `git for-each-ref --format=%(refname:short) refs/heads`.
 * @returns sorted branch names.
 */
export function parseBranchList(stdout) {
  const seen = new Set()
  const branches = []
  if (typeof stdout !== 'string') return branches
  for (const line of stdout.split(/\r?\n/)) {
    const branch = line.trim()
    if (branch === '') continue
    if (branchNameProblem(branch) !== undefined) continue
    if (seen.has(branch)) continue
    seen.add(branch)
    branches.push(branch)
  }
  branches.sort((a, b) => a.localeCompare(b, 'en'))
  return branches
}

/** First non-empty trimmed line of a git stdout blob. */
export function firstLine(stdout) {
  if (typeof stdout !== 'string') return ''
  const line = stdout.split(/\r?\n/, 1)[0] ?? ''
  return line.trim()
}

/** Display label for a detached HEAD: the short hash when available. */
export function detachedLabel(shortHash) {
  const hash = typeof shortHash === 'string' ? shortHash.trim() : ''
  return hash === '' ? 'detached' : `detached (${hash})`
}

/** Split `git log --graph` stdout into a capped, display-ready line list.
 * Trailing blank lines are dropped so the browser can render the graph
 * without a dead row at the bottom, and `truncated` reports when more
 * commits existed than we kept.
 * @param stdout - raw stdout from `git log --graph --oneline --decorate`.
 * @param maxLines - upper bound on kept lines (default 100).
 * @returns `{ lines, truncated }`.
 */
export function parseGraph(stdout, maxLines = 100) {
  const cap = Number.isFinite(maxLines) ? Math.max(1, Math.floor(maxLines)) : 100
  if (typeof stdout !== 'string') return { lines: [], truncated: false }
  const raw = stdout.split(/\r?\n/)
  while (raw.length > 0 && raw[raw.length - 1].trim() === '') raw.pop()
  return { lines: raw.slice(0, cap), truncated: raw.length > cap }
}

/** Parse the decoration part of `%D` into typed ref labels.
 * Handles `HEAD -> branch`, `branch`, `tag: name` and a bare `HEAD`.
 * @param decoration - raw `%D` output (may be empty).
 * @returns array of `{ type, name }`, deduplicated by name.
 */
export function parseRefs(decoration) {
  const refs = []
  const seen = new Set()
  if (typeof decoration !== 'string' || decoration.trim() === '') return refs
  const push = (type, name) => {
    if (name === '' || seen.has(name)) return
    seen.add(name)
    refs.push({ type, name })
  }
  for (const token of decoration.split(',')) {
    const t = token.trim()
    if (t === '') continue
    if (t === 'HEAD') {
      push('HEAD', 'HEAD')
      continue
    }
    if (t.startsWith('tag: ')) {
      push('tag', t.slice(5).trim())
      continue
    }
    const arrow = t.indexOf(' -> ')
    if (arrow !== -1) {
      const head = t.slice(0, arrow).trim()
      const target = t.slice(arrow + 4).trim()
      if (target !== 'HEAD') push('head', target)
      else if (head !== 'HEAD') push('head', head)
      continue
    }
    push('branch', t)
  }
  return refs
}

/** Parse the structured `git log` stdout (unit-separated fields) into
 * commit objects the browser can lay out as a graph.
 * Expected field order per line (separated by the unit separator \x1f):
 *   full-hash | short-hash | parents | author | author-date-iso | %D | subject
 * @param stdout - raw `git log --format=\x1f...` output.
 * @returns array of `{ id, hash, parents, author, date, refs, subject }`.
 */
export function parseLogCommits(stdout) {
  const commits = []
  if (typeof stdout !== 'string') return commits
  for (const line of stdout.split(/\r?\n/)) {
    if (line.trim() === '') continue
    const f = line.split('\x1f')
    if (f.length < 8) continue
    const id = f[1]?.trim() ?? ''
    if (id === '') continue
    const parents = (f[3]?.trim() ?? '') === '' ? [] : f[3].trim().split(/\s+/)
    commits.push({
      id,
      hash: f[2]?.trim() ?? '',
      parents,
      author: f[4]?.trim() ?? '',
      date: f[5]?.trim() ?? '',
      refs: parseRefs(f[6] ?? ''),
      subject: (f[7] ?? '').trim(),
    })
  }
  return commits
}

/** Build the plain value object served over RPC and consumed by the client.
 * `inspected` is the result of the host's git probes; callers may overlay
 * `error` when a later operation fails.
 * @param inspected - raw probe result from GitTreeService.inspect.
 * @returns a JSON-safe public state value.
 */
export function publicState(inspected) {
  const repo = inspected?.repo === true
  return {
    repo,
    cwd: typeof inspected?.cwd === 'string' ? inspected.cwd : null,
    branch: repo && inspected.branch !== undefined ? inspected.branch : null,
    detached: repo && inspected.detached === true,
    dirty: repo && inspected.dirty === true,
    branches: Array.isArray(inspected?.branches) ? inspected.branches : [],
    ...(typeof inspected?.error === 'string' && inspected.error !== '' ? { error: inspected.error } : {}),
  }
}
