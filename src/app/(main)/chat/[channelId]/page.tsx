"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user?: { username: string };
}

export default function ChannelPage() {
  const params = useParams();
  const channelId = params?.channelId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!channelId) return;
    fetch(`/api/messages?channelId=${channelId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch(console.error);
  }, [channelId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, content: newMessage }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
        # Channel {channelId}
      </div>

      <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p style={{ color: "#5c5e66", textAlign: "center", padding: "40px" }}>
            No messages yet. Say something!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: "16px" }}>
              <span style={{ fontWeight: 600, marginRight: "8px" }}>
                {msg.user?.username || "Unknown"}
              </span>
              <span style={{ fontSize: "12px", color: "#747681" }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
              <p style={{ marginTop: "4px" }}>{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <div
          style={{
            display: "flex",
            background: "#ebedef",
            borderRadius: "8px",
            padding: "0 16px",
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "12px 0",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "16px",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}