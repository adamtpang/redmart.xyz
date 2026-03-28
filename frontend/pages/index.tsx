import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
  image: string
  tag?: string
}

interface DemandItem {
  item: string
  votes: number
  status: 'open' | 'sourcing'
}

// ── Data ──────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: '1', name: 'Reef-Safe Sunscreen SPF 50+', vendor: 'NS Essentials', price: 'RM 45', image: '☀️', tag: 'Popular' },
  { id: '2', name: 'Artisan Body Scrub', vendor: 'Local Maker', price: 'RM 35', image: '🧴' },
  { id: '3', name: 'Metal Storage Containers', vendor: 'NS Hardware', price: 'RM 80', image: '📦', tag: 'New' },
  { id: '4', name: 'Homemade Banana Bread', vendor: 'NS Bake Sale', price: 'RM 15', image: '🍞', tag: 'Fresh' },
  { id: '5', name: 'PUR Gum (Aspartame-Free)', vendor: 'Import Goods', price: 'RM 12', image: '🫧' },
  { id: '6', name: 'Monitor Rental (Weekly)', vendor: 'NS Rentals', price: 'RM 50/wk', image: '🖥️' },
  { id: '7', name: 'Pet Rocks (Handpainted)', vendor: 'NS Crafts', price: 'RM 25', image: '🪨', tag: 'Unique' },
  { id: '8', name: 'Bike Rental (Daily)', vendor: 'NS Rentals', price: 'RM 20/day', image: '🚲' },
]

const TOP_DEMANDS: DemandItem[] = [
  { item: 'Oat Milk (Barista Edition)', votes: 15, status: 'open' },
  { item: 'Reef-Safe Sunscreen', votes: 12, status: 'sourcing' },
  { item: 'USB-C Hub', votes: 8, status: 'open' },
]

const QUICK_ACTIONS = [
  "What do you have?",
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
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-light shadow-lg shadow-accent/30 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="font-display text-xl font-bold text-white">R</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 w-[360px] h-[500px] max-h-[80vh] bg-surface-0 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
                  <span className="font-display text-base font-bold text-white">R</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Red</h3>
                  <p className="text-[10px] text-gold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gold inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-text-primary text-lg leading-none">&times;</button>
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
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all">
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
                  className="flex-1 bg-surface-1 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 disabled:opacity-50"
                />
                <button type="submit" disabled={loading || !input.trim()}
                  className="bg-accent text-white font-medium text-[13px] px-3.5 py-2 rounded-lg hover:bg-accent-light transition-colors disabled:opacity-30">
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
    <div className="min-h-screen bg-surface-0 text-text-primary">
      {/* Nav */}
      <nav className="border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-md shadow-accent/20">
            <span className="font-display text-base font-bold text-white tracking-tight">R</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-wide">RedMart</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/demands" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Demand Board
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-12 pb-10 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl md:text-[42px] font-bold leading-tight tracking-tight">
            You need it.<br />
            <span className="text-accent-light">Red can get it.</span>
          </h1>
          <p className="mt-4 text-text-secondary text-base md:text-lg max-w-md mx-auto leading-relaxed">
            The AI-powered marketplace for Network State. Browse goods, request what's missing, and let Red find it for you.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const btn = document.querySelector('.fixed.bottom-5.right-5') as HTMLButtonElement
                if (btn) btn.click()
              }}
              className="bg-accent text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-accent-light transition-colors shadow-lg shadow-accent/20"
            >
              Ask Red
            </button>
            <Link href="/demands"
              className="border border-border text-text-secondary font-medium text-sm px-6 py-2.5 rounded-xl hover:text-text-primary hover:border-border-hover transition-colors"
            >
              View Demands
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="px-5 pb-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Available Now</h2>
          <span className="text-xs text-text-tertiary">{PRODUCTS.length} items</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="bg-surface-1 border border-border rounded-xl p-4 hover:border-border-hover transition-colors group cursor-pointer"
            >
              <div className="text-3xl mb-3">{p.image}</div>
              <div className="flex items-start justify-between gap-1">
                <h3 className="text-sm font-medium text-text-primary leading-snug group-hover:text-white transition-colors">{p.name}</h3>
                {p.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-dim text-accent-light border border-accent/20 whitespace-nowrap flex-shrink-0">
                    {p.tag}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-tertiary mt-1">{p.vendor}</p>
              <p className="text-sm font-semibold text-gold mt-2">{p.price}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demand Signal */}
      <section className="px-5 pb-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Community Wants</h2>
          <Link href="/demands" className="text-xs text-accent-light hover:underline">View all &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TOP_DEMANDS.map((d, i) => (
            <motion.div
              key={d.item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="bg-surface-1 border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className="text-center min-w-[36px]">
                <svg width="14" height="8" viewBox="0 0 14 8" className="text-text-tertiary mx-auto mb-0.5">
                  <path d="M7 0L13 8H1L7 0Z" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold text-text-secondary">{d.votes}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{d.item}</p>
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

      {/* Footer */}
      <footer className="border-t border-border px-5 py-6 text-center">
        <p className="text-xs text-text-tertiary">
          RedMart &mdash; AI-powered community commerce for Network State
        </p>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}
