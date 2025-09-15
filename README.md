# EspressoLabs Real-Time Chat (React + Socket.IO)

A 90‑minute MVP demonstrating:
- Real‑time rooms with Socket.IO
- Simple Google Sign‑In → backend‑verified → httpOnly JWT cookie
- Isolated, in‑memory message history per room
- Online users per room
- Clean React + TypeScript (Vite) frontend
- Jest unit + socket flow tests on the server

> With more time: persist rooms/messages in Redis/Postgres, horizontal scale with Socket.IO adapter (Redis), HTTPS + secure cookies, rate limits, and CI.

---

## Quick Start

### 1) Backend
```bash
cd server
cp .env.example .env   # set GOOGLE_CLIENT_ID and JWT_SECRET
npm i
npm run dev
```
Server: `http://localhost:4000`

### 2) Frontend
```bash
cd client
cp .env.example .env   # set VITE_API_BASE and VITE_GOOGLE_CLIENT_ID
npm i
npm run dev
```
App: `http://localhost:5173`

> You must create a **Google OAuth Client ID (Web)** and add `http://localhost:5173` to Authorized JavaScript origins. Put the client ID in both `.env` files. For production behind HTTPS, set `secure: true` on the cookie.

---

## Architecture (MVP)

**Auth**
- Frontend loads Google Identity Services button.
- On success, gets a Google **ID token** (`credential`).
- Sends it to `/api/auth/google`. Server verifies with `google-auth-library` and signs a short‑lived JWT.
- JWT is stored in an **httpOnly cookie** `token` for Socket.IO auth.

**Sockets**
- `io.use` middleware verifies the cookie JWT and attaches `socket.user`.
- Rooms managed by an in‑memory `RoomStore` (users + bounded messages).
- Events:
  - `room:create` → create if missing
  - `room:join` / `room:leave`
  - `message:send` → broadcast `message:new`
  - Passive:
    - `rooms:update`, `room:users`, `room:history`

**Scaling Path**
- Replace `RoomStore` with Redis or Postgres.
- Use `@socket.io/redis-adapter` for multi‑instance scaling.
- Sticky sessions / consistent hashing on the load balancer.
- Store messages in Postgres, index by `room, at` for pagination.
- Add presence via Redis sets with TTLs; cron to clean stale users.
- Add rate limiting (per IP + per user) to `/api` and socket events.

**Testing**
- `__tests__/roomStore.test.js` covers store behaviors.
- `__tests__/socket.test.js` performs a basic message flow with `socket.io-client`.

---

## Endpoints

- `POST /api/auth/google` → body `{ idToken }` → sets `token` cookie, returns user
- `POST /api/auth/logout` → clears cookie
- `GET /api/health` → `{ ok: true }`

---

## E2E / Demo Notes

- Two or more browsers/tabs can join the same room and see real‑time updates.
- User avatar/name are taken from Google and shown in the UI.
- Message history is in-memory and bounded (default 200).

---

## What I'd Improve with More Time

- Persist messages and rooms in Postgres + Prisma; add pagination and search.
- Redis for presence and pub/sub adapter.
- Add **typing indicators**, **read receipts**, **last seen**.
- Add **role‑based room access**; private rooms; invites.
- Add **Jest e2e** (supertest + Playwright) and GitHub Actions CI.
- Harden security: helmet, CSRF for non‑idempotent HTTP, input validation with Zod, abuse protection.

---

## Repo Layout

```
/client   # Vite + React + TS
/server   # Express + Socket.IO + Google auth -> JWT cookie
```

---

## Scripts

- **server**: `npm run dev`, `npm test`
- **client**: `npm run dev`, `npm run build`, `npm run preview`

Good luck & have fun ☕
