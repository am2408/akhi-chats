"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FeatureIcons = {
  chat: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
      <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
    </svg>
  ),
  video: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
  ),
  screen: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
      <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
    </svg>
  ),
  upload: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
    </svg>
  ),
  bell: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  ),
};

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #5865f2 0%, #764ba2 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 20, color: "#fff",
    }}>
      <div className="animate-scale-in" style={{ textAlign: "center", maxWidth: 600 }}>
        <div style={{
          width: 80, height: 80, background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)", borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="40" height="28" viewBox="0 0 28 20" fill="#fff">
            <path d="M23.02 1.56A22.5 22.5 0 0 0 17.4 0a.08.08 0 0 0-.09.04c-.24.43-.51.99-.7 1.43a20.8 20.8 0 0 0-6.24 0 14.7 14.7 0 0 0-.7-1.43.08.08 0 0 0-.1-.04 22.4 22.4 0 0 0-5.61 1.56.08.08 0 0 0-.04.03C.54 6.77-.33 11.82.1 16.81a.09.09 0 0 0 .03.06 22.7 22.7 0 0 0 6.86 3.1.08.08 0 0 0 .09-.03c.53-.72 1-1.49 1.41-2.29a.08.08 0 0 0-.04-.11 14.9 14.9 0 0 1-2.15-1.03.08.08 0 0 1-.01-.14c.14-.11.29-.22.43-.33a.08.08 0 0 1 .08-.01c4.52 2.07 9.42 2.07 13.89 0a.08.08 0 0 1 .08.01c.14.11.29.23.43.34a.08.08 0 0 1 0 .13c-.69.4-1.4.75-2.16 1.03a.08.08 0 0 0-.04.12c.41.8.88 1.56 1.4 2.28a.08.08 0 0 0 .1.03 22.6 22.6 0 0 0 6.87-3.1.09.09 0 0 0 .04-.05c.52-5.42-.87-10.13-3.69-14.3a.07.07 0 0 0-.03-.04ZM9.35 13.78c-1.24 0-2.26-1.14-2.26-2.53s1-2.53 2.26-2.53c1.27 0 2.28 1.15 2.26 2.53 0 1.4-1 2.53-2.26 2.53Zm8.36 0c-1.24 0-2.26-1.14-2.26-2.53s1-2.53 2.26-2.53c1.27 0 2.28 1.15 2.26 2.53 0 1.4-1 2.53-2.26 2.53Z"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>Akhi Chats</h1>
        <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 40, lineHeight: 1.6 }}>
          Your space to chat, call, and share with friends.<br />Lightweight. Fast. No bloat.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "14px 40px", background: "#fff", color: "#5865f2",
              borderRadius: 28, border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/register")}
            style={{
              padding: "14px 40px", background: "rgba(255,255,255,0.15)", color: "#fff",
              borderRadius: 28, border: "2px solid rgba(255,255,255,0.4)",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              backdropFilter: "blur(10px)", transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          >
            Register
          </button>
        </div>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 60, flexWrap: "wrap" }}>
          {([
            { icon: FeatureIcons.chat, label: "Chat" },
            { icon: FeatureIcons.video, label: "Video Call" },
            { icon: FeatureIcons.screen, label: "Screen Share" },
            { icon: FeatureIcons.upload, label: "File Upload" },
            { icon: FeatureIcons.bell, label: "Notifications" },
          ]).map((f) => (
            <div key={f.label} style={{ textAlign: "center", opacity: 0.85 }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}