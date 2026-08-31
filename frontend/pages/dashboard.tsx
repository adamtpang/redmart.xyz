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
  Tag,
  Tv,
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
  approvalValue?: number
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

const snapshotLabel = '31 Aug, 2:31 PM SGT'

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
    approvalValue: 450,
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
    id: 'anand-maudio',
    rank: 4,
    item: 'M-Audio Monitor Pair',
    buyer: 'Anand',
    ask: 200,
    signal: 'New availability inquiry',
    move: 'Hold RM200 and request an exact pickup time',
    urgency: 'Today',
    received: 'Today, 12:38 PM',
    icon: MessageSquareText,
    reason: 'Anand is the newest inquiry on the speaker pair. The asking price is already competitive, so test collection intent before discussing a discount.',
    draft: 'Hi Anand, yes, the M-Audio speaker pair is available for RM200. Pickup is at Forest City Marina Hotel. What day and exact time can you collect?',
  },
  {
    id: 'hamka-cajon',
    rank: 5,
    item: 'Cajon Bundle',
    buyer: 'Hamka',
    ask: 140,
    signal: 'New availability inquiry',
    move: 'Hold RM140 and request an exact pickup time',
    urgency: 'Today',
    received: 'Today, 2:31 PM',
    icon: MessageSquareText,
    reason: 'Hamka is the newest Cajon inquiry. The listing already has strong traffic, so hold RM140 and test collection intent before negotiating.',
    draft: 'Hi Hamka, ya, cajon dan bundle perkusi masih ada pada harga RM140. Pickup di Forest City Marina Hotel. Bila tarikh dan masa tepat anda boleh ambil?',
  },
  {
    id: 'mohd-bike',
    rank: 6,
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
    rank: 7,
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
    rank: 8,
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
    rank: 9,
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
    rank: 10,
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
    rank: 11,
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
  { item: 'Cajon Bundle', asking: 'RM140', lead: 'Hamka + Samri', signal: 'Newest inquiry at 2:31 PM', status: 'Fresh', next: 'Ask pickup time' },
  { item: '6-string Bass', asking: 'RM590', lead: 'Sha’aban', signal: 'General interest', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Ukulele', asking: 'RM90', lead: 'Kangwei', signal: 'Asked for brand', status: 'Fresh', next: 'Verify brand' },
  { item: 'Air Purifier', asking: 'RM150', lead: 'Zainul + 1', signal: 'Recent message cluster', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Arturia MiniLab MkII', asking: 'RM270', lead: 'Dam', signal: 'Recent message', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'M-Audio Monitor Pair', asking: 'RM200', lead: 'Anand', signal: 'Asked if available', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Amazon Echo', asking: 'RM120', lead: 'None', signal: 'Price test live after 47 clicks', status: 'Watch', next: 'Reassess after 24 hours' },
  { item: 'Acoustic-Electric Guitar', asking: 'RM480', lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
  { item: 'Acoustic Guitar', asking: 'RM190', lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
  { item: 'Squier Stratocaster', asking: 'RM490', lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
]

const proof = [
  { value: 'RM590', label: 'credible money', detail: 'About USD147' },
  { value: '2', label: 'specific offers', detail: 'Bike and Fender' },
  { value: '9', label: 'items with messages', detail: 'Visible notification pane' },
  { value: '14', label: 'active listings', detail: 'All accounted for' },
]

const attention = [
  { item: 'Mountain Bike', clicks: 411, width: '100%' },
  { item: 'Air Purifier', clicks: 264, width: '64%' },
  { item: 'TCL 98-inch TV', clicks: 246, width: '60%' },
  { item: 'M-Audio Monitors', clicks: 218, width: '53%' },
  { item: 'Amazon Echo', clicks: 47, width: '12%' },
]

const approvalItems: ApprovalItem[] = [
  ...actions.map((action) => ({
    id: `reply:${action.id}`,
    kind: 'Reply' as const,
    title: action.move,
    summary: `${action.buyer} · ${action.item} · ${action.signal}. ${action.reason}`,
    value: `RM${(action.approvalValue ?? action.offer ?? action.ask).toLocaleString()}`,
    actionId: action.id,
  })),
  {
    id: 'price:echo-120',
    kind: 'Price change',
    title: 'Amazon Echo price is live at RM120',
    summary: 'Approved, applied through Red Helium, and verified on the Facebook selling dashboard.',
    value: 'RM120',
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
  'Close now': 'border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]',
  Offer: 'border-[#c2344d]/35 bg-[#8b2232]/25 text-[#f0a0af]',
  Fresh: 'border-[#5b7db1]/35 bg-[#5b7db1]/15 text-[#afc9ee]',
  Waiting: 'border-[#c9a84c]/35 bg-[#c9a84c]/10 text-[#e0c976]',
  Watch: 'border-white/15 bg-white/5 text-[#c7bcb5]',
  'No signal': 'border-[#b5572f]/35 bg-[#b5572f]/10 text-[#dc9e82]',
}

function urgencyStyles(urgency: Action['urgency']) {
  if (urgency === 'Now') return 'border-[#c2344d]/35 bg-[#8b2232]/25 text-[#f0a0af]'
  if (urgency === 'Today') return 'border-[#c9a84c]/35 bg-[#c9a84c]/10 text-[#e0c976]'
  if (urgency === 'Verify') return 'border-[#5b7db1]/35 bg-[#5b7db1]/15 text-[#afc9ee]'
  return 'border-white/15 bg-white/5 text-[#c7bcb5]'
}

export default function DashboardPage() {
  const [activeActionId, setActiveActionId] = useState(actions[0].id)
  const [reviewAction, setReviewAction] = useState<Action | null>(null)
  const [copyError, setCopyError] = useState('')

  const activeAction = useMemo(() => actions.find((action) => action.id === activeActionId) ?? actions[0], [activeActionId])
  const decisionSnapshot = useSyncExternalStore(subscribeToDecisionStore, getDecisionSnapshot, () => emptyDecisionSnapshot)
  const decisionStates = useMemo(() => parseDecisionSnapshot(decisionSnapshot), [decisionSnapshot])
  const copiedSet = useMemo(() => new Set(actions.filter((action) => decisionStates[`reply:${action.id}`] === 'copied').map((action) => action.id)), [decisionStates])
  const pendingApprovalCount = approvalItems.filter((item) => item.id !== 'price:echo-120' && !decisionStates[item.id]).length
  const priceWatcherEnabled = decisionStates['policy:price-watcher'] !== 'held'

  const openReview = (action: Action) => {
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
        <meta name="description" content="A clear Facebook Marketplace sales report with ranked next moves, pricing decisions, and copy-ready reply drafts." />
      </Head>

      <div className="dashboard-theme min-h-screen bg-background font-body text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-[#1a0a0a]/90 backdrop-blur-xl">
          <div className="mx-auto grid min-h-[68px] max-w-[1360px] grid-cols-[1fr_auto] items-center gap-5 px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
            <Link href="/" className="inline-flex min-h-[44px] w-fit items-center gap-3 font-display font-semibold tracking-[-0.02em]" aria-label="RedMart home">
              <span className="grid size-8 place-items-center rounded-full border border-[#c2344d]/40 bg-[#8b2232] font-display text-sm italic text-[#fff5ee]" aria-hidden="true">R</span>
              <span className="text-lg">RedMart</span>
            </Link>
            <nav aria-label="Dashboard sections" className="hidden items-center gap-8 md:flex">
              <a className="flex min-h-[44px] items-center text-sm font-medium text-foreground" href="#brief">Brief</a>
              <a className="flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground" href="#approvals">Approvals</a>
              <a className="flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground" href="#pipeline">Listings</a>
              <a className="flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground" href="#pricing">Pricing</a>
            </nav>
            <div className="justify-self-end"><Badge variant="outline" className="h-7 border-[#4caf72]/35 bg-[#4caf72]/10 px-3 text-sm text-[#9ad8b0]"><Bot data-icon="inline-start" aria-hidden="true" />Approval mode</Badge></div>
          </div>
        </header>

        <main className="mx-auto max-w-[1360px] px-5 pb-20 pt-12 md:px-8 md:pt-16">
          <section id="brief" aria-labelledby="brief-heading" className="scroll-mt-28">
            <p className="font-opsmono text-sm font-semibold uppercase tracking-[0.12em] text-gold">Red Marketplace desk / 00</p>
            <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)] lg:items-end">
              <h1 id="brief-heading" className="max-w-[920px] font-display text-[clamp(2.8rem,6vw,5.7rem)] font-semibold leading-[0.94] tracking-[-0.045em]">Close RM190.<span className="block italic text-accent-light">Let Red work the live buyer queue.</span></h1>
              <div className="max-w-xl lg:justify-self-end"><p className="text-lg leading-8 text-muted-foreground">Red has ranked the strongest Marketplace signals into one decision queue. Review the reasoning, approve a draft, then send it yourself in Helium.</p><div className="mt-5 flex items-center gap-2 font-opsmono text-sm text-muted-foreground"><Clock3 className="size-4" aria-hidden="true" />Snapshot {snapshotLabel}</div></div>
            </div>

            <div className="mt-10 grid overflow-hidden rounded-2xl border border-border bg-surface-1/75 shadow-2xl shadow-black/15 sm:grid-cols-2 xl:grid-cols-4" aria-label="Current Marketplace totals">
              {proof.map((item, index) => (
                <div key={item.label} className={cn('flex min-h-[92px] items-baseline gap-3 py-5 sm:px-5 xl:px-6', index > 0 && 'border-t sm:border-t-0', index > 1 && 'sm:border-t xl:border-t-0', index % 2 === 1 && 'sm:border-l', index > 0 && 'xl:border-l')}>
                  <strong className="font-opsmono text-2xl font-medium tabular-nums">{item.value}</strong>
                  <span><span className="block text-base font-medium">{item.label}</span><span className="mt-1 block text-sm text-muted-foreground">{item.detail}</span></span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl shadow-black/15 lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(170px,0.5fr))]" aria-label="Red agent operating status">
              <div className="flex items-start gap-4 p-5 lg:p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/10 text-gold"><Bot className="size-5" aria-hidden="true" /></span>
                <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.08em] text-gold">Red operating status</p><h2 className="mt-1 font-display text-xl font-semibold">Dedicated Red Helium is connected.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Red can monitor listings, rank leads, research prices, and verify approved listing changes. Buyer replies remain manual.</p></div>
              </div>
              <div className="border-t border-border p-5 lg:border-l lg:border-t-0"><Database className="size-5 text-[#9ad8b0]" aria-hidden="true" /><strong className="mt-4 block font-display text-lg">14 / 14</strong><span className="mt-1 block text-sm text-muted-foreground">Listings accounted for</span></div>
              <div className="border-t border-border p-5 lg:border-l lg:border-t-0"><ClipboardCheck className="size-5 text-accent-light" aria-hidden="true" /><strong className="mt-4 block font-display text-lg tabular-nums">{pendingApprovalCount}</strong><span className="mt-1 block text-sm text-muted-foreground">Decisions waiting</span></div>
              <div className="border-t border-border p-5 lg:border-l lg:border-t-0"><RefreshCw className="size-5 text-[#9ad8b0]" aria-hidden="true" /><strong className="mt-4 block font-display text-lg">Hourly</strong><span className="mt-1 block text-sm text-muted-foreground">Monitoring schedule</span></div>
            </div>
          </section>

          <section id="actions" aria-labelledby="actions-heading" className="mt-8 grid scroll-mt-28 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <div className="overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-[#3a151b] via-[#241111] to-[#1a0a0a] p-5 text-[#fffaf3] shadow-2xl shadow-black/25 md:p-7 xl:min-h-[640px]">
              <div className="flex items-center justify-between gap-4 font-opsmono text-sm uppercase tracking-[0.06em] text-[#bdb5b0]"><span className="text-[#e3c35a]">{String(activeAction.rank).padStart(2, '0')} / {String(actions.length).padStart(2, '0')}</span><span>Recommended move</span></div>

              <div className="mt-14 max-w-4xl">
                <div className="flex flex-wrap items-center gap-3"><Badge variant="outline" className="h-7 border-[#fffaf3]/20 bg-[#fffaf3]/5 px-3 text-sm text-[#fffaf3]">{activeAction.signal}</Badge><span className="font-opsmono text-sm text-[#bdb5b0]">{activeAction.received}</span></div>
                <h2 id="actions-heading" className="mt-5 font-display text-[clamp(2rem,4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">{activeAction.move}</h2>
                <p className="mt-5 text-lg leading-8 text-[#d5cfca]">{activeAction.reason}</p>
              </div>

              <div className="mt-10 grid border-y border-[#fffaf3]/20 sm:grid-cols-3">
                <div className="py-4 sm:pr-5"><span className="font-opsmono text-sm uppercase text-[#9e9690]">Buyer</span><strong className="mt-2 block text-lg font-medium">{activeAction.buyer}</strong></div>
                <div className="border-t border-[#fffaf3]/20 py-4 sm:border-l sm:border-t-0 sm:px-5"><span className="font-opsmono text-sm uppercase text-[#9e9690]">Item</span><strong className="mt-2 block text-lg font-medium">{activeAction.item}</strong></div>
                <div className="border-t border-[#fffaf3]/20 py-4 sm:border-l sm:border-t-0 sm:pl-5"><span className="font-opsmono text-sm uppercase text-[#9e9690]">Ask / offer</span><strong className="mt-2 block font-opsmono text-lg font-medium tabular-nums">RM{activeAction.ask.toLocaleString()}{activeAction.offer ? ` / RM${activeAction.offer.toLocaleString()}` : ''}</strong></div>
              </div>

              <div className="mt-8 rounded-xl border border-[#fffaf3]/15 bg-[#1a0a0a]/55 p-5">
                <div className="flex items-center justify-between gap-4"><p className="font-opsmono text-sm uppercase tracking-[0.06em] text-[#e3c35a]">Draft preview</p><ShieldCheck className="size-5 text-[#e3c35a]" aria-label="Manual send only" /></div>
                <p className="mt-4 text-base leading-7 text-[#eee8e1]">{activeAction.draft}</p>
                {activeAction.note ? <div className="mt-4 flex items-start gap-3 border-l-2 border-[#e3c35a] pl-4 text-sm leading-6 text-[#e8dca9]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{activeAction.note}</div> : null}
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-lg text-sm leading-6 text-[#aaa29d]">Review and copy only. Red cannot send, reply, or react as you.</p>
                <Button className="min-h-[44px] bg-[#8b2232] px-5 text-sm text-white hover:bg-[#721a27]" onClick={() => openReview(activeAction)}>{copiedSet.has(activeAction.id) ? <Check aria-hidden="true" /> : <ClipboardCheck aria-hidden="true" />}{copiedSet.has(activeAction.id) ? 'Draft copied' : 'Review this draft'}<ArrowRight aria-hidden="true" /></Button>
              </div>
            </div>

            <aside className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl shadow-black/15" aria-label="Ranked lead queue">
              <div className="border-b border-border p-5 md:p-6"><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Lead queue / {String(actions.length).padStart(2, '0')}</p><h2 className="mt-2 font-display text-2xl font-semibold">Choose the next buyer</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ranked by offer specificity, value, recency, and pickup readiness.</p></div>
              <ol>
                {actions.map((action) => {
                  const Icon = action.icon
                  const isActive = activeAction.id === action.id
                  return (
                    <li key={action.id} className="border-b border-border last:border-b-0">
                      <button type="button" className={cn('grid min-h-[76px] w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:px-5', isActive && 'bg-[#8b2232]/25')} onClick={() => setActiveActionId(action.id)} aria-pressed={isActive} aria-label={`View action ${action.rank} for ${action.buyer} about ${action.item}`}>
                        <span className={cn('grid size-9 place-items-center rounded-lg border border-border bg-background/50 text-sm', isActive && 'border-[#c2344d]/40 bg-[#8b2232] text-white')}><Icon className="size-4" aria-hidden="true" /></span>
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
              <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Decision inbox / {String(pendingApprovalCount).padStart(2, '0')}</p><h2 id="approvals-heading" className="mt-3 font-display text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-none tracking-[-0.04em]">One review. <span className="italic text-accent-light">One approval.</span> One manual paste.</h2></div>
              <p className="text-base leading-7 text-muted-foreground">Every ranked lead is here with the situation, Red’s reasoning, and the exact reply. Approval copies the draft and records your decision. It never sends.</p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/75 shadow-2xl shadow-black/15">
              {approvalItems.map((item, index) => {
                const isVerified = item.id === 'price:echo-120'
                const state = isVerified ? 'approved' : decisionStates[item.id]
                const action = item.actionId ? actions.find((candidate) => candidate.id === item.actionId) : undefined
                const review = () => action && openReview(action)
                return (
                  <article key={item.id} className="grid gap-5 border-b border-border px-4 py-5 last:border-b-0 hover:bg-white/[0.025] md:grid-cols-[48px_120px_minmax(0,1fr)_110px_auto] md:items-center md:py-4">
                    <span className="font-opsmono text-sm text-gold">{String(index + 1).padStart(2, '0')}</span>
                    <Badge variant="outline" className={cn('h-7 px-3 text-sm', item.kind === 'Price change' ? 'border-[#c9a84c]/35 bg-[#c9a84c]/10 text-[#e0c976]' : 'border-[#5b7db1]/35 bg-[#5b7db1]/15 text-[#afc9ee]')}>{item.kind}</Badge>
                    <div><h3 className="font-display text-lg font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p></div>
                    <strong className="font-opsmono text-lg font-medium tabular-nums md:text-right">{item.value}</strong>
                    <Button variant="outline" className={cn('min-h-[44px] min-w-[148px] border-border bg-transparent px-4 text-sm hover:bg-muted', state && 'border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]')} onClick={review} disabled={isVerified}>
                      {state ? <CheckCircle2 aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                      {isVerified ? 'Verified live' : state === 'copied' ? 'Copied for send' : state === 'held' ? 'Held' : 'Review & approve'}
                    </Button>
                  </article>
                )
              })}
            </div>
          </section>

          <section id="pipeline" aria-labelledby="pipeline-heading" className="mt-20 scroll-mt-28">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] md:items-end"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Listing ledger / 14</p><h2 id="pipeline-heading" className="mt-3 font-display text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-none tracking-[-0.04em]">Every item. <span className="italic text-accent-light">Nothing hidden.</span></h2></div><p className="text-base leading-7 text-muted-foreground">All fields reflow into readable two-column records on smaller screens. Nothing is clipped or pushed off-canvas.</p></div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl shadow-black/15">
              <div className="hidden min-h-12 grid-cols-[minmax(180px,1.35fr)_92px_minmax(150px,1fr)_minmax(170px,1.2fr)_118px_112px] items-center gap-4 border-b border-border px-4 font-opsmono text-sm uppercase tracking-[0.04em] text-muted-foreground xl:grid"><span>Item</span><span>Asking</span><span>Top lead</span><span>Signal</span><span>Status</span><span className="text-right">Next move</span></div>
              {pipeline.map((row, index) => (
                <article key={row.item} className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-border px-4 py-5 transition-colors hover:bg-card xl:min-h-[68px] xl:grid-cols-[minmax(180px,1.35fr)_92px_minmax(150px,1fr)_minmax(170px,1.2fr)_118px_112px] xl:items-center xl:gap-4 xl:py-3">
                  <div className="col-span-2 xl:col-span-1"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Item</span><div className="flex items-center gap-3"><span className="font-opsmono text-sm text-gold">{String(index + 1).padStart(2, '0')}</span><strong className="font-display text-base font-semibold">{row.item}</strong></div></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Asking</span><span className="font-opsmono text-base font-medium tabular-nums">{row.asking}</span></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Top lead</span><span className="text-sm text-muted-foreground">{row.lead}</span></div>
                  <div className="col-span-2 sm:col-span-1"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Signal</span><span className="text-sm text-muted-foreground">{row.signal}</span></div>
                  <div><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Status</span><Badge variant="outline" className={cn('h-7 px-2.5 text-sm', statusStyles[row.status])}>{row.status}</Badge></div>
                  <div className="text-right"><span className="mb-1 block font-opsmono text-sm uppercase text-muted-foreground xl:hidden">Next move</span><span className="text-sm font-semibold">{row.next}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="policy-heading" className="mt-20 overflow-hidden rounded-2xl border border-border bg-card/85 shadow-2xl shadow-black/15">
            <div className="grid gap-6 border-b border-border p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7">
              <div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Agent policy / approval gated</p><h2 id="policy-heading" className="mt-2 font-display text-3xl font-semibold">Red does the work. <span className="italic text-accent-light">You make the call.</span></h2><p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">Red monitors every listing, scores buyer intent, prepares follow-ups, and detects stale pricing. It asks before any listing mutation and never sends a person-to-person message as Adam.</p></div>
              <Button variant="outline" className={cn('min-h-[44px] border-border bg-transparent px-4 text-sm hover:bg-muted', priceWatcherEnabled && 'border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]')} onClick={() => writeDecisionStatus('policy:price-watcher', priceWatcherEnabled ? 'held' : 'approved')}>
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
                  <span className="font-opsmono text-sm text-gold">{number}</span><h3 className="mt-10 font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="pricing" aria-labelledby="pricing-heading" className="mt-20 grid scroll-mt-28 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.62fr)]">
            <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-2xl shadow-black/15 md:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-gold">Price test / 01</p><h2 id="pricing-heading" className="mt-3 font-display text-3xl font-semibold">Amazon Echo is live at RM120</h2><p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">The approved RM10 reduction was applied through Red Helium and verified on the Facebook selling dashboard after 47 clicks without visible buyer intent.</p></div><Badge variant="outline" className="h-7 shrink-0 border-[#4caf72]/35 bg-[#4caf72]/10 px-3 text-sm text-[#9ad8b0]"><CheckCircle2 data-icon="inline-start" aria-hidden="true" />Verified live</Badge></div>
              <div className="mt-8 grid border-y border-border sm:grid-cols-3"><div className="py-5 sm:pr-5"><span className="font-opsmono text-sm uppercase text-muted-foreground">Previous</span><strong className="mt-2 block font-display text-3xl font-semibold tabular-nums">RM130</strong></div><div className="border-t border-border py-5 sm:border-l sm:border-t-0 sm:px-5"><span className="font-opsmono text-sm uppercase text-[#9ad8b0]">Live</span><strong className="mt-2 block font-display text-3xl font-semibold tabular-nums text-[#9ad8b0]">RM120</strong></div><div className="border-t border-border py-5 sm:border-l sm:border-t-0 sm:pl-5"><span className="font-opsmono text-sm uppercase text-muted-foreground">Change</span><strong className="mt-2 block text-base font-medium">RM10 lower, a 7.7% price test</strong></div></div>
              <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-muted-foreground"><Clock3 className="mt-0.5 size-4 shrink-0 text-[#9ad8b0]" aria-hidden="true" />Reassess after 24 hours. Hold all other listing prices while buyer conversations are active.</div>
            </div>

            <div className="rounded-2xl border border-[#c2344d]/35 bg-gradient-to-br from-[#8b2232] to-[#4a1520] p-5 text-white shadow-2xl shadow-black/20 md:p-7">
              <p className="font-opsmono text-sm font-semibold uppercase tracking-[0.09em] text-[#f1cad0]">Attention map / clicks</p><h2 className="mt-3 font-display text-3xl font-semibold">Demand is concentrated.</h2>
              <div className="mt-7 space-y-5">{attention.map((item) => (<div key={item.item}><div className="flex items-center justify-between gap-4 text-sm"><span>{item.item}</span><span className="font-opsmono tabular-nums">{item.clicks}</span></div><div className="mt-2 h-1.5 bg-white/20"><div className="h-full bg-[#e3c35a]" style={{ width: item.width }} /></div></div>))}</div>
              <div className="mt-7 border-t border-white/25 pt-5 text-sm leading-6 text-[#f3dce0]"><strong className="text-white">Price-test watch:</strong> Echo is now live at RM120. Recheck it after 24 hours. Three guitars have no fresh inquiry preview and should stay unchanged while their market position is already competitive.</div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 rounded-2xl border border-border bg-card/85 p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-6" aria-labelledby="safety-heading">
            <span className="grid size-11 place-items-center rounded-xl border border-[#4caf72]/35 bg-[#4caf72]/10 text-[#9ad8b0]"><ShieldCheck className="size-5" aria-hidden="true" /></span>
            <div><h2 id="safety-heading" className="font-display text-lg font-semibold">Approval means copy, never send</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Red can prepare the move and exact wording. Adam performs every person-to-person communication in Helium.</p></div>
            <Link href="/" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent-light">About RedMart <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </section>
        </main>
      </div>

      <Dialog open={reviewAction !== null} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="dashboard-dialog-theme rounded-2xl border-border bg-popover font-body text-popover-foreground shadow-2xl shadow-black/50 sm:max-w-xl">
          {reviewAction ? <>
            <DialogHeader><Badge variant="outline" className="mb-1 h-7 border-[#c9a84c]/35 bg-[#c9a84c]/10 px-3 text-sm text-[#e0c976]">Action {String(reviewAction.rank).padStart(2, '0')}</Badge><DialogTitle className="font-display text-2xl font-semibold text-foreground">Review reply for {reviewAction.buyer}</DialogTitle><DialogDescription className="text-base leading-7 text-muted-foreground">The situation, reasoning, and exact message are together here. Approve once to copy it.</DialogDescription></DialogHeader>
            <div className="space-y-5">
              <ol className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-muted text-center font-opsmono text-sm" aria-label="Reply handoff steps"><li className="border-r border-border p-3 font-semibold text-gold">1 Review</li><li className="border-r border-border p-3 font-semibold text-gold">2 Approve + copy</li><li className="p-3 text-muted-foreground">3 Paste in Helium</li></ol>
              <div className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm"><div><p className="font-opsmono uppercase text-muted-foreground">Item</p><p className="mt-1 font-semibold">{reviewAction.item}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Asking</p><p className="mt-1 font-opsmono font-semibold tabular-nums">RM{reviewAction.ask.toLocaleString()}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Recommended</p><p className="mt-1 font-semibold">{reviewAction.move}</p></div><div><p className="font-opsmono uppercase text-muted-foreground">Pickup</p><p className="mt-1 font-semibold">Forest City Marina Hotel</p></div></div>
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
