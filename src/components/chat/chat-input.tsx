"use client";

import React, { useState } from "react";

export default function ChatInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ display: "flex", background: "#ebedef", borderRadius: "8px", padding: "0 16px" }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", outline: "none", fontSize: "16px" }}
        />
        <button onClick={handleSend} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>
          ➤
        </button>
      </div>
    </div>
  );
}