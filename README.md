# APEX — Private AI Intelligence Ecosystem

APEX is a private AI intelligence operating system for elite operators, founders, and capital-backed luxury ecosystems.

## Getting Started

### 1. Environment Variables Setup
Create a `.env.local` file by copying the template:
```bash
cp .env.example .env.local
```
Fill in the credentials:
- **Supabase**: URL, Anon Key, and Service Role Key (from Supabase dashboard API settings)
- **OpenRouter**: API key (from https://openrouter.ai/keys)
- **Upstash Redis**: URL and token (optional — for live event bus telemetry)

### 2. Database Migrations & Seeding
APEX uses Supabase with PostgreSQL. To set up your schema and seed default data:

#### Local Development
1. Ensure your local Supabase CLI is ready:
   ```bash
   npx supabase status
   ```
2. Reset the database to run all migrations and apply `supabase/seed.sql`:
   ```bash
   npx supabase db reset
   ```

#### Remote/Staging Database
1. Link your Supabase CLI to your remote project (reference: `gbppwmmutbisimxavgfw`):
   ```bash
   npx supabase link --project-ref gbppwmmutbisimxavgfw
   ```
   *(You will be prompted for your database password).*
2. Push all migrations:
   ```bash
   npx supabase db push
   ```
3. Run the seed data SQL commands from `supabase/seed.sql` inside the Supabase dashboard's **SQL Editor** to populate your tables with initial organizations, workspaces, and live recommendations.

### 3. Run the Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment on Vercel

Ensure the following environment variables are added to your project settings in the Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_APEX_ORGANIZATION_ID`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

*Note: In production (Vercel), `APEX_DEV_BYPASS` is forced to `false` to guarantee multi-tenant security and profile isolation.*

