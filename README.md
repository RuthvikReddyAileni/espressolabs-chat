# EspressoLabs Real-Time Chat App

A full-stack real-time chat application built for the **EspressoLabs coding challenge**.  
It demonstrates real-time WebSocket communication, Google OAuth authentication, and a polished React + Node.js architecture.

---

## 🚀 Features

- **Google Authentication** (OAuth2 ID Token flow)
  - Users sign in with Google (test accounts only).
  - Shows their **photo + name**, or a clean initials avatar fallback.
- **Real-Time Messaging**
  - WebSocket communication via **Socket.IO**.
  - Broadcasts messages instantly to everyone in a room.
- **Multiple Chat Rooms**
  - Create, join, and leave rooms dynamically.
  - Each room has its own **user list** and **message history**.
- **Online Users**
  - See who’s in the same room.
  - Displays Google profile photo or generated initials avatar.
- **Connection Feedback**
  - Status dot (🟢/🔴).
  - If red, a **Refresh** button appears with instructions.
- **UI/UX**
  - Modern dark theme with clean components.
  - Message bubbles, avatars, sticky composer.
  - Responsive layout for sidebar + chat.

---

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js, Express, Socket.IO
- **Auth**: Google OAuth (ID token verification via `google-auth-library`)
- **Styling**: Custom CSS
- **State**: React hooks, simple local state
- **Storage**: In-memory (no DB, per spec)
- **Extras**: LocalStorage for user session persistence

---

## 📂 Project Structure

```
espressolabs-chat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main app
│   │   ├── components_*.tsx# Login, ChatRoom, RoomList
│   │   ├── hooks_useSocket.ts
│   │   ├── api.ts
│   │   └── styles.css
│   └── vite-env.d.ts
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── index.js        # Express + Socket.IO server
│   │   ├── auth.js         # Google ID token verification
│   │   └── ...
│   └── .env
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/espressolabs-chat.git
cd espressolabs-chat
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=4000
ORIGIN=http://localhost:5173
JWT_SECRET=dev_secret
GOOGLE_CLIENT_ID=<your-google-client-id>
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_BASE=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

Run the frontend:
```bash
npm run dev
```

### 4. Open the app
Frontend will be running at:
```
http://localhost:5173
```

---

## ✅ Usage Flow

1. Open `http://localhost:5173`.
2. Sign in with your Google test account.
3. Create or join a room (e.g. `general`).
4. Chat in real time 🚀  
   - Messages appear instantly for all users in the room.
   - Online sidebar updates dynamically.
   - Your profile picture (or initials) is shown.

---

## 💡 Improvements with More Time

- Persist rooms/messages in a database (MongoDB, Postgres).
- Add typing indicators and read receipts.
- Add unit + integration tests (Jest, Playwright).
- Deploy backend (Heroku/Fly.io) + frontend (Vercel/Netlify).
- Add CI/CD pipeline and linting checks.

---

## 📹 Deliverables

- ✅ Public GitHub repo (this one)
- ✅ README with setup + architecture overview
- ✅ Video demo showing login, room creation, real-time chat

---

## 👨‍💻 Author

**Ruthvik Reddy**  
📧 [ruthvikreddy0711@gmail.com](mailto:ruthvikreddy0711@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/ruthvikreddy0711/)
