# Tennis Drill — Biweekly Sessions

One-page site with shared registrations and waitlist using **Vercel KV**.

## Deploy (GitHub + Vercel)

1. Create a new GitHub repo (empty).
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```
3. On Vercel: New Project → Import Git Repository → pick this repo.
   - Framework Preset: **Other** (Static)
   - Build Command: *(empty)*
   - Output Directory: *(empty or `/`)*

4. In Vercel → Storage → **KV** → Create Database (Region: US). Vercel will inject env vars to your project automatically.

5. Redeploy once. Visit your `*.vercel.app` URL.
