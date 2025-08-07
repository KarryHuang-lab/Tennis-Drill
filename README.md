# Tennis Drill

Bi-weekly tennis drill sign-ups. 6 slots per session. Waitlist with auto-promotion.
Frontend: static `index.html`. Backend: Vercel Serverless Functions + Vercel KV.

## Deadline rule
Registration closes at **5:00 PM (America/Denver) on the day of the session**. After that, users can still **cancel**, but cannot register or move off the waitlist.

## Deploy (Vercel)
1. Import this repo in Vercel (Other / Static; build/output empty).
2. Marketplace → **Vercel KV** → Install → link this project (Production, US).
3. Project → **Settings → Environment Variables** should show `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
4. **Redeploy**.
5. Test: `https://<your-domain>.vercel.app/api/session?date=2025-08-07` returns JSON.
