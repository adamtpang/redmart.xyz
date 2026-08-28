# RedMart Design System

Updated: 2026-08-28

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

Visual captures:

- `redmart-engagement-desktop.png`
- `redmart-engagement-mobile.png`
- `redmart-engagement-mobile-product.png`

