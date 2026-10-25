# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nexus AI Business OS** is a full-stack SaaS MVP for modern businesses. It's an AI-native business operating system that unifies CRM, ERP, social media management, marketing automation, and analytics in one workspace. The deliverable is a React + Vite + TypeScript SPA with a real Hono/tRPC backend, SQLite database (PostgreSQL/MySQL for production), and premium operational UX (think Linear/Attio grade).

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite 7 + Tailwind CSS + shadcn/ui + React Router
- Backend: Hono + tRPC + Drizzle ORM + better-sqlite3 (SQLite locally, PostgreSQL for production)
- Build/Dev: ESLint, Vitest, tsx, concurrently, Vite
- Additional: framer-motion, GSAP, recharts, React Hook Form, Zod, dnd-kit
- Integrations: Social media APIs (Meta, LinkedIn, Twitter, TikTok), Email (SendGrid, Mailgun), SMS (Twilio), Calendar (Google, Outlook)

## Essential Commands

### Frontend + Backend
```bash
npm run dev:full              # Start both frontend (Vite) and backend (tsx watch) concurrently
npm run dev                   # Frontend only (Vite dev server, HMR on port 5173)
npm run dev:api              # Backend only (Hono + tRPC, watch mode)
npm run dev:api:bypass        # Backend with NEXUS_ENABLE_DEV_AUTH_BYPASS=true for testing without auth
```

### Build & Production
```bash
npm run build                # TypeScript check + Vite build (output: dist/)
npm run preview              # Preview production build locally
```

### Database
```bash
npm run db:migrate           # Run Drizzle migrations against the database
npm run db:seed              # Seed demo data (contacts, companies, deals, products, etc.)
```

### Quality & Testing
```bash
npm run lint                 # ESLint on all files
npm run test                 # Vitest (run tests once, not watch)
```

## Architecture & File Structure

### Frontend (`/app/src`)
- **`App.tsx`** — Root React component, routing setup (React Router)
- **`components/`** — UI component tree
  - `ui/` — shadcn/ui components (button, card, dialog, table, etc.)
  - `app/` — App-specific high-level components: AppShell, Sidebar, CommandBar, KpiCard, DataTable, RecordDrawer, ChartSkin
  - `command/` — AI Command Center UI, answer blocks, approval queue
  - `crm/` — Contact timeline, matching panel, contact drawer
  - `deals/` — Deal Kanban, deal card, stage columns
  - `pages/` — Page-level components for each route (Dashboard, Inbox, Deals, Products, etc.)
  - `social/` — Social media integration components (post composer, calendar, analytics)
  - `erp/` — ERP components (inventory, accounting, HR, projects)
  - `marketing/` — Marketing automation (campaigns, funnels, email builder)
- **`hooks/`** — Custom React hooks
- **`types/`** — TypeScript type definitions and domain models
- **`sections/`** — Page sections
- **`main.tsx`** — Entry point for React
- **`index.css`** & **`App.css`** — Global and app-specific styles

### Backend (`/app/server`)
- **`index.ts`** — Hono app entry point, middleware, route mounting
- **`app.ts`** — Main Hono app instance (may combine with index.ts)
- **`db/`** — Database layer
  - `schema.ts` — Drizzle schema (organizations, users, contacts, companies, deals, products, tasks, messages, social_accounts, campaigns, automations, inventory, accounting, hr, projects, audit)
  - `migrate.ts` — Migration runner (Drizzle auto-migrations)
  - `seed.ts` — Seed script for demo data
  - `context.ts` — Database connection & context helpers
- **`auth/`** — Authentication
  - `service.ts` — Auth logic (login, token validation, session)
  - `crypto.ts` — Encryption/hashing utilities
  - `permissions.ts` — Permission checks
- **`routes/`** — tRPC routers organized by domain
  - `crm/` — Contacts, companies, deals, pipelines
  - `erp/` — Products, inventory, accounting, HR, projects
  - `social/` — Social accounts, posts, analytics, scheduling
  - `marketing/` — Campaigns, funnels, email/SMS, automations
  - `analytics/` — Reports, dashboards, AI insights
- **`integrations/`** — External API integrations
  - `meta/` — Facebook, Instagram, WhatsApp Business
  - `linkedin/` — LinkedIn API
  - `twitter/` — X/Twitter API
  - `tiktok/` — TikTok API
  - `email/` — SendGrid, Mailgun, SMTP
  - `sms/` — Twilio, Plivo
  - `calendar/` — Google Calendar, Outlook
  - `storage/` — S3, Google Drive, Dropbox
- **`*.test.ts`, `*.integration.test.ts`, `*.e2e.test.ts`** — Vitest test files

### Config Files
- **`vite.config.ts`** — Vite build config
- **`tsconfig.app.json`** — Frontend TypeScript config
- **`tsconfig.node.json`** — Node (build tools) TypeScript config
- **`eslint.config.js`** — ESLint rules
- **`tailwind.config.js`** — Tailwind theme (shadcn/ui theme)
- **`postcss.config.js`** — PostCSS (Tailwind processing)
- **`package.json`** — Scripts, dependencies, metadata

## Key Patterns & Conventions

### Frontend
1. **Routing** — React Router (routes: `/dashboard`, `/deals`, `/products`, `/inbox`, `/relationships`, `/command`, `/tasks`, `/reports`, `/automations`, `/admin`, `/documents`, `/social`, `/erp`, `/marketing`)
2. **Component structure** — Prefer functional components with hooks. Use shadcn/ui for base UI.
3. **Styling** — Tailwind CSS utility classes; no inline CSS. Use CVA (class-variance-authority) for component variants.
4. **Forms** — React Hook Form + Zod for validation. Example pattern: `useForm()` + `<input {...register(...)}` + `zod().parse(data)`
5. **Animations** — framer-motion for React transitions, GSAP for complex scroll/timeline animations
6. **Data fetching** — tRPC client calls (type-safe RPC to backend)
7. **State management** — React Context for app-wide state (org, user, theme); local state within components

### Backend
1. **API shape** — Hono HTTP handlers mounted on tRPC routers for end-to-end type safety
2. **Database access** — Drizzle ORM; define schema in `db/schema.ts`, query via Drizzle context
3. **Authentication** — Token-based (session/JWT); check `auth/service.ts` for token validation on protected routes
4. **Permission model** — Role-based (owner, manager, agent); check `auth/permissions.ts` before sensitive operations
5. **Error handling** — Throw HTTP errors (Hono will catch); use consistent error codes and messages
6. **Testing** — Vitest; test files colocate with source (e.g., `deals-store.test.ts` next to `deals-store.ts`)

### Domain/Feature Split
- **Contacts & Companies** — CRM surface, timeline, linked deals/properties
- **Deals & Pipeline** — Kanban board, stage history, buyer/seller matching
- **Properties & Inventory** — Grid/list, detail view, matched buyers
- **Buyer Requirements** — Buyer profile, weighted matching engine
- **Inbox** — WhatsApp/email thread list, message thread, AI draft replies
- **AI Command Center** — Natural-language search/suggestions, answer blocks, approval queue
- **Dashboard** — KPIs, charts, lead source attribution
- **Tasks & Viewings** — Simple CRUD, calendar/list views
- **Reports** — Pipeline forecast, SLA metrics, source attribution

### Currency & Locale
- **Currency**: Always format as **AED** with commas (e.g., "AED 3,250,000")
- **Timezone**: Asia/Dubai
- **Language**: English (UI), but support for AR, RU, HI, ZH in data/demo personas
- **Date format**: Consistent with locale (e.g., DD MMM YYYY for Dubai)

## UX Direction (from PRD)

**Premium, high-trust, operational, fast, and calm.** Avoid decorative complexity. Dense professional tool — think Linear/Attio/HubSpot grade SaaS UI, NOT flashy consumer.
- Desktop-first, responsive, min width 390px
- Calm neutral palette with one confident accent; high legibility; subtle elevation
- **Required patterns:**
  - Persistent global command bar (Cmd+K style AI command/search)
  - Configurable left sidebar navigation
  - Table, Kanban, calendar, and timeline views
  - Record side panel for fast editing
  - AI source + confidence indicators
  - Approval queue for pending AI actions
  - Visible sync/integration status
  - Empty states with guided setup

## Database Schema (Conceptual)

Key tables (managed by Drizzle in `db/schema.ts`):
- **contacts** — buyers, sellers, landlords; phone, email, type, lead_source, owner, budget_band, requirements
- **companies** — brokerage, developer, co-brokering partner
- **deals** — buyer_sales pipeline; contact, property, value, stage, owner, next_action
- **properties** — inventory; project, community, type, beds, baths, size, price, status, completion, agent
- **requirements** — buyer profile; min/max budget, communities, property types, beds, size, completion, timeline
- **matches** — computed buyer-property matches with score + reason
- **tasks** — to-do items; related record, assignee, due_date, priority
- **conversations** — unified message thread; type (whatsapp/email/internal)
- **messages** — individual message in a thread; sender, timestamp, body, attachments
- **viewings** — scheduled property tours; contact, property, time, status, outcome
- **audit** — activity log; entity_type, entity_id, user, action, timestamp

## Development Workflow

1. **Start**: Run `npm run dev:full` to boot frontend (Vite on `:5173`) and backend (Hono on `:3000`).
2. **Frontend changes**: Edit `/app/src/*` → Vite HMR reloads browser automatically.
3. **Backend changes**: Edit `/app/server/*` → tsx watch restarts; refresh browser to pick up new data/routes.
4. **Database schema changes**: Update `/app/server/db/schema.ts` → Run `npm run db:migrate` to apply.
5. **Add demo data**: Edit `/app/server/db/seed.ts` → Run `npm run db:seed` (or seed runs on first startup).
6. **Type safety**: Frontend types are synced from backend via tRPC inference. No manual DTO duplication needed.
7. **Build & test**: Run `npm run build` (must pass TypeScript + Vite) before committing. `npm run test` to run tests.

## Auth Context

The app uses **Kimi OAuth** (per plan.md). Auth flow:
1. Unauthenticated users land on `/login` (or redirected there)
2. Login triggers OAuth flow (backend `auth/service.ts`)
3. On success, backend issues session token (stored in httpOnly cookie or localStorage)
4. Frontend includes token in all tRPC calls (Hono middleware validates)
5. Org/user context available in AppShell; passed to pages via React Context or tRPC calls

For dev/testing: Use `npm run dev:api:bypass` to skip auth (sets env var `APEX_ENABLE_DEV_AUTH_BYPASS=true`).

## Common Tasks

### Adding a new page
1. Create a new component in `src/components/pages/MyPage.tsx`
2. Add route in `App.tsx` (React Router)
3. Add sidebar nav entry (update AppShell)
4. Create backend routes in `server/` if data needed
5. Hook up tRPC calls from frontend component

### Adding a new database table
1. Define schema in `server/db/schema.ts` (Drizzle table + relations)
2. Run `npm run db:migrate` (auto-creates SQL)
3. Add seed data in `server/db/seed.ts` (optional but recommended)
4. Create backend query/insert functions (in feature-specific store files)
5. Expose via tRPC router

### Adding a tRPC procedure
1. Define input schema (Zod) and output type
2. Implement handler in backend route file (e.g., `server/deals-store.ts`)
3. Mount on tRPC router
4. Call from frontend: `const result = await trpc.deals.getById.query({ id: '...' })`

### Styling a component
1. Use Tailwind utility classes (e.g., `<div className="p-4 bg-white rounded-lg shadow">`)
2. For variants, use CVA: `const buttonStyles = cva(baseClasses, { variants: {...} })`
3. Import shadcn/ui component if needed: `import { Button } from '@/components/ui/button'`
4. Add hover/focus/active states via Tailwind modifiers: `hover:`, `focus:`, etc.

## Debugging Tips

- **Frontend**: Open browser DevTools (F12). Check Network tab for tRPC calls, Console for errors.
- **Backend**: Check server terminal (from `npm run dev:api`). Add `console.log()` in handlers; look for 500s or auth errors.
- **Database**: Check `/app/server/db/schema.ts` for table structure. Use `better-sqlite3` CLI or simple SELECT queries in backend handlers.
- **Type errors**: Run `npm run lint` and `tsc -b` (no-emit TypeScript check). Types cascade from backend schema → Drizzle → tRPC → frontend.

## Testing

- Write tests alongside source (e.g., `foo.test.ts` next to `foo.ts`)
- Use Vitest (not Jest). Import `{ describe, it, expect }` from vitest
- Run tests: `npm run test` (or `npm run test -- --watch` for watch mode, if available)
- Example pattern:
  ```typescript
  import { describe, it, expect } from 'vitest'
  describe('MyFeature', () => {
    it('should do X', () => {
      expect(result).toEqual(expected)
    })
  })
  ```

## Deployment

The MVP is delivered via `website_version_manager build_version`. The built app (in `dist/`) is either:
- **Dynamic** (if server-backed, which this is) — deployed with server running (e.g., Vercel, Fly.io with Node support)
- **Static fallback** (SPA) — if needed, frontend can run standalone (though full features need backend)

Build checklist before deploy:
1. `npm run build` passes (no TS errors, no build errors)
2. All routes render (check each major page)
3. No console-blocking errors
4. Auth flow works (login → dashboard)
5. Database seeded (demo contacts, properties, deals visible)
