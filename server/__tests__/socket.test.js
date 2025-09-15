import 'dotenv/config';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { RoomStore } from '../src/roomStore.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret';

function makeApp(server, port) {
  const app = express();
  const io = new Server(server, { cors: { origin: '*', credentials: true } });
  const store = new RoomStore(50);
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const user = jwt.verify(token, JWT_SECRET);
      socket.user = user;
      next();
    } catch (e) { next(e); }
  });
  io.on('connection', (socket) => {
    socket.on('room:create', (r, cb) => { store.ensureRoom(r); cb && cb({ ok: true }); });
    socket.on('room:join', (r, cb) => { socket.join(r); store.addUser(r, socket.id, socket.user); cb && cb({ ok: true }); });
    socket.on('message:send', ({ room, text }, cb) => { store.addMessage(room, { text }); io.to(room).emit('message:new', { text }); cb && cb({ ok: true }); });
  });
  return io;
}

test('socket message flow', (done) => {
  const app = express();
  const server = createServer(app);
  const io = makeApp(server);
  server.listen(0, () => {
    const port = server.address().port;
    const token = jwt.sign({ sub: '1', name: 'T' }, JWT_SECRET);
    const c1 = Client(`http://localhost:${port}`, { auth: { token } });
    c1.on('connect', () => {
      c1.emit('room:create', 'alpha', () => {
        c1.emit('room:join', 'alpha', () => {
          c1.on('message:new', (m) => {
            expect(m.text).toBe('hello');
            c1.close();
            io.close();
            server.close();
            done();
          });
          c1.emit('message:send', { room: 'alpha', text: 'hello' });
        });
      });
    });
  });
});
