# APEX Revenue OS — Product Brief for Design (distilled from PRD v1.0)

## What is being built
A full-stack **web application MVP** (SaaS product UI, not just a marketing site) called **APEX Revenue OS** —
an AI-native revenue operating system for **Dubai real estate teams**. It is NOT a generic CRM. It unifies:
leads, WhatsApp/email conversations, deals, properties, buyer requirements, property matching, viewings,
tasks, documents, and AI recommendations in one workspace that "updates itself and recommends the next best action."

The deliverable is a React + Vite + Tailwind + shadcn/ui SPA with a real backend (tRPC + Drizzle + MySQL, Kimi OAuth login).
It needs BOTH: (a) a concise premium **landing page** (marketing entry → "Sign in"), and (b) the **full product app**
behind login.

## UX design direction (from PRD — must follow)
"Premium, high-trust, operational, fast, and calm. Avoid decorative complexity that slows daily work."
- Desktop-first, responsive, minimum width 390px.
- This is a dense professional tool: think Linear / Attio / HubSpot-grade SaaS UI, NOT a flashy consumer site.
- Calm neutral palette with one confident accent; high legibility; subtle elevation; no blue-purple gradients.
- Core patterns REQUIRED by PRD:
  - Persistent global **command bar** (Cmd+K style AI command/search)
  - Configurable **left sidebar navigation**
  - Table, Kanban, calendar, and timeline views
  - Record side panel for fast editing
  - Clear AI source + confidence indicators
  - Approval queue for pending AI actions
  - Visible sync/integration status
  - Empty states with guided setup
- Currency: **AED** formatting everywhere (e.g. AED 3,250,000). Timezone Asia/Dubai.

## Information architecture (PRD global navigation — exact labels/routes)
- Command `/command` — AI command center & natural-language search
- Dashboard `/dashboard`
- Inbox `/inbox` — unified WhatsApp + email + internal notes
- Relationships `/relationships` — contacts & companies
- Deal Flow `/deals` — pipelines, Kanban
- Properties `/properties` — inventory
- Viewings `/viewings`
- Tasks `/tasks`
- Documents `/documents`
- Reports `/reports`
- Automations `/automations`
- Administration `/admin`
- Record pages: contact detail, deal detail, property detail
- Login `/login` (owned by backend auth — exclude from design scope; simple)

## Key product surfaces to design (app pages)
1. **Landing page** — short, premium: hero (product promise), product screenshot/visual, 3-4 value props,
   social proof strip (Dubai brokerages), CTA "Sign in". Reference tone: "The revenue OS for Dubai real estate."
2. **Dashboard** — owner/manager KPIs: pipeline value (AED), new leads, median first-response time,
   overdue follow-ups, viewings this week, weighted forecast chart, deals by stage, lead-source attribution,
   AI approval queue summary, team leaderboard.
3. **Deal Flow (Kanban)** — buyer_sales pipeline with EXACT PRD stages:
   New Inquiry → Qualified → Requirements Confirmed → Properties Shortlisted → Viewing Scheduled →
   Viewing Completed → Offer Made → Negotiation → MOU Signed → SPA Executed → Payment in Progress →
   Handover → Won / Lost. Card shows: contact, property/project, value AED, owner avatar, days-in-stage,
   next action. Deal detail drawer: timeline, stage history, associated contact/property/viewings/offers/documents.
4. **Relationships (Contacts & Companies)** — filterable table: name, type (buyer/seller/landlord/investor/tenant),
   phone (+971...), email, nationality, preferred language, lead source, owner, budget band, last contact,
   status. Contact detail: unified timeline (WhatsApp messages, emails, notes, tasks, viewings, offers),
   buyer requirements panel, AI summary with confidence + sources.
5. **Properties** — inventory grid/table with photos: project, developer, community, building/unit, type,
   beds/baths, size sqft, price AED, status (available/under offer/sold), completion (ready/off-plan),
   listing agent. Property detail: gallery, facts, price history, matched buyers.
6. **Buyer Requirements + Matching** — requirement panel (budget min/max, communities, property types, beds,
   size, completion, purpose, financing, timeline, must-haves) + ranked match list with score bars and
   "why this matched" explanations. PRD default weights: budget 0.30, location 0.20, type 0.15, beds 0.10,
   size 0.10, timeline 0.05, features 0.10.
7. **Inbox** — 3-pane: conversation list (WhatsApp/email icons, unread, SLA timer), message thread
   (WhatsApp-style bubbles), context panel (contact, linked deal, AI draft reply with approve/edit/reject,
   confidence + source citations). Some threads flagged "AI draft pending approval".
8. **AI Command Center** — full-page natural-language interface: suggested prompts, conversational answers
   with embedded record tables/charts, sources cited, action proposals with Approve/Reject buttons.
   Example commands from PRD: "Show all buyers with budgets above AED 5M not contacted in 3 days",
   "Which deals are at risk this month and why?", "Find three available 2BR in Downtown Dubai under AED 3M."
9. **Viewings** — calendar/week view + list: property, contact, advisor, time, status, outcome capture
   (interest score, feedback, next step).
10. **Tasks** — list/board with priorities, due dates, related records, overdue escalation badges.
11. **Reports** — pipeline forecast, lead response SLA, viewing performance, source attribution,
    commission overview stub — charts + tables, date/team/source filters.
12. **Documents, Automations, Admin** — clean functional stubs: document list by type (passport, Emirates ID,
    MOU, SPA, Form A/B/F...), automation template cards (trigger → action), admin (team members, roles,
    integration status cards for WhatsApp Business / Gmail / Outlook / Calendars with "Connected" health).

## AI governance flavor (visible in UI)
AI operates at "draft" autonomy: every AI output shows confidence %, source chips, and requires
human approval for external sends. Show this in Inbox drafts, Command answers, extraction panels.

## Dubai real estate domain data (use for realistic content/seed)
- Communities: Downtown Dubai, Dubai Marina, Palm Jumeirah, Jumeirah Village Circle (JVC), Business Bay,
  Dubai Hills Estate, Arabian Ranches, DIFC, Bluewaters Island, Emaar Beachfront, Sobha Hartland,
  Mohammed Bin Rashid City (MBR City), Damac Hills, JLT, Al Barsha, Deira.
- Developers: Emaar, DAMAC, Sobha, Nakheel, Meraas, Binghatti, Ellington, Azizi, Danube, Omniyat.
- Projects: Burj Khalifa, Address Residences, Marina Gate, Atlantis The Royal Residences, Sobha Hartland Waves,
  Emaar Beachfront Beach Isle, DAMAC Lagoons, Binghatti Heights, Ellington House, Palm Jumeirah Signature Villas.
- Property types: Apartment, Villa, Townhouse, Penthouse, Duplex, Plot. Statuses: Ready / Off-plan.
- Prices: studios ~AED 650K-1.1M; 1BR 900K-2.2M; 2BR 1.4M-3.8M; 3BR 2.5M-7M; villas AED 4M-35M+;
  penthouses AED 8M-60M. Rents: 1BR AED 60K-140K/yr, 2BR 90K-220K/yr.
- Buyer personas: Indian/British/Russian/Chinese/European investors, GCC end-users; languages EN/AR/RU/HI/ZH.
- Lead sources: Property Finder, Bayut, Dubizzle, website form, WhatsApp, referral, walk-in.
- Names for demo contacts: mix of Arabic, Indian, European, Russian, Chinese names. Agents: Dubai brokerage team.
- Doc types: passport, Emirates ID, proof of funds, mortgage pre-approval, Form A, Form B, Form F, MOU, SPA,
  NOC, title deed, tenancy contract.
- KPIs to make believable: median first-response ~ 8 min (target -40%), WAU > 70%, pipeline AED 40-80M,
  monthly closed AED 6-12M, commission 2% typical.

## Success metrics flavor (dashboards)
North star: "Qualified opportunities actively progressed per advisor per month." Quality bars:
message sync success > 99%, AI extraction precision > 90%, response SLA timers visible.
