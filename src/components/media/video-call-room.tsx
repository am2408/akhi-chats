"use client";

import { useEffect, useRef } from "react";

interface VideoCallRoomProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteUser: { id: string; username: string; avatar: string | null } | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onHangUp: () => void;
}

export default function VideoCallRoom({
  localStream,
  remoteStream,
  remoteUser,
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onHangUp,
}: VideoCallRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number>(0);
  const timerDisplayRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      timerRef.current += 1;
      if (timerDisplayRef.current) {
        const mins = Math.floor(timerRef.current / 60).toString().padStart(2, "0");
        const secs = (timerRef.current % 60).toString().padStart(2, "0");
        timerDisplayRef.current.textContent = `${mins}:${secs}`;
      }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const avatarColors = ["#5865f2", "#eb459e", "#fee75c", "#57f287", "#ed4245"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#000", display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", background: "rgba(0,0,0,0.6)", zIndex: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#23a55a",
            boxShadow: "0 0 6px #23a55a",
          }} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
            {remoteUser?.username || "Call"}
          </span>
        </div>
        <div ref={timerDisplayRef} style={{ color: "#b5bac1", fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          00:00
        </div>
      </div>

      {/* Video area */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Remote video (main) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: remoteUser?.avatar
                ? `url(${remoteUser.avatar}) center/cover`
                : avatarColors[(remoteUser?.username || "U").charCodeAt(0) % 5],
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 48, fontWeight: 700,
              animation: "pulse 2s infinite",
            }}>
              {!remoteUser?.avatar && (remoteUser?.username?.[0] || "U").toUpperCase()}
            </div>
            <span style={{ color: "#b5bac1", fontSize: 16 }}>Connecting...</span>
          </div>
        )}

        {/* Local video (PiP) */}
        <div style={{
          position: "absolute", bottom: 100, right: 20,
          width: 240, height: 180, borderRadius: 12,
          overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)",
          background: "#1e1f22",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          {localStream && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "#2b2d31",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#5865f2", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 22, fontWeight: 700,
              }}>
                You
              </div>
            </div>
          )}

          {/* Mute indicator */}
          {isMuted && (
            <div style={{
              position: "absolute", bottom: 6, left: 6,
              background: "#f23f43", borderRadius: "50%",
              width: 24, height: 24, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zM14.98 11.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5.3c0 3.41 2.72 6.23 6 6.72V21h1.4v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div style={{
        height: 72, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
      }}>
        {/* Mute */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: isMuted ? "#f23f43" : "rgba(255,255,255,0.1)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", transition: "background 0.15s",
          }}
        >
          {isMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zM14.98 11.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5.3c0 3.41 2.72 6.23 6 6.72V21h1.4v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          )}
        </button>

        {/* Camera */}
        <button
          onClick={onToggleCamera}
          title={isCameraOff ? "Turn on camera" : "Turn off camera"}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: isCameraOff ? "#f23f43" : "rgba(255,255,255,0.1)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", transition: "background 0.15s",
          }}
        >
          {isCameraOff ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: isScreenSharing ? "#23a55a" : "rgba(255,255,255,0.1)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", transition: "background 0.15s",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
          </svg>
        </button>

        {/* Hang Up */}
        <button
          onClick={onHangUp}
          title="End call"
          style={{
            width: 56, height: 48, borderRadius: 24,
            background: "#f23f43", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", transition: "filter 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
          onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(35,165,90,0.4); }
          50% { box-shadow: 0 0 0 20px rgba(35,165,90,0); }
        }
      `}</style>
    </div>
  );
}