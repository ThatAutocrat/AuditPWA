# Audit

> The gap between who you think you are — and who you actually are.

A brutally honest daily productivity + micro-journal PWA. No streaks, no gamification. Just plan vs. actual, a reflection, and a mood. After 30 days, your portrait.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth + DB | Supabase |
| Styling | CSS Modules (brutalist dark) |
| PWA | next-pwa |
| Hosting | Vercel |

## Features (Month 1)

- [x] Auth (email + password via Supabase)
- [x] Daily log: plan, actual, reflection, mood
- [x] Dashboard with streak + recent logs
- [x] 30-day portrait: heatmap, mood breakdown, word patterns, honest summary
- [x] PWA — installable, offline-ready, push notification at 9pm
- [x] RLS — users only see their own data

## Roadmap

- [ ] Push notifications (9pm daily nudge)
- [ ] Accountability partner (share logs with one person)
- [ ] Weekly email summary
- [ ] Better NLP for pattern detection in reflections

## Setup

```bash
# 1. Clone
git clone https://github.com/ThatAutocrat/audit
cd audit

# 2. Install
npm install

# 3. Supabase
# Create project at supabase.com
# Run lib/supabase/schema.sql in the SQL editor

# 4. Env
cp .env.example .env.local
# Fill in your Supabase credentials

# 5. Run
npm run dev
```

App runs at `http://localhost:3000`

## Deploy

- **Vercel** — connect repo, add env vars, done.
- Supabase handles auth + DB.

---

*Built different. Probably overengineered. Definitely not using a template.*
