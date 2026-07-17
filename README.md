# Afterglow

AI relationship-cultivation app — capture a conversation, get AI-suggested
follow-ups, push a pre-filled message to WhatsApp/SMS/Email/LinkedIn, then
track the relationship over time (Cultivate) with growth stages and an
Impact dashboard.

Frontend-only (React + Vite + Tailwind), backed by Supabase for auth and
per-user data. Currently deployed on Netlify.

## Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react (icons — note: this project's version doesn't ship brand
  icons, so `Linkedin` is aliased from `Link2`. Cosmetic only.)
- Supabase (`@supabase/supabase-js`) — email/password auth + Postgres

## Local setup

```
npm install
cp .env.example .env   # then fill in your own Supabase project's values
npm run dev
```

## Supabase setup (if standing up a fresh project)

1. Create a project at supabase.com
2. SQL Editor → New query → paste `schema.sql` → Run
   (creates the `contacts` table with row-level security so each user only
   ever sees their own rows)
3. Project Settings → API → copy the Project URL and anon public key into
   `.env` (local) or Netlify's env vars (production)

## Deploying (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Env vars (Site settings → Environment variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  (These get baked in at build time, so they must be set *before* Netlify
  builds — not something you can add after the fact without a rebuild.)

## How data works

- `contacts` table: one row per contact, per user. `timeline`, `todos`,
  and `contextNotes` are stored as jsonb arrays rather than normalized
  into their own tables — a deliberate simplification for this stage.
- On first login, a new user's account is seeded with example contacts
  (`buildSeedContacts()` in `App.jsx`) so there's something to explore.
- Every mutation goes through the `setContacts()` wrapper in `App.jsx`,
  which updates local state immediately and persists changed rows to
  Supabase in the background.

## Known gaps / where to pick up next

- The Capture → Extract → Angles → Compose walkthrough (steps 1-4) is
  still a **scripted demo** — voice transcription, AI angle suggestions,
  and message drafting are hardcoded/pattern-matched, not real model
  calls. Wiring real AI (Claude API) would replace the functions:
  `suggestTodosFromMoment`, `suggestTodosFromProfile`,
  `contextualizeTodo`, and the canned transcript strings in the Capture
  step.
- Finishing the Compose flow doesn't yet create a new saved contact —
  it's illustrative of the mechanism, not yet wired to an insert.
- "Push to platform" uses `wa.me` / `sms:` / `mailto:` deep links — opens
  the user's own already-logged-in apps with the message pre-filled.
  No message is ever sent without the user tapping Send themselves, by
  design. Auto-send would require WhatsApp Business API / Twilio / a
  transactional email service — a materially bigger integration, and a
  deliberate choice was made not to build that yet.
- Calendar-based verification (for the "Bloom" stage) and email-reply
  detection (for "Budding") are not implemented — currently self-reported
  by the user, and labeled as such in the Impact dashboard.
