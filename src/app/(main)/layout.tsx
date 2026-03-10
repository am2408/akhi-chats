"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/use-auth";
import useEvents from "@/hooks/use-events";
import useVideoCall from "@/hooks/use-video-call";
import IncomingCallToast from "@/components/media/incoming-call-toast";
import VideoCallRoom from "@/components/media/video-call-room";
import { createContext, useContext } from "react";

/* ─── Call Context ─── */
interface CallContextType {
  startCall: (receiverId: string, type?: "video" | "audio") => Promise<void>;
  callState: { isInCall: boolean; isCalling: boolean };
}

export const CallContext = createContext<CallContextType>({
  startCall: async () => {},
  callState: { isInCall: false, isCalling: false },
});

export function useCallContext() {
  return useContext(CallContext);
}

/* ─── Icons ─── */
const NavIcons = {
  logo: (
    <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
      <path d="M23.02 1.56A22.5 22.5 0 0 0 17.4 0a.08.08 0 0 0-.09.04c-.24.43-.51.99-.7 1.43a20.8 20.8 0 0 0-6.24 0 14.7 14.7 0 0 0-.7-1.43.08.08 0 0 0-.1-.04 22.4 22.4 0 0 0-5.61 1.56.08.08 0 0 0-.04.03C.54 6.77-.33 11.82.1 16.81a.09.09 0 0 0 .03.06 22.7 22.7 0 0 0 6.86 3.1.08.08 0 0 0 .09-.03c.53-.72 1-1.49 1.41-2.29a.08.08 0 0 0-.04-.11 14.9 14.9 0 0 1-2.15-1.03.08.08 0 0 1-.01-.14c.14-.11.29-.22.43-.33a.08.08 0 0 1 .08-.01c4.52 2.07 9.42 2.07 13.89 0a.08.08 0 0 1 .08.01c.14.11.29.23.43.34a.08.08 0 0 1 0 .13c-.69.4-1.4.75-2.16 1.03a.08.08 0 0 0-.04.12c.41.8.88 1.56 1.4 2.28a.08.08 0 0 0 .1.03 22.6 22.6 0 0 0 6.87-3.1.09.09 0 0 0 .04-.05c.52-5.42-.87-10.13-3.69-14.3a.07.07 0 0 0-.03-.04ZM9.35 13.78c-1.24 0-2.26-1.14-2.26-2.53s1-2.53 2.26-2.53c1.27 0 2.28 1.15 2.26 2.53 0 1.4-1 2.53-2.26 2.53Zm8.36 0c-1.24 0-2.26-1.14-2.26-2.53s1-2.53 2.26-2.53c1.27 0 2.28 1.15 2.26 2.53 0 1.4-1 2.53-2.26 2.53Z"/>
    </svg>
  ),
  friends: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-2-4a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
      <path d="M3 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
      <path d="M13 12c-3.87 0-7 2.69-7 6v2h14v-2c0-3.31-3.13-6-7-6zm-5 6c0-2.21 2.24-4 5-4s5 1.79 5 4H8z"/>
      <path d="M7 12c-3.31 0-6 2.24-6 5v2h5v-2c0-1.6.58-3.07 1.54-4.2A7.2 7.2 0 0 0 7 12z"/>
    </svg>
  ),
  chat: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
      <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
    </svg>
  ),
  server: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="9" y1="3" x2="9" y2="15"/><line x1="3" y1="9" x2="15" y2="9"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  ),
  headphone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
    </svg>
  ),
  mic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  ),
};

/* ─── Tooltip ─── */
function SideTooltip({ label, children, show }: { label: string; children: React.ReactNode; show?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
      {(hover || show) && (
        <div style={{
          position: "absolute", left: "calc(100% + 14px)", top: "50%", transform: "translateY(-50%)",
          background: "var(--dc-bg-floating)", color: "var(--dc-text-primary)",
          padding: "8px 12px", borderRadius: 6, fontSize: 14, fontWeight: 600,
          whiteSpace: "nowrap", zIndex: 1000, pointerEvents: "none",
          boxShadow: "0 8px 16px rgba(0,0,0,0.24)",
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

/* ─── Server Icon Button ─── */
function ServerIcon({ active, onClick, children, color }: {
  active?: boolean; onClick: () => void; children: React.ReactNode; color?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Active pill indicator */}
      <div style={{
        position: "absolute", left: 0, width: 4,
        height: active ? 40 : hover ? 20 : 0,
        borderRadius: "0 4px 4px 0",
        background: "var(--dc-text-primary)",
        transition: "height 0.15s",
      }} />
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 48, height: 48,
          borderRadius: active || hover ? 16 : "50%",
          background: active ? (color || "var(--dc-brand)") : hover ? (color || "var(--dc-brand)") : "var(--dc-bg-primary)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: active || hover ? "#fff" : "var(--dc-text-secondary)",
          transition: "border-radius 0.2s, background 0.2s, color 0.2s",
        }}
      >
        {children}
      </button>
    </div>
  );
}

/* ─── Friend Item for DM Sidebar ─── */
interface FriendItem {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  online: "#23a55a", idle: "#f0b232", dnd: "#f23f43", offline: "#80848e",
};

function DMFriendItem({ friend, active, onClick }: { friend: FriendItem; active: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const colors = ["#5865f2", "#eb459e", "#57f287", "#fee75c", "#ed4245"];
  const ci = friend.username.charCodeAt(0) % colors.length;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "6px 8px", borderRadius: 4,
        background: active ? "var(--dc-bg-active)" : hover ? "var(--dc-bg-hover)" : "transparent",
        border: "none", cursor: "pointer", color: active ? "var(--dc-text-primary)" : "var(--dc-text-secondary)",
        transition: "background 0.1s, color 0.1s",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: friend.avatar ? `url(${friend.avatar}) center/cover` : colors[ci],
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 600,
        }}>
          {!friend.avatar && friend.username[0].toUpperCase()}
        </div>
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 10, height: 10, borderRadius: "50%",
          background: STATUS_COLORS[friend.status] || STATUS_COLORS.offline,
          border: "3px solid var(--dc-bg-secondary)",
        }} />
      </div>
      <span style={{ fontWeight: 500, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {friend.username}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                      MAIN LAYOUT                          */
/* ═══════════════════════════════════════════════════════════ */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string; roomId: string; type: "video" | "audio";
    caller: { id: string; username: string; avatar: string | null };
  } | null>(null);

  const {
    callState, localStream, remoteStream, isMuted, isCameraOff, isScreenSharing,
    startCall, acceptCall, declineCall, hangUp,
    toggleMute, toggleCamera, toggleScreenShare, setCallState,
  } = useVideoCall({ userId: user?.id, onCallEnded: () => setIncomingCall(null) });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Fetch accepted friends for DM sidebar
  useEffect(() => {
    if (!user) return;
    fetch(`/api/friends?userId=${user.id}&status=accepted`)
      .then((r) => r.json())
      .then((d) => setFriends(d.friends || []))
      .catch(() => {});
  }, [user]);

  // SSE
  useEvents({
    userId: user?.id,
    onFriendsUpdate: () => {
      if (!user) return;
      fetch(`/api/friends?userId=${user.id}&status=accepted`)
        .then((r) => r.json())
        .then((d) => setFriends(d.friends || []))
        .catch(() => {});
    },
    onStatusUpdate: (data) => {
      const statuses = data as Record<string, string>;
      setFriends((prev) => prev.map((f) => statuses[f.id] !== undefined ? { ...f, status: statuses[f.id] } : f));
    },
    onIncomingCall: (data) => {
      const callData = data as typeof incomingCall;
      if (callData && !callState.isInCall && !callState.isCalling) {
        setIncomingCall(callData);
        setCallState((prev) => ({
          ...prev, isReceiving: true, callId: callData.callId,
          roomId: callData.roomId, remoteUser: callData.caller, callType: callData.type,
        }));
      }
    },
    onCallEnded: () => {
      setIncomingCall(null);
      if (callState.isReceiving) {
        setCallState((prev) => ({ ...prev, isReceiving: false, callId: null, roomId: null }));
      }
    },
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (authLoading || !user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dc-bg-primary)" }}>
        <div style={{ color: "var(--dc-text-muted)", fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  const isOnFriendsOrDM = pathname === "/friends" || pathname.startsWith("/dm/");
  const isOnServers = pathname.startsWith("/servers");
  const isOnSettings = pathname === "/settings";
  const activeFriendId = pathname.startsWith("/dm/") ? pathname.split("/dm/")[1] : null;
  const onlineFriendsCount = friends.filter((f) => f.status === "online").length;

  return (
    <CallContext.Provider value={{ startCall, callState }}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* ═══ Server Bar (72px) ═══ */}
        <div style={{
          width: 72, background: "var(--dc-bg-tertiary)",
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 12, gap: 8, flexShrink: 0, overflowY: "auto",
        }}>
          {/* Home / DMs */}
          <SideTooltip label="Direct Messages">
            <ServerIcon active={isOnFriendsOrDM} onClick={() => router.push("/friends")}>
              {NavIcons.logo}
            </ServerIcon>
          </SideTooltip>

          {/* Divider */}
          <div style={{ width: 32, height: 2, borderRadius: 1, background: "var(--dc-divider)", margin: "0 0 4px" }} />

          {/* Servers */}
          <SideTooltip label="Servers">
            <ServerIcon active={isOnServers} onClick={() => router.push("/servers")} color="#57f287">
              {NavIcons.server}
            </ServerIcon>
          </SideTooltip>

          {/* Add Server */}
          <SideTooltip label="Add a Server">
            <ServerIcon onClick={() => {}} color="#23a55a">
              {NavIcons.plus}
            </ServerIcon>
          </SideTooltip>

          <div style={{ flex: 1 }} />

          {/* Settings */}
          <div style={{ marginBottom: 12 }}>
            <SideTooltip label="Settings">
              <ServerIcon active={isOnSettings} onClick={() => router.push("/settings")} color="#80848e">
                {NavIcons.settings}
              </ServerIcon>
            </SideTooltip>
          </div>
        </div>

        {/* ═══ Channel Sidebar (240px) ═══ */}
        <div style={{
          width: 240, background: "var(--dc-bg-secondary)",
          display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          {/* Sidebar Header */}
          <div style={{
            height: 48, padding: "0 16px",
            display: "flex", alignItems: "center",
            borderBottom: "1px solid rgba(0,0,0,0.24)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.12)",
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--dc-text-primary)" }}>
              {isOnFriendsOrDM ? "Direct Messages" : isOnServers ? "Servers" : "Akhi Chats"}
            </span>
          </div>

          {/* Sidebar Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {/* Friends nav item */}
            {isOnFriendsOrDM && (
              <>
                <button
                  onClick={() => router.push("/friends")}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "6px 8px", borderRadius: 4, marginBottom: 4,
                    background: pathname === "/friends" ? "var(--dc-bg-active)" : "transparent",
                    border: "none", cursor: "pointer",
                    color: pathname === "/friends" ? "var(--dc-text-primary)" : "var(--dc-text-secondary)",
                    fontWeight: 500, fontSize: 15, transition: "background 0.1s",
                  }}
                >
                  {NavIcons.friends}
                  <span>Friends</span>
                  {onlineFriendsCount > 0 && (
                    <span style={{
                      marginLeft: "auto", background: "var(--dc-red)",
                      color: "#fff", borderRadius: 9, padding: "0 6px",
                      fontSize: 12, fontWeight: 700, lineHeight: "18px",
                    }}>
                      {onlineFriendsCount}
                    </span>
                  )}
                </button>

                {/* DM section header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 8px 4px", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.02em",
                  color: "var(--dc-text-muted)",
                }}>
                  <span>Direct Messages</span>
                </div>

                {/* DM friend list */}
                {friends.map((friend) => (
                  <DMFriendItem
                    key={friend.id}
                    friend={friend}
                    active={activeFriendId === friend.id}
                    onClick={() => router.push(`/dm/${friend.id}`)}
                  />
                ))}

                {friends.length === 0 && (
                  <div style={{ padding: "20px 8px", color: "var(--dc-text-muted)", fontSize: 13, textAlign: "center" }}>
                    No conversations yet. Add a friend to start chatting!
                  </div>
                )}
              </>
            )}

            {isOnServers && (
              <div style={{ padding: "8px", color: "var(--dc-text-muted)", fontSize: 13 }}>
                Your servers will appear here.
              </div>
            )}

            {isOnSettings && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "My Account", path: "/settings" },
                ].map((item) => (
                  <button key={item.path} onClick={() => router.push(item.path)} style={{
                    width: "100%", padding: "6px 10px", borderRadius: 4, border: "none",
                    cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 500,
                    background: pathname === item.path ? "var(--dc-bg-active)" : "transparent",
                    color: pathname === item.path ? "var(--dc-text-primary)" : "var(--dc-text-secondary)",
                  }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Panel (bottom) */}
          <div style={{
            height: 52, padding: "0 8px",
            background: "rgba(0,0,0,0.16)",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: user.avatar ? `url(${user.avatar}) center/cover` : "#5865f2",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 600,
              }}>
                {!user.avatar && user.username[0].toUpperCase()}
              </div>
              <div style={{
                position: "absolute", bottom: -2, right: -2,
                width: 10, height: 10, borderRadius: "50%",
                background: "#23a55a", border: "3px solid #232428",
              }} />
            </div>

            {/* Username */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--dc-text-primary)", lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--dc-text-muted)", lineHeight: "14px" }}>
                Online
              </div>
            </div>

            {/* Mic / Headphone / Settings */}
            <button onClick={() => {}} title="Mute" style={{
              width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer",
              background: "transparent", color: "var(--dc-text-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {NavIcons.mic}
            </button>
            <button onClick={() => {}} title="Deafen" style={{
              width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer",
              background: "transparent", color: "var(--dc-text-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {NavIcons.headphone}
            </button>
            <button onClick={handleLogout} title="Log Out" style={{
              width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer",
              background: "transparent", color: "var(--dc-text-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {NavIcons.logout}
            </button>
          </div>
        </div>

        {/* ═══ Main Content ═══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </div>
      </div>

      {/* ─── Call Overlays ─── */}
      {incomingCall && !callState.isInCall && (
        <IncomingCallToast
          callerName={incomingCall.caller.username}
          callerAvatar={incomingCall.caller.avatar}
          callType={incomingCall.type}
          onAccept={() => { acceptCall(incomingCall.callId, incomingCall.type); setIncomingCall(null); }}
          onDecline={() => { declineCall(incomingCall.callId); setIncomingCall(null); }}
        />
      )}

      {callState.isInCall && (
        <VideoCallRoom
          localStream={localStream} remoteStream={remoteStream}
          remoteUser={callState.remoteUser}
          isMuted={isMuted} isCameraOff={isCameraOff} isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute} onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare} onHangUp={hangUp}
        />
      )}

      {callState.isCalling && !callState.isInCall && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.85)", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 20, backdropFilter: "blur(8px)",
        }}>
          <style>{`@keyframes ring { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
          <div style={{
            width: 100, height: 100, borderRadius: "50%", background: "#5865f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 40, fontWeight: 700, animation: "ring 1.5s infinite",
          }}>
            {callState.remoteUser?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>Calling {callState.remoteUser?.username}...</div>
          <div style={{ color: "#b5bac1", fontSize: 14 }}>Ringing</div>
          <button onClick={hangUp} style={{
            marginTop: 20, width: 56, height: 56, borderRadius: "50%",
            background: "#f23f43", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>
        </div>
      )}
    </CallContext.Provider>
  );
}