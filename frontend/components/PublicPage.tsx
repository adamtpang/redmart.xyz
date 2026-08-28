import type { ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SITE_URL = 'https://redmart.xyz'

interface PublicPageProps {
  title: string
  description: string
  path: string
  children: ReactNode
}

export default function PublicPage({ title, description, path, children }: PublicPageProps) {
  const canonical = `${SITE_URL}${path}`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Head>
      <div className="min-h-screen bg-surface-0 text-text-primary font-body">
        <header className="border-b border-border px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="RedMart home">
            <span aria-hidden="true" className="w-9 h-9 rounded-full bg-accent shadow-md shadow-black/30 flex items-center justify-center font-display font-bold text-white">R</span>
            <span className="font-display text-lg font-semibold tracking-wide">RedMart</span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-4">
            <Link href="/demands" className="text-sm text-text-secondary hover:text-text-primary">Demands</Link>
            <Link href="/sell" className="text-sm text-text-secondary hover:text-text-primary">Sell</Link>
          </nav>
        </header>
        <main className="max-w-3xl mx-auto px-5 py-12">
          {children}
        </main>
        <footer className="border-t border-border px-5 py-6 text-center">
          <nav aria-label="Site information" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-text-secondary mb-3">
            <Link href="/about" className="hover:text-text-primary">About</Link>
            <Link href="/contact" className="hover:text-text-primary">Contact</Link>
            <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
          </nav>
          <span className="text-xs text-text-tertiary">RedMart &mdash; an open-source community marketplace prototype</span>
        </footer>
      </div>
    </>
  )
}
