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

test('dashboard carries the latest sales brief and pricing decision', () => {
  assert.match(dashboard, /30 Aug, 7:46 PM SGT/)
  assert.match(dashboard, /Credible money/)
  assert.match(dashboard, /RM590/)
  assert.match(dashboard, /Murtaza offered the full RM190/)
  assert.match(dashboard, /Amazon Echo: RM130 to RM120/)
  assert.match(dashboard, /14 active/)
  assert.doesNotMatch(dashboard, /—/)
})

test('homepage links to the dashboard and the former route redirects', () => {
  assert.match(homepage, /href="\/dashboard"/)
  assert.match(marketplaceRedirect, /destination: '\/dashboard'/)
})
