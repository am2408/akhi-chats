"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/use-auth";

interface DM {
  id: string;
  content: string;
  fileUrl: string | null;
  senderId: string;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

export default function DMPage() {
  const params = useParams();
  const router = useRouter();
  const friendId = params?.friendId as string;
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<DM[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [friendName, setFriendName] = useState("Loading...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch friend info
  useEffect(() => {
    if (!friendId || !user) return;
    fetch(`/api/users/search?q=&userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const friend = data.users?.find((u: { id: string }) => u.id === friendId);
        if (friend) setFriendName(friend.username);
        else setFriendName("Unknown");
      })
      .catch(() => setFriendName("Unknown"));
  }, [friendId, user]);

  // Fetch messages with polling
  useEffect(() => {
    if (!friendId || !user) return;

    const fetchMessages = () => {
      fetch(`/api/dm?userId=${user.id}&friendId=${friendId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []))
        .catch(console.error);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [friendId, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, receiverId: friendId, content: newMessage }),
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

  if (authLoading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#5c5e66" }}>Loading...</div>;
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ height: "48px", borderBottom: "1px solid #e1e2e4", display: "flex", alignItems: "center", padding: "0 16px", gap: "12px" }}>
        <button onClick={() => router.push("/friends")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#5c5e66" }}>←</button>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "12px" }}>
          {friendName.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontWeight: 600 }}>{friendName}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#5c5e66" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <h3 style={{ fontWeight: 700, color: "#060607", marginBottom: "4px" }}>Start of your conversation with {friendName}</h3>
            <p>Send a message to get started!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "12px" }}>
                <div style={{ maxWidth: "65%", padding: "10px 14px", borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: isMe ? "#5865f2" : "#f2f3f5", color: isMe ? "#fff" : "#060607" }}>
                  {!isMe && <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>{msg.sender.username}</div>}
                  <p style={{ margin: 0, wordBreak: "break-word" }}>{msg.content}</p>
                  <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7, textAlign: "right" }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "0 16px 24px" }}>
        <div style={{ display: "flex", background: "#ebedef", borderRadius: "8px", padding: "0 16px" }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Message @${friendName}`}
            style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", outline: "none", fontSize: "16px", color: "#060607" }}
          />
          <button onClick={sendMessage} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", padding: "8px", color: newMessage.trim() ? "#5865f2" : "#80848e" }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}