import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Head from 'next/head'

// ── SEO: canonical URL + Organization/WebSite JSON-LD ──────────────────────
// GPTBot and other crawlers fetch raw HTML with no JS execution, so this
// metadata has to be present in the server-rendered markup (next/head is
// fine here since these pages are statically prerendered, not client-only).

const SITE_URL = 'https://redmart.xyz'

const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'RedMart',
      url: `${SITE_URL}/`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'RedMart',
      url: `${SITE_URL}/`,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

// ── Types ─────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Product {
  id: string
  name: string
  vendor: string
  price: string
  tag?: string
}

interface DemandItem {
  item: string
  votes: number
  status: 'open' | 'sourcing'
}

// ── Data ──────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: '1', name: 'Reef-Safe Sunscreen SPF 50+', vendor: 'NS Essentials', price: 'RM 45', tag: 'Popular' },
  { id: '2', name: 'Artisan Body Scrub', vendor: 'Local Maker', price: 'RM 35' },
  { id: '3', name: 'Metal Storage Containers', vendor: 'NS Hardware', price: 'RM 80', tag: 'New' },
  { id: '4', name: 'Homemade Banana Bread', vendor: 'NS Bake Sale', price: 'RM 15', tag: 'Fresh' },
  { id: '5', name: 'PUR Gum (Aspartame-Free)', vendor: 'Import Goods', price: 'RM 12' },
  { id: '6', name: 'Monitor Rental (Weekly)', vendor: 'NS Rentals', price: 'RM 50/wk' },
  { id: '7', name: 'Pet Rocks (Handpainted)', vendor: 'NS Crafts', price: 'RM 25', tag: 'Unique' },
  { id: '8', name: 'Bike Rental (Daily)', vendor: 'NS Rentals', price: 'RM 20/day' },
]

const TOP_DEMANDS: DemandItem[] = [
  { item: 'Oat Milk (Barista Edition)', votes: 15, status: 'open' },
  { item: 'Reef-Safe Sunscreen', votes: 12, status: 'sourcing' },
  { item: 'USB-C Hub', votes: 8, status: 'open' },
]

const QUICK_ACTIONS = [
  "What's available?",
  "I need sunscreen",
  "What's popular?",
  "Snacks nearby",
]

// ── Helpers ───────────────────────────────────────────────────────────────

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// ── Chat Widget ───────────────────────────────────────────────────────────

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{
    id: 'greeting',
    role: 'assistant',
    content: "I'm Red. I'm the guy who can get things. What do you need?",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, loading, open])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-red-chat', handler)
    return () => window.removeEventListener('open-red-chat', handler)
  }, [])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply }])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: `Having some trouble. ${err.message || 'Try again.'}` }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-light shadow-lg shadow-black/40 flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
          >
            <img src="/red.jpg" alt="Red" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="font-display text-xl font-bold text-white">R</span>' }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 md:bottom-5 md:right-5 z-50 w-full h-full md:w-[380px] md:h-[520px] md:max-h-[80vh] bg-surface-0 md:border md:border-border md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between bg-surface-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-accent flex-shrink-0">
                  <img src="/red.jpg" alt="Red" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="font-display text-base font-bold text-white">R</span></div>' }} />
                </div>
                <div>
                  <h3 className="text-sm font-display font-semibold text-text-primary">Red</h3>
                  <p className="text-[10px] text-gold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gold inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-text-primary text-lg leading-none px-1">&times;</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-surface-2 text-text-primary border border-border rounded-bl-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="whitespace-pre-wrap">{renderBold(msg.content)}</div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-accent-light/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent-light/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent-light/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 1 && !loading && (
              <div className="flex-shrink-0 px-3 pb-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((a) => (
                    <button key={a} onClick={() => sendMessage(a)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all font-body">
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border p-2.5">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell Red what you need..."
                  disabled={loading}
                  className="flex-1 bg-surface-1 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 disabled:opacity-50 font-body"
                />
                <button type="submit" disabled={loading || !input.trim()}
                  className="bg-accent text-white font-medium text-[13px] px-3.5 py-2 rounded-lg hover:bg-accent-light transition-colors disabled:opacity-30 font-body">
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Head>
        <link rel="canonical" href={`${SITE_URL}/`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
        />
      </Head>
      <div className="min-h-screen bg-surface-0 text-text-primary font-body">
      {/* Nav */}
      <nav className="border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-accent shadow-md shadow-black/30 flex-shrink-0">
            <img src="/red.jpg" alt="Red" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="font-display text-base font-bold text-white">R</span></div>' }} />
          </div>
          <span className="font-display text-lg font-semibold tracking-wide">RedMart</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/demands" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Demands
          </Link>
          <Link href="/sell" className="text-sm bg-accent/15 text-accent-light border border-accent/25 px-3 py-1 rounded-lg hover:bg-accent/25 transition-colors">
            Sell
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Red portrait */}
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-2 border-accent/30 shadow-xl shadow-black/40">
            <img src="/red.jpg" alt="Red" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center"><span class="font-display text-3xl font-bold text-white">R</span></div>' }} />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            You need it.<br />
            <span className="text-accent-light italic">Red can get it.</span>
          </h1>
          <p className="mt-4 text-text-secondary text-base max-w-lg mx-auto leading-relaxed">
            The community marketplace for Network State.
            Tell Red what you need. He&rsquo;ll find it.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-red-chat'))}
              className="bg-accent text-white font-display font-semibold text-sm px-7 py-3 rounded-xl hover:bg-accent-light transition-colors shadow-lg shadow-black/30"
            >
              Ask Red
            </button>
            <Link href="/demands"
              className="border border-border text-text-secondary font-display text-sm px-6 py-3 rounded-xl hover:text-text-primary hover:border-border-hover transition-colors"
            >
              View Demands
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="border-t border-border" />
      </div>

      {/* Products Grid */}
      <section className="px-5 py-10 max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl font-semibold">Available Now</h2>
          <span className="text-xs text-text-tertiary">{PRODUCTS.length} items from {new Set(PRODUCTS.map(p => p.vendor)).size} vendors</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-surface-1 border border-border rounded-xl p-4 hover:border-border-hover transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <h3 className="text-sm font-display font-medium text-text-primary leading-snug group-hover:text-white transition-colors">{p.name}</h3>
                {p.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-dim text-accent-light border border-accent/20 whitespace-nowrap flex-shrink-0">
                    {p.tag}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-tertiary">{p.vendor}</p>
              <p className="text-sm font-semibold text-gold mt-2">{p.price}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demand Signal */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="border-t border-border" />
      </div>
      <section className="px-5 py-10 max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Community Wants</h2>
            <p className="text-xs text-text-tertiary mt-1">Don&rsquo;t see what you need? Request it. Red is listening.</p>
          </div>
          <Link href="/demands" className="text-xs text-accent-light hover:underline">View all &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TOP_DEMANDS.map((d, i) => (
            <motion.div
              key={d.item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-surface-1 border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className="text-center min-w-[36px]">
                <svg width="14" height="8" viewBox="0 0 14 8" className="text-text-tertiary mx-auto mb-0.5">
                  <path d="M7 0L13 8H1L7 0Z" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold text-text-secondary">{d.votes}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-medium text-text-primary truncate">{d.item}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                  d.status === 'sourcing'
                    ? 'bg-gold/10 text-gold border-gold/20'
                    : 'bg-accent-dim text-accent-light border-accent/20'
                }`}>
                  {d.status === 'sourcing' ? 'Red is on it' : 'Wanted'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="border-t border-border" />
      </div>
      <section className="px-5 py-10 max-w-5xl mx-auto">
        <h2 className="font-display text-xl font-semibold mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl mb-2">1</div>
            <h3 className="font-display font-semibold text-sm mb-1">Tell Red</h3>
            <p className="text-xs text-text-tertiary leading-relaxed">Ask Red what you need. He searches the inventory and finds matches.</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">2</div>
            <h3 className="font-display font-semibold text-sm mb-1">Red finds it</h3>
            <p className="text-xs text-text-tertiary leading-relaxed">If it&rsquo;s in stock, Red connects you to the vendor. If not, he logs the demand.</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">3</div>
            <h3 className="font-display font-semibold text-sm mb-1">You get it</h3>
            <p className="text-xs text-text-tertiary leading-relaxed">Buy directly from the vendor. No middleman. No markup. Community commerce.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="font-display text-2xl font-bold mb-2">Got something to sell?</h2>
          <p className="text-text-secondary text-sm mb-6">List your goods for the NS community. No fees. No middleman.</p>
          <Link href="/sell" className="bg-accent text-white font-display font-semibold text-sm px-7 py-3 rounded-xl hover:bg-accent-light transition-colors shadow-lg shadow-black/30 inline-block">
            Start Selling
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-6 text-center">
        <p className="text-xs text-text-tertiary font-body">
          RedMart &mdash; Community commerce for Network State
        </p>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
      </div>
    </>
  )
}
