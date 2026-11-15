# RAVAN — The Path to Mastery

A simple personal discipline tracker with a Supabase-ready foundation.

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (PostgreSQL) — optional, falls back to localStorage
- Server-side auth (HttpOnly session cookie)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (see `.env.example`):

   ```
   RAVAN_PASSWORD=RAVAN
   SESSION_SECRET=replace-with-a-long-random-string
   ```

   Supabase is optional. To enable it, also set:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. Run dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 and log in with password `RAVAN`.

## Supabase Setup

1. Open your existing Supabase project's SQL editor.
2. Run `supabase/migrations/0001_init.sql`.
3. Set the env vars above.
4. Restart the app. Activities will seed automatically on first load.

## Deployment (Vercel)

Set environment variables in the Vercel project settings. Do not expose the service role key to the browser.