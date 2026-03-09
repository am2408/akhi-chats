"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        color: "#fff",
      }}
    >
      <div className="animate-scale-in" style={{ textAlign: "center", maxWidth: "600px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "40px",
            fontWeight: "bold",
          }}
        >
          A
        </div>

        <h1 style={{ fontSize: "48px", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          Akhi Chats
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "40px", lineHeight: 1.6 }}>
          Your space to chat, call, and share with friends.
          <br />
          Lightweight. Fast. No bloat.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "14px 40px",
              background: "#fff",
              color: "#5865f2",
              borderRadius: "28px",
              border: "none",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
            }}
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/register")}
            style={{
              padding: "14px 40px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: "28px",
              border: "2px solid rgba(255,255,255,0.4)",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            Register
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
            marginTop: "60px",
            flexWrap: "wrap",
          }}
        >
          {([
            { icon: "💬", label: "Chat" },
            { icon: "📹", label: "Video Call" },
            { icon: "🖥️", label: "Screen Share" },
            { icon: "📁", label: "File Upload" },
            { icon: "🔔", label: "Notifications" },
          ]).map((f) => (
            <div key={f.label} style={{ textAlign: "center", opacity: 0.85 }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{f.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}