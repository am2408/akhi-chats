"use client";

import { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          height: "48px",
          borderBottom: "1px solid #e1e2e4",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontWeight: 600,
        }}
      >
        💬 Direct Messages
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
        <div style={{ textAlign: "center", color: "#5c5e66", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#060607", marginBottom: "8px" }}>
            Welcome to Akhi Chats
          </h2>
          <p>Select a friend or server channel to start chatting.</p>
        </div>
      </div>

      {/* Message input */}
      <div style={{ padding: "0 16px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ebedef",
            borderRadius: "8px",
            padding: "0 16px",
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "12px 0",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "16px",
              color: "#060607",
            }}
          />
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              padding: "8px",
            }}
          >
            📎
          </button>
        </div>
      </div>
    </div>
  );
}