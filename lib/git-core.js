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
