# 5. Risk Analysis

Each risk below is rated **Likelihood** (Low/Medium/High) × **Impact** (Low/Medium/High), with a plain-English mitigation. Sorted roughly by overall severity.

## 5.1 Supply-side risks (contractors)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Not enough good contractors sign up** — the whole model fails if you can't get 3–5+ reliable partners per trade per city | Medium | High | Start recruiting contractors 2–3 months *before* public launch; over-recruit in Phase 1 (aim for more partners than you think you need, since some will underperform or churn); offer a genuinely attractive early-partner deal (lower commission for the first cohort, guaranteed minimum job flow if possible) |
| **A partner technician does poor or unsafe work, or damages property** | Medium | High | Mandatory liability insurance proof at onboarding (see [Partnership Framework](07-Partnership-Framework.md)); a customer-facing guarantee/refund policy funded partly by a contractor holdback/deposit; fast three-strikes removal policy |
| **A partner contractor "goes around" the app** — poaches the customer directly to avoid paying commission (a classic marketplace "disintermediation" risk) | High (this happens in every service marketplace) | Medium | Build recurring value contractors can't easily replicate themselves (steady lead flow, scheduling tools, payment collection); contract clauses with real but reasonable penalties (rarely enforceable in practice, but they set norms); focus energy on making the platform genuinely useful to contractors, not just policing them |
| **Contractor company itself is not properly licensed, or lets its license lapse** | Medium | High (legal exposure) | License verification at onboarding *and* an annual re-verification process, tied to Balady/Wathq platform checks (see [Feasibility Study](04-Feasibility-Study.md)) |

## 5.2 Demand-side risks (customers)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Customer acquisition cost (CAC) is higher than expected** — apps in this category often need real marketing spend to get initial traction | Medium-High | High | Start with a lean Phase 0 (landing page + social ads) to measure real CAC before committing to a large marketing budget (see [Recommendations](09-Roadmap-and-Recommendations.md)); lean on word-of-mouth/referral incentives, which are unusually effective in KSA's social/family-network-driven culture |
| **Trust barrier** — letting a stranger into your home is a bigger psychological hurdle than, say, ordering food delivery | Medium | Medium | Photo ID verification of technicians shown in-app before arrival, live tracking, a visible rating history, and marketing that leans hard on "vetted and insured," not just "fast" |
| **Low repeat usage** — a one-off repair app risks becoming a "use once and delete" app if there's no reason to come back | Medium | Medium | The subscription/maintenance-plan revenue stream (§2.4) exists specifically to counter this — push it actively after every first job |

## 5.3 Competitive risk

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **A well-funded competitor (e.g., Noon Home Services, or Muheel backed by Abdul Latif Jameel) out-spends and out-markets us** | High — these players already exist and are well-capitalized | High | Compete on focus and execution, not budget: be genuinely better on multi-trade breadth, SLA reliability, and city-specific contractor quality rather than trying to out-advertise a conglomerate; consider whether a specific under-served city or trade niche is a better initial beachhead than head-to-head competition in Riyadh from day one |
| **Price war** — competitors undercut commission/pricing to win contractor or customer share | Medium | Medium | Don't compete purely on being the cheapest — competing on reliability and being the contractor's steadiest source of consistent income builds more durable loyalty than a lower commission alone |

## 5.4 Financial risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Running out of cash before reaching break-even** (the single most common startup failure mode) | Medium-High | Very High | Stage spending in phases (Phase 0 lean validation → Phase 1 full launch) rather than committing the full budget upfront; keep 6 months of runway as a hard rule; explore Kafalah-guaranteed SME financing to reduce reliance on pure equity (see [Financial Plan](06-Financial-Plan.md)) |
| **Cash-flow mismatch** — you may need to pay contractors quickly to keep them happy, while customer payment/refund cycles and gateway settlement can lag | Medium | Medium | Negotiate reasonable payment gateway settlement terms upfront; keep a working-capital buffer specifically earmarked for contractor payouts, separate from operating cash |
| **Currency/inflation exposure on imported spare parts** (AC units, water heaters, fixtures often import-linked) | Low-Medium | Low-Medium | Since parts are typically sourced and priced by the contractor, not us, this mostly passes through — but factor it into how often your price bands need revisiting |

## 5.5 Regulatory & legal risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Misclassifying the business's licensing needs** (e.g., assuming no trade license is needed when one actually is, given some specific structure you choose) | Low-Medium | Very High | This is the #1 reason to get written legal confirmation before launch, not after (see [Feasibility Study](04-Feasibility-Study.md) §4.3) |
| **Data protection (PDPL) non-compliance** — mishandling customer home-address and access-schedule data | Low-Medium | High (fines + reputational damage in a trust-dependent business) | Build compliance in at the design stage with legal input, not as an afterthought |
| **VAT/e-invoicing non-compliance** as revenue crosses the mandatory threshold | Low | Medium | Register proactively (even voluntarily, pre-threshold, to reclaim input VAT) and use a licensed accountant for e-invoicing setup from day one |

## 5.6 Operational risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Seasonal demand spikes overwhelm contractor capacity** (everyone's AC breaks in the same July heatwave) | High (predictable) | Medium | Plan contractor recruitment capacity *ahead* of the summer season specifically; consider a "surge" pricing or priority-queue mechanic (used transparently, this is a well-understood pattern from ride-hailing apps) |
| **Key-person dependency** — if the founding team is small, losing one person (illness, cofounder dispute) can stall the business | Medium | Medium | Document processes as you build them (this plan is a start); avoid single-person dependency on both the technical and operational sides as early as headcount allows |

## 5.7 Summary: the three risks worth losing sleep over

1. **Supply-side density** — not having enough good, reliable contractors per city/trade at launch. This alone can sink the customer trust the entire business depends on.
2. **Cash runway** — underestimating how long it takes to reach density and break-even, and running out of money first.
3. **The licensing question** — proceeding on an assumption about trade-license requirements that turns out to be wrong. Get it in writing before you spend real money.

Everything else on this page is manageable with good process; these three deserve dedicated attention before and during launch.
