# Deploy RepoMind.Ai

Code is on GitHub: https://github.com/Aryanrs006/RepoMind.Ai

## Step 1 — Backend on Render (free)

1. Open https://dashboard.render.com
2. Click **New +** → **Blueprint**
3. Connect GitHub → select **RepoMind.Ai**
4. Render will read `render.yaml` from repo root
5. When prompted, add secret:
   - **GEMINI_API_KEY** = your key from https://aistudio.google.com/apikey
6. Click **Apply** and wait ~5–10 min for build
7. Copy your backend URL, e.g. `https://repomind-api.onrender.com`

Test: open `https://YOUR-URL.onrender.com/` → should show `{"message":"RepoMind Running"}`

## Step 2 — Frontend on Vercel (free)

1. Open https://vercel.com/new
2. Import **RepoMind.Ai** from GitHub
3. Set **Root Directory** = `frontend`
4. Add Environment Variable:
   - **VITE_API_URL** = `https://repomind-api.onrender.com` (your Render URL)
5. Click **Deploy**

## Step 3 — CORS (optional, recommended)

On Render dashboard → **repomind-api** → **Environment**:

```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Replace with your actual Vercel URL.

## CLI deploy (alternative)

### Frontend
```bash
cd frontend
npx vercel login
npx vercel --prod
# Set VITE_API_URL in Vercel dashboard after first deploy
```

### Backend
Use Render dashboard (Docker + git is easiest). CLI needs `render` login.

## Notes

- Render free tier sleeps after 15 min idle — first request may take ~30s
- ChromaDB data persists on Render disk (`chroma_db` mount)
- Never commit `.env` — use platform env vars only
