# RedMart Design System

Updated: 2026-08-31

## Product story

RedMart is one seamless engagement product across Reddit, Facebook Groups, and
Facebook Marketplace. Its core journey is:

1. Discover
2. Understand
3. Engage
4. Follow up
5. Sell

The page should lead with the outcome, not with internal agent architecture.
Channel-specific capabilities are surfaces inside the same workflow.

## Structural reference

The landing page is built against
[Tailark Hero Section Block Eight](https://tailark.com/blog/shadcn-hero-section-block-eight).
The borrowed structure is a direct centered offer followed by a large
interactive product preview with tabs for adjacent product surfaces.

RedMart preserves its own editorial visual identity instead of copying
Tailark's palette or demo content.

### Marketplace dashboard

The `/dashboard` route is built against the public interface system of
[Shapeable.art](https://shapeable.art). It borrows an evidence-first hierarchy,
Space Grotesk and IBM Plex Mono typography, a border-led proof strip, one dark
decision console, a ranked ledger, square corners, and responsive records that
preserve every field without a wide table. RedMart maps Shapeable's structural
principles onto its own burgundy and gold identity instead of copying its
palette or assets.

The dashboard uses a scoped light operations theme so long lead and listing
sessions remain legible. The public landing page keeps the original dark
editorial theme.

Dashboard component families:

- Badge for monitor, urgency, and pipeline states
- Button for section navigation and copy-only actions
- A master-detail action console instead of a grid of repeated action cards
- Dialog for the required reply review confirmation
- Responsive listing records instead of a horizontally scrolling table

Dashboard density follows a 4px rhythm. Currency values use tabular numerals.
Essential text is never smaller than 12px and visible targets are at least
44px tall. Person-to-person actions are always copy-only: Red prepares the
draft, and Adam sends it manually in Helium.

## Brand tokens

| Role | Token | Value |
| --- | --- | --- |
| Page background | `--background` | `#1A0A0A` |
| Primary text | `--foreground` | `rgba(255,245,238,0.95)` |
| Card | `--card` | `#241111` |
| Primary burgundy | `--primary` | `#8B2232` |
| Secondary oxblood | `--secondary` | `#2E1818` |
| Muted | `--muted` | `#2E1818` |
| Gold accent | `--accent-foreground` | `#C9A84C` |
| Border | `--border` | `rgba(255,200,180,0.10)` |
| Focus ring | `--ring` | `#C9A84C` |
| Base radius | `--radius` | `0.75rem` |

Typography:

- Display: Playfair Display
- Body: Source Serif 4
- Labels: uppercase, approximately 10px, with generous tracking

Dashboard typography:

- Interface: Space Grotesk
- Operational labels and currency: IBM Plex Mono
- Essential labels: 12px minimum

## Component system

The project uses shadcn Base Nova with Base UI primitives and Tailwind CSS.
The landing page uses:

- Accordion
- Badge
- Button variants
- Card
- Separator
- Tabs

The generated Tabs root receives a local `flex-col` override because the
project is currently on Tailwind CSS 3, while the generated Base Nova component
contains Tailwind CSS 4 data-attribute utilities.

## Verification

Verified against the production build in a clean headless Helium profile:

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Next.js production build | Passed |
| Body text contrast | 18.02, WCAG AA |
| Card description contrast | 6.81, WCAG AA |
| Navigation contrast | 8.26, WCAG AA |
| Primary button contrast | 8.24, WCAG AA |
| Desktop horizontal overflow | None |
| Mobile horizontal overflow at 390px | None |
| Desktop workflow columns | 5 |
| Mobile workflow columns | 1 |
| Unnamed controls | 0 |
| Reduced motion | Honored |
| Reddit tab | Passed |
| Facebook Groups tab | Passed |
| Facebook Marketplace tab | Passed |

Dashboard verification, 2026-08-30:

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Contract tests | 7 of 7 passed |
| ESLint | 0 errors, 29 pre-existing warnings |
| Next.js production build | Passed |
| Dashboard route | Statically rendered |
| Unapproved messaging requests | 0 |
| Em dashes in dashboard source | 0 |
| Latest report snapshot | 30 Aug, 7:46 PM SGT |
| Helium visual and keyboard pass | Awaiting one-time remote-debugging approval |

Dashboard redesign verification, 2026-08-31:

| Check | Result |
| --- | --- |
| Shapeable audit baseline | 5 findings, 2 high, 2 medium, 1 low |
| Baseline off-screen mobile text | 65 elements |
| Baseline tiny text | 161 mobile, 164 desktop |
| TypeScript | Passed |
| Contract tests | 8 of 8 passed |
| ESLint | 0 errors, 29 pre-existing warnings |
| Next.js production build | Passed |
| Dashboard route | Statically rendered |
| Wide pipeline table | Removed |
| Essential text below 12px | Removed from dashboard source |
| Interactive queue targets | 76px minimum |
| Reduced-motion handling | Global zero-duration override added |
| Unapproved messaging requests | 0 |
| Em dashes in dashboard source | 0 |
| Latest report snapshot | 31 Aug, 12:18 PM SGT |
| Production Shapeable rerun | 20 of 20 checks passed, 0 findings |
| Production Shapeable audit ID | `audit-20260831044619` |
| Helium visual and keyboard pass | Awaiting one-time remote-debugging approval |

Visual captures:

- `redmart-engagement-desktop.png`
- `redmart-engagement-mobile.png`
- `redmart-engagement-mobile-product.png`

