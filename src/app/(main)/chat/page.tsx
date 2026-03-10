"use client";

import { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        height: 48, borderBottom: "1px solid var(--dc-bg-tertiary)",
        display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 600, gap: 8,
        color: "var(--dc-text-primary)",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--dc-text-muted)">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
        </svg>
        Direct Messages
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        <div style={{ textAlign: "center", color: "var(--dc-text-muted)", padding: 40 }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--dc-text-muted)" opacity="0.4">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
              <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--dc-text-primary)", marginBottom: 8 }}>
            Welcome to Akhi Chats
          </h2>
          <p>Select a friend or server channel to start chatting.</p>
        </div>
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          background: "var(--dc-bg-active)", borderRadius: 8, padding: "0 16px",
        }}>
          <input
            type="text" value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: "12px 0", background: "transparent", border: "none",
              outline: "none", fontSize: 16, color: "var(--dc-text-primary)",
            }}
          />
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--dc-text-muted)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}