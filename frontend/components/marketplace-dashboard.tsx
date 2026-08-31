import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  AlertTriangle,
  Bot,
  Check,
  ChevronRight,
  ClipboardCheck,
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-opsmono text-sm font-semibold uppercase tracking-[0.1em] text-gold">{children}</p>
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
        <meta name="description" content="A focused Facebook Marketplace sales report with firm-offer value, one recommended move, and copy-ready replies." />
      </Head>

      <div className="dashboard-theme min-h-screen bg-background font-ops text-foreground">
        <header className="border-b border-border bg-background/95">
          <div className="mx-auto flex min-h-[64px] max-w-[1080px] items-center justify-between gap-4 px-5 md:px-8">
            <Link href="/" className="inline-flex min-h-[44px] items-center gap-3 font-display text-lg font-semibold" aria-label="RedMart home">
              <span className="grid size-8 place-items-center rounded-sm bg-[#8b2232] font-display text-sm italic text-[#fff5ee]" aria-hidden="true">R</span>
              <span>RedMart</span>
              <span className="hidden font-ops text-sm font-normal text-muted-foreground sm:inline">Marketplace</span>
            </Link>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="hidden sm:inline">{snapshotLabel}</span>
              <Badge variant="outline" className="h-7 border-[#4caf72]/30 bg-[#4caf72]/10 px-3 text-sm text-[#9ad8b0]"><Bot aria-hidden="true" />Live</Badge>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1080px] px-5 pb-20 pt-12 md:px-8 md:pt-16">
          <section id="brief" aria-labelledby="brief-heading">
            <SectionLabel>Marketplace brief</SectionLabel>
            <div className="mt-5 grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
              <h1 id="brief-heading" className="max-w-3xl font-display text-[clamp(3.25rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
                <span className="text-gold">{formatUsd(credibleMoneyMyr)}</span>
                <span className="block italic text-accent-light">ready to close.</span>
              </h1>
              <div className="space-y-2 text-base leading-7">
                <p><strong className="font-semibold text-foreground">RM{credibleMoneyMyr.toLocaleString()}</strong> across {firmOffers.length} firm offers.</p>
                <p className="text-muted-foreground">Everything else is pipeline, not cash.</p>
                <a className="inline-flex min-h-[44px] items-center text-sm text-gold underline decoration-gold/40 underline-offset-4" href="https://www.bnm.gov.my/exchange-rates" target="_blank" rel="noreferrer">BNM 28 Aug · USD1 = RM4.0275</a>
              </div>
            </div>

            <div className="grid border-b border-border sm:grid-cols-3" aria-label="Marketplace operating summary">
              <div className="border-b border-border py-5 sm:border-b-0 sm:border-r sm:pr-6"><span className="text-sm text-muted-foreground">Active listings</span><strong className="mt-1 block font-opsmono text-2xl tabular-nums">14</strong></div>
              <div className="border-b border-border py-5 sm:border-b-0 sm:border-r sm:px-6"><span className="text-sm text-muted-foreground">Awaiting review</span><strong className="mt-1 block font-opsmono text-2xl tabular-nums">{pendingApprovalCount}</strong></div>
              <div className="py-5 sm:pl-6"><span className="text-sm text-muted-foreground">Red status</span><strong className="mt-1 block text-base font-semibold">Hourly monitor active</strong></div>
            </div>
          </section>

          <section id="next-move" aria-labelledby="actions-heading" className="mt-14">
            <div className="flex flex-col gap-5 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionLabel>Next move / {String(activeAction.rank).padStart(2, '0')}</SectionLabel>
                <h2 id="actions-heading" className="mt-3 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-none tracking-[-0.035em]">One decision at a time.</h2>
              </div>
              <label className="block w-full max-w-sm text-sm text-muted-foreground" htmlFor="lead-selector">
                View another lead
                <select
                  id="lead-selector"
                  value={activeActionId}
                  onChange={(event) => setActiveActionId(event.target.value)}
                  className="mt-2 min-h-[44px] w-full rounded-sm border border-border bg-card px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {rankedActions.map((action) => (
                    <option key={action.id} value={action.id}>{String(action.rank).padStart(2, '0')} · {action.buyer} · {action.item}</option>
                  ))}
                </select>
              </label>
            </div>

            <article className="grid gap-8 border-b border-border py-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,0.65fr)]">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="h-7 border-[#c2344d]/30 bg-[#8b2232]/20 px-3 text-sm text-[#f0a0af]">{activeAction.urgency}</Badge>
                  <span>{activeAction.received}</span>
                </div>
                <p className="mt-7 text-sm uppercase tracking-[0.08em] text-muted-foreground">{activeAction.item}</p>
                <h3 className="mt-2 font-display text-4xl font-semibold">{activeAction.buyer}</h3>
                <p className="mt-2 text-base text-muted-foreground">{activeAction.signal}</p>

                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
                  <div><span className="block text-sm text-muted-foreground">Asking</span><strong className="mt-1 block font-opsmono text-2xl tabular-nums">RM{activeAction.ask.toLocaleString()}</strong></div>
                  <div><span className="block text-sm text-muted-foreground">Cash now</span><strong className="mt-1 block font-opsmono text-2xl tabular-nums text-gold">{activeAction.offer ? formatUsd(activeAction.offer) : '$0.00'}</strong><span className="mt-1 block text-sm text-muted-foreground">{activeAction.offer ? `RM${activeAction.offer.toLocaleString()} offered` : 'No firm offer'}</span></div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 lg:border-l lg:border-border lg:pl-8">
                <div>
                  <SectionLabel>Red recommends</SectionLabel>
                  <p className="mt-3 text-xl font-semibold leading-8">{activeAction.move}</p>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">{activeAction.reason}</p>
                </div>
                <Button className="min-h-[44px] w-full justify-between px-5" onClick={() => { setReviewAction(activeAction); setCopyError('') }}>
                  {copiedSet.has(activeAction.id) ? <Check aria-hidden="true" /> : <ClipboardCheck aria-hidden="true" />}
                  <span>{copiedSet.has(activeAction.id) ? 'Copied for manual send' : 'Review draft'}</span>
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </article>
          </section>

          <section aria-labelledby="offers-heading" className="mt-14">
            <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
              <div><SectionLabel>Firm offers</SectionLabel><h2 id="offers-heading" className="mt-2 font-display text-3xl font-semibold">Money with a number.</h2></div>
              <span className="font-opsmono text-lg tabular-nums text-gold">RM{credibleMoneyMyr.toLocaleString()}</span>
            </div>
            <div>
              {firmOffers.map((item) => (
                <div key={item.item} className="grid gap-3 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_120px_150px] sm:items-center">
                  <div><strong className="text-base">{item.item}</strong><p className="mt-1 text-sm text-muted-foreground">{item.lead}. {item.next}.</p></div>
                  <strong className="font-opsmono text-xl tabular-nums text-gold">{formatUsd(item.onTableMyr)}</strong>
                  <Badge variant="outline" className={cn('h-7 w-fit px-3 text-sm sm:justify-self-end', statusStyles[item.status])}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14" aria-labelledby="details-heading">
            <SectionLabel>Details</SectionLabel>
            <h2 id="details-heading" className="mt-2 font-display text-3xl font-semibold">Open only what you need.</h2>

            <div className="mt-5 border-t border-border">
              <details id="pipeline" className="group border-b border-border">
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span><strong className="block text-base">All 14 listings</strong><span className="mt-1 block text-sm text-muted-foreground">Every item. One honest number. Sorted by price.</span></span>
                  <ChevronRight className="size-5 text-gold transition-transform group-open:rotate-90" aria-hidden="true" />
                </summary>
                <div className="border-t border-border">
                  <p className="py-4 text-sm leading-6 text-muted-foreground">Cash now counts only a specific offer or agreed amount. Interest without a number stays at $0.00.</p>
                  {sortedMarketplacePipeline.map((row, index) => (
                    <article key={row.item} className="grid gap-3 border-t border-border py-4 md:grid-cols-[32px_minmax(180px,1fr)_100px_120px_minmax(180px,1fr)] md:items-center">
                      <span className="font-opsmono text-sm text-gold">{String(index + 1).padStart(2, '0')}</span>
                      <div><strong className="text-base">{row.item}</strong><span className="mt-1 block text-sm text-muted-foreground md:hidden">{row.lead}. {row.signal}.</span></div>
                      <span className="font-opsmono text-base tabular-nums">RM{row.asking.toLocaleString()}</span>
                      <div><strong className={cn('font-opsmono text-base tabular-nums', row.onTableMyr > 0 ? 'text-gold' : 'text-muted-foreground')}>{formatUsd(row.onTableMyr)}</strong><span className="mt-1 block text-sm text-muted-foreground">{row.onTableMyr > 0 ? `RM${row.onTableMyr.toLocaleString()}` : 'No firm offer'}</span></div>
                      <div className="hidden md:block"><p className="text-sm text-muted-foreground">{row.lead}. {row.signal}.</p><p className="mt-1 text-sm font-semibold">{row.next}</p></div>
                    </article>
                  ))}
                </div>
              </details>

              <details id="tim-inventory" className="group border-b border-border">
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span><strong className="block text-base">Tim inventory, 59 items</strong><span className="mt-1 block text-sm text-muted-foreground">Show all 59 Tim-owned items. 58 need pricing.</span></span>
                  <span className="flex items-center gap-3"><span className="hidden font-opsmono text-sm tabular-nums text-muted-foreground sm:inline">${timInventoryTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} bought</span><ChevronRight className="size-5 text-gold transition-transform group-open:rotate-90" aria-hidden="true" /></span>
                </summary>
                <div className="border-t border-border pb-2">
                  <p className="py-4 text-sm leading-6 text-muted-foreground">Historical purchase cost is context, not a resale recommendation. The TV is already listed. The other 58 items need condition, photos, and an approved asking price. Historical total: RM{timInventoryTotalMyr.toLocaleString('en-MY', { minimumFractionDigits: 2 })}.</p>
                  {sortedTimInventory.map((row, index) => {
                    const alreadyListed = row.item.startsWith('TCL 98-inch TV')
                    return (
                      <article key={`${row.room}-${row.item}-${row.purchaseMyr}`} className="grid grid-cols-[32px_minmax(0,1fr)_auto] gap-3 border-t border-border py-4 md:grid-cols-[32px_minmax(220px,1fr)_130px_120px_140px] md:items-center">
                        <span className="font-opsmono text-sm text-gold">{String(index + 1).padStart(2, '0')}</span>
                        <div><strong className="text-base">{row.item}</strong><span className="mt-1 block text-sm text-muted-foreground md:hidden">{row.room}</span></div>
                        <span className="hidden text-sm text-muted-foreground md:block">{row.room}</span>
                        <span className="font-opsmono text-sm tabular-nums">RM{row.purchaseMyr.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                        <Badge variant="outline" className={cn('col-start-2 h-7 w-fit px-2.5 text-sm md:col-start-auto md:justify-self-end', alreadyListed ? statusStyles.Fresh : statusStyles.Watch)}>{alreadyListed ? 'Already listed' : 'Needs sale price'}</Badge>
                      </article>
                    )
                  })}
                </div>
              </details>

              <details id="pricing" className="group border-b border-border">
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span><strong className="block text-base">Price watch</strong><span className="mt-1 block text-sm text-muted-foreground">Echo is live at RM120. Three quiet guitars stay unchanged.</span></span>
                  <span className="flex items-center gap-3"><Badge variant="outline" className="hidden h-7 border-[#4caf72]/30 bg-[#4caf72]/10 px-3 text-sm text-[#9ad8b0] sm:inline-flex">Watcher {priceWatcherEnabled ? 'on' : 'off'}</Badge><ChevronRight className="size-5 text-gold transition-transform group-open:rotate-90" aria-hidden="true" /></span>
                </summary>
                <div className="grid gap-8 border-t border-border py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div><SectionLabel>Echo is live at RM120</SectionLabel><p className="mt-3 text-base leading-7 text-muted-foreground">The approved RM10 reduction is verified live after 47 clicks without visible buyer intent. Reassess after 24 hours. Propose a small change after 72 hours with no buyer signal and 25+ clicks. Every listing edit still requires exact approval.</p><Button variant="outline" className={cn('mt-5 min-h-[44px] border-border bg-transparent px-4 text-sm', priceWatcherEnabled && 'border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]')} onClick={() => writeDecisionStatus('policy:price-watcher', priceWatcherEnabled ? 'held' : 'approved')}>{priceWatcherEnabled ? <Zap aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}Price watcher {priceWatcherEnabled ? 'on' : 'off'}</Button></div>
                  <div><SectionLabel>No fresh attention</SectionLabel><p className="mt-3 text-base font-semibold">Hold the guitars.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Acoustic-Electric Guitar RM480, Acoustic Guitar RM190, Squier Stratocaster RM490.</p></div>
                </div>
              </details>
            </div>
          </section>

          <footer className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#9ad8b0]" aria-hidden="true" /><div><strong className="text-base">Approval means copy, never send</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">Red prepares the move. Adam performs person-to-person communication in Helium.</p></div></div>
            <Link href="/" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-accent-light">About RedMart</Link>
          </footer>
        </main>
      </div>

      <Dialog open={reviewAction !== null} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="dashboard-dialog-theme rounded-lg border-border bg-popover font-ops text-popover-foreground shadow-2xl shadow-black/50 sm:max-w-xl">
          {reviewAction ? <>
            <DialogHeader>
              <SectionLabel>Review reply / {String(reviewAction.rank).padStart(2, '0')}</SectionLabel>
              <DialogTitle className="font-display text-3xl font-semibold text-foreground">{reviewAction.buyer}, {reviewAction.item}</DialogTitle>
              <DialogDescription className="text-base leading-7 text-muted-foreground">{reviewAction.reason}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <p className="sr-only">1 Review. 2 Approve + copy. 3 Paste in Helium.</p>
              <div className="grid grid-cols-2 gap-5 border-y border-border py-4 text-sm">
                <div><span className="text-muted-foreground">Recommended</span><strong className="mt-1 block">{reviewAction.move}</strong></div>
                <div><span className="text-muted-foreground">Cash now</span><strong className="mt-1 block font-opsmono tabular-nums text-gold">{reviewAction.offer ? formatUsd(reviewAction.offer) : '$0.00'}</strong></div>
              </div>
              <div><SectionLabel>Exact draft</SectionLabel><div className="mt-3 select-text rounded-sm border border-border bg-background/55 p-4 text-base leading-7">{reviewAction.draft}</div></div>
              {reviewAction.note ? <div className="flex items-start gap-3 rounded-sm border border-[#c9a84c]/25 bg-[#c9a84c]/10 p-4 text-sm leading-6 text-[#e0c976]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{reviewAction.note}</div> : null}
              {copyError ? <p role="alert" className="text-sm text-accent-light">{copyError}</p> : null}
              <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9ad8b0]" aria-hidden="true" />It does not send a Facebook message. Approval only copies the exact draft for manual use in Helium.</div>
            </div>
            <DialogFooter className="border-border bg-muted"><Button variant="ghost" className="min-h-[44px]" onClick={closeReview}>Cancel</Button><Button className="min-h-[44px]" onClick={approveAndCopy}><ClipboardCheck aria-hidden="true" />Approve & copy to clipboard</Button></DialogFooter>
          </> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
