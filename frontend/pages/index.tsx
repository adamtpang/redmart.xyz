import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  CircleCheck,
  Layers3,
  ListChecks,
  MessageSquareText,
  MessagesSquare,
  PenLine,
  ScanSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  UsersRound,
} from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/shadcn/accordion'
import { Badge } from '@/components/shadcn/badge'
import { buttonVariants } from '@/components/shadcn/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card'
import { Separator } from '@/components/shadcn/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import { cn } from '@/lib/utils'

const SITE_URL = 'https://redmart.xyz'

const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': SITE_URL + '/#organization',
      name: 'RedMart',
      url: SITE_URL + '/',
      sameAs: ['https://github.com/adamtpang/redmart.xyz'],
    },
    {
      '@type': 'WebSite',
      '@id': SITE_URL + '/#website',
      name: 'RedMart',
      url: SITE_URL + '/',
      publisher: { '@id': SITE_URL + '/#organization' },
    },
  ],
}

interface ChannelPreview {
  id: 'reddit' | 'groups' | 'marketplace'
  label: string
  shortLabel: string
  icon: LucideIcon
  discovery: string
  source: string
  signal: string
  context: string
  draft: string
  nextStep: string
}

interface WorkflowStep {
  title: string
  description: string
  icon: LucideIcon
}

interface Faq {
  question: string
  answer: string
}

const CHANNELS: ChannelPreview[] = [
  {
    id: 'reddit',
    label: 'Reddit',
    shortLabel: 'Reddit',
    icon: MessagesSquare,
    discovery: 'Relevant subreddits, questions, and intent signals',
    source: 'Founder and small-business discussions',
    signal: 'Someone is asking how to solve a problem your offer addresses',
    context: 'Red identifies the question, the constraints, and why your goods or services may fit before suggesting any response.',
    draft: 'Lead with the useful answer. Address the constraint they named, then mention your offer only when it genuinely helps.',
    nextStep: 'Contribute first, offer second',
  },
  {
    id: 'groups',
    label: 'Facebook Groups',
    shortLabel: 'Groups',
    icon: UsersRound,
    discovery: 'Niche groups, recommendation posts, and local demand',
    source: 'Communities where buyers already ask each other',
    signal: 'A group member is requesting a product or service recommendation',
    context: 'Red captures the group context, location, urgency, and social norms so your response feels native to the conversation.',
    draft: 'Answer the request directly, disclose your connection, and make the next step simple without turning the thread into an ad.',
    nextStep: 'Reply with context, then follow up',
  },
  {
    id: 'marketplace',
    label: 'Facebook Marketplace',
    shortLabel: 'Marketplace',
    icon: Store,
    discovery: 'Listings, buyer interest, pricing, and pickup signals',
    source: 'Your active selling workflow',
    signal: 'A buyer has moved beyond “Is this available?” and shared real intent',
    context: 'Red ranks the lead using the offer, timing, pickup details, and listing history, then recommends the strongest next move.',
    draft: 'Confirm the buyer’s timing, restate the pickup terms, and hold the price until the logistics signal becomes clearer.',
    nextStep: 'Advance the sale without losing margin',
  },
]

const WORKFLOW: WorkflowStep[] = [
  {
    title: 'Discover',
    description: 'Find the right subreddits, Facebook Groups, threads, listings, and buyer conversations.',
    icon: Search,
  },
  {
    title: 'Understand',
    description: 'Read the intent, context, urgency, language, and social norms behind each opportunity.',
    icon: BrainCircuit,
  },
  {
    title: 'Engage',
    description: 'Draft a natural response that adds value before it asks for attention or a sale.',
    icon: MessageSquareText,
  },
  {
    title: 'Follow up',
    description: 'Keep promising conversations moving without losing the history or the next action.',
    icon: BellRing,
  },
  {
    title: 'Sell',
    description: 'Turn attention into a booked service, a qualified lead, or a completed Marketplace sale.',
    icon: ShoppingBag,
  },
]

const FAQS: Faq[] = [
  {
    question: 'What exactly does RedMart find?',
    answer:
      'RedMart finds relevant subreddits, Facebook Groups, public discussions, recommendation requests, Marketplace buyer signals, and other moments where people are already expressing a need connected to what you sell.',
  },
  {
    question: 'Is RedMart for goods, services, or both?',
    answer:
      'Both. A service business can use Red to find questions, recommendations, and qualified conversations. A seller can use the same workflow to create stronger Marketplace listings, research prices, rank buyers, and follow up toward a sale.',
  },
  {
    question: 'How is this different from a social listening tool?',
    answer:
      'Listening is only the first step. RedMart carries a useful signal into context, a suggested reply, a follow-up plan, and a selling action. The goal is not another alert feed. The goal is a seamless path from discovery to engagement to conversion.',
  },
  {
    question: 'Does Red post or message people as me?',
    answer:
      'No. Red can research, monitor, summarize, recommend, and prepare copy-ready drafts. You remain the final sender for person-to-person communication. On Marketplace, Red can apply an exact listing-field change only after you explicitly approve that change.',
  },
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  'Find relevant conversations',
  'Help with Marketplace leads',
  'Draft a useful reply',
]

function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'greeting',
    role: 'assistant',
    content: 'I’m Red. Tell me what you sell and where you want to find the right conversation.',
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    inputRef.current?.focus()
  }, [messages, loading, open])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMessage: ChatMessage = { id: `user-${messages.length}`, role: 'user', content: text.trim() }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== 'greeting')
            .map(({ role, content }) => ({ role, content })),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      setMessages((current) => [...current, {
        id: `assistant-${current.length}`,
        role: 'assistant',
        content: data.reply,
      }])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again.'
      setMessages((current) => [...current, {
        id: `error-${current.length}`,
        role: 'assistant',
        content: `Having some trouble. ${message}`,
      }])
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
            type="button"
            aria-label="Open Red chat"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-light text-white shadow-lg shadow-black/40 transition-transform hover:scale-105"
          >
            <span aria-hidden="true" className="font-display text-xl font-bold">R</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="red-chat-title"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col overflow-hidden bg-surface-0 shadow-2xl md:bottom-5 md:right-5 md:h-[520px] md:max-h-[80vh] md:w-[380px] md:rounded-2xl md:border md:border-border"
          >
            <div className="flex items-center justify-between border-b border-border bg-surface-1 px-4 py-3">
              <div className="flex items-center gap-3">
                <BrandMark />
                <div>
                  <h2 id="red-chat-title" className="font-display text-sm font-semibold">Red</h2>
                  <span className="text-[10px] text-gold">Ready to research</span>
                </div>
              </div>
              <button type="button" aria-label="Close Red chat" onClick={() => setOpen(false)} className="px-1 text-xl leading-none text-text-tertiary hover:text-text-primary">&times;</button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-md bg-accent text-white'
                      : 'rounded-bl-md border border-border bg-surface-2 text-text-primary',
                  )}>
                    <div className="whitespace-pre-wrap">{message.role === 'assistant' ? renderBold(message.content) : message.content}</div>
                  </div>
                </div>
              ))}
              {loading && <p className="text-xs text-text-tertiary">Red is thinking…</p>}
              <div ref={bottomRef} />
            </div>

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action} type="button" onClick={() => sendMessage(action)} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text-secondary hover:border-accent/40 hover:text-text-primary">
                    {action}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={(event) => { event.preventDefault(); sendMessage(input) }} className="flex gap-2 border-t border-border p-2.5">
              <label htmlFor="red-chat-input" className="sr-only">Message Red</label>
              <input
                id="red-chat-input"
                name="message"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tell Red what you sell…"
                disabled={loading}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface-1 px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary disabled:opacity-50"
              />
              <button type="submit" disabled={loading || !input.trim()} className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-light disabled:opacity-30">Send</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-light/30 bg-accent font-display text-base font-bold italic text-white shadow-md shadow-black/30"
    >
      R
    </span>
  )
}

function ChannelWorkspace({ channel }: { channel: ChannelPreview }) {
  const Icon = channel.icon

  return (
    <TabsContent value={channel.id} className="mt-0">
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)]">
        <div className="min-w-0 border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold">
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">Discovery map</p>
              <p className="text-xs font-medium text-text-primary">{channel.discovery}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-surface-2/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">Where Red is looking</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-1 text-accent-light">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary">{channel.label}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-tertiary">{channel.source}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-surface-2/40 p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              <Target className="h-3.5 w-3.5 text-accent-light" aria-hidden="true" />
              Signal Red found
            </div>
            <p className="mt-2 font-display text-base font-semibold leading-snug text-text-primary">{channel.signal}</p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-light" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">Red’s engagement brief</p>
            </div>
            <Badge variant="outline" className="w-fit border-accent/30 bg-accent/10 text-[9px] uppercase tracking-[0.12em] text-accent-light">
              Product preview
            </Badge>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-xl border border-border bg-surface-2/55 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Why this matters</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{channel.context}</p>
            </div>
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-light">
                <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                Suggested approach
              </div>
              <p className="mt-3 font-display text-base italic leading-relaxed text-text-primary">“{channel.draft}”</p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-1 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Recommended next step</p>
                <p className="mt-1 text-xs font-medium text-text-primary">{channel.nextStep}</p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-gold" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

function ProductWorkspace() {
  return (
    <Card className="card overflow-hidden border-border bg-surface-1/95 py-0 shadow-2xl shadow-black/40 ring-1 ring-gold/15">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-2/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-accent-light" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-text-secondary">Red engagement workspace</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-gold">
          <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
          One workflow, three surfaces
        </div>
      </div>

      <Tabs defaultValue="reddit" className="flex-col gap-0">
        <div className="border-b border-border px-3 py-3 sm:px-5">
          <TabsList aria-label="Preview RedMart by channel" className="grid h-auto w-full grid-cols-3 bg-surface-2 p-1">
            {CHANNELS.map((channel) => {
              const Icon = channel.icon
              return (
                <TabsTrigger key={channel.id} value={channel.id} className="min-w-0 gap-1.5 px-2 py-2 text-[11px] sm:text-xs">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{channel.label}</span>
                  <span className="sm:hidden">{channel.shortLabel}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        {CHANNELS.map((channel) => (
          <ChannelWorkspace key={channel.id} channel={channel} />
        ))}
      </Tabs>
    </Card>
  )
}

export default function HomePage() {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <Head>
        <title>RedMart | Reddit and Facebook Engagement That Sells</title>
        <meta
          name="description"
          content="RedMart finds relevant conversations, communities, buyers, and demand across Reddit and Facebook, then helps you engage naturally and sell goods or services."
        />
        <meta property="og:title" content="RedMart | Find the conversation. Make the right reply. Close the sale." />
        <meta
          property="og:description"
          content="A seamless engagement workflow for Reddit, Facebook Groups, and Facebook Marketplace."
        />
        <link rel="canonical" href={SITE_URL + '/'} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }} />
      </Head>

      <div className="min-h-screen overflow-x-hidden bg-surface-0 font-body text-text-primary">
        <nav aria-label="Primary navigation" className="border-b border-border bg-surface-0/90 px-5 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="#top" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BrandMark />
              <span className="font-display text-lg font-semibold tracking-wide">RedMart</span>
            </a>
            <div className="hidden items-center gap-6 md:flex">
              <a href="#product" className="nav-item text-sm text-text-secondary transition-colors hover:text-text-primary">Product</a>
              <a href="#workflow" className="nav-item text-sm text-text-secondary transition-colors hover:text-text-primary">How it works</a>
              <a href="#channels" className="nav-item text-sm text-text-secondary transition-colors hover:text-text-primary">Channels</a>
              <Link href="/dashboard" className="nav-item text-sm text-text-secondary transition-colors hover:text-text-primary">Dashboard</Link>
              <a href="#faq" className="nav-item text-sm text-text-secondary transition-colors hover:text-text-primary">FAQ</a>
            </div>
            <a href="#product" className={cn(buttonVariants({ size: 'sm' }), 'font-display font-semibold')}>
              See Red work
            </a>
          </div>
        </nav>

        <main id="top">
          <section className="relative px-5 pb-14 pt-16 sm:pb-20 sm:pt-24">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-90"
              style={{
                background:
                  'radial-gradient(60% 52% at 50% 5%, rgba(139,34,50,0.46) 0%, rgba(201,168,76,0.08) 48%, transparent 80%)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-72 max-w-6xl opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(201,168,76,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.10) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
                maskImage: 'radial-gradient(circle at center, black, transparent 72%)',
              }}
            />

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55 }}
              className="relative mx-auto max-w-6xl"
            >
              <div className="mx-auto max-w-4xl text-center">
                <Badge variant="secondary" className="mb-6 border-gold/25 bg-gold-dim text-[10px] uppercase tracking-[0.18em] text-gold">
                  Reddit + Facebook engagement
                </Badge>
                <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
                  Find the conversation.
                  <span className="block italic text-accent-light">Make the right reply.</span>
                  <span className="block">Close the sale.</span>
                </h1>
                <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
                  RedMart finds the people, groups, threads, and buyers already talking about what you sell. It understands the context, drafts a natural response, and keeps the opportunity moving across Reddit, Facebook Groups, and Marketplace.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a href="#product" className={cn(buttonVariants({ size: 'lg' }), 'btn-primary w-full font-display font-semibold sm:w-auto')}>
                    See Red in action
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full font-display font-semibold sm:w-auto')}>
                    Open dashboard
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1.5"><CircleCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />Goods and services</span>
                  <span className="flex items-center gap-1.5"><CircleCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />Context before outreach</span>
                  <span className="flex items-center gap-1.5"><CircleCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />Human-reviewed engagement</span>
                </div>
              </div>

              <div id="product" className="scroll-mt-8 pt-12 sm:pt-16">
                <ProductWorkspace />
              </div>
            </motion.div>
          </section>

          <section className="border-y border-border bg-surface-1/45 px-5 py-8">
            <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-[0.72fr_1.28fr] md:items-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">The product thesis</p>
              <p className="font-display text-lg leading-relaxed text-text-primary sm:text-xl">
                GummySearch-style discovery, RedReach-style opportunity spotting, and Facebook selling workflows, combined into one seamless engagement layer.
              </p>
            </div>
          </section>

          <section id="workflow" className="scroll-mt-16 px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">One continuous workflow</p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">From “someone needs this” to “sale closed.”</h2>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  Most tools stop after search or monitoring. Red carries the opportunity through the full engagement loop, with the context and next action intact.
                </p>
              </div>

              <div className="section-cards mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {WORKFLOW.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <Card key={step.title} className="relative border-border bg-surface-1 py-4">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent-light">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="font-display text-xs font-semibold text-text-tertiary">0{index + 1}</span>
                        </div>
                        <CardTitle className="mt-4 font-display text-lg">{step.title}</CardTitle>
                        <CardDescription className="card-desc text-xs leading-relaxed text-text-secondary">{step.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-6xl px-5"><Separator /></div>

          <section id="channels" className="scroll-mt-16 px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Three surfaces, one Red</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Meet customers where intent already exists.</h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-text-secondary lg:justify-self-end">
                  Reddit reveals the language and problems of a market. Facebook Groups reveal trusted communities and recommendation demand. Marketplace reveals active buyers. Red connects all three to the same selling goal.
                </p>
              </div>

              <div className="mt-9 grid gap-4 lg:grid-cols-3">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon
                  return (
                    <Card key={channel.id} className="border-border bg-surface-1">
                      <CardHeader>
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <CardTitle className="font-display text-xl">{channel.label}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-text-secondary">{channel.discovery}.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 border-t border-border pt-4">
                          <div className="flex gap-2.5 text-xs leading-relaxed text-text-secondary">
                            <ScanSearch className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-light" aria-hidden="true" />
                            Find the conversation or buyer signal.
                          </div>
                          <div className="flex gap-2.5 text-xs leading-relaxed text-text-secondary">
                            <PenLine className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-light" aria-hidden="true" />
                            Draft the right response or selling move.
                          </div>
                          <div className="flex gap-2.5 text-xs leading-relaxed text-text-secondary">
                            <ListChecks className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-light" aria-hidden="true" />
                            Keep the next action in one queue.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="px-5 py-8 sm:py-14">
            <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-accent/25 bg-surface-1 shadow-2xl shadow-black/25 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="relative overflow-hidden border-b border-border p-7 sm:p-10 lg:border-b-0 lg:border-r">
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{ background: 'radial-gradient(circle at 10% 0%, rgba(139,34,50,0.34), transparent 62%)' }}
                />
                <div className="relative">
                  <Badge variant="secondary" className="border-gold/20 bg-gold/10 text-[9px] uppercase tracking-[0.16em] text-gold">
                    Seamless reply-guy workflow
                  </Badge>
                  <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">Reply-guy speed. Human context.</h2>
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                    Red is built to help you arrive at the right moment with something useful to say. It does not spray generic comments. It finds high-fit context, shows you why it matters, and prepares a response specific enough to earn attention.
                  </p>
                  <div className="mt-7 space-y-3">
                    {['Relevance before volume', 'Context before copy', 'Follow-up without inbox sprawl'].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-xs text-text-primary">
                        <CircleCheck className="h-4 w-4 text-gold" aria-hidden="true" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">What Red hands you</p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      icon: Target,
                      label: 'The opportunity',
                      text: 'Who is asking, where they are asking, and why the moment is relevant.',
                    },
                    {
                      icon: BrainCircuit,
                      label: 'The context',
                      text: 'The need, constraints, tone, and history you should understand before replying.',
                    },
                    {
                      icon: MessageSquareText,
                      label: 'The engagement',
                      text: 'A natural draft that contributes first and makes the commercial next step easy.',
                    },
                    {
                      icon: ListChecks,
                      label: 'The follow-up',
                      text: 'A clear next action so a promising conversation does not disappear into another inbox.',
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-xl border border-border bg-surface-2/55 p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-1 text-accent-light">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-display text-sm font-semibold text-text-primary">{item.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-16 sm:py-20">
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent-light">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-5 font-display text-3xl font-semibold">Seamless does not mean unattended.</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
                <p>
                  Red can discover, monitor, summarize, recommend, draft, price, and organize follow-up. The engagement feels seamless because the research and context travel with the opportunity, not because Red pretends to be you.
                </p>
                <p>
                  Person-to-person replies, reactions, calls, emails, and direct messages remain yours to send. Exact Facebook Marketplace listing fields can be changed only when you explicitly request and approve those changes.
                </p>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-6xl px-5"><Separator /></div>

          <section id="faq" className="scroll-mt-16 px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">The clear version</p>
              <h2 className="mt-3 text-center font-display text-3xl font-semibold">Questions about RedMart</h2>
              <Accordion className="mt-8">
                {FAQS.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question} className="border-border">
                    <AccordionTrigger className="font-display text-sm text-text-primary">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-[13px] leading-relaxed text-text-secondary">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section className="px-5 pb-20 pt-6 text-center sm:pb-24">
            <div className="mx-auto max-w-3xl rounded-2xl border border-gold/20 bg-gradient-to-br from-accent/15 via-surface-1 to-gold/5 px-6 py-12 sm:px-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Find, reply, sell</p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Turn existing intent into the next customer.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
                RedMart brings audience discovery, contextual engagement, follow-up, and Facebook selling into one focused workflow.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="#product" className={cn(buttonVariants({ size: 'lg' }), 'font-display font-semibold')}>
                  Explore the product
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#channels" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'font-display font-semibold')}>
                  Compare the channels
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border px-5 py-7">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-sm font-semibold">RedMart</span>
            </div>
            <div className="text-center sm:text-right">
              <nav aria-label="Site information" className="mb-1.5 flex items-center justify-center gap-4 text-xs text-text-secondary sm:justify-end">
                <Link href="/about" className="hover:text-text-primary">About</Link>
                <Link href="/contact" className="hover:text-text-primary">Contact</Link>
                <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
              </nav>
              <p className="text-xs text-text-tertiary">Seamless engagement for Reddit, Facebook Groups, and Facebook Marketplace.</p>
            </div>
          </div>
        </footer>
        <ChatWidget />
      </div>
    </>
  )
}
