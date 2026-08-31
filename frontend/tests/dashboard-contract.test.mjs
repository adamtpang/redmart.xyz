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
  assert.match(dashboard, /31 Aug, 1:59 PM SGT/)
  assert.match(dashboard, /credible money/)
  assert.match(dashboard, /RM590/)
  assert.match(dashboard, /Accept RM190 and lock a pickup time/)
  assert.match(dashboard, /Amazon Echo is live at RM120/)
  assert.match(dashboard, /active listings/)
  assert.doesNotMatch(dashboard, /—/)
})

test('dashboard implements the Shapeable responsive and type fixes', () => {
  assert.match(dashboard, /font-ops/)
  assert.match(dashboard, /Every item\. Nothing hidden\./)
  assert.doesNotMatch(dashboard, /<table/)
  assert.doesNotMatch(dashboard, /text-\[(?:9|10|11)px\]/)
  assert.match(dashboard, /min-h-\[76px\]/)
})

test('Red exposes an approval-driven sales operating model', () => {
  assert.match(dashboard, /Red works\. You decide\./)
  assert.match(dashboard, /red-marketplace-decisions-v1/)
  assert.match(dashboard, /Do the work automatically\. Escalate the decisions\./)
  assert.match(dashboard, /72 hours with no buyer signal and at least 25 clicks/)
  assert.match(dashboard, /Amazon Echo price is live at RM120/)
  assert.match(dashboard, /14 \/ 14/)
  assert.match(dashboard, /Monitoring schedule/)
})

test('homepage links to the dashboard and the former route redirects', () => {
  assert.match(homepage, /href="\/dashboard"/)
  assert.match(marketplaceRedirect, /destination: '\/dashboard'/)
})
