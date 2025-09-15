import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { RoomStore } from './roomStore.js';
import { verifyGoogleIdToken, signJwt, verifyJwt, parseTokenFromCookie } from './auth.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: ORIGIN, credentials: true }
});

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

// ---- Auth endpoints ----
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const user = await verifyGoogleIdToken(idToken);
    const jwt = signJwt(user);
    // httpOnly cookie for sockets
    res.cookie('token', jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true behind HTTPS
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Auth failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Basic health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---- Socket logic ----
const store = new RoomStore(200);

// Auth middleware
io.use((socket, next) => {
  try {
    const token = parseTokenFromCookie(socket.handshake.headers.cookie || '');
    if (!token) return next(new Error('No auth token'));
    const user = verifyJwt(token);
    socket.user = { id: user.sub, email: user.email, name: user.name, picture: user.picture };
    next();
  } catch (err) {
    next(new Error('Auth invalid'));
  }
});

io.on('connection', (socket) => {
  // Send current rooms
  socket.emit('rooms:update', store.listRooms());

  socket.on('room:create', (roomName, cb) => {
    if (!roomName || typeof roomName !== 'string') return cb && cb({ error: 'Invalid name' });
    store.ensureRoom(roomName);
    io.emit('rooms:update', store.listRooms());
    cb && cb({ ok: true });
  });

  socket.on('room:join', (roomName, cb) => {
    if (!roomName) return cb && cb({ error: 'Missing room' });
    socket.join(roomName);
    store.addUser(roomName, socket.id, socket.user);
    io.to(roomName).emit('room:users', store.getUsers(roomName));
    socket.emit('room:history', { room: roomName, messages: store.getMessages(roomName) });
    io.emit('rooms:update', store.listRooms());
    cb && cb({ ok: true });
  });

  socket.on('room:leave', (roomName, cb) => {
    socket.leave(roomName);
    store.removeUser(roomName, socket.id);
    io.to(roomName).emit('room:users', store.getUsers(roomName));
    io.emit('rooms:update', store.listRooms());
    cb && cb({ ok: true });
  });

  socket.on('message:send', ({ room, text }, cb) => {
    if (!room || typeof text !== 'string' || !text.trim()) return cb && cb({ error: 'Invalid message' });
    const msg = {
      id: Math.random().toString(36).slice(2),
      room,
      text: text.trim(),
      at: Date.now(),
      user: socket.user,
    };
    store.addMessage(room, msg);
    io.to(room).emit('message:new', msg);
    cb && cb({ ok: true, id: msg.id });
  });

  socket.on('disconnecting', () => {
    // Remove user from all rooms they're in
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((r) => {
      store.removeUser(r, socket.id);
      io.to(r).emit('room:users', store.getUsers(r));
    });
    io.emit('rooms:update', store.listRooms());
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
