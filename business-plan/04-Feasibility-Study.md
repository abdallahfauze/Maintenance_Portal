# 4. Feasibility Study

A feasibility study answers one question from four angles: **"Can this actually be done, realistically?"** Below, each angle is scored plainly (Green = clear path, Yellow = doable but needs specific action, Red = a real obstacle to solve before proceeding).

## 4.1 Technical feasibility — 🟢 Green, with a build-vs-buy decision to make

Building a two-sided marketplace app (customer app + contractor/technician app + admin dashboard) is a well-understood problem — this is not novel technology. The core components:

| Component | Purpose | Build complexity |
|---|---|---|
| Customer app (iOS + Android) | Browse services, book, track job, pay, rate | Medium — standard booking-app UX patterns |
| Technician/contractor app or portal | Receive job, accept/decline, update status, get paid | Medium |
| Admin/ops dashboard | Dispatch oversight, contractor management, disputes, reporting | Medium |
| Payment integration | Collect from customer, hold in escrow-like flow, pay out contractor | Requires a licensed KSA payment gateway partner (see §4.3) — do not build this yourself |
| Backend/cloud infrastructure | Everything else runs on this | Standard cloud hosting (AWS/Azure/local KSA data-center options — see PDPL note in §4.3) |

**Build options, ranked by our recommendation**:
1. **No-code/low-code MVP first** (e.g., a simple booking website + WhatsApp Business + a small manual dispatch team) — fastest, cheapest, validates demand before big spend. Strongly recommended as Phase 0 (see [Recommendations & Roadmap](09-Roadmap-and-Recommendations.md)).
2. **Outsourced development agency** for the full app — faster than hiring an in-house team from scratch, but requires careful vendor selection and a clear spec (this plan, plus a proper Product Requirements Document, is exactly what you'd hand them).
3. **In-house dev team** — most control, but slowest and most expensive to stand up; only worth it once you have proven demand and are scaling past Phase 1.

This plan **cannot write your app's code or select your specific developer** — that is a software engineering engagement. What it *can* do is hand a development partner a clear brief (this document set) so they can scope and quote accurately.

## 4.2 Operational feasibility — 🟡 Yellow — doable, but this is where most of these businesses actually fail

The technology is the easy part. The hard part is **operations**: recruiting good contractors, keeping quality consistent, and handling the inevitable disputes (a technician doesn't show up, does a bad job, damages something, or a customer refuses to pay).

Key operational functions you must staff or build a process for before launch:

- **Contractor recruitment & vetting** — a real, in-person or video-verified process to check each partner company's licenses, insurance, and a sample of their technicians' work history/references. (See [Partnership Framework](07-Partnership-Framework.md).)
- **Dispatch** — matching an incoming job to the right available contractor by trade, location, and current load. At launch, this can be a person on a laptop with a simple dashboard; it does not need to be a complex algorithm on day one.
- **Quality control** — mystery-shopping your own contractors periodically, monitoring ratings, and having a clear "three strikes" policy for underperformers.
- **Dispute resolution & guarantees** — a documented, fast process for "the technician broke something" or "the job wasn't done properly," including who pays (this is where insurance and contractor deposits/holdbacks matter — detailed in [SLA Templates](08-SLA-Templates.md)).
- **Customer support** — Arabic + English phone/chat coverage during working hours at minimum, ideally extending toward the emergency-repair hours customers actually need (a burst pipe at 9pm is a real scenario).

**Verdict**: feasible, but budget real headcount for this from day one (see [Financial Plan](06-Financial-Plan.md) staffing plan) — do not assume the app runs itself.

## 4.3 Legal & regulatory feasibility — 🟡 Yellow — feasible, but several items must be confirmed by a licensed Saudi lawyer before launch

This is the section where "the plan can tell you what to check, but cannot check it for you" applies most strongly. Here is the landscape as researched, with what needs professional confirmation clearly flagged:

| Requirement | What we found | Action needed |
|---|---|---|
| **Commercial Registration (CR)** | Any company operating in Saudi Arabia needs a CR from the Ministry of Commerce, with an activity code matching what you actually do (likely an e-commerce/marketplace/services-intermediary classification, not a "contracting" classification). | **Must be filed by, or with, a Saudi corporate lawyer or licensed business-setup consultancy.** Get written confirmation of the correct activity code for a "marketplace connecting customers to third-party maintenance contractors" — this determines a lot of what follows. |
| **Maroof e-commerce verification** | A Ministry of Commerce platform verifying your business is real and licensed; increasingly required by payment gateways and builds customer trust. | Register once your CR is issued — a straightforward step your ops/admin lead can typically handle without a lawyer. |
| **Do we need our own contracting/trade license (SCA, municipal)?** | Saudi Contractors Authority (SCA) licenses and Balady (municipal) trade licenses apply to companies that *perform* electrical/plumbing/HVAC/construction work. Since our model never has our own staff touching a customer's wiring or pipes — **we are the booking platform, the contractor is the licensed tradesperson** — the plain reading is that we do not need our own SCA/trade license. | **This must be confirmed in writing by a Saudi corporate lawyer before you rely on it.** This single point is the most important legal question in this entire plan — get it answered first, since it affects your CR activity code, your contracts, and your risk exposure. |
| **Contractor partner licensing** | Every partner contractor company must independently hold its own valid Balady municipal license, and where applicable, Civil Defense approval and an SCA classification for its trade and scale. | Build license verification into onboarding (see [Partnership Framework](07-Partnership-Framework.md)) — check the Balady platform / Wathq business-verification portal for each partner before signing them, and re-verify annually. |
| **Payment processing** | Saudi Arabia requires a SAMA (Saudi Central Bank)–licensed/regulated payment service provider for collecting and disbursing funds; you cannot legally run your own unlicensed payment rails. Established local gateways include names such as Moyasar, PayTabs, HyperPay, and Tap Payments. | Engage a licensed KSA payment gateway directly — this is a standard integration, not a custom legal negotiation, but confirm current SAMA-licensed status of whichever provider you choose. |
| **VAT (Value Added Tax)** | Standard VAT rate is 15%, administered by ZATCA (Zakat, Tax and Customs Authority). Mandatory registration once taxable turnover exceeds SAR 375,000/year; voluntary registration available above SAR 187,500/year (useful pre-revenue, to reclaim input VAT on setup costs). | Register with ZATCA at the appropriate threshold; use a licensed accountant for e-invoicing compliance (ZATCA mandates structured e-invoicing) from day one. |
| **Zakat / Corporate tax** | Saudi/GCC-national shareholders' share of profit is subject to Zakat (2.5% of the Zakat base); non-Saudi/non-GCC shareholders' share is subject to 20% corporate income tax. Relevant if you take on a foreign investor or co-founder. | Confirm your specific ownership structure's tax treatment with an accountant before finalizing your cap table. |
| **Foreign ownership (if any founder/investor is non-Saudi)** | Saudi Arabia generally requires a MISA (Ministry of Investment) foreign investment license for non-Saudi-owned or part-owned companies; 100% foreign ownership is permitted in most services sectors under current investment law. | If any owner is not a Saudi/GCC national, confirm MISA licensing requirements and timeline with a corporate lawyer as an early, parallel-track item — this can take several weeks and should not be a launch-week surprise. |
| **Labor law / Saudization (Nitaqat)** | Any staff you directly employ (ops, support, marketing — not contractor technicians, since they're employed by the partner companies) count toward your company's Nitaqat Saudization quota, which affects visa issuance for any non-Saudi hires. | Plan your Phase 1 hiring mix (see [Financial Plan](06-Financial-Plan.md)) with Nitaqat in mind from day one; a licensed HR/legal consultant can model your specific quota band. |
| **Data protection (PDPL)** | Saudi Arabia's Personal Data Protection Law (administered by SDAIA) governs how you collect, store, and process customer personal data (names, addresses, phone numbers, home-access details) — a materially important compliance area given how sensitive "which homes are empty/occupied when" data is. | Build PDPL-compliant data handling into the app from the design stage (this is a software/legal co-design task) — retrofitting privacy compliance later is far more expensive. |

## 4.4 Financial feasibility — 🟢 Green, provided funding is secured before committing to full app development

The unit economics work on paper (commission + booking fee per job, low marginal cost per additional job once the platform exists) — see [Financial Plan](06-Financial-Plan.md) for the full model. The real financial risk is **not** "can this be profitable eventually" — comparable marketplaces in this category clearly are — it's **"do we have enough runway to survive the slow ramp-up before density (enough contractors and enough customers in the same city) kicks in."** This is why the Financial Plan models a conservative multi-month ramp and why the Recommendations document pushes hard for a lean, staged spend rather than committing the full budget to app development on day one.

## 4.5 Overall feasibility verdict

**Feasible, with three specific pre-launch gates**, all detailed further in [Recommendations & Roadmap](09-Roadmap-and-Recommendations.md):

1. Written legal confirmation of your licensing position (do you need your own trade license — almost certainly no, but get it in writing).
2. Secured funding for at least a Phase 0 lean launch (see [Financial Plan](06-Financial-Plan.md)).
3. Signed agreements with at least 3–5 contractor partners per trade, per city, before public launch — an app with no reliable supply side fails immediately on its first bad reviews.

---

### Sources consulted
[SCA Licensing Guide for Contractors – Lexology](https://www.lexology.com/library/detail.aspx?g=c472dbf2-0647-4c57-9010-3ce5bf805b09), [Civil Defense License Guide 2025](https://jkmanagement.ae/civil-defense-license-in-saudi-arabia-a-complete-guide-for-2025/), [Maroof Business Verification Guide 2026](https://incorpmena.com/saudi-maroof), [VAT Rate Saudi Arabia 2026 – Vision2030.ai](https://vision2030.ai/encyclopedia/vat-rate-saudi-arabia/), [Saudi Arabia Tax Guide 2026 – House of Saud](https://houseofsaud.com/business/tax-guide/), [Motaded – Saudi Freelance Regulations Guide 2026](https://motaded.com.sa/blog/saudi-freelance-regulations-guide)
