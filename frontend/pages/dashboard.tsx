import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Eye,
  Gauge,
  Inbox,
  ListChecks,
  MessageSquareText,
  PackageSearch,
  Radio,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingDown,
  Tv,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/shadcn/badge'
import { Button } from '@/components/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/lib/utils'

type Action = {
  id: string
  rank: number
  item: string
  buyer: string
  ask: number
  offer?: number
  label: string
  move: string
  reason: string
  draft: string
  urgency: 'Now' | 'Today' | 'Watch'
  icon: LucideIcon
  note?: string
}

type PipelineRow = {
  item: string
  asking: string
  lead: string
  signal: string
  offer: string
  status: 'Close now' | 'Specific offer' | 'Waiting' | 'Qualify' | 'Watch' | 'No signal'
  next: string
}

const snapshotLabel = '30 Aug, 7:46 PM SGT'

const actions: Action[] = [
  {
    id: 'murtaza-bike', rank: 1, item: 'Mountain Bike', buyer: 'Murtaza', ask: 190, offer: 190,
    label: 'Full-price offer', move: 'Accept RM190 and lock a pickup time', urgency: 'Now', icon: Bike,
    reason: 'Murtaza offered the full asking price and is waiting. This is the shortest path to a completed sale.',
    draft: 'Hi Murtaza, I can accept RM190. Pickup is at Forest City Marina Hotel. Please send an exact collection time; I can confirm the sale once we agree on pickup.',
  },
  {
    id: 'danny-tv', rank: 2, item: 'TCL 98-inch TV', buyer: 'Danny', ask: 10000,
    label: 'Availability check', move: 'Hold RM10,000 and qualify transport', urgency: 'Now', icon: Tv,
    reason: 'The TV has fresh interest and high value. Confirm suitable transport before discussing a commitment or price change.',
    draft: 'Hi Danny, yes, the TCL 98C8K is available at RM10,000. Pickup is at Forest City Marina Hotel. Please confirm you have suitable transport and tell me when you could collect.',
    note: 'Tim owns this item. Tim must approve any price move or sale commitment.',
  },
  {
    id: 'ahmad-fender', rank: 3, item: 'Fender Amplifier', buyer: 'Ahmad', ask: 490, offer: 400,
    label: 'Specific offer', move: 'Counter at RM450', urgency: 'Today', icon: CircleDollarSign,
    reason: 'Ahmad has made a real RM400 offer. RM450 splits the RM90 gap while protecting value.',
    draft: 'Hi Ahmad, thanks for the RM400 offer. I can meet you at RM450. Pickup is at Forest City Marina Hotel. If that works, what day and time can you collect?',
  },
  {
    id: 'sparx-drums', rank: 4, item: 'Drum Kit', buyer: 'Sparx', ask: 590,
    label: 'Waiting for response', move: 'Hold RM590 and qualify transport', urgency: 'Today', icon: PackageSearch,
    reason: 'A full drum kit is difficult to move. A transport check filters serious buyers before time is spent scheduling.',
    draft: 'Hi Sparx, the drum kit is available at RM590. Pickup is at Forest City Marina Hotel and you will need suitable transport. What day and time works?',
  },
  {
    id: 'dam-arturia', rank: 5, item: 'Arturia MiniLab MkII', buyer: 'Dam', ask: 270,
    label: 'Waiting for response', move: 'Hold RM270 and schedule pickup', urgency: 'Today', icon: MessageSquareText,
    reason: 'Dam is already waiting. A precise pickup question is the cleanest way to test intent without discounting.',
    draft: 'Hi Dam, the Arturia MiniLab MkII is available at RM270. Pickup is at Forest City Marina Hotel. When could you collect?',
  },
  {
    id: 'monitor-buyer', rank: 6, item: 'M-Audio Monitor Pair', buyer: 'Marketplace buyer', ask: 200,
    label: 'Waiting for response', move: 'Hold RM200 and schedule pickup', urgency: 'Today', icon: Radio,
    reason: 'The listing has clear traffic and an active conversation. Ask for an exact time before considering any price reduction.',
    draft: 'Hi, the M-Audio monitor pair is available at RM200. Pickup is at Forest City Marina Hotel. What collection time works?',
  },
  {
    id: 'ya-purifier', rank: 7, item: 'Air Purifier', buyer: 'Ya Wau Sin', ask: 150,
    label: 'Waiting for response', move: 'Confirm RM150 and ask for an exact time', urgency: 'Today', icon: MessageSquareText,
    reason: 'The buyer asked whether the item is still available. Move directly from availability to pickup timing.',
    draft: 'Hi, yes, the air purifier is available at RM150. Pickup is at Forest City Marina Hotel. What exact day and time could you collect?',
  },
  {
    id: 'suren-cajon', rank: 8, item: 'Cajon Bundle', buyer: 'Suren', ask: 140,
    label: 'Waiting for response', move: 'Hold RM140 and ask for an exact time', urgency: 'Watch', icon: MessageSquareText,
    reason: 'Suren is a warmer lead than the earlier RM70 offer. Test pickup intent before negotiating.',
    draft: 'Hi Suren, the cajon percussion bundle is available at RM140. Pickup is at Forest City Marina Hotel. What exact day and time could you collect?',
  },
  {
    id: 'amiruddin-bike', rank: 9, item: 'Mountain Bike', buyer: 'Amiruddin', ask: 190,
    label: 'Backup lead', move: 'Use as backup if Murtaza does not schedule', urgency: 'Watch', icon: Bike,
    reason: 'There is already a full-price offer. Keep Amiruddin warm without promising the same item twice.',
    draft: 'Hi Amiruddin, another buyer has offered the full RM190. If you can collect from Forest City Marina Hotel, please send your earliest pickup time and I will confirm whether it is still available.',
  },
]

const pipeline: PipelineRow[] = [
  { item: 'Mountain Bike', asking: 'RM190', lead: 'Murtaza', signal: 'Full-price offer', offer: 'RM190', status: 'Close now', next: 'Schedule pickup' },
  { item: 'Fender Amplifier', asking: 'RM490', lead: 'Ahmad', signal: 'Specific offer', offer: 'RM400', status: 'Specific offer', next: 'Counter RM450' },
  { item: 'TCL 98-inch TV', asking: 'RM10,000', lead: 'Danny', signal: 'Availability check', offer: 'None', status: 'Qualify', next: 'Check transport' },
  { item: 'Drum Kit', asking: 'RM590', lead: 'Sparx', signal: 'Waiting for reply', offer: 'None', status: 'Waiting', next: 'Check transport' },
  { item: 'Arturia MiniLab MkII', asking: 'RM270', lead: 'Dam', signal: 'Waiting for reply', offer: 'None', status: 'Waiting', next: 'Schedule pickup' },
  { item: 'M-Audio Monitor Pair', asking: 'RM200', lead: 'Marketplace buyer', signal: 'Waiting for reply', offer: 'None', status: 'Waiting', next: 'Schedule pickup' },
  { item: 'Air Purifier', asking: 'RM150', lead: 'Ya Wau Sin', signal: 'Availability check', offer: 'None', status: 'Waiting', next: 'Schedule pickup' },
  { item: 'Cajon Bundle', asking: 'RM140', lead: 'Suren', signal: 'Waiting for reply', offer: 'None', status: 'Waiting', next: 'Schedule pickup' },
  { item: 'Bass Guitar', asking: 'RM590', lead: 'Jerry / Ayie', signal: 'General interest', offer: 'None', status: 'Watch', next: 'Hold price' },
  { item: 'Ukulele', asking: 'RM90', lead: 'Puskas', signal: 'Asked firm price', offer: 'None', status: 'Watch', next: 'Confirm price' },
  { item: 'Amazon Echo', asking: 'RM130', lead: 'None', signal: '44 clicks, no buyer signal', offer: 'None', status: 'No signal', next: 'Consider RM120' },
  { item: '3 remaining active listings', asking: 'Varies', lead: 'No fresh preview', signal: 'No material change visible', offer: 'None', status: 'Watch', next: 'Monitor' },
]

const kpis = [
  { label: 'Credible money', value: 'RM590', detail: 'About USD147', icon: CircleDollarSign },
  { label: 'Specific offers', value: '2', detail: 'Bike and Fender amp', icon: Tag },
  { label: 'Unread chats', value: '1', detail: 'Needs manual review', icon: Inbox },
  { label: 'Active listings', value: '14', detail: 'One visible zero-signal item', icon: ListChecks },
]

const statusStyles: Record<PipelineRow['status'], string> = {
  'Close now': 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  'Specific offer': 'border-gold/30 bg-gold/10 text-gold',
  Waiting: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
  Qualify: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
  Watch: 'border-border bg-muted text-text-secondary',
  'No signal': 'border-amber-400/25 bg-amber-400/10 text-amber-200',
}

const navItems = [
  { href: '#overview', label: 'Overview', icon: Gauge },
  { href: '#actions', label: 'Action queue', icon: ClipboardCheck },
  { href: '#pipeline', label: 'Item pipeline', icon: PackageSearch },
  { href: '#pricing', label: 'Pricing', icon: TrendingDown },
  { href: '#safety', label: 'Safety', icon: ShieldCheck },
]

function formatRing(index: number) {
  if (index === 1) return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
  if (index === 2) return 'border-gold/30 bg-gold/10 text-gold'
  return 'border-border bg-muted text-text-secondary'
}

export default function DashboardPage() {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [copiedActionIds, setCopiedActionIds] = useState<string[]>([])
  const [copyError, setCopyError] = useState('')
  const copiedSet = useMemo(() => new Set(copiedActionIds), [copiedActionIds])

  const openAction = (action: Action) => {
    setSelectedAction(action)
    setReviewed(false)
    setCopyError('')
  }

  const closeAction = () => {
    setSelectedAction(null)
    setReviewed(false)
    setCopyError('')
  }

  const approveAndCopy = async () => {
    if (!selectedAction || !reviewed) return
    try {
      await navigator.clipboard.writeText(selectedAction.draft)
      setCopiedActionIds((current) => current.includes(selectedAction.id) ? current : [...current, selectedAction.id])
      closeAction()
    } catch {
      setCopyError('Clipboard access was blocked. Select the draft and copy it manually.')
    }
  }

  return (
    <>
      <Head>
        <title>Marketplace Command Center | RedMart</title>
        <meta name="description" content="A read-only Facebook Marketplace report with ranked next actions, pricing decisions, and copy-ready reply drafts." />
      </Head>

      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden border-r border-border bg-card/45 lg:flex lg:flex-col">
            <div className="flex h-20 items-center gap-3 border-b border-border px-5">
              <div className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/15 text-gold">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div>
                <Link href="/" className="font-display text-lg font-semibold tracking-tight text-text-primary">RedMart</Link>
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-tertiary">Command center</p>
              </div>
            </div>
            <nav aria-label="Dashboard sections" className="flex-1 space-y-1 p-3">
              <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">Marketplace</p>
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <a key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-text-primary', index === 0 ? 'bg-muted text-text-primary' : 'text-text-secondary')}>
                    <Icon className="size-4" aria-hidden="true" />{item.label}
                  </a>
                )
              })}
            </nav>
            <div className="m-3 rounded-xl border border-border bg-background/60 p-4" id="safety">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                <ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" />Manual send only
              </div>
              <p className="text-xs leading-relaxed text-text-tertiary">Red ranks moves and prepares drafts. You review, copy, and send every Facebook message yourself.</p>
            </div>
          </aside>

          <main className="min-w-0">
            <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
              <div className="flex min-h-20 flex-col justify-center gap-3 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">Marketplace command center</h1>
                    <Badge variant="outline" className="border-emerald-400/25 bg-emerald-400/10 text-emerald-200"><Eye data-icon="inline-start" aria-hidden="true" />Read-only monitor</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-text-secondary">Ranked moves from the latest Helium Marketplace snapshot. Last monitored {snapshotLabel}.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" render={<a href="#pipeline" />}>View all items<ChevronRight aria-hidden="true" /></Button>
                  <Button size="sm" render={<a href="#actions" />}>Review next move<ArrowRight aria-hidden="true" /></Button>
                </div>
              </div>
            </header>

            <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8" id="overview">
              <section aria-labelledby="snapshot-heading">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Live sales brief</p>
                    <h2 id="snapshot-heading" className="mt-1 font-display text-xl font-semibold text-text-primary">Two credible offers, one sale ready to close</h2>
                  </div>
                  <div className="hidden items-center gap-2 text-xs text-text-tertiary sm:flex"><Clock3 className="size-3.5" aria-hidden="true" />Snapshot {snapshotLabel}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                      <Card key={kpi.label} size="sm" className="bg-card/80">
                        <CardHeader className="grid grid-cols-[1fr_auto] items-start">
                          <CardDescription className="text-xs font-medium uppercase tracking-[0.12em]">{kpi.label}</CardDescription>
                          <div className="grid size-8 place-items-center rounded-lg border border-border bg-muted text-gold"><Icon className="size-4" aria-hidden="true" /></div>
                        </CardHeader>
                        <CardContent><p className="font-display text-3xl font-semibold tabular-nums text-text-primary">{kpi.value}</p><p className="mt-1 text-xs text-text-tertiary">{kpi.detail}</p></CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>

              <section aria-labelledby="close-first-heading" className="scroll-mt-28" id="actions">
                <Card className="relative overflow-hidden border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(5,46,22,0.32),rgba(36,17,17,0.92)_48%)] ring-0">
                  <div className="pointer-events-none absolute right-0 top-0 size-72 translate-x-24 -translate-y-32 rounded-full bg-emerald-400/10 blur-3xl" />
                  <CardHeader className="relative gap-3 px-5 pt-1 sm:grid sm:grid-cols-[1fr_auto] sm:px-6">
                    <div>
                      <Badge variant="outline" className="mb-3 border-emerald-400/30 bg-emerald-400/10 text-emerald-200"><Check data-icon="inline-start" aria-hidden="true" />Close this first</Badge>
                      <CardTitle id="close-first-heading" className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">Murtaza offered the full RM190 for the bike</CardTitle>
                      <CardDescription className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">Accept the asking price, then require an exact pickup time at Forest City Marina Hotel before confirming the sale.</CardDescription>
                    </div>
                    <div className="rounded-xl border border-emerald-400/20 bg-background/45 p-4 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">Offer versus ask</p>
                      <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-emerald-200">RM190</p><p className="mt-1 text-xs text-emerald-300">100% of asking price</p>
                    </div>
                  </CardHeader>
                  <CardFooter className="relative flex-col items-stretch gap-3 border-emerald-400/15 bg-background/30 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-2 text-xs text-text-secondary"><Clock3 className="size-3.5 text-emerald-300" aria-hidden="true" />Buyer has been waiting since 5:13 PM</div>
                    <Button onClick={() => openAction(actions[0])}>Review pickup reply<ArrowRight aria-hidden="true" /></Button>
                  </CardFooter>
                </Card>
              </section>

              <section aria-labelledby="queue-heading">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Ranked action queue</p><h2 id="queue-heading" className="mt-1 font-display text-xl font-semibold text-text-primary">Next moves by conversion likelihood</h2></div>
                  <p className="text-xs text-text-tertiary">Every draft opens a review modal and copies only after confirmation.</p>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  {actions.slice(1).map((action) => {
                    const Icon = action.icon
                    const copied = copiedSet.has(action.id)
                    return (
                      <Card key={action.id} size="sm" className="bg-card/75 transition-colors hover:bg-card">
                        <CardHeader className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
                          <div className={cn('grid size-9 place-items-center rounded-lg border text-sm font-semibold tabular-nums', formatRing(action.rank))}>{action.rank}</div>
                          <div className="min-w-0"><CardTitle className="truncate text-sm font-semibold text-text-primary">{action.item}</CardTitle><CardDescription className="mt-0.5 truncate text-xs">{action.buyer} · {action.label}</CardDescription></div>
                          <div className="text-right"><p className="text-sm font-semibold tabular-nums text-text-primary">RM{action.ask.toLocaleString()}</p>{action.offer ? <p className="text-[11px] text-gold">Offer RM{action.offer}</p> : null}</div>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
                          <div className="grid size-9 place-items-center rounded-lg border border-border bg-muted text-text-secondary"><Icon className="size-4" aria-hidden="true" /></div>
                          <div><p className="text-sm font-medium text-text-primary">{action.move}</p><p className="mt-1 text-xs leading-relaxed text-text-tertiary">{action.reason}</p>
                            {action.note ? <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-2 text-[11px] leading-relaxed text-amber-200"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{action.note}</p> : null}
                          </div>
                        </CardContent>
                        <CardFooter className="justify-between py-3">
                          <Badge variant="outline" className={cn('text-[10px]', action.urgency === 'Now' ? 'border-rose-400/25 bg-rose-400/10 text-rose-200' : action.urgency === 'Today' ? 'border-gold/25 bg-gold/10 text-gold' : 'border-border text-text-tertiary')}>{action.urgency}</Badge>
                          <Button variant={copied ? 'secondary' : 'outline'} size="sm" onClick={() => openAction(action)}>{copied ? <Check aria-hidden="true" /> : <ClipboardCheck aria-hidden="true" />}{copied ? 'Draft copied' : 'Review draft'}</Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              </section>

              <section aria-labelledby="pipeline-heading" className="scroll-mt-28" id="pipeline">
                <Card className="gap-0 bg-card/80 py-0">
                  <CardHeader className="border-b border-border px-5 py-5 sm:px-6">
                    <CardTitle id="pipeline-heading" className="font-display text-xl font-semibold text-text-primary">Item pipeline</CardTitle>
                    <CardDescription>All material lead states visible in the latest read-only Marketplace snapshot.</CardDescription>
                    <CardAction><Badge variant="outline" className="border-border text-text-secondary">14 active</Badge></CardAction>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                      <caption className="sr-only">Facebook Marketplace listings, lead signals, offers, and recommended next moves</caption>
                      <thead className="bg-muted/55 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary"><tr>
                        <th scope="col" className="px-5 py-3 sm:px-6">Item</th><th scope="col" className="px-4 py-3">Asking</th><th scope="col" className="px-4 py-3">Top lead</th><th scope="col" className="px-4 py-3">Signal</th><th scope="col" className="px-4 py-3">Offer</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-5 py-3 text-right sm:px-6">Next move</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border">{pipeline.map((row) => (
                        <tr key={row.item} className="transition-colors hover:bg-muted/35">
                          <th scope="row" className="px-5 py-3.5 font-medium text-text-primary sm:px-6">{row.item}</th><td className="px-4 py-3.5 font-medium tabular-nums text-text-primary">{row.asking}</td><td className="px-4 py-3.5 text-text-secondary">{row.lead}</td><td className="px-4 py-3.5 text-text-tertiary">{row.signal}</td><td className="px-4 py-3.5 tabular-nums text-text-secondary">{row.offer}</td><td className="px-4 py-3.5"><Badge variant="outline" className={cn('text-[10px]', statusStyles[row.status])}>{row.status}</Badge></td><td className="px-5 py-3.5 text-right font-medium text-text-secondary sm:px-6">{row.next}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </Card>
              </section>

              <section aria-labelledby="pricing-heading" className="grid scroll-mt-28 gap-4 xl:grid-cols-[1.15fr_0.85fr]" id="pricing">
                <Card className="border border-amber-400/20 bg-[linear-gradient(135deg,rgba(120,53,15,0.18),rgba(36,17,17,0.92)_55%)] ring-0">
                  <CardHeader><Badge variant="outline" className="mb-2 border-amber-400/25 bg-amber-400/10 text-amber-200"><TrendingDown data-icon="inline-start" aria-hidden="true" />Price decision</Badge><CardTitle id="pricing-heading" className="font-display text-xl font-semibold text-text-primary">Amazon Echo: RM130 to RM120</CardTitle><CardDescription className="max-w-2xl leading-relaxed">The Echo is four days old with 44 clicks and no visible buyer signal. A RM10 cut is the only current repricing candidate.</CardDescription></CardHeader>
                  <CardContent><div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-background/40 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary">Current</p><p className="mt-1 font-display text-2xl font-semibold tabular-nums text-text-primary">RM130</p></div>
                    <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-amber-300">Proposed</p><p className="mt-1 font-display text-2xl font-semibold tabular-nums text-amber-100">RM120</p></div>
                    <div className="rounded-lg border border-border bg-background/40 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary">Tradeoff</p><p className="mt-1 text-sm font-medium text-text-primary">RM10 less for faster conversion</p></div>
                  </div></CardContent>
                  <CardFooter className="flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-text-tertiary">No price change has been approved or applied. Reassess 24 hours after any edit.</p><Badge variant="outline" className="border-border text-text-secondary">Owner decision needed</Badge></CardFooter>
                </Card>

                <Card className="bg-card/80">
                  <CardHeader><CardTitle className="font-display text-xl font-semibold text-text-primary">Attention map</CardTitle><CardDescription>What is moving and what is quiet.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    {[['Mountain Bike', '352 clicks', 'w-full', 'bg-emerald-400'], ['Air Purifier', '247 clicks', 'w-[70%]', 'bg-gold'], ['TCL 98-inch TV', '219 clicks', 'w-[62%]', 'bg-gold'], ['M-Audio Monitors', '207 clicks', 'w-[59%]', 'bg-gold']].map(([item, clicks, width, color]) => (
                      <div key={item}><div className="flex items-center justify-between gap-3 text-xs"><span className="text-text-secondary">{item}</span><span className="tabular-nums text-text-primary">{clicks}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn('h-full', width, color)} /></div></div>
                    ))}
                    <Separator />
                    <div className="flex items-start gap-3 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" /><div><p className="text-sm font-medium text-amber-100">Only visible zero-signal item: Amazon Echo</p><p className="mt-1 text-xs leading-relaxed text-amber-200/75">44 clicks, no buyer signal. Do not reduce the TV while fresh interest is active.</p></div></div>
                  </CardContent>
                </Card>
              </section>

              <section className="rounded-xl border border-border bg-card/55 p-4 lg:hidden" id="safety-mobile"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden="true" /><div><h2 className="text-sm font-semibold text-text-primary">Manual send safety</h2><p className="mt-1 text-xs leading-relaxed text-text-tertiary">Red ranks actions and prepares copy-ready drafts. It does not send a Facebook message. You perform the final send manually.</p></div></div></section>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={selectedAction !== null} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent>{selectedAction ? <>
          <DialogHeader><Badge variant="outline" className="mb-1 border-gold/25 bg-gold/10 text-gold">Action #{selectedAction.rank}</Badge><DialogTitle>Review reply for {selectedAction.buyer}</DialogTitle><DialogDescription>Confirm the recipient, price, pickup location, and wording before the draft is copied.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-3 text-xs">
              <div><p className="text-text-tertiary">Item</p><p className="mt-1 font-medium text-text-primary">{selectedAction.item}</p></div><div><p className="text-text-tertiary">Asking price</p><p className="mt-1 font-medium tabular-nums text-text-primary">RM{selectedAction.ask.toLocaleString()}</p></div><div><p className="text-text-tertiary">Recommended move</p><p className="mt-1 font-medium text-text-primary">{selectedAction.move}</p></div><div><p className="text-text-tertiary">Pickup</p><p className="mt-1 font-medium text-text-primary">Forest City Marina Hotel</p></div>
            </div>
            <div><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Why this move</p><p className="text-sm leading-relaxed text-text-secondary">{selectedAction.reason}</p></div>
            <div><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Exact draft</p><div className="select-text rounded-xl border border-border bg-background p-3 text-sm leading-relaxed text-text-primary">{selectedAction.draft}</div></div>
            {selectedAction.note ? <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-200"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{selectedAction.note}</div> : null}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/35 p-3 text-sm text-text-secondary transition-colors hover:bg-muted/55"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} className="mt-0.5 size-4 rounded border-border accent-primary" /><span>I reviewed the final recipient, price, pickup location, and wording.</span></label>
            {copyError ? <p role="alert" className="text-xs text-rose-300">{copyError}</p> : null}
            <div className="flex items-start gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-relaxed text-emerald-200"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Approving copies this draft to your clipboard. It does not send a Facebook message. You must send it manually in Helium.</div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeAction}>Cancel</Button><Button disabled={!reviewed} onClick={approveAndCopy}><ClipboardCheck aria-hidden="true" />Approve & copy reply</Button></DialogFooter>
        </> : null}</DialogContent>
      </Dialog>
    </>
  )
}
