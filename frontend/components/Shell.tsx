import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { STORE_URL } from '../lib/constants'

interface ShellProps {
  title: string
  children: React.ReactNode
}

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Products',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 6h12" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 6v7" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2h8l2 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6l2-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M2 6h12" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Shell({ title, children }: ShellProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface-0">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-surface-1 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md hover:bg-surface-2 transition-colors"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-secondary">
            {mobileMenuOpen ? (
              <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-60 h-full bg-surface-1 border-r border-border flex flex-col pt-12"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex-1 px-2 py-3 space-y-0.5">
                {navItems.map((item) => {
                  const active = router.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 ease-out',
                        active
                          ? 'bg-surface-2 text-text-primary border-l-2 border-accent'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/50'
                      )}
                    >
                      <span className={active ? 'text-accent' : 'text-text-tertiary'}>{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                  <span className="text-xs text-text-tertiary truncate">
                    {STORE_URL || 'No store connected'}
                  </span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-surface-1 border-r border-border flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-semibold text-text-primary">Shopify App</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 ease-out',
                  active
                    ? 'bg-surface-2 text-text-primary border-l-2 border-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/50'
                )}
              >
                <span className={active ? 'text-accent' : 'text-text-tertiary'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <span className="text-xs text-text-tertiary truncate">
              {STORE_URL || 'No store connected'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop topbar */}
        <header className="hidden md:flex h-12 bg-surface-1 border-b border-border items-center justify-between px-5 flex-shrink-0">
          <h1 className="text-sm font-medium text-text-primary">{title}</h1>
          {STORE_URL && (
            <a
              href={`${STORE_URL}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-150 ease-out"
            >
              Store Admin &rarr;
            </a>
          )}
        </header>

        {/* Content */}
        <motion.main
          key={router.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto p-4 md:p-5 pt-16 md:pt-5"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
