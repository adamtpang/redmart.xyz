import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface VendorForm {
  name: string
  business: string
  products: string
  contact: string
}

const EXISTING_VENDORS = [
  { name: 'NS Essentials', products: 'Sunscreen, toiletries, daily essentials', status: 'active' },
  { name: 'NS Bake Sale', products: 'Banana bread, cookies, pastries', status: 'active' },
  { name: 'NS Hardware', products: 'Storage containers, tools, cables', status: 'active' },
  { name: 'NS Rentals', products: 'Monitors, bikes, scooters', status: 'active' },
  { name: 'NS Crafts', products: 'Handpainted pet rocks, art', status: 'active' },
  { name: 'Local Maker', products: 'Body scrubs, soaps, skincare', status: 'active' },
]

export default function SellPage() {
  const [form, setForm] = useState<VendorForm>({ name: '', business: '', products: '', contact: '' })
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In prod this would hit an API. For hackathon, just show success.
    setSubmitted(true)
  }

  const steps = [
    { label: 'You', field: 'name' as const, placeholder: 'Your name', question: 'Who are you?' },
    { label: 'Business', field: 'business' as const, placeholder: 'e.g. NS Bake Sale', question: 'What\'s your business called?' },
    { label: 'Products', field: 'products' as const, placeholder: 'e.g. Banana bread, cookies, custom cakes', question: 'What do you sell?' },
    { label: 'Contact', field: 'contact' as const, placeholder: 'Telegram, WhatsApp, or email', question: 'How should buyers reach you?' },
  ]

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
          <Link href="/demands" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Demands
          </Link>
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Home
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-10 pb-16">
        {!submitted ? (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Sell on <span className="text-accent-light">RedMart</span>
              </h1>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                List your goods for the NS community. No fees, no middleman. Red connects buyers to you directly.
              </p>
            </motion.div>

            {/* Progress */}
            <div className="flex gap-1 mt-8 mb-6">
              {steps.map((s, i) => (
                <div key={s.label} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent-light' : 'bg-surface-3'}`} />
              ))}
            </div>

            {/* Form - one step at a time */}
            <form onSubmit={handleSubmit}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-lg font-display font-semibold mb-3">
                  {steps[step].question}
                </label>
                {steps[step].field === 'products' ? (
                  <textarea
                    value={form[steps[step].field]}
                    onChange={(e) => setForm({ ...form, [steps[step].field]: e.target.value })}
                    placeholder={steps[step].placeholder}
                    rows={3}
                    className="w-full bg-surface-1 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 resize-none"
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={form[steps[step].field]}
                    onChange={(e) => setForm({ ...form, [steps[step].field]: e.target.value })}
                    placeholder={steps[step].placeholder}
                    className="w-full bg-surface-1 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                    autoFocus
                  />
                )}
              </motion.div>

              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="text-sm text-text-tertiary hover:text-text-secondary px-4 py-2.5"
                  >
                    Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => form[steps[step].field].trim() && setStep(step + 1)}
                    disabled={!form[steps[step].field].trim()}
                    className="bg-accent text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-accent-light transition-colors disabled:opacity-30"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!form.contact.trim()}
                    className="bg-accent text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-accent-light transition-colors disabled:opacity-30"
                  >
                    Submit Listing
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          /* Success */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-light mx-auto flex items-center justify-center mb-6">
              <span className="text-2xl text-white font-bold">R</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">You're in.</h2>
            <p className="text-text-secondary text-sm mb-1">
              Red will start connecting buyers to <strong className="text-text-primary">{form.business}</strong>.
            </p>
            <p className="text-text-tertiary text-xs mb-8">
              We'll reach out via {form.contact} to set up your store page.
            </p>
            <Link href="/" className="bg-accent text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-accent-light transition-colors inline-block">
              Back to RedMart
            </Link>
          </motion.div>
        )}

        {/* Existing vendors */}
        <div className="mt-16">
          <h2 className="font-display text-lg font-semibold mb-4">Already selling on RedMart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {EXISTING_VENDORS.map((v) => (
              <div key={v.name} className="bg-surface-1 border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-dim flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-light text-xs font-bold">{v.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{v.name}</p>
                  <p className="text-[11px] text-text-tertiary truncate">{v.products}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
