import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const read = (relative) => readFile(path.join(root, relative), 'utf8')

test('homepage exposes canonical metadata, structured identity, and named chat controls', async () => {
  const source = await read('pages/index.tsx')
  assert.match(source, /<title>RedMart \| Community Marketplace<\/title>/)
  assert.match(source, /rel="canonical"/)
  assert.match(source, /application\/ld\+json/)
  assert.match(source, /aria-label="Open Red chat"/)
  assert.match(source, /aria-label="Close Red chat"/)
  assert.match(source, /htmlFor="red-chat-input"/)
  assert.match(source, /id="red-chat-input"/)
})

test('crawler guidance and discovery files publish canonical URLs', async () => {
  const [robots, sitemap, llms] = await Promise.all([
    read('public/robots.txt'),
    read('public/sitemap.xml'),
    read('public/llms.txt'),
  ])
  for (const bot of ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended']) {
    assert.match(robots, new RegExp(`User-agent: ${bot}`))
  }
  assert.match(robots, /Sitemap: https:\/\/redmart\.xyz\/sitemap\.xml/)
  assert.match(sitemap, /<loc>https:\/\/redmart\.xyz\/<\/loc>/)
  assert.match(llms, /https:\/\/redmart\.xyz\/privacy/)
  assert.match(llms, /does not advertise a public API or MCP service/i)
})

test('every public trust page exists and the document declares English', async () => {
  const [about, contact, privacy, document] = await Promise.all([
    read('pages/about.tsx'),
    read('pages/contact.tsx'),
    read('pages/privacy.tsx'),
    read('pages/_document.tsx'),
  ])
  assert.match(about, /About RedMart/)
  assert.match(contact, /Contact RedMart/)
  assert.match(privacy, /Privacy policy/)
  assert.match(document, /<Html lang="en">/)
})

test('security headers include enforced CSP and MIME sniffing protection', async () => {
  const require = createRequire(import.meta.url)
  const config = require(path.join(root, 'next.config.js'))
  const rules = await config.headers()
  const headers = Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]))
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/)
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/)
  assert.doesNotMatch(headers['Content-Security-Policy'], /\*/)
  assert.equal(headers['X-Content-Type-Options'], 'nosniff')
})
