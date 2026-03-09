"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import useAuth from "@/hooks/use-auth";

interface DM {
  id: string;
  content: string;
  fileUrl: string | null;
  senderId: string;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

interface FriendInfo {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
}

export default function DMPage() {
  const params = useParams();
  const friendId = params?.friendId as string;
  const { user } = useAuth();
  const [messages, setMessages] = useState<DM[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [friend, setFriend] = useState<FriendInfo | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch friend info
  useEffect(() => {
    if (!friendId) return;
    fetch(`/api/users/${friendId}`)
      .then((r) => r.json())
      .then((d) => { if (d.user) setFriend(d.user); })
      .catch(() => {});
  }, [friendId]);

  // Fetch messages with polling
  const fetchMessages = useCallback(() => {
    if (!friendId || !user) return;
    fetch(`/api/dm?userId=${user.id}&friendId=${friendId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(console.error);
  }, [friendId, user]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [friendId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    const content = newMessage;
    setNewMessage("");

    // Optimistic update
    const optimisticMsg: DM = {
      id: `temp-${Date.now()}`,
      content,
      fileUrl: null,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, username: user.username, avatar: user.avatar || null },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, receiverId: friendId, content }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const emojis = ["😀", "😂", "❤️", "🔥", "👍", "👎", "🎉", "😢", "😡", "🤔", "😮", "💀", "👀", "✅", "🙏", "🫡", "💯", "😭", "🥺", "😤"];

  if (!user) return null;

  // Show loading if friend not loaded yet
  if (!friend) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--dc-text-muted)" }}>
        Loading conversation...
      </div>
    );
  }

  const statusColor = friend.status === "online" ? "var(--dc-status-online)" : friend.status === "idle" ? "var(--dc-status-idle)" : friend.status === "dnd" ? "var(--dc-status-dnd)" : "var(--dc-status-offline)";

  // Group messages by date
  const groupedMessages: { date: string; msgs: DM[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const d = new Date(msg.createdAt).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    if (d !== currentDate) {
      currentDate = d;
      groupedMessages.push({ date: d, msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  }

  const shouldShowHeader = (msgs: DM[], index: number) => {
    if (index === 0) return true;
    const prev = msgs[index - 1];
    const curr = msgs[index];
    if (prev.senderId !== curr.senderId) return true;
    return new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime() > 7 * 60 * 1000;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        height: 48, borderBottom: "1px solid var(--dc-bg-tertiary)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0,
      }}>
        <span style={{ color: "var(--dc-text-muted)", fontSize: 20 }}>@</span>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: friend.avatar ? `url(${friend.avatar}) center/cover` : "var(--dc-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 10, fontWeight: 600,
        }}>
          {!friend.avatar && friend.username[0].toUpperCase()}
        </div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{friend.username}</span>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {/* Welcome */}
        <div style={{ padding: "24px 16px 8px" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: friend.avatar ? `url(${friend.avatar}) center/cover` : "var(--dc-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 36, fontWeight: 600, marginBottom: 12,
          }}>
            {!friend.avatar && friend.username[0].toUpperCase()}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{friend.username}</h1>
          <p style={{ color: "var(--dc-text-muted)", fontSize: 14, marginBottom: 16 }}>
            This is the beginning of your direct message history with{" "}
            <strong style={{ color: "var(--dc-text-primary)" }}>{friend.username}</strong>.
          </p>
          <div style={{ height: 1, background: "var(--dc-divider)" }} />
        </div>

        {/* Message groups */}
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 4px", gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: "var(--dc-divider)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--dc-text-muted)", whiteSpace: "nowrap" }}>
                {group.date}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--dc-divider)" }} />
            </div>

            {group.msgs.map((msg, idx) => {
              const showHead = shouldShowHeader(group.msgs, idx);
              const isMe = msg.senderId === user.id;
              const senderName = isMe ? user.username : friend.username;
              const senderAvatar = isMe ? (user.avatar || null) : friend.avatar;

              return (
                <div
                  key={msg.id}
                  style={{
                    padding: showHead ? "4px 48px 1px 72px" : "1px 48px 1px 72px",
                    marginTop: showHead ? 16 : 0,
                    position: "relative",
                  }}
                >
                  {showHead && (
                    <div>
                      {/* Avatar */}
                      <div style={{
                        position: "absolute", left: 16, top: 4,
                        width: 40, height: 40, borderRadius: "50%",
                        background: senderAvatar ? `url(${senderAvatar}) center/cover` : "var(--dc-brand)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 600, fontSize: 16,
                      }}>
                        {!senderAvatar && senderName[0].toUpperCase()}
                      </div>
                      {/* Name + time */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: isMe ? "var(--dc-brand)" : "#f38ba8" }}>
                          {senderName}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--dc-text-muted)" }}>
                          {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                          {" "}
                          {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{
                    fontSize: 15, lineHeight: "22px", color: "var(--dc-text-primary)",
                    wordBreak: "break-word", opacity: msg.id.startsWith("temp-") ? 0.6 : 1,
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "0 16px 24px", position: "relative" }}>
        {/* Emoji picker */}
        {showEmoji && (
          <div>
            <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowEmoji(false)} />
            <div style={{
              position: "absolute", bottom: 72, right: 16,
              background: "var(--dc-bg-floating)", borderRadius: 8, padding: 12,
              zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, width: 220,
            }}>
              {emojis.map((e) => (
                <button key={e} onClick={() => addEmoji(e)} style={{
                  width: 36, height: 36, borderRadius: 6, background: "transparent",
                  border: "none", cursor: "pointer", fontSize: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center",
          background: "var(--dc-bg-active)", borderRadius: 8, padding: "0 16px",
        }}>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--dc-text-muted)", fontSize: 22, padding: "8px 8px 8px 0",
          }}>➕</button>

          <input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendMessage(); }}
            placeholder={`Message @${friend.username}`}
            style={{
              flex: 1, padding: "11px 0", background: "transparent",
              border: "none", outline: "none", fontSize: 15, color: "var(--dc-text-primary)",
            }}
          />

          <button onClick={() => setShowEmoji(!showEmoji)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--dc-text-muted)", fontSize: 22, padding: 8,
          }}>😀</button>
        </div>
      </div>
    </div>
  );
}