# RepoMind.Ai

AI-powered GitHub repo analyzer — clone any repo, index its code, and ask questions.

## Stack

- **Backend:** FastAPI, ChromaDB, Gemini
- **Frontend:** React + Vite

## Local development

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add GEMINI_API_KEY to backend/.env
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173

## Deploy

### 1. Push to GitHub

Push this repo to [github.com/Aryanrs006/RepoMind.Ai](https://github.com/Aryanrs006/RepoMind.Ai)

### 2. Backend → Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend` (if deploying from monorepo)
4. Add environment variable:
   - `GEMINI_API_KEY` = your Gemini API key
5. Deploy — you'll get a URL like `https://repomind-api.onrender.com`

Or use **New Web Service** → **Docker** → point to `backend/Dockerfile`

### 3. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://repomind-api.onrender.com`)
4. Deploy

### 4. Update CORS (optional)

On Render, set `ALLOWED_ORIGINS` to your Vercel URL:
```
https://your-app.vercel.app
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /clone?url=` | Clone GitHub repo |
| `GET /read` | List repo files |
| `GET /store` | Index code in vector DB |
| `GET /ask?question=` | Ask AI about the repo |
