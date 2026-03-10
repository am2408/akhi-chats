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
      .then((data) => { if (data.messages) setMessages(data.messages); })
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
      if (data.message) { setMessages((prev) => [...prev, data.message]); setNewMessage(""); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        height: 48, borderBottom: "1px solid var(--dc-bg-tertiary)",
        display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 600, gap: 8,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--dc-text-muted)">
          <path d="M5.88 21l1.54-5.12L3.5 12.44l5.36-.46L11 7.5l2.14 4.48 5.36.46-3.92 3.44L16.12 21 11 17.77 5.88 21z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span style={{ color: "var(--dc-text-muted)" }}>#</span>
        Channel {channelId}
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p style={{ color: "var(--dc-text-muted)", textAlign: "center", padding: 40 }}>
            No messages yet. Say something!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 600, marginRight: 8, color: "var(--dc-text-primary)" }}>
                {msg.user?.username || "Unknown"}
              </span>
              <span style={{ fontSize: 12, color: "var(--dc-text-muted)" }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
              <p style={{ marginTop: 4, color: "var(--dc-text-primary)" }}>{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <div style={{
          display: "flex", background: "var(--dc-bg-active)", borderRadius: 8, padding: "0 16px",
        }}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", outline: "none", fontSize: 16, color: "var(--dc-text-primary)" }}
          />
          <button onClick={sendMessage} style={{
            background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--dc-text-muted)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}