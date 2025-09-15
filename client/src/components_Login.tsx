import React, { useEffect, useRef } from "react";
import api from "./api";

declare global { interface Window { google?: any } }

export default function Login({ onLoggedIn }: { onLoggedIn: (u: any) => void }) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId || !divRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          const idToken = response.credential;
          const res = await api.post("/api/auth/google", { idToken });
          const user = res.data.user;
          // keep user in memory + survive refresh
          localStorage.setItem("user", JSON.stringify(user));
          onLoggedIn(user);
          // no window.location.reload() — socket will connect once user exists
        } catch (e) {
          console.error("Login failed", e);
          alert("Login failed. Please try again.");
        }
      },
    });

    window.google.accounts.id.renderButton(divRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, []);

  return (
    <div className="card center-card">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Sign in</h2>
        <p style={{ color: "var(--muted)", margin: "0 0 6px 0" }}>
          Use your Google account (dev test users only).
        </p>
        <div ref={divRef} />
      </div>
    </div>
  );
}
