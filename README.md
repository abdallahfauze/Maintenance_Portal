# Maintenance Portal

A marketplace app connecting residential clients in Saudi Arabia with vetted
maintenance contractors (electrical, plumbing, HVAC, civil finishes),
starting in Jeddah. This repo holds both the business plan and the running
Stage 0 MVP.

- **[`business-plan/`](business-plan/00-README.md)** — the full business
  plan package: executive summary, business model, market research,
  feasibility study, risk analysis, financial plan, contractor partnership
  framework, SLA templates, and roadmap. Also available as a consolidated
  Word document at `business-plan/Maintenance-Portal-Business-Plan.docx`.
- **Everything else in this repo (the root)** — the Stage 0 MVP app itself,
  described below.

## The Stage 0 MVP

This is the **Stage 0 lean validation build** described in the business plan
(`business-plan/06-Financial-Plan.md` §6.1–6.2 and
`business-plan/09-Roadmap-and-Recommendations.md`): a simple customer
booking page plus an admin dispatch dashboard, built to prove real demand
and contractor reliability in Jeddah **before** committing the larger Stage 1
budget to a full native mobile app.

It intentionally does **not** include a native contractor mobile app, push
notifications, WhatsApp integration, or online payment — those are Stage 1
scope. This build's whole point is to let a small team run real bookings by
hand (customer books on the web → admin sees it appear → admin phones a
contractor and assigns them in the dashboard) and measure whether the model
holds up, at a fraction of the cost and time of the full app.

### What's here

- **`/`** — the public booking form. A customer cascades through the service
  catalog (Category → Sub-category → Item → Quality tier, e.g. Sanitary
  Fixtures → Mixers & Taps → Kitchen Sink Mixer Tap → Medium/Ideal Standard,
  300 SAR), sets a quantity (e.g. 5 taps, 2 water heaters), and adds it to
  their request. They can keep adding as many different services as they
  need — even across categories — before filling in their contact info,
  location, and one shared appointment slot once and submitting everything
  together. They're redirected to a request status page (`/request/[id]`)
  they can bookmark, showing every item's own price and status.
  - The catalog (6 categories, 24 sub-categories, 107 items, each with a
    Low/Medium/High brand + price, plus a market-researched technician labor
    fee per item — SR 100 floor for a quick swap up to SR 350-500 for a full
    split AC install) is seeded from `prisma/data/catalog.json`, generated
    from the client-supplied `Home_Maintenance_Fixtures_Master_KSA`
    spreadsheet — see `prisma/seed.ts`. The quoted price (part × quantity,
    all-inclusive) is re-derived server-side from the database at submission
    time, never trusted from the client. A flat SR 20 booking fee (per
    Financial Plan §pricing) is added once per request, not per item, since
    it exists to discourage no-shows on the visit itself.
  - Labor is batched per item via `laborBatchSize` (default 1): a technician
    can realistically swap several quick items — e.g. up to 5 light
    switches — in one visit, so labor is only charged
    `ceil(quantity / laborBatchSize)` times, not once per unit. Heavy
    installs (split/window AC, washing machines, toilets, DB boards) keep
    `laborBatchSize = 1`, since batching doesn't apply to real per-unit
    install time. See `computeQuote()` in `src/lib/catalog-shared.ts` — the
    one place this math lives, used by the live preview, the cart, and the
    server action alike.
  - Each service in a request becomes its own `Booking` row (own status,
    own contractor) so different trades in the same visit can be dispatched
    independently, but all rows share a `requestId` generated once per
    submission so the customer and admin both see them as one request.
- **`/admin`** — password-protected dispatch dashboard. Lists bookings
  grouped by request (shared customer/visit info shown once per group),
  filterable by status, with inline controls to assign a contractor per item
  (filtered to contractors in that item's category) and update its job status
  independently of the rest of the request. Assigning a contractor computes
  and snapshots the price split for that item — using that contractor's
  commission rate *at the moment of assignment* — showing the platform's
  commission and the contractor's payout per job and per request. Each job
  also tracks its own lifecycle: timestamps for assigned/started/completed/
  cancelled, an on-time/late badge (comparing when work actually started to
  the promised hourly slot, per the Contractor-facing SLA doc), free-text
  completion notes, and a delay/escalation flag with a reason — visible to
  admin, with a soft "may be running behind schedule" notice (no internal
  reason text) shown to the customer on their request page while it's open.
  Once a job is Completed, the customer can rate it 1-5 stars with an
  optional comment right on the request page — separate from the sitewide
  feedback widget, this is per-job quality feedback. Each contractor's
  average rating (from their completed jobs) shows on the Contractors page.
- **`/admin/contractors`** — contractor onboarding funnel per the Partnership
  Framework doc: add an applicant (company, contact person, category,
  license numbers), then move them through Applied → Under Review → Active
  (or Suspended/Rejected), ticking License/Insurance verified as admin
  confirms them (e.g. against Balady/Wathq). A contractor is only offered
  for job assignment once onboarding status is Active *and* the separate
  Active toggle is on — the toggle lets you temporarily pause an otherwise
  fully-onboarded partner (e.g. if they're overbooked) without re-running
  the whole funnel. Each partner also has a Bronze/Silver/Gold tier field
  for future priority routing, plus commercial terms: a commission rate
  (defaults to the Financial Plan's recommended 18%, adjustable 0-100% per
  partner) and an agreement-signed checkbox + date (the agreement itself is
  drafted/signed outside this tool, per the Partnership Framework doc — this
  just tracks status).
- **`/admin/feedback`** — review comments left via the floating "💬 Leave
  feedback" widget that appears on every page (public and admin). Anyone
  reviewing the site can leave a comment tied to the exact page it's about;
  it's saved straight to the database instead of needing to be relayed by
  email or chat. Mark items resolved as they're addressed.
- **`/admin/overview`** — operations KPIs at a glance: completion rate (of
  finished jobs), on-time/SLA rate (of started jobs), average customer
  rating, open escalations, platform revenue (commission + booking fees)
  vs. total contractor payouts, and a per-contractor leaderboard (jobs,
  completions, on-time %, rating) to inform future tiering decisions.
- **`/contractor`** — each contractor company gets its own portal login
  (phone number + a password admin generates for them from the Contractors
  page and shares by phone — no self-serve signup/reset, matching the
  admin auth's own simplicity). A contractor sees *only their own* jobs:
  their payout (never the platform's commission or other contractors'
  jobs), the customer's address/contact/schedule, and controls to push a
  job forward (Assigned → In Progress → Completed, or Cancelled) — they
  can't un-assign a job or send it back to Pending, that stays an admin
  dispatch call. They can add completion notes and report a delay, which
  shows up as an escalation on the admin Bookings page.
  - **`/contractor/technicians`** — each contractor manages their own field
    staff roster and assigns one to a job from their Jobs page, so the
    contractor's own dispatcher — not the platform — decides which of
    their technicians goes where.
  - A "N new" badge on the Jobs nav link shows how many jobs were assigned
    since the contractor's last visit, clearing once they open the Jobs
    page — a lightweight in-app notification for Stage 0. Real push
    notifications (SMS/WhatsApp Business API/email) need their own vendor
    account and are Stage 1 scope — see the roadmap in "Next steps" below.

### Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + TypeScript + React 19
- **Tailwind CSS v4** for styling
- **Prisma 7** + **PostgreSQL** (via the `@prisma/adapter-pg` driver adapter)
  for data — chosen over SQLite specifically so this runs correctly on
  serverless hosts like Vercel, which don't provide persistent local disk
- A minimal shared-secret cookie session for `/admin` (see **Security notes**
  below — this is intentionally basic for a Stage 0 pilot)

This stack was chosen because it's a single, coherent full-stack
TypeScript codebase that's easy to hand to a development agency later (per
the plan's recommendation to get 3+ competing quotes for the Stage 1 native
app) — the booking/contractor data model and business logic here can carry
over conceptually even if Stage 1 is built as a separate React Native +
Node.js app.

### Deploying (e.g. on Vercel)

The app lives at the repo root, so no custom "Root Directory" setting is
needed when importing this repo into Vercel — the default works.

The build script runs the database migration and an idempotent seed
automatically (`prisma migrate deploy && tsx prisma/seed.ts && next build`),
so a fresh deploy just needs three environment variables set before the
first build:

- `DATABASE_URL` (or `POSTGRES_URL`) — a Postgres connection string. If
  you add a Postgres database via Vercel's Storage tab and connect it to
  this project, Vercel sets this for you automatically.
- `ADMIN_PASSWORD` — the password for `/admin/login`.
- `ADMIN_SESSION_SECRET` — any long random string.

### Running it locally

Requires a Postgres database (local or hosted — Neon, Supabase, Vercel
Postgres, and Prisma Postgres free tiers all work).

```bash
npm install
cp .env.example .env        # then set DATABASE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
npx prisma migrate dev      # applies the schema
npm run db:seed             # adds 7 sample Jeddah contractors across all 4 trades
npm run dev                 # http://localhost:3000
```

Admin login is at `/admin/login`, using the `ADMIN_PASSWORD` from `.env`.

### Security notes — read before using this beyond your own laptop

This is a **Stage 0 pilot tool for a small internal team**, not a
production-hardened system. Specifically:

- Admin auth is a single shared password (`ADMIN_PASSWORD`), not per-person
  accounts — fine for 2–3 people manually dispatching jobs, not fine once you
  have a real ops team with different roles.
- Contractor portal auth is one password per company (hashed + salted in the
  database, unlike the admin password), generated by admin and shared by
  phone — no self-serve signup, forgot-password flow, or per-technician
  logins yet.
- There's no rate-limiting on the public booking form, the login page, or
  the feedback widget.
- No payment processing is implemented — per the business plan, that
  requires a SAMA-licensed payment gateway integration, which is explicitly
  Stage 1 scope requiring its own vendor relationship.

Before this handles real customer data at any real volume, get it reviewed —
this is exactly the kind of thing a security review or a development agency
should look at before Stage 1.

### Next steps (matching the business plan's roadmap)

1. Run this for real bookings in Jeddah for 6–8 weeks (see
   `business-plan/09-Roadmap-and-Recommendations.md` Stage 0 steps 4–7).
2. Add WhatsApp Business notifications so customers get status updates
   without needing to revisit the booking page.
3. Once demand is validated, use this repo's data model as a reference brief
   for the Stage 1 native app build (customer app + contractor app +
   admin dashboard, per `business-plan/04-Feasibility-Study.md` §4.1).
