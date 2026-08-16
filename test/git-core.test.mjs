import test from 'node:test'
import assert from 'node:assert/strict'
import {
  branchNameProblem,
  detachedLabel,
  firstLine,
  parseBranchList,
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

test('publicState projects probe results into the wire shape', () => {
  assert.deepEqual(publicState({ repo: false, cwd: 'C:\\work', branch: null, dirty: false, detached: false, branches: [] }), {
    repo: false,
    cwd: 'C:\\work',
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
