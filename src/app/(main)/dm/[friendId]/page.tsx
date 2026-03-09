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
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch friend info
  useEffect(() => {
    if (!friendId || !user) return;
    fetch(`/api/users/search?q=&userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        const f = (d.users || []).find((u: FriendInfo) => u.id === friendId);
        if (f) setFriend(f);
      })
      .catch(() => {});
  }, [friendId, user]);

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
    const interval = setInterval(fetchMessages, 2000);
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

  // Simulate typing indicator
  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    const content = newMessage;
    setNewMessage("");
    setIsTyping(false);

    // Optimistic update
    const optimisticMsg: DM = {
      id: `temp-${Date.now()}`,
      content,
      fileUrl: null,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, username: user.username, avatar: user.avatar },
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

  if (!user || !friend) return null;

  // Group messages by date
  const groupedMessages: { date: string; messages: DM[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const d = new Date(msg.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (d !== currentDate) {
      currentDate = d;
      groupedMessages.push({ date: d, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  // Group consecutive messages from same sender
  const shouldShowHeader = (messages: DM[], index: number) => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    const curr = messages[index];
    if (prev.senderId !== curr.senderId) return true;
    const timeDiff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return timeDiff > 7 * 60 * 1000; // 7 minutes
  };

  const statusColor = friend.status === "online" ? "var(--dc-status-online)" : friend.status === "idle" ? "var(--dc-status-idle)" : friend.status === "dnd" ? "var(--dc-status-dnd)" : "var(--dc-status-offline)";

  const emojis = ["😀", "😂", "❤️", "🔥", "👍", "👎", "🎉", "😢", "😡", "🤔", "😮", "💀", "👀", "✅", "🙏", "🫡", "💯", "😭", "🥺", "😤"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Header ── */}
      <div style={{
        height: "48px",
        borderBottom: "1px solid var(--dc-bg-tertiary)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "12px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--dc-text-muted)", fontSize: "20px" }}>@</span>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              background: friend.avatar ? `url(${friend.avatar}) center/cover` : "var(--dc-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "10px", fontWeight: 600,
            }}>
              {!friend.avatar && friend.username[0].toUpperCase()}
            </div>
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>{friend.username}</span>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: statusColor,
          }} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Header icons */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["📞", "📹", "📌", "👤", "🔍"].map((icon, i) => (
            <button
              key={i}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "18px", color: "var(--dc-text-secondary)",
                transition: "color 0.15s", padding: "4px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-secondary)"; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "8px" }}>
        {/* Welcome section */}
        <div style={{ padding: "24px 16px 8px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: friend.avatar ? `url(${friend.avatar}) center/cover` : "var(--dc-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "36px", fontWeight: 600,
            marginBottom: "12px",
          }}>
            {!friend.avatar && friend.username[0].toUpperCase()}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>{friend.username}</h1>
          <p style={{ color: "var(--dc-text-muted)", fontSize: "14px", marginBottom: "16px" }}>
            This is the beginning of your direct message history with <strong style={{ color: "var(--dc-text-primary)" }}>{friend.username}</strong>.
          </p>
          <div style={{ height: "1px", background: "var(--dc-divider)" }} />
        </div>

        {/* Messages */}
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 16px 4px",
              gap: "8px",
            }}>
              <div style={{ flex: 1, height: "1px", background: "var(--dc-divider)" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--dc-text-muted)", whiteSpace: "nowrap" }}>
                {group.date}
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--dc-divider)" }} />
            </div>

            {group.messages.map((msg, idx) => {
              const showHead = shouldShowHeader(group.messages, idx);
              const isMe = msg.senderId === user.id;
              const sender = isMe ? { username: user.username, avatar: user.avatar } : { username: friend.username, avatar: friend.avatar };

              return (
                <div
                  key={msg.id}
                  className="animate-fade-in"
                  style={{
                    padding: showHead ? "4px 48px 1px 72px" : "1px 48px 1px 72px",
                    marginTop: showHead ? "16px" : "0",
                    position: "relative",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-bg-message-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {showHead && (
                    <>
                      {/* Avatar */}
                      <div style={{
                        position: "absolute",
                        left: "16px",
                        top: "4px",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: sender.avatar ? `url(${sender.avatar}) center/cover` : "var(--dc-brand)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "16px",
                        cursor: "pointer",
                      }}>
                        {!sender.avatar && sender.username[0].toUpperCase()}
                      </div>
                      {/* Username + timestamp */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "2px" }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: "15px",
                          color: isMe ? "var(--dc-brand)" : "#f38ba8",
                          cursor: "pointer",
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                        >
                          {sender.username}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--dc-text-muted)" }}>
                          {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                          {" "}
                          {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Hover timestamp (for collapsed messages) */}
                  {!showHead && (
                    <span style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "10px",
                      color: "var(--dc-text-muted)",
                      opacity: 0,
                      width: "40px",
                      textAlign: "center",
                    }}
                      className="hover-time"
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}

                  <div style={{
                    fontSize: "15px",
                    lineHeight: "22px",
                    color: "var(--dc-text-primary)",
                    wordBreak: "break-word",
                    opacity: msg.id.startsWith("temp-") ? 0.6 : 1,
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            padding: "4px 16px 8px 72px",
            fontSize: "13px",
            color: "var(--dc-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <div style={{ display: "flex", gap: "3px" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--dc-text-muted)",
                    animation: `typingDot 1.4s ease infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span><strong>{friend.username}</strong> is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ padding: "0 16px 24px", position: "relative" }}>
        {/* Emoji picker */}
        {showEmoji && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowEmoji(false)} />
            <div className="animate-scale-in" style={{
              position: "absolute",
              bottom: "72px",
              right: "16px",
              background: "var(--dc-bg-floating)",
              borderRadius: "8px",
              padding: "12px",
              zIndex: 999,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "4px",
              width: "220px",
            }}>
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => addEmoji(e)}
                  style={{
                    width: "36px", height: "36px", borderRadius: "6px",
                    background: "transparent", border: "none",
                    cursor: "pointer", fontSize: "20px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(el) => { el.currentTarget.style.background = "var(--dc-bg-hover)"; }}
                  onMouseLeave={(el) => { el.currentTarget.style.background = "transparent"; }}
                >
                  {e}
                </button>
              ))}
            </div>
          </>
        )}

        <div style={{
          display: "flex",
          alignItems: "center",
          background: "var(--dc-bg-active)",
          borderRadius: "8px",
          padding: "0 16px",
        }}>
          {/* Attachment */}
          <button
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--dc-text-muted)", fontSize: "22px", padding: "8px 8px 8px 0",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-muted)"; }}
          >
            ➕
          </button>

          <input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Message @${friend.username}`}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "15px",
              color: "var(--dc-text-primary)",
            }}
          />

          {/* Right side icons */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--dc-text-muted)", fontSize: "22px", padding: "8px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-muted)"; }}
            >
              😀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}