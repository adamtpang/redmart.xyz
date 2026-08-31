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

The `/dashboard` route is a direct extension of RedMart's own landing page.
It uses the same oxblood canvas, warm ivory typography, burgundy actions, gold
operational signals, Playfair Display headlines, Source Serif body copy, soft
radii, and editorial pacing. The decision queue is denser than the marketing
page, but it should still feel unmistakably like RedMart rather than a generic
analytics product.

[Shapeable.art](https://shapeable.art) is used only as a mechanical quality
audit for overflow, target size, content hierarchy, and accessibility. It is
not a visual reference and its fonts, light palette, square corners, and grid
styling must not be copied into RedMart.

Dashboard component families:

- Badge for monitor, urgency, and pipeline states
- Button for section navigation and copy-only actions
- A master-detail action console instead of a grid of repeated action cards
- Dialog for the required reply review confirmation
- Responsive listing records instead of a horizontally scrolling table

Agent interaction model:

- One decision inbox shows the move, evidence, value, and approval state.
- Reply approvals persist as copy-ready decisions. Adam still sends manually.
- Exact listing edits persist separately from reply decisions and never imply
  that Facebook changed before the Helium connector verifies the mutation.
- The price watcher can be enabled or disabled and proposes a reduction after
  72 hours with no buyer signal and at least 25 clicks.
- All 14 listings remain visible in the report, including quiet items.

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

- Headlines: Playfair Display, including italic burgundy emphasis
- Interface and explanatory copy: Source Serif 4
- Compact operational metadata: IBM Plex Mono
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
| Latest report snapshot | 31 Aug, 1:59 PM SGT |
| Production Shapeable rerun | 20 of 20 checks passed, 0 findings |
| Production Shapeable audit ID | `audit-20260831044619` |
| Helium visual and keyboard pass | Awaiting one-time remote-debugging approval |

Approval-driven agent expansion, 2026-08-31:

| Check | Result |
| --- | --- |
| Persistent browser approval state | Implemented |
| Reply approval behavior | Review and copy only |
| Exact price approval | Amazon Echo RM130 to RM120, applied and verified live |
| Price watcher policy | 72 hours, 25 clicks, 24-hour cooldown |
| All listing coverage | 14 of 14 |
| Live connector status | Dedicated Red Helium connected, hourly monitor active |
| Production Shapeable rerun | 20/20 checks passed, zero findings |
| Post-price-change contract tests | 9 of 9 passed |
| Production Shapeable audit ID | `audit-20260831060830` |

Approval handoff refinement, 2026-08-31:

| Check | Result |
| --- | --- |
| Ranked reply decisions in inbox | 11 of 11 |
| Total inbox entries | 12, including the verified Echo price change |
| Latest lead represented | Hamka, Cajon Bundle, 2:31 PM SGT |
| Reply handoff | Review, approve and copy, then manual paste in Helium |
| Extra confirmation checkbox | Removed |
| Persistent copied state | Verified in isolated headless Helium |
| Person-to-person side effects | 0 |
| Minimum visible target size | 44px |
| Desktop horizontal overflow | None |
| Mobile horizontal overflow at 390px | None |
| Production Helium dialog pass | Hamka situation, reasoning, draft, and pickup details verified |
| Contract tests | 9 of 9 passed |
| Production Shapeable rerun | 21 of 21 checks passed, zero findings, 100/100 surface score |
| Production Shapeable audit ID | `audit-20260831070003` |
| Production deployment ID | `dpl_EtP2b4pWVYBraFmzoWxVcSKQan2g` |
| Code commit | `b8f12fe` |

RedMart identity restoration, 2026-08-31:

| Check | Result |
| --- | --- |
| Primary visual reference | RedMart landing page |
| Shapeable role | Audit only, never art direction |
| Dashboard background | Oxblood `#1A0A0A` |
| Display typography | Playfair Display |
| Body typography | Source Serif 4 |
| Desktop horizontal overflow | None at 1440px |
| Mobile horizontal overflow | None at 390px |
| Mobile approval dialog | 362px wide inside a 390px viewport |
| Minimum reviewed action height | 44px |
| Keyboard focus | Visible 2px gold outline |
| Contract tests | 9 of 9 passed |
| Person-to-person side effects | 0 |

Visual captures:

- `redmart-engagement-desktop.png`
- `redmart-engagement-mobile.png`
- `redmart-engagement-mobile-product.png`

