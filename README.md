# Marilux Beauty Bar

A luxury beauty destination in Hebron, Accra — built as a digital experience rather than a
brochure. Ten service "rooms", each with its own colour mood and motion, and a nine-step booking
flow modelled on premium spa check-in rather than a contact form.

---

## Running it

```bash
npm install
npm run dev                  # http://localhost:3000
```

A `.env.local` is already present with a development admin password, so
`http://localhost:3000/admin` opens immediately:

| | |
| --- | --- |
| URL | `/admin` |
| Password | `marilux-dev-password` |

**Change both values before deploying.** Copy `.env.example` for the full list of variables —
email, WhatsApp and payments are all unset by default, and each reports itself as unconfigured
rather than failing silently.

`.data/bookings.json` contains three sample bookings so the dashboard is not empty on first
look. Delete that file to start clean.

```bash
npm run build && npm start   # production
npm run typecheck            # tsc --noEmit
npm run lint
```

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Static generation for every content page, server routes for the booking API |
| Language | TypeScript (strict) | One `zod` schema validates the booking on both client and server |
| Styling | Tailwind CSS 3.4 | Design tokens live in `tailwind.config.ts`; primitives in `globals.css` |
| Scroll-linked motion | GSAP + ScrollTrigger | Scrubbed parallax, reveals, split headings |
| UI state motion | Framer Motion | Step transitions, lightbox, accordions, mobile menu |
| Smooth scrolling | Lenis | Driven by the GSAP ticker, so both share one rAF loop |
| Icons | lucide-react, react-icons | Lucide for UI, react-icons for brand marks |
| Theming | CSS variables + Tailwind tokens | One class set drives both light and dark |
| Email | nodemailer (SMTP) or Gmail API | SMTP + an App Password is the simple path |
| Storage | JSON file behind a repository interface | Swap for Postgres before serverless |

## Architecture

```
src/
├── app/
│   ├── (site)/                 Public site — marketing chrome, smooth scroll
│   │   ├── services/[slug]/    The ten immersive category pages (SSG)
│   │   ├── booking/            The nine-step flow + gateway return page
│   │   └── template.tsx        Route-transition curtain (remounts per nav)
│   ├── (admin)/admin/          Studio dashboard — no marketing chrome
│   │   ├── page.tsx            Earnings, today, awaiting review, channels
│   │   ├── bookings/           List, filters, search, full detail + actions
│   │   ├── schedule/           Week view
│   │   └── login/ · setup/
│   ├── api/                    booking · admin · payments · contact · newsletter
│   └── layout.tsx              Fonts, theme bootstrap, root providers
├── components/
│   ├── providers/              SmoothScroll · Preloader · Cursor
│   ├── layout/                 Navigation · Footer · FloatingActions · Newsletter
│   ├── ui/                     Reveal · SplitHeading · Magnetic · Button · Plate · …
│   ├── sections/               Composable page sections
│   ├── booking/                Context, steps, progress rail, summary, confirmation
│   ├── admin/                  Nav, stat cards, status pills, booking actions
│   └── gallery/                MasonryGrid · Lightbox · BeforeAfter
├── lib/
│   ├── data/                   Services, team, testimonials, gallery, images, policies, site
│   ├── booking/                Zod schema, availability engine
│   ├── store/                  Booking repository + earnings reporting
│   ├── admin/                  Session auth (HMAC cookie, constant-time compare)
│   ├── integrations/           SMTP · Gmail · WhatsApp · payments · notify (server-only)
│   ├── gsap.ts                 Single plugin-registration point
│   └── motion.ts               Shared easing vocabulary
└── hooks/
```

### Editing content

Almost everything the studio will want to change lives in `src/lib/data/`:

- **`services.ts`** — the ten categories and all their treatments. Each category carries a
  `mood` (accent colour + ambient gradient) that drives its page, its cards and its selection
  states. Adding a treatment is one object; adding a category is one object and a new static
  page is generated automatically.
- **`site.ts`** — contact details, socials, opening hours. `openingHours` also drives which
  booking slots exist.
- **`team.ts`** — specialists, and which categories each can be booked for.
- **`testimonials.ts`**, **`gallery.ts`**, **`policies.ts`**.

### Photography

45 photographs live in `public/images/`, organised into themed pools in
`src/lib/data/images.ts` (`brows`, `lashes`, `hair`, `nails`, `skin`, `spa`, `makeup`,
`portrait`, `studio`). Components ask for a pool and a slot rather than a filename:

```tsx
<Plate theme="lashes" index={2} ratio="aspect-[4/5]" />
```

**These are placeholders.** They are free-licensed Pexels photographs chosen to reflect the
studio's clientele — see `CREDITS.md` for every source. To swap in Marilux's own photography,
replace the files in `public/images/` keeping the same filenames; no code changes at all. To
point one slot at a specific new file, pass `src` instead of `theme`.

If a slot resolves to neither, `<Plate>` renders a generated warm-light composition rather than
a broken box, so the layout can never collapse.

## The booking flow

`Category → Service → Specialist → Date → Time → Details → Notes → Summary → Deposit`

- State lives in `BookingContext`. Changing an upstream answer invalidates the ones beneath it —
  a new service means a new duration, so the chosen slot is cleared rather than silently kept.
- Deep links skip ahead: `/booking?category=lashes&service=volume-set` lands on the first
  unanswered step. Every service card on the site links this way.
- **Pricing, duration and specialist names are resolved server-side** from the catalogue, never
  trusted from the request body, and the slot is re-checked before the booking is accepted.
- Availability (`src/lib/booking/availability.ts`) is currently deterministic, so the same date
  always yields the same grid. Replace the body of `getAvailability` with a call to the studio
  calendar; the signature is what the UI depends on.

### Notifications

On submission the booking fans out to every configured channel in parallel
(`src/lib/integrations/notify.ts`). Delivery never blocks or fails the booking — if Gmail or
WhatsApp is down, the guest is still confirmed and the server log names exactly which channel
needs a manual follow-up:

```
[booking] MLX-260915-SZ7DV — undelivered: whatsapp/owner (WhatsApp Cloud API is not configured.)
```

The owner receives name, phone, WhatsApp, email, service, date, time, notes and deposit status.
The client receives a branded confirmation with the policy summary.

> **WhatsApp note:** Meta only permits free-form messages inside a 24-hour customer-service
> window. Owner notifications are unaffected. For client confirmations, get a message template
> approved and set `WHATSAPP_CUSTOMER_TEMPLATE` — the adapter will then send the template instead.

### Payments

`PaymentProvider` (`src/lib/integrations/types.ts`) is the contract. **Paystack** and **Hubtel**
are implemented live; add Stripe or Flutterwave by implementing the same interface and registering
it in `PROVIDERS` — nothing above that file changes.

Without gateway credentials the flow stays honest: the booking is recorded and acknowledged, and
the guest is told the studio will send a deposit link by WhatsApp. It never claims a payment
succeeded when none was taken. Deposits are only marked paid by the **signature-verified** webhook
at `/api/payments/webhook`.

### Booking lifecycle

A submitted booking is **persisted first**, then notified — a booking the studio cannot see is
worse than one that was not announced. It also re-checks the slot against the store, so two guests
submitting the same specialist and time seconds apart cannot both succeed.

`pending → confirmed → completed`, with `declined`, `cancelled` and `no-show` as exits. Revenue is
only counted once an appointment is marked completed; no-show deposits are reported separately as
forfeited.

## Theming

Light and dark are one set of classes. `tailwind.config.ts` maps every semantic colour to a CSS
variable, and `globals.css` defines two palettes — so `text-ivory` is warm ivory on dark and
near-black on light, and `border-line` carries a different alpha in each theme because a hairline
needs more weight on white than on black.

| Token | Use |
| --- | --- |
| `bg-ink`, `bg-ink-800…300` | Surfaces, darkest to lightest |
| `text-ivory`, `text-ivory/50` | Reading colour and its softer steps |
| `text-accent`, `border-accent` | Gold for type and rules — **darkens on light** for contrast |
| `bg-champagne`, `text-onaccent` | Fixed brand gold fill and the dark type that sits on it |
| `border-line`, `-2`, `-3` | Hairlines, subtle → strong |
| `bg-fill`, `bg-fill-2` | Barely-there surface tints |

Two rules worth knowing:

- **Gold splits in two.** `champagne` is the fixed brand gold used for filled buttons; `accent`
  is the theme-aware gold used for text, borders and rules. Gold type on ivory would fail contrast
  otherwise.
- **Content over photography never flips.** Anything laid over an image sits inside `.on-media`,
  which pins the colour tokens to their light-on-dark values — the scrim beneath does not change
  with the theme, so the text above it must not either.

The theme is written to `<html data-theme>` by a small inline script before first paint, so there
is no flash of the wrong palette and no hydration mismatch. The choice persists in `localStorage`
and defaults to the visitor's system preference.

## The admin dashboard

`/admin` — the studio's working tool. Deliberately outside the marketing chrome: no smooth-scroll
rig, no intro curtain, no custom cursor.

| Screen | What it does |
| --- | --- |
| **Overview** | Deposits collected, revenue completed, booked-not-yet-delivered, balance due in studio, average value, forfeited deposits. Today's diary, the queue awaiting review, and live notification-channel status. |
| **Bookings** | Every appointment, filtered by status and searchable by name, reference, email, phone or service. |
| **Booking detail** | Full client record: contact details, the treatment, duration, specialist, **the client's own notes** (allergies, pregnancy, sensitivities), deposit state, message history, and every previous booking by that client. |
| **Schedule** | Week view with opening hours, chair time, booked value, and each client's notes inline. |

Actions: accept, decline, mark completed, no-show, cancel, reopen; set deposit state; send or
resend a confirmation; send a reminder; leave a private studio note.

Accepting or declining offers to message the client in the same step — a checkbox, not a silent
side effect. Every send reports per-channel outcome honestly, including the actual failure reason:

> email: delivered
> whatsapp: not sent — WhatsApp Cloud API is not configured.

### Access

One studio password exchanged for an HMAC-signed, HTTP-only, 12-hour cookie. The password is
compared in constant time, sign-in is rate-limited to five attempts per ten minutes, and the
dashboard is `noindex`. **Without `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` the dashboard does
not open at all** — there is no default password, and `/admin/setup` tells you what to set.

### Reminders

The dashboard's "Send reminders" button messages tomorrow's confirmed bookings and skips anyone
already reminded, so pressing it twice cannot message a client twice. The same endpoint runs from
cron with a `x-cron-key` header matching `CRON_SECRET`:

```bash
curl -X POST https://your-domain/api/admin/reminders -H "x-cron-key: $CRON_SECRET"
```

## Storage

Bookings persist through a repository interface (`src/lib/store/bookings.ts`). The bundled
implementation is a JSON file under `.data/`, with writes serialised through a promise queue and
committed by atomic rename — so two bookings landing in the same tick cannot clobber each other,
and a crash mid-write cannot corrupt the file.

> **Before deploying to Vercel, Netlify or any serverless host:** their filesystems are ephemeral
> and per-invocation, so this store will silently lose data. Implement the same
> `BookingRepository` interface against Postgres, Supabase or Turso. Nothing outside that one file
> needs to change.

## Performance

Measured on the production build, scripted full-page scroll:

| Metric | Result |
| --- | --- |
| TTFB | 12 ms |
| LCP | 88 ms |
| CLS | 0.0000 |
| Median frame | 8.3 ms |
| 95th-percentile frame | 9.1 ms |
| Frames over 16.7 ms | 1 of 179, scrolling the full page |
| First-load JS | ~102 kB shared |

One caveat worth knowing: the **first ever request** for each image pays Next.js image
optimisation, which showed as a ~9 s LCP on a cold server. Once optimised, the same hero image
is 50 kB and LCP is 88 ms. On a CDN this happens once per image, globally — but if you want it
gone entirely, pre-generate the sizes at build time.

How it stays there:

- Only `opacity` and `transform` are animated, so reveals live on the compositor.
- Lenis runs on the GSAP ticker — two independent rAF loops would fight and drop frames.
- The cursor uses `gsap.quickTo`, writing one transform per frame instead of re-rendering React.
- The Google Map is click-to-load; a third-party embed in the initial document would cost several
  hundred kilobytes and set cookies before the visitor asked for a map.
- The intro curtain shows once per session and overlays already-painted DOM, so it never gates LCP.
- Every image goes through `next/image` with explicit `sizes`, so a card never downloads a
  hero-sized file — and every surface reserves its aspect ratio, which is why CLS is a flat zero.

## Accessibility

- Every reveal target carries `data-anim`, which the stylesheet hides **only once JS has booted** —
  so the page is fully readable without JavaScript and there is no flash of hidden content.
- `prefers-reduced-motion` disables Lenis, the preloader, the cursor, magnetic buttons and every
  scroll animation, and forces revealed content visible.
- Booking choices are real radio groups; the calendar and slot grid use `aria-pressed`; the
  before/after slider is a real range input, so it is keyboard-operable.
- The confirmation moves focus to its heading so assistive technology announces the outcome.
- Skip link, visible focus rings, labelled landmarks, and `aria-live` on availability counts.
- Both themes are built to contrast: gold darkens to `#8A662A` on light backgrounds rather than
  keeping a brand value that would fail against ivory.

## SEO

- Per-page canonical URLs, Open Graph and Twitter metadata via `buildMetadata`.
- JSON-LD: `BeautySalon` sitewide, `OfferCatalog` on services, `Service` per category,
  `EducationalOrganization` for the Institute, `Review`/`ItemList` for testimonials, `FAQPage`
  on contact.
- Generated `sitemap.xml` and `robots.txt`; `/booking/confirm` is excluded from indexing because
  it carries booking references.
- Edge-generated Open Graph share image at `/opengraph-image`.

## A note on content

Prices are **indicative placeholders in Ghana Cedis** and should be reviewed before launch. The
testimonials, specialist biographies and statistics are illustrative copy written to the brand's
voice — replace them with real reviews, real team members and real numbers before going live.
