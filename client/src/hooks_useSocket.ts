import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(enabled: boolean) {
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState<{name: string; online: number; messages: number}[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) {
      // ensure we’re disconnected if user logs out
      socketRef.current?.close();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const s = io(import.meta.env.VITE_API_BASE || 'http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = s;

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      console.error('socket connect_error:', err?.message);
      setConnected(false);
    });

    s.on('rooms:update', (r) => setRooms(r));
    s.on('room:users', (u) => setUsers(u));
    s.on('room:history', (h) => setHistory(h.messages));
    s.on('message:new', (m) => setHistory((prev) => [...prev, m]));

    return () => { s.close(); };
  }, [enabled]); // 🔑 only when enabled (i.e., logged in)

  function createRoom(name: string) {
    socketRef.current?.emit('room:create', name, (res:any)=>{ if(res?.error) alert(res.error); });
  }
  function joinRoom(name: string) {
    socketRef.current?.emit('room:join', name, (res:any)=>{ if(res?.error) alert(res.error); });
  }
  function leaveRoom(name: string) {
    socketRef.current?.emit('room:leave', name, (res:any)=>{ if(res?.error) alert(res.error); });
  }
  function sendMessage(room: string, text: string) {
    const t = (text||'').trim();
    if (!t) return;
    socketRef.current?.emit('message:send', { room, text: t }, (res:any)=>{ if(res?.error) alert(res.error); });
  }

  return { connected, rooms, users, history, createRoom, joinRoom, leaveRoom, sendMessage };
}
