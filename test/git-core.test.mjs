import test from 'node:test'
import assert from 'node:assert/strict'
import {
  branchNameProblem,
  detachedLabel,
  firstLine,
  parseBranchList,
  parseGraph,
  parseLogCommits,
  parseRefs,
  publicState,
} from '../lib/git-core.js'

test('parseBranchList deduplicates, trims, sorts, and drops unsafe names', () => {
  const out = ['main', 'feat/a', 'main', '', 'bad branch', '-weird'].join('\n')
  assert.deepEqual(parseBranchList(out), ['feat/a', 'main'])
})

test('parseBranchList accepts CRLF output', () => {
  assert.deepEqual(parseBranchList('main\r\n  dev  \r\n\r\n'), ['dev', 'main'])
})

test('firstLine returns the first non-empty trimmed line', () => {
  assert.equal(firstLine('  \n  main  \n  dev\n'), '')
  assert.equal(firstLine('main\n'), 'main')
})

test('branchNameProblem validates the switch boundary', () => {
  assert.equal(branchNameProblem('main'), undefined)
  assert.equal(branchNameProblem('feat/ci-1'), undefined)
  assert.equal(branchNameProblem('HEAD'), 'HEAD is a detached checkout, not a branch')
  assert.equal(branchNameProblem('-main'), 'branch name must not start with a dash')
  assert.equal(branchNameProblem('bad branch'), 'branch name contains whitespace or control characters')
  assert.equal(branchNameProblem('a'.repeat(256)), 'branch name must not exceed 255 characters')
  assert.equal(branchNameProblem(undefined), 'branch name must be a string')
})

test('detachedLabel renders a stable detached label', () => {
  assert.equal(detachedLabel('a1b2c3d'), 'detached (a1b2c3d)')
  assert.equal(detachedLabel(''), 'detached')
})

test('parseGraph trims trailing blanks, caps lines, and reports truncation', () => {
  assert.deepEqual(parseGraph('* a\n* b\n\n\n', 100), { lines: ['* a', '* b'], truncated: false })
  assert.deepEqual(parseGraph('* 1\n* 2\n* 3', 2), { lines: ['* 1', '* 2'], truncated: true })
  assert.deepEqual(parseGraph(undefined, 5), { lines: [], truncated: false })
  assert.deepEqual(parseGraph('* a\r\n* b\r\n\r\n', 100), { lines: ['* a', '* b'], truncated: false })
})

test('publicState projects probe results into the wire shape', () => {
  assert.deepEqual(publicState({ repo: false, cwd: 'C:\work', branch: null, dirty: false, detached: false, branches: [] }), {
    repo: false,
    cwd: 'C:\work',
    branch: null,
    detached: false,
    dirty: false,
    branches: [],
  })
  assert.deepEqual(
    publicState({ repo: true, cwd: '/repo', branch: 'main', dirty: true, detached: false, branches: ['dev', 'main'] }),
    { repo: true, cwd: '/repo', branch: 'main', detached: false, dirty: true, branches: ['dev', 'main'] },
  )
  assert.equal(publicState({ repo: true, cwd: '/repo', branch: 'detached (abc)', dirty: false, detached: true, branches: [] }).detached, true)
})

test('parseRefs parses HEAD, branches, tags and dedupes', () => {
  assert.deepEqual(parseRefs('HEAD -> main, origin/main, tag: v1.0, HEAD'), [
    { type: 'head', name: 'main' },
    { type: 'branch', name: 'origin/main' },
    { type: 'tag', name: 'v1.0' },
    { type: 'HEAD', name: 'HEAD' },
  ])
  assert.deepEqual(parseRefs(''), [])
  assert.deepEqual(parseRefs(undefined), [])
})

test('parseLogCommits parses unit-separated log rows into commit objects', () => {
  const SEP = String.fromCharCode(31) // \x1f field separator
  const out = [
    SEP + 'a'.repeat(40) + SEP + 'ab' + SEP + 'parent1 parent2' + SEP + 'Alice' + SEP + '2026-08-17T10:00:00+08:00' + SEP + 'HEAD -> main' + SEP + 'first commit',
    SEP + 'b'.repeat(40) + SEP + 'bc' + SEP + '' + SEP + 'Bob' + SEP + '2026-08-16T09:00:00Z' + SEP + '' + SEP + 'second commit',
    '',
  ].join('\n')
  const commits = parseLogCommits(out)
  assert.equal(commits.length, 2)
  assert.deepEqual(commits[0], {
    id: 'a'.repeat(40),
    hash: 'ab',
    parents: ['parent1', 'parent2'],
    author: 'Alice',
    date: '2026-08-17T10:00:00+08:00',
    refs: [{ type: 'head', name: 'main' }],
    subject: 'first commit',
  })
  assert.deepEqual(commits[1].parents, [])
  assert.equal(commits[1].refs.length, 0)
  assert.equal(commits[1].subject, 'second commit')
})
