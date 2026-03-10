"use client";

import { useEffect, useRef } from "react";

interface IncomingCallToastProps {
  callerName: string;
  callerAvatar: string | null;
  callType: "video" | "audio";
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallToast({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
}: IncomingCallToastProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sounds/call-ringing.mp3");
    audio.loop = true;
    audio.play().catch(() => {});
    audioRef.current = audio;

    // Auto-decline after 30s
    const timeout = setTimeout(onDecline, 30000);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      clearTimeout(timeout);
    };
  }, [onDecline]);

  const colors = ["#5865f2", "#eb459e", "#fee75c", "#57f287", "#ed4245"];
  const colorIndex = callerName.charCodeAt(0) % colors.length;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: 340,
        background: "#1e1f22",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 10000,
        overflow: "hidden",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Green accent bar */}
      <div style={{ height: 4, background: "#23a55a", animation: "pulse 2s infinite" }} />

      <div style={{ padding: 20 }}>
        {/* Caller info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%",
              background: callerAvatar ? `url(${callerAvatar}) center/cover` : colors[colorIndex],
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 22,
              boxShadow: "0 0 0 3px rgba(35,165,90,0.4)",
            }}
          >
            {!callerAvatar && callerName[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{callerName}</div>
            <div style={{ fontSize: 13, color: "#b5bac1", marginTop: 2 }}>
              Incoming {callType} call...
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { audioRef.current?.pause(); onDecline(); }}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              border: "none", cursor: "pointer",
              background: "#f23f43", color: "#fff",
              fontWeight: 600, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "filter 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" />
            </svg>
            Decline
          </button>
          <button
            onClick={() => { audioRef.current?.pause(); onAccept(); }}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              border: "none", cursor: "pointer",
              background: "#23a55a", color: "#fff",
              fontWeight: 600, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "filter 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}