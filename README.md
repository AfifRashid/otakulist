# OtakuList — simple anime watchlist

A minimal full‑stack app where you can create a watchlist and add anime either manually or via searching MyAnimeList.

## Features
- Add anime with planned/ watching/ done status.
- Increment/set progress, rate 1–10, filter by status.
- `/api/stats` computes hours watched and backlog count.
- Optional search via **Jikan** (unofficial MyAnimeList API) at `/api/search?q=...` — *off by default*

## Tech
- Backend: Node 20 + Express + SQLite (better-sqlite3), Jest + Supertest, ESLint.
- Frontend: React (Vite).
- Containerised: Dockerfiles for FE/BE, `docker-compose.yml` for dev/test deploy.
- Code quality: SonarQube via `sonar-project.properties` (language: JS/TS).
- CI: `Jenkinsfile` with 4 stages (Build, Test, CodeQuality, Deploy).

## Quick start (local)
```bash
# Backend
cd backend
npm ci
npm run dev
# Frontend (in another terminal)
cd ../frontend
npm ci
npm run dev
```

Backend default: http://localhost:3000, Frontend: http://localhost:5173

## Docker compose
```bash
docker compose up -d --build
# FE: http://localhost:5173  (points to http://backend:3000 inside compose)
```

## Jikan integration
- Enable by setting `JIKAN_ENABLED=true` in backend env (compose does this commented out).
- Endpoint: `GET /api/search?q=naruto`
- Uses `https://api.jikan.moe/v4/anime?q=...` read‑only. If disabled, endpoint returns 501.
