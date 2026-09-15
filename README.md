# Marilux Beauty Bar

A luxury beauty destination in Hebron, Accra — built as a digital experience rather than a
brochure. Ten service "rooms", each with its own colour mood and motion, and a nine-step booking
flow modelled on premium spa check-in rather than a contact form.

---

## Running it

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything degrades gracefully
npm run dev                  # http://localhost:3000
```

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

## Architecture

```
src/
├── app/                        Routes, metadata, API handlers
│   ├── api/                    booking · payments · contact · newsletter
│   ├── services/[slug]/        The ten immersive category pages (SSG)
│   ├── booking/                The nine-step flow + gateway return page
│   ├── layout.tsx              Fonts, providers, JSON-LD, chrome
│   └── template.tsx            Route-transition curtain (remounts per navigation)
├── components/
│   ├── providers/              SmoothScroll · Preloader · Cursor
│   ├── layout/                 Navigation · Footer · FloatingActions · Newsletter
│   ├── ui/                     Reveal · SplitHeading · Magnetic · Button · Plate · …
│   ├── sections/               Composable page sections
│   ├── booking/                Context, steps, progress rail, summary, confirmation
│   └── gallery/                MasonryGrid · Lightbox · BeforeAfter
├── lib/
│   ├── data/                   Services, team, testimonials, gallery, policies, site
│   ├── booking/                Zod schema, availability engine
│   ├── integrations/           Gmail · WhatsApp · payments · notify (server-only)
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

### Replacing the placeholder photography

`<Plate>` (`src/components/ui/Plate.tsx`) renders a designed warm-light composition wherever a
real photograph has not been supplied. Pass `src` and it swaps to an optimised `next/image` with
no other change:

```tsx
<Plate src="/photos/brow-detail.jpg" alt="Hand-finished brow artistry" ratio="aspect-[4/5]" />
```

Plate hues are mapped into the brand's warm band from a numeric `seed`, so no generated plate can
drift off-palette.

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

### Still to wire up

Two `TODO(persistence)` markers mark the one deliberate gap: bookings are notified but not yet
written to a datastore, so the webhook cannot reconcile a reference to a record. Add a table (or
Airtable/Sheets/Supabase) in `POST /api/booking`, then update the deposit status in the webhook.

## Performance

Measured on the production build, scripted full-page scroll:

| Metric | Result |
| --- | --- |
| LCP | 156 ms (the hero LCP element is type, not an image) |
| CLS | 0.0000 |
| Median frame | 8.3 ms |
| Frames over 16.7 ms | 1 of 147 |
| First-load JS | ~102 kB shared |

How it stays there:

- Only `opacity` and `transform` are animated, so reveals live on the compositor.
- Lenis runs on the GSAP ticker — two independent rAF loops would fight and drop frames.
- The cursor uses `gsap.quickTo`, writing one transform per frame instead of re-rendering React.
- The Google Map is click-to-load; a third-party embed in the initial document would cost several
  hundred kilobytes and set cookies before the visitor asked for a map.
- The intro curtain shows once per session and overlays already-painted DOM, so it never gates LCP.

## Accessibility

- Every reveal target carries `data-anim`, which the stylesheet hides **only once JS has booted** —
  so the page is fully readable without JavaScript and there is no flash of hidden content.
- `prefers-reduced-motion` disables Lenis, the preloader, the cursor, magnetic buttons and every
  scroll animation, and forces revealed content visible.
- Booking choices are real radio groups; the calendar and slot grid use `aria-pressed`; the
  before/after slider is a real range input, so it is keyboard-operable.
- The confirmation moves focus to its heading so assistive technology announces the outcome.
- Skip link, visible focus rings, labelled landmarks, and `aria-live` on availability counts.

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
