# 2. Business Model

## 2.1 The simplest possible explanation

Think of Maintenance Portal as the "Careem/Uber for home repairs," except instead of independent drivers, our "drivers" are **technicians employed by partner maintenance companies** who already work in these cities. We are the matchmaker, the booking system, the payment processor, and the quality/complaints referee. The partner company is the employer, the licensed trade business, and the one who owns the tools, the van, and the technician's payroll.

This matters a lot, because it defines almost everything else in this document:

- We are **asset-light**: no technicians on our payroll (at least not in Phase 1), no vans, no tool inventory, no spare-parts warehouse.
- Our core product is **trust and convenience**: a customer trusts that whoever shows up is vetted, priced fairly, on time, and insured/guaranteed — that trust is the entire value we're selling.
- Our core operational job is **partner management**: recruiting good contractors, training them on our standards, monitoring their performance, and being willing to drop the bad ones.

## 2.2 Business Model Canvas

| Block | Details |
|---|---|
| **Customer Segments** | Phase 1: residential homeowners and tenants (villas, apartments) in Jeddah, Riyadh, Dammam. Phase 2: same, extended to Madinah, Taif, Khobar, Jubail. Phase 3 (future): corporate/facility clients (small offices, retail units, compounds) — see §2.6. |
| **Value Propositions** | *For customers*: one app for electrical/plumbing/HVAC/paint-and-tile, upfront pricing, vetted technicians, tracked jobs, guarantee/refund policy, Arabic + English support. *For contractor partners*: a steady stream of new customers without spending on their own marketing/app, faster payment collection (we collect from the customer, pay them out), and job-scheduling software they don't have to build themselves. |
| **Channels** | Mobile app (iOS + Android) as primary; a simple website and WhatsApp Business as secondary/backup booking channels (especially useful pre-app and for less tech-comfortable or older customers); social media (Instagram/Snapchat/TikTok are heavily used in KSA) and Google/Apple app store presence for acquisition. |
| **Customer Relationships** | Self-service booking with human-backed customer support (chat + phone), automated job status updates (SMS/push), post-job rating, loyalty via maintenance subscription plans. |
| **Revenue Streams** | (1) Commission per completed job, (2) fixed customer booking/dispatch fee, (3) recurring maintenance subscription plans, (4) — later — featured-placement/lead fees for contractors wanting priority. Full detail in §2.4. |
| **Key Resources** | The app/platform itself (the core IP), the contractor partner network, the brand and customer trust, the operations/dispatch team, cash for working capital (paying contractors promptly even if customer payment settlement lags). |
| **Key Activities** | Contractor recruitment & vetting, technology development & maintenance, marketing & customer acquisition, dispatch/operations, quality control & dispute resolution, finance/collections. |
| **Key Partnerships** | Maintenance contractor companies (the core partnership — see [Partnership Framework](07-Partnership-Framework.md)), a SAMA-licensed payment gateway (e.g., a provider such as Moyasar, PayTabs, HyperPay, or Tap — confirm current options with a licensed payment consultant), an app development partner/vendor, insurance broker (liability cover), and government SME support programs (Monsha'at, Kafalah). |
| **Cost Structure** | Technology build & hosting, salaries (ops, support, marketing, management), marketing/customer acquisition spend, payment gateway fees, insurance, office/admin overhead, contractor payouts (a pass-through, not a "cost" in the P&L sense — see [Financial Plan](06-Financial-Plan.md)). |

## 2.3 Who does what — the division of labor

| Responsibility | Us (Maintenance Portal) | Contractor Partner |
|---|---|---|
| Owns the customer relationship & app | Yes | No |
| Employs the technician | No | Yes |
| Holds the trade/municipal license to do electrical, plumbing, HVAC work | No — not required if we never perform the work ourselves (**confirm with lawyer**, see [Feasibility Study](04-Feasibility-Study.md)) | Yes — mandatory |
| Vets technician competence & background | Sets the bar & spot-checks | Does the hiring & day-to-day supervision |
| Sets/approves pricing shown to customer | Sets standard price bands per job type | Bids into or accepts our price bands |
| Collects payment from customer | Yes (via app) | No — paid out by us |
| Provides tools, van, spare parts | No | Yes |
| Handles warranty/comeback visits | Enforces the policy | Performs the work |
| Carries liability insurance for the work performed | Requires proof of it | Yes — must hold it |
| Handles first-line customer support & dispatch | Yes | Receives jobs, updates status |

## 2.4 Revenue streams, explained simply

1. **Commission on completed jobs** — the main engine. When a contractor completes a SAR 300 plumbing job through the app, we keep a percentage (industry-typical range for on-demand service marketplaces is **15%–25%**; recommended starting point **18%**, adjustable per trade and job size — see [Financial Plan](06-Financial-Plan.md) §pricing for the full logic). We have not found public commission figures for KSA competitors (MAHA, HomeXA, etc. don't publish them), so this should be validated against real contractor conversations during onboarding — contractors will tell you what they consider fair very quickly.
2. **Booking/dispatch fee** — a small flat fee (suggested **SAR 15–25**) charged to the customer at the point of booking, covering the cost of a technician being dispatched at all (this also discourages no-shows/frivolous bookings, a common problem in this industry).
3. **Maintenance subscription plans** ("Portal Care") — an annual or semi-annual plan (e.g., 2 AC services/year + priority booking + a discount on parts) sold directly to homeowners. This is the highest-margin, most predictable revenue line once trust is established, and it is standard in this industry (AC preventive-maintenance contracts are already common practice among facility and villa owners in KSA).
4. **Contractor value-added services** (Phase 2+) — optional paid placement/lead-boost for contractors who want more job volume, once you have enough customer demand that this creates real value for contractors rather than just being an extra cost you're asking them to swallow.

## 2.5 Why "partner" beats "hire" for a first-mover in this market

| | Partner Model (recommended) | Employ-Your-Own-Technicians Model |
|---|---|---|
| Time to launch | Months | 1–2 years (recruiting, training, licensing, fleet, tools) |
| Upfront capital | Lower (tech + ops team only) | Much higher (payroll, vans, tool inventory, spare parts stock) |
| Licensing burden | Lower — contractors carry their own trade licenses | You must hold SCA/municipal trade licenses yourself |
| Quality control | Harder — you don't directly manage the technician | Easier — direct control |
| Scalability across new cities | Fast — sign a local contractor already there | Slow — must build presence city by city |
| Margin per job | Lower (you only take a commission) | Higher (you keep the full job value) — *if* you can run it efficiently |

**Recommendation**: start partner-only. Once you have volume and data (which contractors are reliable, which job types are highest-margin, which cities are strongest), you can selectively bring specific high-volume, high-margin service lines in-house later (a common playbook: many marketplaces gradually vertically integrate their best-performing categories once proven).

## 2.6 Residential now, corporate later — why the sequencing makes sense

Corporate/facility clients (offices, retail, small compounds) want the same core service but with different needs: consolidated monthly invoicing, multi-site contracts, faster SLAs, and often a dedicated account manager. Going after them from day one would split your limited launch budget and dilute focus. The recommended path:

1. **Phase 1**: prove the model on residential customers, where booking is simpler (single unit, one decision-maker, pay-per-job).
2. **Phase 2**: once you have a reliable contractor network and operations playbook, corporate clients become an easier upsell — you already have the technicians and the trust; you're mainly adding a billing/contract layer (monthly invoicing instead of per-job payment) and a slightly more formal SLA (already largely covered in [SLA Templates](08-SLA-Templates.md), since B2B SLAs are a stricter version of the same document).
