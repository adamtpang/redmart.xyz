import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(new URL('../pages/dashboard.tsx', import.meta.url), 'utf8')
const component = await readFile(new URL('../components/marketplace-dashboard.tsx', import.meta.url), 'utf8')
const data = await readFile(new URL('../lib/marketplace-data.ts', import.meta.url), 'utf8')
const dashboard = `${page}\n${component}\n${data}`
const homepage = await readFile(new URL('../pages/index.tsx', import.meta.url), 'utf8')
const globals = await readFile(new URL('../styles/globals.css', import.meta.url), 'utf8')
const marketplaceRedirect = await readFile(new URL('../pages/marketplace.tsx', import.meta.url), 'utf8')

test('dashboard exposes honest USD value from firm offers only', () => {
  assert.match(data, /myrPerUsd = 4\.0275/)
  assert.match(data, /onTableMyr: 190/)
  assert.match(data, /onTableMyr: 400/)
  assert.equal((data.match(/onTableMyr: 0/g) ?? []).length, 12)
  assert.match(component, /Everything else is pipeline, not cash\./)
  assert.match(component, /Cash now counts only a specific offer or agreed amount/)
  assert.match(component, /No firm offer/)
  assert.match(component, /BNM 28 Aug · USD1 = RM4\.0275/)
})

test('dashboard prepares ranked leads for approval and copy without a messaging request', () => {
  assert.match(component, /rankedActions\.map/)
  assert.match(component, /One decision at a time\./)
  assert.match(component, /Approve & copy to clipboard/)
  assert.match(component, /3 Paste in Helium/)
  assert.match(component, /It does not send a Facebook message/)
  assert.doesNotMatch(dashboard, /I reviewed the final recipient/)
  assert.doesNotMatch(dashboard, /fetch\(|axios|\/api\/.*send/i)
})

test('dashboard carries the latest sales brief and pricing decision', () => {
  assert.match(data, /31 Aug, 3:31 PM SGT/)
  assert.match(data, /Accept RM190 and lock a pickup time/)
  assert.match(component, /Echo is live at RM120/)
  assert.match(data, /Kartikan/)
  assert.match(data, /Hi Hamka, ya, cajon dan bundle perkusi masih ada/)
  assert.match(component, /Hourly monitor active/)
  assert.doesNotMatch(dashboard, /—/)
})

test('dashboard preserves the RedMart editorial identity and responsive safeguards', () => {
  assert.match(component, /font-ops/)
  assert.match(component, /font-display/)
  assert.match(component, /text-gold/)
  assert.match(component, /ready to close\./)
  assert.match(globals, /\.dashboard-theme[\s\S]*color-scheme: dark/)
  assert.doesNotMatch(globals, /\.dashboard-theme[\s\S]*radial-gradient/)
  assert.doesNotMatch(globals, /\.dashboard-theme[\s\S]*color-scheme: light/)
  assert.match(component, /Every item\. One honest number\./)
  assert.doesNotMatch(component, /<table/)
  assert.doesNotMatch(component, /text-\[(?:9|10|11)px\]/)
  assert.doesNotMatch(component, /min-h-11/)
  assert.match(component, /min-h-\[44px\]/)
  assert.match(component, /min-h-\[76px\]/)
  assert.match(component, /Open only what you need\./)
  assert.match(component, /<select/)
})

test('Red exposes a concise approval-driven operating model', () => {
  assert.match(component, /red-marketplace-decisions-v1/)
  assert.match(component, /Approval means copy, never send/)
  assert.match(component, /72 hours with no buyer signal and 25\+ clicks/)
  assert.match(component, /Every listing edit still requires exact approval/)
  assert.equal((data.match(/onTableMyr: \d+/g) ?? []).length, 14)
})

test('Tim inventory is complete, owner-scoped, and sorted by purchase price', () => {
  assert.equal((data.match(/purchaseMyr: \d+/g) ?? []).length, 59)
  assert.match(data, /timInventoryTotalMyr = 35706\.98/)
  assert.match(data, /timInventoryTotalUsd = 8864\.52/)
  assert.match(component, /sort\(\(a, b\) => b\.purchaseMyr - a\.purchaseMyr\)/)
  assert.match(component, /sort\(\(a, b\) => b\.asking - a\.asking\)/)
  assert.match(component, /Show all 59 Tim-owned items/)
  assert.match(component, /Historical purchase cost is context, not a resale recommendation/)
  assert.match(component, /58 need pricing/)
  assert.match(component, /Already listed/)
})

test('homepage links to the dashboard and the former route redirects', () => {
  assert.match(page, /marketplace-dashboard/)
  assert.match(homepage, /href="\/dashboard"/)
  assert.match(marketplaceRedirect, /destination: '\/dashboard'/)
})
