import React, { useState } from "react";
import "./styles.css";
import Login from "./components_Login";
import RoomList from "./components_RoomList";
import ChatRoom from "./components_ChatRoom";
import { useSocket } from "./hooks_useSocket";
import api from "./api";

/** Helpers for avatar fallback */
function initials(nameOrEmail?: string) {
  if (!nameOrEmail) return "?";
  const clean = nameOrEmail.trim();
  const parts = clean.split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : clean.slice(0, 2)).toUpperCase();
}
function colorFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 45% 35%)`;
}

function App() {
  // hydrate user once (prevents flicker)
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  // socket only connects when logged in
  const { connected, rooms, users, history, createRoom, joinRoom, leaveRoom, sendMessage } =
    useSocket(!!user);

  const handleJoin = (name: string) => { joinRoom(name); setCurrentRoom(name); };
  const handleLeave = () => { if (currentRoom) { leaveRoom(currentRoom); setCurrentRoom(null); } };

  const logout = async () => {
    try { await api.post("/api/auth/logout", {}); } catch {}
    localStorage.removeItem("user");
    setUser(null);
    setCurrentRoom(null);
    // no need to reload; socket hook will close on enabled=false
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <span>EspressoLabs Chat</span>

          {/* status + refresh helper */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className={`dot ${connected ? "green" : "red"}`} title={connected ? "Connected" : "Not connected"} />
            </div>
            {!connected && (
              <button
                className="btn"
                style={{ padding: "4px 10px", fontSize: 12 }}
                onClick={() => window.location.reload()}
                title="If the dot is red, refresh to retry connection"
              >
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* User section (photo or initials) */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user.picture ? (
              <img
                src={user.picture}
                width={28}
                height={28}
                style={{ borderRadius: 14 }}
                alt={user.name || user.email}
                title={user.name || user.email}
              />
            ) : (
              <div
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  background: colorFromString(user.name || user.email || "anon"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "uppercase",
                  border: "1px solid rgba(255,255,255,.15)"
                }}
                aria-label={user.name || user.email}
                title={user.name || user.email}
              >
                {initials(user.name || user.email)}
              </div>
            )}
            <span>{user.name || user.email}</span>
            <button className="btn ghost" onClick={logout}>Logout</button>
          </div>
        )}
      </header>

      {/* Main content */}
      {!user ? (
        <Login onLoggedIn={setUser} />
      ) : !currentRoom ? (
        <div className="card" style={{ padding: 16 }}>
          <RoomList rooms={rooms} onCreate={createRoom} onJoin={handleJoin} />
        </div>
      ) : (
        <ChatRoom
          room={currentRoom}
          history={history}
          users={users}
          onSend={(t) => sendMessage(currentRoom, t)}
          onLeave={handleLeave}
          currentUserEmail={user?.email}
        />
      )}
    </div>
  );
}

export default App;
