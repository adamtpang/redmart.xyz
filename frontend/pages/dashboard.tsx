import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  DollarSign,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
} from 'lucide-react'

import { Badge } from '@/components/shadcn/badge'
import { Button, buttonVariants } from '@/components/shadcn/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog'
import { cn } from '@/lib/utils'

type QueueFilter = 'review' | 'ready' | 'monitoring'
type Confidence = 'High' | 'Medium'

interface MarketplaceAction {
  id: string
  buyer: string
  item: string
  asking: number
  offer?: number
  recommendation: string
  signal: string
  urgency: string
  confidence: Confidence
  reasoning: string[]
  draft: string
}

const ACTIONS: MarketplaceAction[] = [
  {
    id: 'ahmad-fender',
    buyer: 'Ahmad',
    item: 'Fender Champion 40 amplifier',
    asking: 490,
    offer: 400,
    recommendation: 'Counter at RM450 and ask for a pickup time',
    signal: 'Specific cash offer',
    urgency: 'Reply next',
    confidence: 'High',
    reasoning: [
      'A specific offer is stronger purchase intent than an availability check.',
      'RM450 preserves most of the current asking price while meeting the buyer halfway.',
      'Asking for a collection time turns price agreement into a concrete commitment.',
    ],
    draft: 'Hi Ahmad, thanks for the RM400 offer. I can meet you at RM450 if you can pick it up from Forest City Marina Hotel. What day and time works for you?',
  },
  {
    id: 'jerry-bass',
    buyer: 'Jerry',
    item: '6-string bass guitar',
    asking: 590,
    recommendation: 'Hold at RM590 and move directly to pickup',
    signal: 'Follow-up message: “Hello?”',
    urgency: 'Warm lead',
    confidence: 'High',
    reasoning: [
      'The buyer followed up without prompting, which is a strong urgency signal.',
      'No lower offer is on the table, so there is no reason to discount yet.',
      'A direct collection question is the shortest path to confirming the sale.',
    ],
    draft: 'Hi Jerry, yes, the 6-string bass is still available at RM590. Pickup is at Forest City Marina Hotel. If that works, what day and time can you collect it?',
  },
  {
    id: 'prasetyo-monitors',
    buyer: 'Prasetyo',
    item: 'M-Audio studio monitors',
    asking: 200,
    recommendation: 'Hold at RM200 and schedule collection',
    signal: 'Asked about two music listings',
    urgency: 'Cross-item lead',
    confidence: 'High',
    reasoning: [
      'Interest across two related listings suggests a serious music buyer.',
      'Fresh demand invalidates the planned price reduction on the monitors.',
      'A pickup question tests intent without introducing an unnecessary discount.',
    ],
    draft: 'Hi Prasetyo, the M-Audio monitors are still available at RM200. Pickup is at Forest City Marina Hotel. When would you like to collect them?',
  },
  {
    id: 'haiqal-cajon',
    buyer: 'Haiqal',
    item: 'Cajon percussion bundle',
    asking: 140,
    offer: 70,
    recommendation: 'Counter once at RM120',
    signal: 'Low but specific offer',
    urgency: 'Price-sensitive',
    confidence: 'Medium',
    reasoning: [
      'The RM70 offer is only half of the asking price, so accepting would give up too much value.',
      'RM120 is a meaningful concession while keeping the bundle above its liquidation floor.',
      'A clear one-time counter avoids a long negotiation with a low-intent buyer.',
    ],
    draft: 'Hi Haiqal, thanks for the offer. I can do RM120 for the full cajon percussion bundle if you can pick it up from Forest City Marina Hotel. Let me know what day and time works.',
  },
  {
    id: 'ravi-drums',
    buyer: 'Ravi',
    item: 'German-brand acoustic drum kit',
    asking: 590,
    recommendation: 'Hold at RM590 and qualify pickup logistics',
    signal: 'Recent inquiry on a high-value item',
    urgency: 'High-value lead',
    confidence: 'Medium',
    reasoning: [
      'The drum kit has multiple inquiries and strong listing traffic.',
      'There is no price objection yet, so discounting now would be premature.',
      'Confirming transport and collection timing reveals whether the buyer can complete the deal.',
    ],
    draft: 'Hi Ravi, the drum kit is still available at RM590. Pickup is at Forest City Marina Hotel, and you will need suitable transport for the full kit. What day and time are you thinking?',
  },
  {
    id: 'puskas-ukulele',
    buyer: 'Puskas',
    item: 'Ukulele',
    asking: 90,
    recommendation: 'Confirm the RM90 price is firm',
    signal: 'Asked whether the price is fixed',
    urgency: 'Quick decision',
    confidence: 'Medium',
    reasoning: [
      'The listing is already priced low relative to the rest of the inventory.',
      'A concise firm-price answer gives the buyer a clear decision without reopening negotiation.',
      'Adding the pickup point removes the next likely question and speeds up the handoff.',
    ],
    draft: 'Hi Puskas, yes, RM90 is the firm price. It is available for pickup at Forest City Marina Hotel. If you want it, what day and time can you collect?',
  },
]

const MONITORING = [
  { item: 'Arturia MiniLab', price: 'RM270', note: '28 clicks and no strong buyer signal. Review price after the current reply round.' },
  { item: 'Amazon Echo', price: 'RM130', note: 'Recently reduced from RM140. Give the new price time before changing it again.' },
  { item: '100-inch TV', price: 'RM10,000', note: '152 clicks, but it is Tim-owned. Hold until Tim approves any price move.' },
]

const FILTERS: { id: QueueFilter; label: string }[] = [
  { id: 'review', label: 'Needs review' },
  { id: 'ready', label: 'Ready to send' },
  { id: 'monitoring', label: 'Monitoring' },
]

function BrandMark() {
  return (
    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-light/30 bg-accent font-display text-base font-bold italic text-white shadow-md shadow-black/30">
      R
    </span>
  )
}

function formatMoney(value: number) {
  return `RM${value.toLocaleString('en-MY')}`
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<QueueFilter>('review')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [readyIds, setReadyIds] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const selected = useMemo(() => ACTIONS.find((action) => action.id === selectedId) ?? null, [selectedId])
  const visibleActions = filter === 'ready'
    ? ACTIONS.filter((action) => readyIds.includes(action.id))
    : ACTIONS.filter((action) => !readyIds.includes(action.id))
  const potentialValue = ACTIONS.reduce((sum, action) => sum + (action.offer ? Math.max(action.offer, action.asking) : action.asking), 0)

  function openReview(action: MarketplaceAction) {
    setSelectedId(action.id)
    setReviewed(false)
    setNotice(null)
  }

  function closeReview() {
    setSelectedId(null)
    setReviewed(false)
  }

  async function approveAndCopy() {
    if (!selected || !reviewed) return
    try {
      await navigator.clipboard.writeText(selected.draft)
      setReadyIds((current) => current.includes(selected.id) ? current : [...current, selected.id])
      setNotice(`Reply for ${selected.buyer} approved and copied. Open Facebook and press Send yourself.`)
      setSelectedId(null)
      setReviewed(false)
      setFilter('ready')
    } catch {
      setNotice('Clipboard access was blocked. The approved reply remains visible so you can copy it manually.')
      setReadyIds((current) => current.includes(selected.id) ? current : [...current, selected.id])
      setSelectedId(null)
      setReviewed(false)
      setFilter('ready')
    }
  }

  return (
    <>
      <Head>
        <title>Marketplace approval queue | RedMart</title>
        <meta name="description" content="Review Red's recommended Facebook Marketplace moves, reasoning, and copy-ready replies." />
      </Head>

      <div className="min-h-screen bg-surface-0 font-body text-text-primary">
        <nav aria-label="Marketplace workspace navigation" className="sticky top-0 z-40 border-b border-border bg-surface-0/90 px-5 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BrandMark />
              <span className="font-display text-lg font-semibold tracking-wide">RedMart</span>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden border-gold/20 bg-gold-dim text-gold sm:inline-flex">
                <ShieldCheck aria-hidden="true" /> Human approval required
              </Badge>
              <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-text-secondary')}>
                <ArrowLeft aria-hidden="true" /> Home
              </Link>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4 border border-accent-light/20 bg-accent-dim text-accent-light">
                <Sparkles aria-hidden="true" /> Red&apos;s next moves
              </Badge>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Marketplace approval queue</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                Red ranks the warmest buyers, explains the move, and prepares the exact reply. You review the final wording before anything is ready to leave your hands.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 px-4 py-3 text-xs text-text-secondary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-dim text-gold"><Clock3 aria-hidden="true" className="h-4 w-4" /></span>
              <div><span className="block font-semibold text-text-primary">Last reviewed</span>Live Marketplace snapshot · 29 Aug</div>
            </div>
          </div>

          <section aria-label="Marketplace overview" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Recommended now', value: ACTIONS.length.toString(), icon: Target, detail: 'Ranked by conversion likelihood' },
              { label: 'Value represented', value: formatMoney(potentialValue), icon: DollarSign, detail: 'Current asking-price exposure' },
              { label: 'Ready for you', value: readyIds.length.toString(), icon: Clipboard, detail: 'Approved, copied, not sent' },
              { label: 'Active listings', value: '14', icon: Store, detail: 'Current Facebook inventory' },
            ].map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.label} size="sm" className="border border-border bg-surface-1 ring-0">
                  <CardContent className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">{metric.label}</p>
                      <p className="mt-2 font-display text-2xl font-bold text-text-primary">{metric.value}</p>
                      <p className="mt-1 text-xs text-text-tertiary">{metric.detail}</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/20 bg-gold-dim text-gold"><Icon aria-hidden="true" className="h-4 w-4" /></span>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          {notice && (
            <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-900/15 p-4 text-sm text-emerald-300">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none" />
              <p>{notice}</p>
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section aria-labelledby="action-queue-heading">
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Decision workspace</p>
                  <h2 id="action-queue-heading" className="mt-1 font-display text-2xl font-semibold">Next best actions</h2>
                </div>
                <div className="flex rounded-lg border border-border bg-surface-1 p-1" role="tablist" aria-label="Approval queue filters">
                  {FILTERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={filter === item.id}
                      onClick={() => setFilter(item.id)}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        filter === item.id ? 'bg-accent text-white' : 'text-text-tertiary hover:text-text-primary'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {filter === 'monitoring' ? (
                <div className="mt-4 space-y-3">
                  {MONITORING.map((entry) => (
                    <Card key={entry.item} className="border border-border bg-surface-1 ring-0">
                      <CardHeader className="grid-cols-[1fr_auto]">
                        <div><CardTitle className="font-display">{entry.item}</CardTitle><CardDescription className="mt-1">{entry.note}</CardDescription></div>
                        <Badge variant="outline" className="border-border text-text-secondary">{entry.price}</Badge>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : visibleActions.length ? (
                <div className="mt-4 space-y-3">
                  {visibleActions.map((action, index) => {
                    const isReady = readyIds.includes(action.id)
                    return (
                      <Card key={action.id} className="border border-border bg-surface-1 ring-0 transition-colors hover:border-border-hover">
                        <CardHeader className="border-b border-border pb-4">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-gold/20 bg-gold-dim font-display text-sm font-bold text-gold">{index + 1}</span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <CardTitle className="font-display">{action.buyer} · {action.item}</CardTitle>
                                  <Badge variant={action.confidence === 'High' ? 'default' : 'secondary'} className={action.confidence === 'High' ? 'bg-accent text-white' : ''}>{action.confidence} confidence</Badge>
                                </div>
                                <CardDescription className="mt-1">{action.signal} · Asking {formatMoney(action.asking)}{action.offer ? ` · Offered ${formatMoney(action.offer)}` : ''}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-gold/20 bg-gold-dim text-gold">{action.urgency}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Red recommends</p>
                          <p className="mt-1 font-display text-lg font-semibold text-text-primary">{action.recommendation}</p>
                          <p className="mt-3 line-clamp-2 rounded-lg border border-border bg-surface-0/45 p-3 text-sm leading-relaxed text-text-secondary">“{action.draft}”</p>
                          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <span className="text-xs text-text-tertiary">{action.reasoning.length} evidence points ready for review</span>
                            <Button onClick={() => openReview(action)} variant={isReady ? 'outline' : 'default'}>
                              {isReady ? <Check aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />}
                              {isReady ? 'Review approved reply' : 'Review action'}
                              <ChevronRight aria-hidden="true" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-1/60 p-10 text-center">
                  <CheckCircle2 aria-hidden="true" className="mx-auto h-6 w-6 text-gold" />
                  <p className="mt-3 font-display text-lg font-semibold">Nothing in this queue</p>
                  <p className="mt-1 text-sm text-text-tertiary">Approve a recommendation and it will appear here, ready for you to send.</p>
                </div>
              )}
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Marketplace operating rules">
              <Card className="border border-gold/20 bg-gradient-to-b from-gold-dim to-surface-1 ring-0">
                <CardHeader>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-surface-0/50 text-gold"><ShieldCheck aria-hidden="true" className="h-5 w-5" /></span>
                  <CardTitle className="font-display text-xl">Approval means prepared</CardTitle>
                  <CardDescription className="leading-relaxed">For person-to-person messages, Red never presses Facebook&apos;s Send button. Approval copies the reviewed reply and marks it ready for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-text-secondary">
                  {['Red recommends the next move.', 'You inspect the evidence and exact wording.', 'Approval copies the reply.', 'You perform the final Send action in Facebook.'].map((step, index) => (
                    <div key={step} className="flex gap-3"><span className="font-display font-bold text-gold">0{index + 1}</span><span>{step}</span></div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-border bg-surface-1 ring-0">
                <CardHeader><CardTitle className="font-display">Listing health</CardTitle><CardDescription>Items that need observation, not an immediate cut.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {MONITORING.map((entry) => (
                    <button key={entry.item} type="button" onClick={() => setFilter('monitoring')} className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-border-hover hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span><span className="block text-sm font-medium text-text-primary">{entry.item}</span><span className="text-xs text-text-tertiary">{entry.price}</span></span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 flex-none text-text-tertiary" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) closeReview() }}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <Badge variant="secondary" className="mb-1 w-fit border border-gold/20 bg-gold-dim text-gold">Final approval</Badge>
                <DialogTitle>{selected.recommendation}</DialogTitle>
                <DialogDescription>Review why Red chose this move and the exact reply that will be copied.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface-0/45 p-3 text-xs">
                <div><span className="block text-text-tertiary">Buyer</span><span className="mt-1 block font-semibold text-text-primary">{selected.buyer}</span></div>
                <div><span className="block text-text-tertiary">Item</span><span className="mt-1 block font-semibold text-text-primary">{selected.item}</span></div>
                <div><span className="block text-text-tertiary">Asking</span><span className="mt-1 block font-semibold text-text-primary">{formatMoney(selected.asking)}</span></div>
                <div><span className="block text-text-tertiary">Buyer offer</span><span className="mt-1 block font-semibold text-text-primary">{selected.offer ? formatMoney(selected.offer) : 'No offer yet'}</span></div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Why this move</p>
                <ul className="mt-2 space-y-2">
                  {selected.reasoning.map((reason) => (
                    <li key={reason} className="flex gap-2 text-sm leading-relaxed text-text-secondary"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-gold" />{reason}</li>
                  ))}
                </ul>
              </div>

              <div>
                <label htmlFor="approved-reply" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Exact proposed reply</label>
                <textarea id="approved-reply" readOnly value={selected.draft} className="mt-2 min-h-28 w-full resize-none rounded-lg border border-border bg-surface-0/60 p-3 text-sm leading-relaxed text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm text-text-secondary transition-colors hover:bg-surface-2">
                <input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C9A84C]" />
                <span><span className="block font-semibold text-text-primary">I reviewed the final recipient, price, pickup location, and wording.</span><span className="mt-1 block text-xs text-text-tertiary">Approval copies this text. It does not send a Facebook message.</span></span>
              </label>

              <DialogFooter>
                <Button variant="outline" onClick={closeReview}>Cancel</Button>
                <Button disabled={!reviewed} onClick={approveAndCopy}>
                  <Clipboard aria-hidden="true" /> Approve & copy reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
