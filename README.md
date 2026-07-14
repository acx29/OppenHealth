# OppenHealth

Redefining health tracking.

## v2 (this branch)

Monorepo rebuild: React frontend + NestJS backend, both talking to Supabase.

```
apps/
  api/   NestJS API — auth (signup/login/logout) with httpOnly JWT cookie
  web/   React + Vite — Login v2 design, stubbed dashboard
supabase/  SQL schemas (user_profiles, workouts)
```

### Run it (dev)

Requires a `.env` at the repo root with `SUPABASE_PROJECT_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

```bash
npm install        # once, from the repo root — installs both apps
npm run dev:api    # NestJS on http://localhost:3000
npm run dev:web    # Vite on http://localhost:5173 (proxies /api -> :3000)
```

Open http://localhost:5173 and sign in.

## v1 history

- v1: sign up + log out with JWT token through cookies; Vercel deploy at http://oppenhealth.vercel.app
- v1.2: dashboard with workouts + stats heatmap (vanilla JS — see `main` branch)
