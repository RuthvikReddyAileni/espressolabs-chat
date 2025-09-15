import React, { useMemo, useRef, useEffect, useState } from "react";

type User = { name?: string; email?: string; picture?: string; sub?: string };
type Msg = { id: string; text: string; at: number; user?: User };

export default function ChatRoom({
  room, history, users, onSend, onLeave, currentUserEmail,
}: {
  room: string;
  history: Msg[];
  users: User[];
  onSend: (t: string) => void;
  onLeave: () => void;
  currentUserEmail?: string | null;
}) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const trySend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };
  function initials(nameOrEmail?: string) {
    if (!nameOrEmail) return "?";
    const parts = nameOrEmail.trim().split(" ");
    if (parts.length === 1) {
      // maybe it's an email → take first 2 chars
      return parts[0].slice(0, 2).toUpperCase();
    }
    // first + last name initials
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function colorFromString(s: string) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}deg 35% 32%)`;
  }
  // autoscroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const you = (u?: User) => (u?.email && currentUserEmail ? u.email === currentUserEmail : false);

  return (
    <div className="layout">
      {/* chat panel */}
      <div className="card">
        <div className="room-header">
          <div className="room-title">Room: {room}</div>
          <button className="btn ghost" onClick={onLeave}>Leave</button>
        </div>

        <div className="chat">
          <div className="history" ref={listRef}>
            {history.length === 0 && (
              <div className="badge">Say hi 👋 — message history is empty.</div>
            )}

            {history.map((m) => {
              const mine = you(m.user);
              const label = m.user?.name || m.user?.email || "anon";
              const bg = colorFromString(label);

              return (
                <div key={m.id} className={`msg ${mine ? "mine" : "theirs"}`}>
                  {/* show avatar/initials only for other users (like most messengers) */}
                  {!mine && (
                    m.user?.picture ? (
                      <img className="avatar" src={m.user.picture} alt={label} />
                    ) : (
                      <div
                        className="avatar"
                        style={{
                          background: bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#fff",
                          textTransform: "uppercase",
                        }}
                        aria-label={label}
                        title={label}
                      >
                        {initials(label)}
                      </div>
                    )
                  )}

                  <div className="bubble">
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                      {label}
                    </div>
                    <div>{m.text}</div>
                    <div className="meta">{new Date(m.at).toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="composer">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => { if (e.key === "Enter") trySend(); }}
            />
            <button className="btn" onClick={trySend}>Send</button>
          </div>
        </div>

      </div>

      {/* right sidebar */}
      <aside className="card sidebar">
        <p className="side-title">Online</p>
        {users.length === 0 && <div className="badge">No one here yet</div>}

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {users.map((u, i) => {
            const label = u.name || u.email || "anon";
            return (
              <li key={u.sub || u.email || i} className="userline">
                {u.picture ? (
                  <img
                    className="avatar"
                    src={u.picture}
                    alt={label}
                    title={label}
                  />
                ) : (
                  <div
                    className="avatar"
                    style={{
                      background: "#39466e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#fff",
                      textTransform: "uppercase"
                    }}
                    aria-label={label}
                    title={label}
                  >
                    {initials(label)}
                  </div>
                )}
                <div>
                  <div>{label}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

    </div>
  );
}
