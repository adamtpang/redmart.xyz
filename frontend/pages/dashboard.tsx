import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Bike,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Database,
  Inbox,
  MessageSquareText,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  TrendingDown,
  Tv,
  WifiOff,
  Zap,
  type LucideIcon,
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
import { cn } from '@/lib/utils'

type Action = {
  id: string
  rank: number
  item: string
  buyer: string
  ask: number
  offer?: number
  signal: string
  move: string
  reason: string
  draft: string
  urgency: 'Now' | 'Today' | 'Verify' | 'Backup'
  received: string
  icon: LucideIcon
  note?: string
}

type PipelineRow = {
  item: string
  asking: string
  lead: string
  signal: string
  status: 'Close now' | 'Offer' | 'Fresh' | 'Waiting' | 'Watch' | 'No signal'
  next: string
}

type ApprovalStatus = 'copied' | 'approved' | 'held'

type ApprovalItem = {
  id: string
  kind: 'Reply' | 'Price change'
  title: string
  summary: string
  value: string
  actionId?: string
}

const snapshotLabel = '31 Aug, 12:18 PM SGT'

const actions: Action[] = [
  {
    id: 'murtaza-bike',
    rank: 1,
    item: 'Mountain Bike',
    buyer: 'Murtaza',
    ask: 190,
    offer: 190,
    signal: 'Full-price offer',
    move: 'Accept RM190 and lock a pickup time',
    urgency: 'Now',
    received: 'Waiting since Saturday',
    icon: Bike,
    reason: 'Murtaza offered the full asking price. This is the clearest intent and the shortest path to a completed sale.',
    draft: 'Hi Murtaza, I can accept RM190. Pickup is at Forest City Marina Hotel. Please send an exact collection time; I can confirm the sale once we agree on pickup.',
  },
  {
    id: 'ahmad-fender',
    rank: 2,
    item: 'Fender Champion 40',
    buyer: 'Ahmad',
    ask: 490,
    offer: 400,
    signal: 'Specific RM400 offer',
    move: 'Counter once at RM450',
    urgency: 'Now',
    received: 'Open negotiation',
    icon: CircleDollarSign,
    reason: 'Ahmad named a real number. RM450 splits the gap and protects value while keeping the negotiation easy to close.',
    draft: 'Hi Ahmad, thanks for the RM400 offer. I can meet you at RM450. Pickup is at Forest City Marina Hotel. If that works, what day and time can you collect?',
  },
  {
    id: 'danny-tv',
    rank: 3,
    item: 'TCL 98-inch TV',
    buyer: 'Danny',
    ask: 10000,
    signal: 'Availability check',
    move: 'Hold RM10,000 and qualify transport',
    urgency: 'Today',
    received: 'Fresh high-value lead',
    icon: Tv,
    reason: 'The TV has active interest and significant value. Confirm transport and collection readiness before discussing price.',
    draft: 'Hi Danny, yes, the TCL 98C8K is available at RM10,000. Pickup is at Forest City Marina Hotel. Please confirm you have suitable transport and tell me when you could collect.',
    note: 'Tim owns this item. Tim must approve any price move or sale commitment.',
  },
  {
    id: 'mohd-bike',
    rank: 4,
    item: 'Mountain Bike',
    buyer: 'Mohd',
    ask: 190,
    signal: 'New unread inquiry',
    move: 'Keep as first backup to Murtaza',
    urgency: 'Today',
    received: 'Today, 11:19 AM',
    icon: Inbox,
    reason: 'Mohd is the newest bike inquiry, but Murtaza already offered full price. Ask for the earliest collection time without promising the item twice.',
    draft: 'Hi Mohd, another buyer has offered the full RM190. If you can collect from Forest City Marina Hotel, please send your earliest pickup time and I will confirm whether it is still available.',
  },
  {
    id: 'suria-drums',
    rank: 5,
    item: 'German-brand Drum Kit',
    buyer: 'Suria',
    ask: 590,
    signal: 'Fresh inquiry',
    move: 'Hold RM590 and qualify transport',
    urgency: 'Today',
    received: 'Today, 6:30 AM',
    icon: PackageSearch,
    reason: 'A full drum kit needs suitable transport. Confirm logistics before spending time on scheduling or negotiation.',
    draft: 'Hi Suria, the drum kit is available at RM590. Pickup is at Forest City Marina Hotel and you will need suitable transport. What day and time could you collect?',
  },
  {
    id: 'samri-cajon',
    rank: 6,
    item: 'Cajon Bundle',
    buyer: 'Samri',
    ask: 140,
    signal: 'Fresh inquiry',
    move: 'Hold RM140 and ask for an exact time',
    urgency: 'Today',
    received: 'Today, 6:19 AM',
    icon: MessageSquareText,
    reason: 'Samri is a fresh lead at an already reduced price. Test collection intent before offering another discount.',
    draft: 'Hi Samri, the cajon percussion bundle is available at RM140. Pickup is at Forest City Marina Hotel. What exact day and time could you collect?',
  },
  {
    id: 'shaaban-bass',
    rank: 7,
    item: '6-string Bass',
    buyer: 'Sha’aban',
    ask: 590,
    signal: 'General interest',
    move: 'Hold RM590 and ask for pickup timing',
    urgency: 'Today',
    received: 'Sunday',
    icon: MessageSquareText,
    reason: 'The bass has a new buyer signal but no price discussion. Move the conversation to a concrete collection time before negotiating.',
    draft: 'Hi Sha’aban, the 6-string bass is available at RM590. Pickup is at Forest City Marina Hotel. What day and time could you collect?',
  },
  {
    id: 'kangwei-ukulele',
    rank: 8,
    item: 'Ukulele',
    buyer: 'Kangwei',
    ask: 90,
    signal: 'Asked for the brand',
    move: 'Verify the brand marking before replying',
    urgency: 'Verify',
    received: 'Fresh product question',
    icon: Tag,
    reason: 'Kangwei asked a factual product question. Inspect the headstock or label first so the reply is accurate and useful.',
    draft: 'Hi Kangwei, I’m checking the brand marking now and will confirm it before you make a trip. The asking price is RM90 and pickup is at Forest City Marina Hotel.',
    note: 'Do not use this draft until the brand marking has been checked.',
  },
  {
    id: 'sufiyan-bike',
    rank: 9,
    item: 'Mountain Bike',
    buyer: 'Sufiyan',
    ask: 190,
    signal: 'Generic inquiry',
    move: 'Keep as second backup',
    urgency: 'Backup',
    received: 'Today, 10:00 AM',
    icon: Bike,
    reason: 'Two stronger bike leads are already ahead. Keep Sufiyan warm only if the full-price buyer does not schedule.',
    draft: 'Hi Sufiyan, the bike has active interest at RM190. If you can collect from Forest City Marina Hotel, please send your earliest pickup time and I will confirm availability.',
  },
]

const pipeline: PipelineRow[] = [
  { item: 'Mountain Bike', asking: 'RM190', lead: 'Murtaza + 3 backups', signal: 'Full-price RM190 offer', status: 'Close now', next: 'Schedule pickup' },
  { item: 'Fender Champion 40', asking: 'RM490', lead: 'Ahmad', signal: 'Specific RM400 offer', status: 'Offer', next: 'Counter RM450' },
  { item: 'TCL 98-inch TV', asking: 'RM10,000', lead: 'Danny', signal: 'Availability check', status: 'Fresh', next: 'Qualify transport' },
  { item: 'German-brand Drum Kit', asking: 'RM590', lead: 'Suria', signal: 'Fresh inquiry', status: 'Fresh', next: 'Qualify transport' },
  { item: 'Cajon Bundle', asking: 'RM140', lead: 'Samri', signal: 'Fresh inquiry', status: 'Fresh', next: 'Ask pickup time' },
  { item: '6-string Bass', asking: 'RM590', lead: 'Sha’aban', signal: 'General interest', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Ukulele', asking: 'RM90', lead: 'Kangwei', signal: 'Asked for brand', status: 'Fresh', next: 'Verify brand' },
  { item: 'Air Purifier', asking: 'RM150', lead: 'Ya Wau Sin', signal: 'Earlier availability check', status: 'Waiting', next: 'Ask pickup time' },
  { item: 'Arturia MiniLab MkII', asking: 'RM270', lead: 'Dam', signal: 'Earlier conversation', status: 'Waiting', next: 'Follow up once' },
  { item: 'M-Audio Monitor Pair', asking: 'RM200', lead: 'Marketplace buyer', signal: 'Earlier conversation', status: 'Waiting', next: 'Follow up once' },
  { item: 'Amazon Echo', asking: 'RM130', lead: 'None', signal: '47 clicks, no buyer signal', status: 'No signal', next: 'Consider RM120' },
  { item: 'Acoustic-Electric Guitar', asking: 'RM480', lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
  { item: 'Acoustic Guitar', asking: 'RM190', lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
  { item: 'Squier Stratocaster', asking: 'RM490', lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
]

const proof = [
  { value: 'RM590', label: 'credible money', detail: 'About USD147' },
  { value: '2', label: 'specific offers', detail: 'Bike and Fender' },
  { value: '7', label: 'fresh leads', detail: 'Since Sunday' },
  { value: '14', label: 'active listings', detail: 'All accounted for' },
]

const attention = [
  { item: 'Mountain Bike', clicks: 408, width: '100%' },
  { item: 'Air Purifier', clicks: 263, width: '64%' },
  { item: 'TCL 98-inch TV', clicks: 244, width: '60%' },
  { item: 'M-Audio Monitors', clicks: 218, width: '53%' },
  { item: 'Amazon Echo', clicks: 47, width: '12%' },
]

const approvalItems: ApprovalItem[] = [
  {
    id: 'reply:murtaza-bike',
    kind: 'Reply',
    title: 'Accept Murtaza’s full RM190 bike offer',
    summary: 'Confirm Forest City Marina Hotel and require an exact collection time.',
    value: 'RM190',
    actionId: 'murtaza-bike',
  },
  {
    id: 'reply:ahmad-fender',
    kind: 'Reply',
    title: 'Counter Ahmad once at RM450',
    summary: 'Split the RM90 gap, protect value, and move directly to pickup timing.',
    value: 'RM450',
    actionId: 'ahmad-fender',
  },
  {
    id: 'price:echo-120',
    kind: 'Price change',
    title: 'Reduce Amazon Echo from RM130 to RM120',
    summary: '47 clicks and no visible buyer signal make this the only current price test.',
    value: '-RM10',
  },
]

const decisionStoreKey = 'red-marketplace-decisions-v1'
const decisionStoreEvent = 'red-marketplace-decisions-changed'
const emptyDecisionSnapshot = '{}'

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

const statusStyles: Record<PipelineRow['status'], string> = {
  'Close now': 'border-[#2f7b55]/25 bg-[#dff3e7] text-[#245d42]',
  Offer: 'border-[#8b2232]/25 bg-[#f4dfe3] text-[#7c1f2e]',
  Fresh: 'border-[#355f9a]/20 bg-[#e5eef9] text-[#294f82]',
  Waiting: 'border-[#9a6d20]/25 bg-[#f6ecd7] text-[#79551c]',
  Watch: 'border-[#c7c2bb] bg-[#ece9e4] text-[#655e5a]',
  'No signal': 'border-[#b5572f]/25 bg-[#f8e4dc] text-[#8b4126]',
}

function urgencyStyles(urgency: Action['urgency']) {
  if (urgency === 'Now') return 'border-[#8b2232]/30 bg-[#f4dfe3] text-[#7c1f2e]'
  if (urgency === 'Today') return 'border-[#9a6d20]/25 bg-[#f6ecd7] text-[#79551c]'
  if (urgency === 'Verify') return 'border-[#355f9a]/20 bg-[#e5eef9] text-[#294f82]'
  return 'border-[#c7c2bb] bg-[#ece9e4] text-[#655e5a]'
}

export default function DashboardPage() {
  const [activeActionId, setActiveActionId] = useState(actions[0].id)
  const [reviewAction, setReviewAction] = useState<Action | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [priceReviewOpen, setPriceReviewOpen] = useState(false)
  const [priceReviewed, setPriceReviewed] = useState(false)

  const activeAction = useMemo(() => actions.find((action) => action.id === activeActionId) ?? actions[0], [activeActionId])
  const decisionSnapshot = useSyncExternalStore(subscribeToDecisionStore, getDecisionSnapshot, () => emptyDecisionSnapshot)
  const decisionStates = useMemo(() => parseDecisionSnapshot(decisionSnapshot), [decisionSnapshot])
  const copiedSet = useMemo(() => new Set(actions.filter((action) => decisionStates[`reply:${action.id}`] === 'copied').map((action) => action.id)), [decisionStates])
  const pendingApprovalCount = approvalItems.filter((item) => !decisionStates[item.id]).length
  const priceWatcherEnabled = decisionStates['policy:price-watcher'] !== 'held'

  const openReview = (action: Action) => {
    setReviewAction(action)
    setReviewed(false)
    setCopyError('')
  }

  const closeReview = () => {
    setReviewAction(null)
    setReviewed(false)
    setCopyError('')
  }

  const openPriceReview = () => {
    setPriceReviewOpen(true)
    setPriceReviewed(false)
  }

  const closePriceReview = () => {
    setPriceReviewOpen(false)
    setPriceReviewed(false)
  }

  const approveAndCopy = async () => {
    if (!reviewAction || !reviewed) return
    try {
      await navigator.clipboard.writeText(reviewAction.draft)
      writeDecisionStatus(`reply:${reviewAction.id}`, 'copied')
      closeReview()
    } catch {
      setCopyError('Clipboard access was blocked. Select the draft and copy it manually.')
    }
  }

  const approvePriceChange = () => {
    if (!priceReviewed) return
    writeDecisionStatus('price:echo-120', 'approved')
    closePriceReview()
  }

  return (
    <>
      <Head>
        <title>Marketplace Sales Desk | RedMart</title>
        <meta name="description" content="A clear Facebook Marketplace sales report with ranked next moves, pricing decisions, and copy-ready reply drafts." />
      </Head>

      <div className="dashboard-theme min-h-screen bg-background font-ops text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto grid min-h-[68px] max-w-[1680px] grid-cols-[1fr_auto] items-center gap-5 px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
            <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-3 font-semibold tracking-[-0.02em]" aria-label="RedMart home">
              <span className="grid size-7 rotate-6 place-items-center bg-[#211a1b]" aria-hidden="true"><span className="h-1 w-4 bg-[#e3c35a]" /></span>
              <span className="text-lg">RedMart</span>
            </Link>
            <nav aria-label="Dashboard sections" className="hidden items-center gap-8 md:flex">
              <a className="flex min-h-11 items-center text-sm font-medium text-foreground" href="#brief">Brief</a>
              <a className="flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground" href="#approvals">Approvals</a>
              <a className="flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground" href="#pipeline">Listings</a>
              <a className="flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground" href="#pricing">Pricing</a>
            </nav>
            <div className="justify-self-end"><Badge variant="outline" className="h-7 border-[#2f7b55]/25 bg-[#dff3e7] px-3 text-sm text-[#245d42]"><Bot data-icon="inline-start" aria-hidden="true" />Approval mode</Badge></div>
          </div>
        </header>

        <main className="mx-auto max-w-[1680px] px-5 pb-20 pt-12 md:px-8 md:pt-16">
          <section id="brief" aria-labelledby="brief-heading" className="scroll-mt-28">
            <p className="font-opsmono text-sm font-semibold uppercase tracking-[0.08em] text-[#8b2232]">Marketplace sales desk / 00</p>
            <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)] lg:items-end">
              <h1 id="brief-heading" className="max-w-[980px] text-[clamp(2.8rem,6vw,5.7rem)] font-medium leading-[0.94] tracking-[-0.065em]">Close RM190. Then work the next six live buyers.</h1>
              <div className="max-w-xl lg:justify-self-end"><p className="text-lg leading-8 text-muted-foreground">Red has ranked the strongest Marketplace signals into one decision queue. Review the reasoning, approve a draft, then send it yourself in Helium.</p><div className="mt-5 flex items-center gap-2 font-opsmono text-sm text-muted-foreground"><Clock3 className="size-4" aria-hidden="true" />Snapshot {snapshotLabel}</div></div>
            </div>

            <div className="mt-10 grid border-y border-border sm:grid-cols-2 xl:grid-cols-4" aria-label="Current Marketplace totals">
              {proof.map((item, index) => (
                <div key={item.label} className={cn('flex min-h-[92px] items-baseline gap-3 py-5 sm:px-5 xl:px-6', index > 0 && 'border-t sm:border-t-0', index > 1 && 'sm:border-t xl:border-t-0', index % 2 === 1 && 'sm:border-l', index > 0 && 'xl:border-l')}>
                  <strong className="font-opsmono text-2xl font-medium tabular-nums">{item.value}</strong>
                  <span><span className="block text-base font-medium">{item.label}</span><span className="mt-1 block text-sm text-muted-foreground">{item.detail}</span></span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid border border-border bg-card lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(170px,0.5fr))]" aria-label="Red agent operating status">
              <div className="flex items-start gap-4 p-5 lg:p-6">
                <span className="grid size-11 shrink-0 place-items-center bg-[#211a1b] text-[#e3c35a]"><Bot className="size-5" aria-hidden="true" /></span>
                <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.06em] text-[#8b2232]">Red operating status</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Latest snapshot analyzed. Live sync needs Helium approval.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Red can keep ranking, researching, and drafting from captured data. Facebook changes wait for an exact approval and a connected local Helium session.</p></div>
              </div>
              <div className="border-t border-border p-5 lg:border-l lg:border-t-0"><Database className="size-5 text-[#2f7b55]" aria-hidden="true" /><strong className="mt-4 block text-lg">14 / 14</strong><span className="mt-1 block text-sm text-muted-foreground">Listings accounted for</span></div>
              <div className="border-t border-border p-5 lg:border-l lg:border-t-0"><ClipboardCheck className="size-5 text-[#8b2232]" aria-hidden="true" /><strong className="mt-4 block text-lg tabular-nums">{pendingApprovalCount}</strong><span className="mt-1 block text-sm text-muted-foreground">Decisions waiting</span></div>
              <div className="border-t border-border p-5 lg:border-l lg:border-t-0"><WifiOff className="size-5 text-[#9a6d20]" aria-hidden="true" /><strong className="mt-4 block text-lg">Paused</strong><span className="mt-1 block text-sm text-muted-foreground">Live Facebook sync</span></div>
            </div>
          </section>

          <section id="actions" aria-labelledby="actions-heading" className="mt-8 grid scroll-mt-28 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <div className="bg-[#211a1b] p-5 text-[#fffaf3] md:p-7 xl:min-h-[640px]">
              <div className="flex items-center justify-between gap-4 font-opsmono text-sm uppercase tracking-[0.06em] text-[#bdb5b0]"><span className="text-[#e3c35a]">{String(activeAction.rank).padStart(2, '0')} / {String(actions.length).padStart(2, '0')}</span><span>Recommended move</span></div>

              <div className="mt-14 max-w-4xl">
                <div className="flex flex-wrap items-center gap-3"><Badge variant="outline" className="h-7 border-[#fffaf3]/20 bg-[#fffaf3]/5 px-3 text-sm text-[#fffaf3]">{activeAction.signal}</Badge><span className="font-opsmono text-sm text-[#bdb5b0]">{activeAction.received}</span></div>
                <h2 id="actions-heading" className="mt-5 text-[clamp(2rem,4vw,4rem)] font-medium leading-[1.02] tracking-[-0.055em]">{activeAction.move}</h2>
                <p className="mt-5 text-lg leading-8 text-[#d5cfca]">{activeAction.reason}</p>
              </div>

              <div className="mt-10 grid border-y border-[#fffaf3]/20 sm:grid-cols-3">
                <div className="py-4 sm:pr-5"><span className="font-opsmono text-sm uppercase text-[#9e9690]">Buyer</span><strong className="mt-2 block text-lg font-medium">{activeAction.buyer}</strong></div>
                <div className="border-t border-[#fffaf3]/20 py-4 sm:border-l sm:border-t-0 sm:px-5"><span className="font-opsmono text-sm uppercase text-[#9e9690]">Item</span><strong className="mt-2 block text-lg font-medium">{activeAction.item}</strong></div>
                <div className="border-t border-[#fffaf3]/20 py-4 sm:border-l sm:border-t-0 sm:pl-5"><span className="font-opsmono text-sm uppercase text-[#9e9690]">Ask / offer</span><strong className="mt-2 block font-opsmono text-lg font-medium tabular-nums">RM{activeAction.ask.toLocaleString()}{activeAction.offer ? ` / RM${activeAction.offer.toLocaleString()}` : ''}</strong></div>
              </div>

              <div className="mt-8 border border-[#fffaf3]/20 bg-[#2b2425] p-5">
                <div className="flex items-center justify-between gap-4"><p className="font-opsmono text-sm uppercase tracking-[0.06em] text-[#e3c35a]">Draft preview</p><ShieldCheck className="size-5 text-[#e3c35a]" aria-label="Manual send only" /></div>
                <p className="mt-4 text-base leading-7 text-[#eee8e1]">{activeAction.draft}</p>
                {activeAction.note ? <div className="mt-4 flex items-start gap-3 border-l-2 border-[#e3c35a] pl-4 text-sm leading-6 text-[#e8dca9]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{activeAction.note}</div> : null}
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-lg text-sm leading-6 text-[#aaa29d]">Review and copy only. Red cannot send, reply, or react as you.</p>
                <Button className="min-h-11 bg-[#8b2232] px-5 text-sm text-white hover:bg-[#721a27]" onClick={() => openReview(activeAction)}>{copiedSet.has(activeAction.id) ? <Check aria-hidden="true" /> : <ClipboardCheck aria-hidden="true" />}{copiedSet.has(activeAction.id) ? 'Draft copied' : 'Review this draft'}<ArrowRight aria-hidden="true" /></Button>
              </div>
            </div>

            <aside className="border border-border bg-card" aria-label="Ranked lead queue">
              <div className="border-b border-border p-5 md:p-6"><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-[#8b2232]">Lead queue / 09</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">Choose the next buyer</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ranked by offer specificity, value, recency, and pickup readiness.</p></div>
              <ol>
                {actions.map((action) => {
                  const Icon = action.icon
                  const isActive = activeAction.id === action.id
                  return (
                    <li key={action.id} className="border-b border-border last:border-b-0">
                      <button type="button" className={cn('grid min-h-[76px] w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:px-5', isActive && 'bg-[#f1e6e7]')} onClick={() => setActiveActionId(action.id)} aria-pressed={isActive} aria-label={`View action ${action.rank} for ${action.buyer} about ${action.item}`}>
                        <span className={cn('grid size-9 place-items-center border border-border bg-background text-sm', isActive && 'border-[#8b2232]/30 bg-[#8b2232] text-white')}><Icon className="size-4" aria-hidden="true" /></span>
                        <span className="min-w-0"><strong className="block truncate text-base font-semibold">{action.buyer}</strong><span className="mt-1 block truncate text-sm text-muted-foreground">{action.item} · {action.signal}</span></span>
                        <span className="flex items-center gap-2"><Badge variant="outline" className={cn('h-7 px-2.5 text-sm', urgencyStyles(action.urgency))}>{action.urgency}</Badge><ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" /></span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </aside>
          </section>

          <section id="approvals" aria-labelledby="approvals-heading" className="mt-20 scroll-mt-28">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] md:items-end">
              <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-[#8b2232]">Decision inbox / {String(pendingApprovalCount).padStart(2, '0')}</p><h2 id="approvals-heading" className="mt-3 text-[clamp(2.2rem,4vw,4.2rem)] font-medium leading-none tracking-[-0.055em]">Red works. You decide.</h2></div>
              <p className="text-base leading-7 text-muted-foreground">Every move arrives with evidence, tradeoffs, exact scope, and a reversible approval. Buyer replies remain copy-only for your final send.</p>
            </div>

            <div className="mt-8 border-t border-[#282321]">
              {approvalItems.map((item, index) => {
                const state = decisionStates[item.id]
                const action = item.actionId ? actions.find((candidate) => candidate.id === item.actionId) : undefined
                const review = () => item.kind === 'Price change' ? openPriceReview() : action && openReview(action)
                return (
                  <article key={item.id} className="grid gap-5 border-b border-border px-4 py-5 md:grid-cols-[48px_120px_minmax(0,1fr)_110px_auto] md:items-center md:py-4">
                    <span className="font-opsmono text-sm text-[#8b2232]">{String(index + 1).padStart(2, '0')}</span>
                    <Badge variant="outline" className={cn('h-7 px-3 text-sm', item.kind === 'Price change' ? 'border-[#9a6d20]/25 bg-[#f6ecd7] text-[#79551c]' : 'border-[#355f9a]/20 bg-[#e5eef9] text-[#294f82]')}>{item.kind}</Badge>
                    <div><h3 className="text-lg font-semibold tracking-[-0.025em]">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p></div>
                    <strong className="font-opsmono text-lg font-medium tabular-nums md:text-right">{item.value}</strong>
                    <Button variant="outline" className={cn('min-h-11 min-w-[148px] border-border bg-transparent px-4 text-sm hover:bg-muted', state && 'border-[#2f7b55]/25 bg-[#dff3e7] text-[#245d42]')} onClick={review}>
                      {state ? <CheckCircle2 aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                      {state === 'copied' ? 'Copied for send' : state === 'approved' ? 'Approved locally' : state === 'held' ? 'Held' : 'Review decision'}
                    </Button>
                  </article>
                )
              })}
            </div>
          </section>

          <section id="pipeline" aria-labelledby="pipeline-heading" className="mt-20 scroll-mt-28">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] md:items-end"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-[#8b2232]">Listing ledger / 14</p><h2 id="pipeline-heading" className="mt-3 text-[clamp(2.2rem,4vw,4.2rem)] font-medium leading-none tracking-[-0.055em]">Every item. Nothing hidden.</h2></div><p className="text-base leading-7 text-muted-foreground">All fields reflow into readable two-column records on smaller screens. Nothing is clipped or pushed off-canvas.</p></div>

            <div className="mt-8 border-t border-[#282321]">
              <div className="hidden min-h-12 grid-cols-[minmax(180px,1.35fr)_92px_minmax(150px,1fr)_minmax(170px,1.2fr)_118px_112px] items-center gap-4 border-b border-border px-4 font-opsmono text-sm uppercase tracking-[0.04em] text-muted-foreground xl:grid"><span>Item</span><span>Asking</span><span>Top lead</span><span>Signal</span><span>Status</span><span className="text-right">Next move</span></div>
              {pipeline.map((row, index) => (
                <article key={row.item} className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-border px-4 py-5 transition-colors hover:bg-card xl:min-h-[68px] xl:grid-cols-[minmax(180px,1.35fr)_92px_minmax(150px,1fr)_minmax(170px,1.2fr)_118px_112px] xl:items-center xl:gap-4 xl:py-3">
                  <div className="col-span-2 xl:col-span-1"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Item</span><div className="flex items-center gap-3"><span className="font-opsmono text-sm text-[#8b2232]">{String(index + 1).padStart(2, '0')}</span><strong className="text-base font-semibold">{row.item}</strong></div></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Asking</span><span className="font-opsmono text-base font-medium tabular-nums">{row.asking}</span></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Top lead</span><span className="text-sm text-muted-foreground">{row.lead}</span></div>
                  <div className="col-span-2 sm:col-span-1"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Signal</span><span className="text-sm text-muted-foreground">{row.signal}</span></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Status</span><Badge variant="outline" className={cn('h-7 px-2.5 text-sm', statusStyles[row.status])}>{row.status}</Badge></div>
                  <div className="text-right"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Next move</span><span className="text-sm font-semibold">{row.next}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="policy-heading" className="mt-20 border border-border bg-card">
            <div className="grid gap-6 border-b border-border p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7">
              <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-[#8b2232]">Agent policy / approval gated</p><h2 id="policy-heading" className="mt-2 text-3xl font-medium tracking-[-0.045em]">Do the work automatically. Escalate the decisions.</h2><p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">Red monitors every listing, scores buyer intent, prepares follow-ups, and detects stale pricing. It asks before any listing mutation and never sends a person-to-person message as Adam.</p></div>
              <Button variant="outline" className={cn('min-h-11 border-border bg-transparent px-4 text-sm hover:bg-muted', priceWatcherEnabled && 'border-[#2f7b55]/25 bg-[#dff3e7] text-[#245d42]')} onClick={() => writeDecisionStatus('policy:price-watcher', priceWatcherEnabled ? 'held' : 'approved')}>
                {priceWatcherEnabled ? <Zap aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
                Price watcher {priceWatcherEnabled ? 'on' : 'off'}
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['01', 'Monitor', 'Check listings and inbox previews every hour when Helium is connected.'],
                ['02', 'Work leads', 'Rank intent, draft replies, flag scams, and ask for exact pickup timing.'],
                ['03', 'Price intelligently', 'Propose a small reduction after 72 hours with no buyer signal and at least 25 clicks.'],
                ['04', 'Ask before acting', 'Require an exact approval for every price, status, or listing-field change.'],
              ].map(([number, title, description], index) => (
                <div key={number} className={cn('min-h-[190px] p-5 md:p-6', index > 0 && 'border-t border-border sm:border-t-0 sm:border-l', index === 2 && 'sm:border-l-0 xl:border-l', index > 1 && 'sm:border-t xl:border-t-0')}>
                  <span className="font-opsmono text-sm text-[#8b2232]">{number}</span><h3 className="mt-10 text-xl font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="pricing" aria-labelledby="pricing-heading" className="mt-20 grid scroll-mt-28 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.62fr)]">
            <div className="border border-border bg-card p-5 md:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-[#8b2232]">Price decision / 01</p><h2 id="pricing-heading" className="mt-3 text-3xl font-medium tracking-[-0.045em]">Amazon Echo: RM130 to RM120</h2><p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">The Echo has 47 clicks and no visible buyer signal. A RM10 cut is the only current repricing proposal. {decisionStates['price:echo-120'] === 'approved' ? 'The exact change is approved locally but not yet applied to Facebook.' : decisionStates['price:echo-120'] === 'held' ? 'The current decision is to hold RM130.' : 'No change has been approved or applied.'}</p></div><Badge variant="outline" className="h-7 shrink-0 border-[#9a6d20]/25 bg-[#f6ecd7] px-3 text-sm text-[#79551c]"><TrendingDown data-icon="inline-start" aria-hidden="true" />Owner decision</Badge></div>
              <div className="mt-8 grid border-y border-border sm:grid-cols-3"><div className="py-5 sm:pr-5"><span className="font-opsmono text-sm uppercase text-muted-foreground">Current</span><strong className="mt-2 block font-opsmono text-3xl font-medium tabular-nums">RM130</strong></div><div className="border-t border-border py-5 sm:border-l sm:border-t-0 sm:px-5"><span className="font-opsmono text-sm uppercase text-[#8b2232]">Proposed</span><strong className="mt-2 block font-opsmono text-3xl font-medium tabular-nums text-[#8b2232]">RM120</strong></div><div className="border-t border-border py-5 sm:border-l sm:border-t-0 sm:pl-5"><span className="font-opsmono text-sm uppercase text-muted-foreground">Tradeoff</span><strong className="mt-2 block text-base font-medium">RM10 less for a faster conversion test</strong></div></div>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-6 text-muted-foreground">If approved, reassess 24 hours after the edit. Hold all other listing prices while buyer conversations are active.</p><Button variant="outline" className={cn('min-h-11 shrink-0 border-border bg-transparent px-4 text-sm hover:bg-muted', decisionStates['price:echo-120'] && 'border-[#2f7b55]/25 bg-[#dff3e7] text-[#245d42]')} onClick={openPriceReview}>{decisionStates['price:echo-120'] === 'approved' ? <CheckCircle2 aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}{decisionStates['price:echo-120'] === 'approved' ? 'Approved locally' : decisionStates['price:echo-120'] === 'held' ? 'Price held' : 'Review price change'}</Button></div>
            </div>

            <div className="bg-[#8b2232] p-5 text-white md:p-7">
              <p className="font-opsmono text-sm font-semibold uppercase tracking-[0.07em] text-[#f1cad0]">Attention map / clicks</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.045em]">Demand is concentrated.</h2>
              <div className="mt-7 space-y-5">{attention.map((item) => (<div key={item.item}><div className="flex items-center justify-between gap-4 text-sm"><span>{item.item}</span><span className="font-opsmono tabular-nums">{item.clicks}</span></div><div className="mt-2 h-1.5 bg-white/20"><div className="h-full bg-[#e3c35a]" style={{ width: item.width }} /></div></div>))}</div>
              <div className="mt-7 border-t border-white/25 pt-5 text-sm leading-6 text-[#f3dce0]"><strong className="text-white">Zero-signal watch:</strong> Echo is the only listing with measured clicks but no buyer signal. Three guitars have no fresh inquiry preview and should stay unchanged until their listing data is checked.</div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 border border-border bg-card p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-6" aria-labelledby="safety-heading">
            <span className="grid size-11 place-items-center border border-[#2f7b55]/25 bg-[#dff3e7] text-[#245d42]"><ShieldCheck className="size-5" aria-hidden="true" /></span>
            <div><h2 id="safety-heading" className="text-lg font-semibold">Approval means copy, never send</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Red can prepare the move and exact wording. Adam performs every person-to-person communication in Helium.</p></div>
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8b2232]">About RedMart <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </section>
        </main>
      </div>

      <Dialog open={reviewAction !== null} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="dashboard-dialog-theme border-border bg-popover font-ops text-popover-foreground shadow-2xl shadow-black/25 sm:max-w-xl">
          {reviewAction ? <>
            <DialogHeader><Badge variant="outline" className="mb-1 h-7 border-[#8b2232]/25 bg-[#f4dfe3] px-3 text-sm text-[#7c1f2e]">Action {String(reviewAction.rank).padStart(2, '0')}</Badge><DialogTitle className="font-ops text-2xl font-medium tracking-[-0.04em] text-foreground">Review reply for {reviewAction.buyer}</DialogTitle><DialogDescription className="text-base leading-7 text-muted-foreground">Confirm the recipient, price, pickup location, and wording before this draft is copied.</DialogDescription></DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm"><div><p className="font-opsmono uppercase text-muted-foreground">Item</p><p className="mt-1 font-semibold">{reviewAction.item}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Asking</p><p className="mt-1 font-opsmono font-semibold tabular-nums">RM{reviewAction.ask.toLocaleString()}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Recommended</p><p className="mt-1 font-semibold">{reviewAction.move}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Pickup</p><p className="mt-1 font-semibold">Forest City Marina Hotel</p></div></div>
              <div><p className="mb-2 font-opsmono text-sm font-semibold uppercase tracking-[0.05em] text-[#8b2232]">Why this move</p><p className="text-base leading-7 text-muted-foreground">{reviewAction.reason}</p></div>
              <div><p className="mb-2 font-opsmono text-sm font-semibold uppercase tracking-[0.05em] text-[#8b2232]">Exact draft</p><div className="select-text border border-border bg-background p-4 text-base leading-7">{reviewAction.draft}</div></div>
              {reviewAction.note ? <div className="flex items-start gap-3 border-l-2 border-[#9a6d20] bg-[#f6ecd7] p-4 text-sm leading-6 text-[#79551c]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{reviewAction.note}</div> : null}
              <label className="flex min-h-12 cursor-pointer items-start gap-3 border border-border bg-muted p-4 text-base text-foreground hover:bg-[#dedad4]"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} className="mt-1 size-5 shrink-0 accent-[#8b2232]" /><span>I reviewed the final recipient, price, pickup location, and wording.</span></label>
              {copyError ? <p role="alert" className="text-sm text-[#8b2232]">{copyError}</p> : null}
              <div className="flex items-start gap-3 border border-[#2f7b55]/25 bg-[#dff3e7] p-4 text-sm leading-6 text-[#245d42]"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Approving copies this draft to your clipboard. It does not send a Facebook message. You must send it manually in Helium.</div>
            </div>
            <DialogFooter className="border-border bg-muted"><Button variant="ghost" className="min-h-11" onClick={closeReview}>Cancel</Button><Button className="min-h-11" disabled={!reviewed} onClick={approveAndCopy}><ClipboardCheck aria-hidden="true" />Approve & copy reply</Button></DialogFooter>
          </> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={priceReviewOpen} onOpenChange={(open) => !open && closePriceReview()}>
        <DialogContent className="dashboard-dialog-theme border-border bg-popover font-ops text-popover-foreground shadow-2xl shadow-black/25 sm:max-w-xl">
          <DialogHeader><Badge variant="outline" className="mb-1 h-7 border-[#9a6d20]/25 bg-[#f6ecd7] px-3 text-sm text-[#79551c]"><TrendingDown data-icon="inline-start" aria-hidden="true" />Price approval</Badge><DialogTitle className="font-ops text-2xl font-medium tracking-[-0.04em] text-foreground">Reduce Amazon Echo to RM120?</DialogTitle><DialogDescription className="text-base leading-7 text-muted-foreground">Approve one exact listing-field change. No other title, description, status, or listing field is included.</DialogDescription></DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-3 border-y border-border py-4 text-sm"><div><p className="font-opsmono uppercase text-muted-foreground">Current</p><p className="mt-1 font-opsmono text-xl font-semibold tabular-nums">RM130</p></div><div className="border-l border-border pl-4"><p className="font-opsmono uppercase text-[#8b2232]">Approved price</p><p className="mt-1 font-opsmono text-xl font-semibold tabular-nums text-[#8b2232]">RM120</p></div><div className="border-l border-border pl-4"><p className="font-opsmono uppercase text-muted-foreground">Change</p><p className="mt-1 font-opsmono text-xl font-semibold tabular-nums">-RM10</p></div></div>
            <div><p className="mb-2 font-opsmono text-sm font-semibold uppercase tracking-[0.05em] text-[#8b2232]">Why Red recommends it</p><p className="text-base leading-7 text-muted-foreground">The listing has 47 clicks and no visible buyer signal. A 7.7% reduction is small enough to preserve value and large enough to create a fresh pricing test.</p></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="border border-border bg-background p-4"><SlidersHorizontal className="size-5 text-[#8b2232]" aria-hidden="true" /><strong className="mt-3 block">Exact scope</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">Amazon Echo price only, RM130 to RM120.</p></div><div className="border border-border bg-background p-4"><Clock3 className="size-5 text-[#8b2232]" aria-hidden="true" /><strong className="mt-3 block">Recheck window</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">Wait 24 hours before proposing another change.</p></div></div>
            <label className="flex min-h-12 cursor-pointer items-start gap-3 border border-border bg-muted p-4 text-base text-foreground hover:bg-[#dedad4]"><input type="checkbox" checked={priceReviewed} onChange={(event) => setPriceReviewed(event.target.checked)} className="mt-1 size-5 shrink-0 accent-[#8b2232]" /><span>I approve changing only the Amazon Echo price from RM130 to RM120.</span></label>
            <div className="flex items-start gap-3 border border-[#9a6d20]/25 bg-[#f6ecd7] p-4 text-sm leading-6 text-[#79551c]"><WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />This approval is saved in this dashboard. Applying it to Facebook still requires the local Helium connector, which is currently awaiting remote-debugging approval.</div>
          </div>
          <DialogFooter className="border-border bg-muted"><Button variant="ghost" className="min-h-11" onClick={() => { writeDecisionStatus('price:echo-120', 'held'); closePriceReview() }}>Hold price</Button><Button className="min-h-11" disabled={!priceReviewed} onClick={approvePriceChange}><Check aria-hidden="true" />Approve exact price</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
