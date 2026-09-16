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
npm run db:migrate           # apply the Supabase schema (idempotent)
npm run db:import            # move any local JSON bookings into Postgres
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
| Email | nodemailer over SMTP (Brevo or Gmail) | Free, and works on any host |
| SMS | Provider registry — Arkesel · Hubtel · mNotify · Brevo · Twilio | Ghanaian providers are ~100× cheaper here |
| Storage | Supabase Postgres (`postgres.js`), JSON file fallback | Selected by `DATABASE_URL` |

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

**These are the fallbacks.** Anything the studio uploads in the dashboard takes precedence; what
follows is what renders before they do, and wherever they have not set an image.

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

Every booking sends **four messages** — an email and an SMS to the client, an email and an SMS
to the studio. Two channels each, deliberately: if one is missed or filtered, the other lands.

Setup is in **[NOTIFICATIONS-SETUP.md](NOTIFICATIONS-SETUP.md)** (Brevo for email, Arkesel or
Hubtel for SMS, with real costs).

Deliveries run in parallel and never block or fail the booking — if a provider is down the guest
is still confirmed, and the log names exactly which channel needs a manual follow-up:

```
[booking] MLX-260915-SZ7DV — undelivered: sms/customer (Insufficient balance)
```

The studio receives name, phone, email, service, date, time, **the client's notes** and deposit
status. The client receives a branded email plus a one-segment SMS.

**SMS is written for cost.** Each message fits a single 160-character GSM-7 segment; the copy is
normalised to the GSM alphabet automatically, because one curly apostrophe from a client note
would switch the message to Unicode, halve the characters per segment and double the price.

Adding a provider means implementing `SmsProvider` (four members) in
`src/lib/integrations/sms.ts` and adding it to the registry. `SMS_PROVIDER=console` prints texts
to the terminal so the whole flow can be walked locally without an account.

> **WhatsApp is paused.** Email and SMS cover everything it would have. Turning it on needs a
> number that is *not* in use on the WhatsApp phone app — registering with the Cloud API removes
> it from that app permanently, and that is a Meta platform rule, not a setting. The code is
> written and tested and activates the moment credentials appear; see
> **[WHATSAPP-SETUP.md](WHATSAPP-SETUP.md)**.

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
| **Overview** | Deposits collected, revenue completed, booked-not-yet-delivered, balance due in studio, average value, forfeited deposits. Today's diary, the queue awaiting review, live status for storage/email/SMS/WhatsApp, and a **send a real test message** panel for each channel. |
| **Bookings** | Every appointment, filtered by status and searchable by name, reference, email, phone or service. |
| **Booking detail** | Full client record: contact details, the treatment, duration, specialist, **the client's own notes** (allergies, pregnancy, sensitivities), deposit state, message history, and every previous booking by that client. |
| **Schedule** | Week view with opening hours, chair time, booked value, and each client's notes inline. |
| **Prices** | Every treatment's price, duration and visibility, editable inline. Live on the website the moment you save. |
| **Promos** | Automatic discounts and coupon codes — percentage or fixed, scoped to everything, a category or one treatment, with dates and usage limits. |
| **Messages** | Rewrite any confirmation, reminder or decline in your own words, with a live preview and SMS segment count. |
| **Gallery** | The portfolio — upload work, caption it, set its size in the grid, reorder, hide. |
| **Settings** | Where bookings reach you, which channels are on, deposit percentage, booking window, and a site-wide announcement banner. |

Actions: accept, decline, mark completed, no-show, cancel, reopen; set deposit state; send or
resend a confirmation; send a reminder; leave a private studio note.

Accepting or declining offers to message the client in the same step — a checkbox, not a silent
side effect. Every send reports per-channel outcome honestly, including the actual failure reason:

> email: delivered
> sms: not sent — Sender ID not registered

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

## Studio-editable content

Nothing about prices, messages or recipients requires a developer. It all lives in Supabase and
is edited from `/admin`.

### How the catalogue works

`src/lib/data/services.ts` remains the source of **structure** and the default copy. Supabase
holds **overrides** layered on at read time (`src/lib/catalogue/index.ts`). That has three
consequences worth knowing:

- An empty database renders exactly the catalogue we ship.
- "Reset to default" is deleting a row, not restoring a backup.
- A database outage degrades to the shipped prices rather than to an error — reads are wrapped
  in a timeout so a slow database can never stall a page render or a build.

Saving from the admin calls `revalidatePath`, so the statically generated pages pick up new
prices immediately rather than waiting for a cache to expire.

### Promotions

Two flavours share one table. A **promotion** with no code applies automatically to everything in
its scope; a **coupon** has a code the client types at checkout. Where both apply the client gets
whichever is worth more — they never stack, which avoids a discount the studio did not intend.

Every figure is recomputed server-side before a booking is accepted. A client that submits a
made-up code is simply charged the full price; the browser is never trusted with a price.

### Message templates

Each lifecycle message (received, confirmed, reminder, declined, cancelled) has an editable email
subject, email body and SMS. **A blank field falls back to the shipped copy** — so the studio can
rewrite only the text message and keep our email. Templates use `{{token}}` placeholders, and the
editor previews against a sample booking, flags unrecognised tokens, and counts SMS segments so
the cost of a longer message is visible before it is saved.

### Images

Uploads are normalised on the way in with sharp: EXIF-rotated upright, resized to a 2000px
longest edge, and converted to WebP at quality 82. A 4 MB phone photograph lands as a couple of
hundred kilobytes. That processing matters more than it sounds — the studio will upload straight
from a phone, and raw camera files would be the single biggest thing slowing the site down.

Two storage backends behind one interface (`src/lib/media/storage.ts`):

| Configured | Backend |
| --- | --- |
| `SUPABASE_URL` + `SUPABASE_SECRET_KEY` | Supabase Storage, served from its CDN |
| neither | Postgres `bytea`, served by `/api/media/[id]` |

The bucket is created by `npm run db:migrate` (migration `0004`), not by hand in the dashboard —
public read, **no public write**. Uploads go through `/api/admin/media`, which requires an admin
session and the server-only secret key.

Supabase renamed its keys: `service_role` → **secret**, `anon` → **publishable**. Both old and
new variable names are accepted. A publishable key is treated as *not configured* rather than as
a credential — pasting the wrong one is an easy mistake, and degrading to the database keeps
uploads working while the dashboard's storage test explains what to change.

The Postgres backend is the default because it needs nothing beyond `DATABASE_URL`. Responses
are `immutable` with a one-year max-age and filenames carry a timestamp, so each image is fetched
exactly once — which is what makes it viable. Moving to Supabase Storage later is two environment
variables; existing images keep working, because each row records its own provider and URL.

Images attach to a service, a category, or a gallery item, and the picker also accepts a pasted
URL. Clearing one falls back to the shipped photography rather than leaving a hole.

### Settings

Owner email addresses and phone numbers are fields, not environment variables — a change of
number is a thirty-second edit. Multiple recipients are supported, each channel can be switched
off without removing credentials, and the deposit percentage, booking window and an announcement
banner are all editable.

## Storage — Supabase

Bookings live in Supabase Postgres. Two implementations sit behind one interface
(`src/lib/store/types.ts`) and the choice is automatic:

| `DATABASE_URL` | Store used |
| --- | --- |
| set | Supabase Postgres (`postgresRepository`) |
| unset | JSON file under `.data/` (`fileRepository`) |

The dashboard's **System status** panel says which is live, so you can never deploy thinking one
is active when it is not.

### Setting it up

```bash
# 1. Connection string — Supabase → Project Settings → Database → Transaction pooler (6543).
#    Percent-encode the password: % → %25, ? → %3F, $ → %24, * → %2A
DATABASE_URL=postgresql://postgres.<ref>:<encoded-pw>@aws-1-<region>.pooler.supabase.com:6543/postgres

npm run db:migrate    # applies supabase/migrations/*.sql, idempotent
npm run db:import     # optional: moves .data/bookings.json into Postgres
```

Use the **transaction** pooler (port 6543) — it is what serverless needs, and the driver is
configured with `prepare: false` to match. `db:migrate` switches itself to the session pooler
(5432), because migrations need one sustained connection.

### Schema notes

- **Dates are `date` + minutes-from-midnight, not `timestamptz`.** The studio thinks in local
  wall-clock time; a timezone conversion is the classic way to move an appointment by an hour.
  Every read renders the date with `to_char` so nothing can drift.
- **RLS is on with no policies, and `anon`/`authenticated` have no grants.** This table holds
  names, phone numbers and medical disclosures. The app connects as `postgres` over the pooler
  and bypasses RLS; the lockdown is a hard backstop so the public PostgREST endpoint can never
  expose client data even if a key leaks.
- `updated_at` is maintained by a trigger, not the application.

### Swapping databases

Implement `BookingRepository` (five methods) against anything else and point `bookings` at it.
Nothing outside `src/lib/store/` needs to change.

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
