import test from 'node:test'
import assert from 'node:assert/strict'
import { envelopeFetch } from '../lib/index.js'

/** Build one POST Request carrying the given body to a git-branch route. */
function post(body) {
  return new Request('http://x/api/git-branch/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

test('envelopeFetch echoes a client-request envelope as a server-response', async () => {
  const handler = envelopeFetch(async (payload) => ({ ok: true, value: { echoed: payload } }))
  const response = await handler(
    post({ type: 'client-request', rpcId: 'r1', method: 'git-branch/state', payload: { sessionId: 's1' } }),
  )
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    type: 'server-response',
    rpcId: 'r1',
    result: { ok: true, value: { echoed: { sessionId: 's1' } } },
  })
})

test('envelopeFetch answers a non-envelope body with a bad-request result', async () => {
  const handler = envelopeFetch(async () => ({ ok: true, value: null }))
  const body = await (await handler(post({ hello: 1 }))).json()
  assert.equal(body.rpcId, 'invalid-request')
  assert.equal(body.result.ok, false)
  assert.equal(body.result.error.code, 'bad-request')
})

test('envelopeFetch rejects a non-JSON body with HTTP 400', async () => {
  const handler = envelopeFetch(async () => ({ ok: true, value: null }))
  assert.equal((await handler(post('not json'))).status, 400)
})

test('envelopeFetch maps a thrown handler to HTTP 500', async () => {
  const handler = envelopeFetch(async () => { throw new Error('kaput') })
  const response = await handler(
    post({ type: 'client-request', rpcId: 'r2', method: 'git-branch/state', payload: null }),
  )
  assert.equal(response.status, 500)
})
