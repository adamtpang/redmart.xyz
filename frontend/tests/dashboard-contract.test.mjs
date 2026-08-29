import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const dashboard = await readFile(new URL('../pages/dashboard.tsx', import.meta.url), 'utf8')
const homepage = await readFile(new URL('../pages/index.tsx', import.meta.url), 'utf8')
const marketplaceRedirect = await readFile(new URL('../pages/marketplace.tsx', import.meta.url), 'utf8')

test('dashboard requires review and prepares copy without a messaging request', () => {
  assert.match(dashboard, /I reviewed the final recipient, price, pickup location, and wording/)
  assert.match(dashboard, /Approve & copy reply/)
  assert.match(dashboard, /It does not send a Facebook message/)
  assert.doesNotMatch(dashboard, /fetch\(|axios|\/api\/.*send/i)
})

test('homepage links to the dashboard and the former route redirects', () => {
  assert.match(homepage, /href="\/dashboard"/)
  assert.match(marketplaceRedirect, /destination: '\/dashboard'/)
})
