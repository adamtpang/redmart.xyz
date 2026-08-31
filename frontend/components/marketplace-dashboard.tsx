import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/shadcn/badge'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog'
import {
  marketplaceActions,
  marketplacePipeline,
  myrPerUsd,
  snapshotLabel,
  timInventory,
  timInventoryTotalMyr,
  timInventoryTotalUsd,
  type MarketplaceAction,
  type PipelineRow,
} from '@/lib/marketplace-data'
import { cn } from '@/lib/utils'

type ApprovalStatus = 'copied' | 'approved' | 'held'

const decisionStoreKey = 'red-marketplace-decisions-v1'
const decisionStoreEvent = 'red-marketplace-decisions-changed'
const emptyDecisionSnapshot = '{}'

const statusStyles: Record<PipelineRow['status'], string> = {
  'Close now': 'border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]',
  Offer: 'border-[#c2344d]/35 bg-[#8b2232]/25 text-[#f0a0af]',
  Fresh: 'border-[#5b7db1]/35 bg-[#5b7db1]/15 text-[#afc9ee]',
  Watch: 'border-white/15 bg-white/5 text-[#c7bcb5]',
}

function urgencyStyles(urgency: MarketplaceAction['urgency']) {
  if (urgency === 'Now') return 'border-[#c2344d]/35 bg-[#8b2232]/25 text-[#f0a0af]'
  if (urgency === 'Today') return 'border-[#c9a84c]/35 bg-[#c9a84c]/10 text-[#e0c976]'
  if (urgency === 'Verify') return 'border-[#5b7db1]/35 bg-[#5b7db1]/15 text-[#afc9ee]'
  return 'border-white/15 bg-white/5 text-[#c7bcb5]'
}

function formatUsd(myr: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(myr / myrPerUsd)
}

function getDecisionSnapshot() {
  if (typeof window === 'undefined') return emptyDecisionSnapshot
  return window.localStorage.getItem(decisionStoreKey) ?? emptyDecisionSnapshot
}

function subscribeToDecisionStore(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(decisionStoreEvent, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(decisionStoreEvent, onStoreChange)
  }
}

function parseDecisionSnapshot(snapshot: string): Record<string, ApprovalStatus> {
  try {
    const value = JSON.parse(snapshot)
    return value && typeof value === 'object' ? value as Record<string, ApprovalStatus> : {}
  } catch {
    return {}
  }
}

function writeDecisionStatus(id: string, status: ApprovalStatus) {
  if (typeof window === 'undefined') return
  const current = parseDecisionSnapshot(getDecisionSnapshot())
  window.localStorage.setItem(decisionStoreKey, JSON.stringify({ ...current, [id]: status }))
  window.dispatchEvent(new Event(decisionStoreEvent))
}

export default function MarketplaceDashboard() {
  const rankedActions = useMemo(() => [...marketplaceActions].sort((a, b) => a.rank - b.rank), [])
  const [activeActionId, setActiveActionId] = useState(rankedActions[0].id)
  const [reviewAction, setReviewAction] = useState<MarketplaceAction | null>(null)
  const [copyError, setCopyError] = useState('')

  const activeAction = useMemo(
    () => rankedActions.find((action) => action.id === activeActionId) ?? rankedActions[0],
    [activeActionId, rankedActions],
  )
  const decisionSnapshot = useSyncExternalStore(subscribeToDecisionStore, getDecisionSnapshot, () => emptyDecisionSnapshot)
  const decisionStates = useMemo(() => parseDecisionSnapshot(decisionSnapshot), [decisionSnapshot])
  const copiedSet = useMemo(
    () => new Set(rankedActions.filter((action) => decisionStates[`reply:${action.id}`] === 'copied').map((action) => action.id)),
    [decisionStates, rankedActions],
  )
  const pendingApprovalCount = rankedActions.filter((action) => !decisionStates[`reply:${action.id}`]).length
  const priceWatcherEnabled = decisionStates['policy:price-watcher'] !== 'held'
  const firmOffers = marketplacePipeline.filter((item) => item.onTableMyr > 0)
  const credibleMoneyMyr = firmOffers.reduce((total, item) => total + item.onTableMyr, 0)
  const sortedMarketplacePipeline = useMemo(() => [...marketplacePipeline].sort((a, b) => b.asking - a.asking), [])
  const sortedTimInventory = useMemo(() => [...timInventory].sort((a, b) => b.purchaseMyr - a.purchaseMyr), [])

  const openReview = (action: MarketplaceAction) => {
    setReviewAction(action)
    setCopyError('')
  }

  const closeReview = () => {
    setReviewAction(null)
    setCopyError('')
  }

  const approveAndCopy = async () => {
    if (!reviewAction) return
    try {
      await navigator.clipboard.writeText(reviewAction.draft)
      writeDecisionStatus(`reply:${reviewAction.id}`, 'copied')
      closeReview()
    } catch {
      setCopyError('Clipboard access was blocked. Select the draft and copy it manually.')
    }
  }

  return (
    <>
      <Head>
        <title>Marketplace Sales Desk | RedMart</title>
        <meta name="description" content="A clear Facebook Marketplace sales report with firm-offer value, ranked next moves, and copy-ready reply drafts." />
      </Head>

      <div className="dashboard-theme min-h-screen bg-background font-body text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-[#1a0a0a]/90 backdrop-blur-xl">
          <div className="mx-auto grid min-h-[68px] max-w-[1280px] grid-cols-[1fr_auto] items-center gap-5 px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
            <Link href="/" className="inline-flex min-h-[44px] w-fit items-center gap-3 font-display font-semibold tracking-[-0.02em]" aria-label="RedMart home">
              <span className="grid size-8 place-items-center rounded-full border border-[#c2344d]/40 bg-[#8b2232] font-display text-sm italic text-[#fff5ee]" aria-hidden="true">R</span>
              <span className="text-lg">RedMart</span>
            </Link>
            <nav aria-label="Dashboard sections" className="hidden items-center gap-8 md:flex">
              <a className="flex min-h-[44px] items-center px-3 text-sm font-medium text-foreground" href="#brief">Brief</a>
              <a className="flex min-h-[44px] items-center px-3 text-sm text-muted-foreground hover:text-foreground" href="#next-move">Next move</a>
              <a className="flex min-h-[44px] items-center px-3 text-sm text-muted-foreground hover:text-foreground" href="#pipeline">Listings</a>
              <a className="flex min-h-[44px] items-center px-3 text-sm text-muted-foreground hover:text-foreground" href="#tim-inventory">Tim</a>
              <a className="flex min-h-[44px] items-center px-3 text-sm text-muted-foreground hover:text-foreground" href="#pricing">Pricing</a>
            </nav>
            <div className="justify-self-end"><Badge variant="outline" className="h-7 border-[#4caf72]/35 bg-[#4caf72]/10 px-3 text-sm text-[#9ad8b0]"><Bot data-icon="inline-start" aria-hidden="true" />Approval mode</Badge></div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-10 md:px-8 md:pt-14">
          <section id="brief" aria-labelledby="brief-heading" className="scroll-mt-28">
            <div className="grid gap-7 border-b border-border pb-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-end">
              <div>
                <p className="font-opsmono text-sm font-semibold uppercase tracking-[0.12em] text-gold">Marketplace money desk / 00</p>
                <h1 id="brief-heading" className="mt-4 font-display text-[clamp(3rem,7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                  <span className="block font-opsmono text-gold">{formatUsd(credibleMoneyMyr)}</span>
                  <span className="block italic text-accent-light">on the table.</span>
                </h1>
              </div>
              <div className="max-w-lg lg:justify-self-end">
                <p className="text-lg leading-8 text-foreground">RM{credibleMoneyMyr.toLocaleString()} across {firmOffers.length} firm offers.</p>
                <p className="mt-1 text-base leading-7 text-muted-foreground">Everything else is pipeline, not cash.</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-opsmono text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><Clock3 className="size-4" aria-hidden="true" />{snapshotLabel}</span>
                  <a className="min-h-[44px] content-center text-gold underline decoration-gold/40 underline-offset-4 hover:text-[#e0c976]" href="https://www.bnm.gov.my/exchange-rates" target="_blank" rel="noreferrer">BNM 28 Aug · USD1 = RM4.0275</a>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[repeat(2,minmax(0,1fr))_minmax(250px,0.8fr)]" aria-label="Firm offers and operating status">
              {firmOffers.map((item) => (
                <article key={item.item} className="rounded-2xl border border-border bg-card/85 p-5">
                  <div className="flex items-start justify-between gap-4"><div><p className="font-opsmono text-sm uppercase tracking-[0.06em] text-muted-foreground">Firm offer</p><h2 className="mt-2 font-display text-xl font-semibold">{item.item}</h2></div><Badge variant="outline" className={cn('h-7 px-3 text-sm', statusStyles[item.status])}>{item.status}</Badge></div>
                  <div className="mt-6 flex items-end justify-between gap-4"><strong className="font-opsmono text-3xl font-medium tabular-nums text-gold">{formatUsd(item.onTableMyr)}</strong><span className="font-opsmono text-sm tabular-nums text-muted-foreground">RM{item.onTableMyr.toLocaleString()}</span></div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.lead}. {item.next}.</p>
                </article>
              ))}
              <article className="rounded-2xl border border-border bg-card/85 p-5">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-gold/20 bg-gold/10 text-gold"><Bot className="size-5" aria-hidden="true" /></span><div><p className="font-opsmono text-sm uppercase text-muted-foreground">Red status</p><strong className="block text-base">Hourly monitor active</strong></div></div>
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4"><div><span className="font-opsmono text-sm text-muted-foreground">Live</span><strong className="mt-1 block font-opsmono text-xl">14</strong></div><div><span className="font-opsmono text-sm text-muted-foreground">Tim</span><strong className="mt-1 block font-opsmono text-xl">59</strong></div><div><span className="font-opsmono text-sm text-muted-foreground">Review</span><strong className="mt-1 block font-opsmono text-xl">{pendingApprovalCount}</strong></div></div>
              </article>
            </div>
          </section>

          <section id="next-move" aria-labelledby="actions-heading" className="mt-14 scroll-mt-28">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Next move / {String(activeAction.rank).padStart(2, '0')}</p><h2 id="actions-heading" className="mt-2 font-display text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-none tracking-[-0.04em]">One decision at a time.</h2></div><p className="max-w-xl text-base leading-7 text-muted-foreground">Red ranks the buyer queue and explains the move. Approval copies the exact draft for your manual send in Helium.</p></div>
            <div className="grid overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl shadow-black/20 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.72fr)]">
              <article className="flex min-w-0 flex-col p-5 md:p-7 xl:border-r xl:border-border">
                <div className="flex flex-wrap items-center justify-between gap-3"><Badge variant="outline" className={cn('h-7 px-3 text-sm', urgencyStyles(activeAction.urgency))}>{activeAction.urgency}</Badge><span className="font-opsmono text-sm text-muted-foreground">{activeAction.received}</span></div>
                <div className="mt-7 flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/10 text-gold"><MessageSquareText className="size-5" aria-hidden="true" /></span><div><p className="font-opsmono text-sm uppercase tracking-[0.06em] text-muted-foreground">{activeAction.item}</p><h3 className="mt-1 font-display text-3xl font-semibold">{activeAction.buyer}</h3><p className="mt-2 text-base text-muted-foreground">{activeAction.signal}</p></div></div>
                <div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
                  <div className="bg-muted p-4"><span className="font-opsmono text-sm uppercase text-muted-foreground">Asking</span><strong className="mt-2 block font-opsmono text-2xl font-medium tabular-nums">RM{activeAction.ask.toLocaleString()}</strong></div>
                  <div className="bg-muted p-4"><span className="font-opsmono text-sm uppercase text-muted-foreground">Cash now</span><strong className="mt-2 block font-opsmono text-2xl font-medium tabular-nums text-gold">{activeAction.offer ? formatUsd(activeAction.offer) : '$0.00'}</strong><span className="mt-1 block text-sm text-muted-foreground">{activeAction.offer ? `RM${activeAction.offer.toLocaleString()} offered` : 'No firm offer'}</span></div>
                  <div className="bg-muted p-4"><span className="font-opsmono text-sm uppercase text-muted-foreground">Red recommends</span><strong className="mt-2 block text-base font-semibold leading-6">{activeAction.move}</strong></div>
                </div>
                <div className="mt-7"><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.08em] text-gold">Why</p><p className="mt-2 text-base leading-7 text-muted-foreground">{activeAction.reason}</p></div>
                <div className="mt-5 rounded-xl border border-border bg-background/50 p-4"><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.08em] text-gold">Draft preview</p><p className="mt-3 line-clamp-3 text-base leading-7 text-muted-foreground">{activeAction.draft}</p></div>
                {activeAction.note ? <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/10 p-4 text-sm leading-6 text-[#e0c976]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{activeAction.note}</div> : null}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"><Button className="min-h-[44px] px-5" onClick={() => openReview(activeAction)}>{copiedSet.has(activeAction.id) ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}{copiedSet.has(activeAction.id) ? 'Copied for manual send' : 'Review & approve'}</Button><span className="text-sm text-muted-foreground">Approval copies the message. It never sends.</span></div>
              </article>

              <aside aria-label="Ranked lead queue" className="min-w-0 bg-background/25">
                <div className="flex items-center justify-between border-b border-border px-4 py-4"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.08em] text-gold">Ranked queue</p><p className="mt-1 text-sm text-muted-foreground">Select the next buyer.</p></div><Badge variant="outline" className="h-7 border-border px-3 text-sm">{rankedActions.length}</Badge></div>
                <ol className="max-h-[610px] overflow-y-auto overscroll-contain">
                  {rankedActions.map((action) => {
                    const active = action.id === activeAction.id
                    const copied = copiedSet.has(action.id)
                    return (
                      <li key={action.id} className="border-b border-border last:border-b-0">
                        <button type="button" aria-pressed={active} className={cn('grid min-h-[76px] w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset', active && 'bg-muted')} onClick={() => setActiveActionId(action.id)}>
                          <span className="font-opsmono text-sm text-gold">{String(action.rank).padStart(2, '0')}</span>
                          <span className="min-w-0"><strong className="block truncate text-base font-semibold">{action.buyer}</strong><span className="mt-1 block truncate text-sm text-muted-foreground">{action.item} · {action.signal}</span></span>
                          {copied ? <Check className="size-4 text-[#9ad8b0]" aria-label="Copied" /> : <ChevronRight className={cn('size-4 text-muted-foreground', active && 'text-gold')} aria-hidden="true" />}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </aside>
            </div>
          </section>

          <section id="pipeline" aria-labelledby="pipeline-heading" className="mt-14 scroll-mt-28">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] md:items-end"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Live listing ledger / 14 · price high to low</p><h2 id="pipeline-heading" className="mt-3 font-display text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-none tracking-[-0.04em]">Every item. <span className="italic text-accent-light">One honest number.</span></h2></div><p className="text-base leading-7 text-muted-foreground">Cash now counts only a specific offer or agreed amount. Interest without a number stays at $0.00.</p></div>
            <div className="mt-7 rounded-2xl border border-border bg-card/70 shadow-2xl shadow-black/15">
              <div className="hidden min-h-12 grid-cols-[minmax(190px,1.25fr)_90px_120px_minmax(220px,1.35fr)_140px] items-center gap-4 border-b border-border px-4 font-opsmono text-sm uppercase tracking-[0.04em] text-muted-foreground xl:grid"><span>Item</span><span>Asking</span><span>Cash now</span><span>Best signal</span><span className="text-right">Next</span></div>
              {sortedMarketplacePipeline.map((row, index) => (
                <article key={row.item} className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-border px-4 py-5 transition-colors last:border-b-0 hover:bg-card xl:min-h-[68px] xl:grid-cols-[minmax(190px,1.25fr)_90px_120px_minmax(220px,1.35fr)_140px] xl:items-center xl:gap-4 xl:py-3">
                  <div className="col-span-2 xl:col-span-1"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Item</span><div className="flex items-center gap-3"><span className="font-opsmono text-sm text-gold">{String(index + 1).padStart(2, '0')}</span><strong className="font-display text-base font-semibold">{row.item}</strong></div></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Asking</span><span className="font-opsmono text-base font-medium tabular-nums">RM{row.asking.toLocaleString()}</span></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Cash now</span><strong className={cn('block font-opsmono text-base tabular-nums', row.onTableMyr > 0 ? 'text-gold' : 'text-muted-foreground')}>{formatUsd(row.onTableMyr)}</strong><span className="mt-1 block text-sm text-muted-foreground">{row.onTableMyr > 0 ? `RM${row.onTableMyr.toLocaleString()}` : 'No firm offer'}</span></div>
                  <div className="col-span-2 xl:col-span-1"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Best signal</span><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={cn('h-7 px-2.5 text-sm', statusStyles[row.status])}>{row.status}</Badge><span className="text-sm text-muted-foreground">{row.lead}. {row.signal}.</span></div></div>
                  <div className="col-span-2 text-left xl:col-span-1 xl:text-right"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Next move</span><span className="text-sm font-semibold">{row.next}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section id="tim-inventory" aria-labelledby="tim-inventory-heading" className="mt-14 scroll-mt-28">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.48fr)] md:items-end">
              <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Tim inventory / 59 · purchase price high to low</p><h2 id="tim-inventory-heading" className="mt-3 font-display text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-none tracking-[-0.04em]">Everything Tim bought. <span className="italic text-accent-light">Ready to price.</span></h2></div>
              <p className="text-base leading-7 text-muted-foreground">Historical purchase cost is context, not a resale recommendation. The TV is already listed. The other 58 items still need condition, photos, and an approved asking price.</p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-border bg-card/85 p-5"><p className="font-opsmono text-sm uppercase tracking-[0.06em] text-muted-foreground">Historical purchase total</p><strong className="mt-3 block font-opsmono text-3xl font-medium tabular-nums text-gold">${timInventoryTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><span className="mt-2 block font-opsmono text-sm tabular-nums text-muted-foreground">RM{timInventoryTotalMyr.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span></article>
              <article className="rounded-2xl border border-border bg-card/85 p-5"><p className="font-opsmono text-sm uppercase tracking-[0.06em] text-muted-foreground">Listing readiness</p><div className="mt-3 flex items-end justify-between gap-4"><strong className="font-opsmono text-3xl font-medium tabular-nums">1 / 59</strong><Badge variant="outline" className="h-7 border-[#c9a84c]/35 bg-[#c9a84c]/10 px-3 text-sm text-[#e0c976]">58 need pricing</Badge></div><p className="mt-3 text-sm leading-6 text-muted-foreground">The TCL TV is already live. Every other item remains an inventory candidate.</p></article>
            </div>

            <details className="group mt-4 overflow-hidden rounded-2xl border border-border bg-card/70">
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-5 font-semibold marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"><span>Show all 59 Tim-owned items</span><ChevronRight className="size-5 text-gold transition-transform group-open:rotate-90" aria-hidden="true" /></summary>
              <div className="border-t border-border">
                <div className="hidden min-h-12 grid-cols-[56px_minmax(220px,1.4fr)_130px_110px_150px] items-center gap-4 border-b border-border px-4 font-opsmono text-sm uppercase tracking-[0.04em] text-muted-foreground lg:grid"><span>#</span><span>Item</span><span>Room</span><span>Bought for</span><span className="text-right">Listing status</span></div>
                {sortedTimInventory.map((row, index) => {
                  const alreadyListed = row.item.startsWith('TCL 98-inch TV')
                  return (
                    <article key={`${row.room}-${row.item}-${row.purchaseMyr}`} className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-border px-4 py-4 last:border-b-0 lg:min-h-[64px] lg:grid-cols-[56px_minmax(220px,1.4fr)_130px_110px_150px] lg:items-center lg:gap-4 lg:py-3">
                      <span className="font-opsmono text-sm text-gold">{String(index + 1).padStart(2, '0')}</span>
                      <div><strong className="font-display text-base font-semibold">{row.item}</strong><span className="mt-1 block text-sm text-muted-foreground lg:hidden">{row.room}</span></div>
                      <span className="hidden text-sm text-muted-foreground lg:block">{row.room}</span>
                      <div className="col-start-2 lg:col-start-auto"><strong className="block font-opsmono text-base tabular-nums">RM{row.purchaseMyr.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong><span className="mt-1 block font-opsmono text-sm tabular-nums text-muted-foreground">${row.purchaseUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                      <div className="col-start-2 lg:col-start-auto lg:text-right"><Badge variant="outline" className={cn('h-7 px-2.5 text-sm', alreadyListed ? statusStyles.Fresh : statusStyles.Watch)}>{alreadyListed ? 'Already listed' : 'Needs sale price'}</Badge></div>
                    </article>
                  )
                })}
              </div>
            </details>
          </section>

          <section id="pricing" aria-labelledby="pricing-heading" className="mt-14 grid scroll-mt-28 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
            <div className="rounded-2xl border border-border bg-card/85 p-5 md:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Price watch / 01</p><h2 id="pricing-heading" className="mt-2 font-display text-3xl font-semibold">Echo is live at RM120</h2><p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">The approved RM10 reduction is verified live after 47 clicks without visible buyer intent. Reassess after 24 hours.</p></div><Badge variant="outline" className="h-7 shrink-0 border-[#4caf72]/35 bg-[#4caf72]/10 px-3 text-sm text-[#9ad8b0]"><CheckCircle2 data-icon="inline-start" aria-hidden="true" />Verified</Badge></div>
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-6 text-muted-foreground">Propose a small change after 72 hours with no buyer signal and 25+ clicks. Every listing edit still requires exact approval.</p><Button variant="outline" className={cn('min-h-[44px] shrink-0 border-border bg-transparent px-4 text-sm hover:bg-muted', priceWatcherEnabled && 'border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]')} onClick={() => writeDecisionStatus('policy:price-watcher', priceWatcherEnabled ? 'held' : 'approved')}>{priceWatcherEnabled ? <Zap aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}Price watcher {priceWatcherEnabled ? 'on' : 'off'}</Button></div>
            </div>
            <div className="rounded-2xl border border-border bg-card/85 p-5 md:p-6"><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">No fresh attention / 03</p><h2 className="mt-2 font-display text-2xl font-semibold">Hold the guitars.</h2><ul className="mt-5 space-y-3 text-base text-muted-foreground"><li className="border-t border-border pt-3">Acoustic-Electric Guitar · RM480</li><li className="border-t border-border pt-3">Acoustic Guitar · RM190</li><li className="border-t border-border pt-3">Squier Stratocaster · RM490</li></ul><p className="mt-5 text-sm leading-6 text-muted-foreground">No price move yet. Their current positions are already competitive and the signal threshold has not been met.</p></div>
          </section>

          <section className="mt-4 grid gap-4 rounded-2xl border border-border bg-card/85 p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-6" aria-labelledby="safety-heading">
            <span className="grid size-11 place-items-center rounded-xl border border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]"><ShieldCheck className="size-5" aria-hidden="true" /></span>
            <div><h2 id="safety-heading" className="font-display text-lg font-semibold">Approval means copy, never send</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Red prepares the move and exact wording. Adam performs every person-to-person communication in Helium.</p></div>
            <Link href="/" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent-light">About RedMart <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </section>
        </main>
      </div>

      <Dialog open={reviewAction !== null} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="dashboard-dialog-theme rounded-2xl border-border bg-popover font-body text-popover-foreground shadow-2xl shadow-black/50 sm:max-w-xl">
          {reviewAction ? <>
            <DialogHeader><Badge variant="outline" className="mb-1 h-7 border-[#c9a84c]/35 bg-[#c9a84c]/10 px-3 text-sm text-[#e0c976]">Action {String(reviewAction.rank).padStart(2, '0')}</Badge><DialogTitle className="font-display text-2xl font-semibold text-foreground">Review reply for {reviewAction.buyer}</DialogTitle><DialogDescription className="text-base leading-7 text-muted-foreground">Review the situation, reasoning, and exact message. Approval copies it for your manual send.</DialogDescription></DialogHeader>
            <div className="space-y-5">
              <ol className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-muted text-center font-opsmono text-sm" aria-label="Reply handoff steps"><li className="border-r border-border p-3 font-semibold text-gold">1 Review</li><li className="border-r border-border p-3 font-semibold text-gold">2 Approve + copy</li><li className="p-3 text-muted-foreground">3 Paste in Helium</li></ol>
              <div className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm"><div><p className="font-opsmono uppercase text-muted-foreground">Item</p><p className="mt-1 font-semibold">{reviewAction.item}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Cash now</p><p className="mt-1 font-opsmono font-semibold tabular-nums text-gold">{reviewAction.offer ? formatUsd(reviewAction.offer) : '$0.00'}</p><p className="mt-1 text-muted-foreground">{reviewAction.offer ? `RM${reviewAction.offer.toLocaleString()} offered` : 'No firm offer'}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Recommended</p><p className="mt-1 font-semibold">{reviewAction.move}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Pickup</p><p className="mt-1 font-semibold">Forest City Marina Hotel</p></div></div>
              <div><p className="mb-2 font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-gold">Why this move</p><p className="text-base leading-7 text-muted-foreground">{reviewAction.reason}</p></div>
              <div><p className="mb-2 font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-gold">Exact draft</p><div className="select-text rounded-xl border border-border bg-background/60 p-4 text-base leading-7">{reviewAction.draft}</div></div>
              {reviewAction.note ? <div className="flex items-start gap-3 rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/10 p-4 text-sm leading-6 text-[#e0c976]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{reviewAction.note}</div> : null}
              {copyError ? <p role="alert" className="text-sm text-accent-light">{copyError}</p> : null}
              <div className="flex items-start gap-3 rounded-xl border border-[#4caf72]/30 bg-[#4caf72]/10 p-4 text-sm leading-6 text-[#9ad8b0]"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Approving copies this draft to your clipboard. It does not send a Facebook message. You must send it manually in Helium.</div>
            </div>
            <DialogFooter className="border-border bg-muted"><Button variant="ghost" className="min-h-[44px]" onClick={closeReview}>Cancel</Button><Button className="min-h-[44px]" onClick={approveAndCopy}><ClipboardCheck aria-hidden="true" />Approve & copy to clipboard</Button></DialogFooter>
          </> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
