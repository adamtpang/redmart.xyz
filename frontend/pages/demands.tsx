import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Demand {
  id: string
  item: string
  description: string
  votes: number
  submittedBy: string
  createdAt: string
  status: 'open' | 'sourcing' | 'fulfilled'
}

const SEED_DEMANDS: Demand[] = [
  { id: '1', item: 'Sunscreen SPF 50+', description: 'Need reef-safe sunscreen, hard to find locally', votes: 12, submittedBy: 'NS Resident', createdAt: '2026-03-27', status: 'sourcing' },
  { id: '2', item: 'USB-C Hub', description: 'Need a good multi-port hub for my laptop', votes: 8, submittedBy: 'NS Resident', createdAt: '2026-03-27', status: 'open' },
  { id: '3', item: 'Oat Milk', description: 'Barista edition oat milk for coffee', votes: 15, submittedBy: 'NS Resident', createdAt: '2026-03-26', status: 'open' },
  { id: '4', item: 'Yoga Mat', description: 'Good quality, non-slip yoga mat', votes: 6, submittedBy: 'NS Resident', createdAt: '2026-03-26', status: 'fulfilled' },
  { id: '5', item: 'PUR Gum', description: 'Aspartame-free gum, any flavor', votes: 4, submittedBy: 'NS Resident', createdAt: '2026-03-28', status: 'open' },
]

const STATUS_STYLES = {
  open: 'bg-accent-dim text-accent-light border-accent/20',
  sourcing: 'bg-gold-dim text-gold border-gold/20',
  fulfilled: 'bg-emerald-900/20 text-emerald-400 border-emerald-400/20',
}

const STATUS_LABELS = {
  open: 'Wanted',
  sourcing: 'Red is on it',
  fulfilled: 'Got it',
}

function getVoterId(): string {
  let id = localStorage.getItem('red-voter-id')
  if (!id) {
    id = `v-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('red-voter-id', id)
  }
  return id
}

function getVotedSet(): Set<string> {
  try {
    const raw = localStorage.getItem('red-voted')
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveVoted(voted: Set<string>) {
  localStorage.setItem('red-voted', JSON.stringify(Array.from(voted)))
}

export default function DemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    setVoted(getVotedSet())
    const stored = localStorage.getItem('red-demands')
    if (stored) {
      setDemands(JSON.parse(stored))
    } else {
      setDemands(SEED_DEMANDS)
      localStorage.setItem('red-demands', JSON.stringify(SEED_DEMANDS))
    }
  }, [])

  function saveDemands(updated: Demand[]) {
    setDemands(updated)
    localStorage.setItem('red-demands', JSON.stringify(updated))
  }

  function handleVote(id: string) {
    if (voted.has(id)) return // already voted
    const updated = demands.map(d =>
      d.id === id ? { ...d, votes: d.votes + 1 } : d
    )
    saveDemands(updated)
    const newVoted = new Set(voted)
    newVoted.add(id)
    setVoted(newVoted)
    saveVoted(newVoted)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newItem.trim()) return

    const newDemand: Demand = {
      id: `d-${Date.now()}`,
      item: newItem.trim(),
      description: newDesc.trim(),
      votes: 1,
      submittedBy: 'You',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'open',
    }

    saveDemands([newDemand, ...demands])
    setNewItem('')
    setNewDesc('')
    setShowForm(false)
  }

  const sorted = [...demands].sort((a, b) => b.votes - a.votes)
  const openCount = demands.filter(d => d.status === 'open').length
  const sourcingCount = demands.filter(d => d.status === 'sourcing').length

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary font-body">
      {/* Nav */}
      <nav className="border-b border-border px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-accent shadow-md shadow-black/30 flex-shrink-0">
            <img src="/red.jpg" alt="Red" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="font-display text-base font-bold text-white">R</span></div>' }} />
          </div>
          <span className="font-display text-lg font-semibold tracking-wide">RedMart</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Home</Link>
          <Link href="/sell" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Sell</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-wide">Demand Board</h1>
          <p className="text-xs text-text-tertiary mt-1">What NS needs. Red is listening.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-white text-sm font-display font-semibold px-4 py-2 rounded-xl hover:bg-accent-light transition-colors"
        >
          + Request
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 flex gap-4">
        <div className="bg-surface-1 border border-border rounded-xl px-4 py-3 flex-1">
          <p className="text-2xl font-display font-bold text-accent-light">{openCount}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Items wanted</p>
        </div>
        <div className="bg-surface-1 border border-border rounded-xl px-4 py-3 flex-1">
          <p className="text-2xl font-display font-bold text-gold">{sourcingCount}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Being sourced</p>
        </div>
        <div className="bg-surface-1 border border-border rounded-xl px-4 py-3 flex-1">
          <p className="text-2xl font-display font-bold text-text-primary">{demands.length}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Total requests</p>
        </div>
      </div>

      {/* Submit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="px-5 pb-4 space-y-3">
              <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="What do you need? (e.g. Reef-safe sunscreen)"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Any details? (optional)"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-light transition-colors"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-text-tertiary hover:text-text-secondary px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demand list */}
      <div className="px-5 space-y-2 pb-8">
        {sorted.map((demand, i) => (
          <motion.div
            key={demand.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="bg-surface-1 border border-border rounded-xl p-4 flex items-start gap-4"
          >
            {/* Vote button */}
            <button
              onClick={() => handleVote(demand.id)}
              disabled={voted.has(demand.id)}
              className={`flex flex-col items-center gap-0.5 min-w-[40px] group ${voted.has(demand.id) ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <svg width="16" height="10" viewBox="0 0 16 10" className={`transition-colors ${voted.has(demand.id) ? 'text-accent-light' : 'text-text-tertiary group-hover:text-accent-light'}`}>
                <path d="M8 0L15 10H1L8 0Z" fill="currentColor" />
              </svg>
              <span className={`text-sm font-semibold transition-colors ${voted.has(demand.id) ? 'text-accent-light' : 'text-text-secondary group-hover:text-accent-light'}`}>
                {demand.votes}
              </span>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-text-primary">{demand.item}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[demand.status]}`}>
                  {STATUS_LABELS[demand.status]}
                </span>
              </div>
              {demand.description && (
                <p className="text-xs text-text-tertiary mt-1">{demand.description}</p>
              )}
              <p className="text-[10px] text-text-tertiary mt-1.5">
                {demand.submittedBy} &middot; {demand.createdAt}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Back to Red */}
      <div className="fixed bottom-4 right-4">
        <Link
          href="/"
          className="bg-accent text-white text-sm font-display font-semibold pl-3 pr-4 py-2.5 rounded-full shadow-lg shadow-black/40 hover:bg-accent-light transition-colors flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
            <img src="/red.jpg" alt="Red" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-xs font-bold">R</span></div>' }} />
          </div>
          Ask Red
        </Link>
      </div>
    </div>
  )
}
