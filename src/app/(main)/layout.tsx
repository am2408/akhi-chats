"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/use-auth";

interface Server {
  id: string;
  name: string;
  icon: string | null;
}

interface Friend {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
  friendshipId: string;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [dmFriends, setDmFriends] = useState<Friend[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Fetch servers
  useEffect(() => {
    if (!user) return;
    fetch(`/api/servers?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setServers(d.servers || []))
      .catch(() => {});
  }, [user]);

  // Fetch DM friends
  useEffect(() => {
    if (!user) return;
    fetch(`/api/friends?userId=${user.id}&status=accepted`)
      .then((r) => r.json())
      .then((d) => setDmFriends(d.friends || []))
      .catch(() => {});
  }, [user]);

  // Fetch notifications count
  useEffect(() => {
    if (!user) return;
    fetch(`/api/notifications?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        const unread = (d.notifications || []).filter((n: { read: boolean }) => !n.read).length;
        setUnreadNotifs(unread);
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--dc-bg-tertiary)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>💬</div>
          <div style={{ color: "var(--dc-text-muted)", fontSize: "14px" }}>Loading Akhi Chats...</div>
        </div>
      </div>
    );
  }

  const isDMActive = pathname.startsWith("/dm") || pathname === "/friends";

  const statusColor = (s: string) => {
    switch (s) {
      case "online": return "var(--dc-status-online)";
      case "idle": return "var(--dc-status-idle)";
      case "dnd": return "var(--dc-status-dnd)";
      default: return "var(--dc-status-offline)";
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Server bar (far left) ── */}
      <div style={{
        width: "72px",
        background: "var(--dc-bg-tertiary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        gap: "8px",
        flexShrink: 0,
        overflowY: "auto",
      }}>
        {/* DMs / Home button */}
        <button
          onClick={() => router.push("/friends")}
          data-tooltip="Direct Messages"
          className="tooltip tooltip-right"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: isDMActive ? "16px" : "24px",
            background: isDMActive ? "var(--dc-brand)" : "var(--dc-bg-primary)",
            color: isDMActive ? "#fff" : "var(--dc-text-secondary)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            transition: "all 0.2s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!isDMActive) {
              e.currentTarget.style.borderRadius = "16px";
              e.currentTarget.style.background = "var(--dc-brand)";
              e.currentTarget.style.color = "#fff";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDMActive) {
              e.currentTarget.style.borderRadius = "24px";
              e.currentTarget.style.background = "var(--dc-bg-primary)";
              e.currentTarget.style.color = "var(--dc-text-secondary)";
            }
          }}
        >
          💬
          {unreadNotifs > 0 && (
            <span style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              background: "var(--dc-red)",
              color: "#fff",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid var(--dc-bg-tertiary)",
            }}>
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
        </button>

        {/* Divider */}
        <div style={{
          width: "32px",
          height: "2px",
          background: "var(--dc-divider)",
          borderRadius: "1px",
        }} />

        {/* Server icons */}
        {servers.map((server) => {
          const active = pathname.startsWith(`/servers/${server.id}`);
          return (
            <button
              key={server.id}
              onClick={() => router.push(`/servers/${server.id}`)}
              data-tooltip={server.name}
              className="tooltip tooltip-right"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: active ? "16px" : "24px",
                background: server.icon
                  ? `url(${server.icon}) center/cover`
                  : active
                    ? "var(--dc-brand)"
                    : "var(--dc-bg-primary)",
                color: active ? "#fff" : "var(--dc-text-secondary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 600,
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active && !server.icon) {
                  e.currentTarget.style.borderRadius = "16px";
                  e.currentTarget.style.background = "var(--dc-brand)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active && !server.icon) {
                  e.currentTarget.style.borderRadius = "24px";
                  e.currentTarget.style.background = "var(--dc-bg-primary)";
                  e.currentTarget.style.color = "var(--dc-text-secondary)";
                }
              }}
            >
              {!server.icon && server.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </button>
          );
        })}

        {/* Add Server */}
        <button
          onClick={() => router.push("/servers/create")}
          data-tooltip="Add a Server"
          className="tooltip tooltip-right"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "24px",
            background: "var(--dc-bg-primary)",
            color: "var(--dc-green)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderRadius = "16px";
            e.currentTarget.style.background = "var(--dc-green)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderRadius = "24px";
            e.currentTarget.style.background = "var(--dc-bg-primary)";
            e.currentTarget.style.color = "var(--dc-green)";
          }}
        >
          +
        </button>
      </div>

      {/* ── Channel sidebar ── */}
      {isDMActive && (
        <div style={{
          width: "240px",
          background: "var(--dc-bg-secondary)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{ padding: "12px 10px", borderBottom: "1px solid var(--dc-bg-tertiary)" }}>
            <button
              onClick={() => router.push("/friends")}
              style={{
                width: "100%",
                padding: "6px 8px",
                background: "var(--dc-bg-tertiary)",
                border: "none",
                borderRadius: "4px",
                color: "var(--dc-text-muted)",
                fontSize: "13px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Find or start a conversation
            </button>
          </div>

          {/* DM Navigation */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {/* Friends link */}
            <button
              onClick={() => router.push("/friends")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                background: pathname === "/friends" ? "var(--dc-bg-active)" : "transparent",
                color: pathname === "/friends" ? "var(--dc-text-primary)" : "var(--dc-text-secondary)",
                fontSize: "15px",
                fontWeight: pathname === "/friends" ? 600 : 400,
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/friends") {
                  e.currentTarget.style.background = "var(--dc-bg-hover)";
                  e.currentTarget.style.color = "var(--dc-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/friends") {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--dc-text-secondary)";
                }
              }}
            >
              <span style={{ fontSize: "20px" }}>👥</span>
              Friends
            </button>

            {/* DM Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 8px 4px 12px",
            }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--dc-text-muted)",
                letterSpacing: "0.02em",
              }}>
                Direct Messages
              </span>
              <button
                onClick={() => { const t = document.querySelector('[data-tab="add"]') as HTMLButtonElement; if(t) t.click(); else router.push("/friends"); }}
                data-tooltip="Create DM"
                className="tooltip tooltip-top"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--dc-text-muted)",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>

            {/* DM list */}
            {dmFriends.map((friend) => {
              const active = pathname === `/dm/${friend.id}`;
              return (
                <button
                  key={friend.id}
                  onClick={() => router.push(`/dm/${friend.id}`)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    background: active ? "var(--dc-bg-active)" : "transparent",
                    color: active ? "var(--dc-text-primary)" : "var(--dc-text-secondary)",
                    transition: "all 0.1s",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--dc-bg-hover)";
                      e.currentTarget.style.color = "var(--dc-text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--dc-text-secondary)";
                    }
                  }}
                >
                  {/* Avatar with status */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: friend.avatar ? `url(${friend.avatar}) center/cover` : "var(--dc-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      {!friend.avatar && friend.username[0].toUpperCase()}
                    </div>
                    <div style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: statusColor(friend.status),
                      border: "3px solid var(--dc-bg-secondary)",
                    }} />
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: active ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {friend.username}
                  </span>
                </button>
              );
            })}

            {dmFriends.length === 0 && (
              <div style={{ padding: "16px 12px", textAlign: "center", color: "var(--dc-text-muted)", fontSize: "13px" }}>
                No conversations yet
              </div>
            )}
          </div>

          {/* ── User panel (bottom) ── */}
          <div style={{
            padding: "0 8px",
            background: "var(--dc-bg-tertiary)",
            borderTop: "none",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 4px",
              gap: "8px",
            }}>
              {/* Avatar */}
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowUserMenu(!showUserMenu)}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: user.avatar ? `url(${user.avatar}) center/cover` : "var(--dc-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}>
                  {!user.avatar && user.username[0].toUpperCase()}
                </div>
                <div style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--dc-status-online)",
                  border: "2px solid var(--dc-bg-tertiary)",
                }} />
              </div>

              {/* Username */}
              <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setShowUserMenu(!showUserMenu)}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dc-text-primary)", lineHeight: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.username}
                </div>
                <div style={{ fontSize: "11px", color: "var(--dc-text-muted)", lineHeight: "14px" }}>
                  Online
                </div>
              </div>

              {/* Settings buttons */}
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => router.push("/settings")}
                  data-tooltip="User Settings"
                  className="tooltip tooltip-top"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--dc-text-muted)",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-bg-hover)"; e.currentTarget.style.color = "var(--dc-text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dc-text-muted)"; }}
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* User menu popup */}
            {showUserMenu && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowUserMenu(false)} />
                <div className="animate-scale-in" style={{
                  position: "absolute",
                  bottom: "56px",
                  left: "80px",
                  width: "300px",
                  background: "var(--dc-bg-floating)",
                  borderRadius: "8px",
                  padding: "8px 0",
                  zIndex: 999,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>
                  {/* Profile card */}
                  <div style={{ padding: "12px" }}>
                    <div style={{
                      background: "var(--dc-brand)",
                      height: "60px",
                      borderRadius: "8px 8px 0 0",
                      position: "relative",
                    }}>
                      <div style={{
                        position: "absolute",
                        bottom: "-24px",
                        left: "16px",
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: user.avatar ? `url(${user.avatar}) center/cover` : "var(--dc-brand)",
                        border: "4px solid var(--dc-bg-floating)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "22px",
                        fontWeight: 600,
                      }}>
                        {!user.avatar && user.username[0].toUpperCase()}
                      </div>
                    </div>
                    <div style={{ marginTop: "32px", padding: "0 4px" }}>
                      <div style={{ fontWeight: 700, fontSize: "20px" }}>{user.username}</div>
                      <div style={{ color: "var(--dc-text-muted)", fontSize: "13px" }}>{user.email}</div>
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "var(--dc-divider)", margin: "4px 12px" }} />

                  <button
                    onClick={() => { setShowUserMenu(false); router.push("/settings"); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--dc-text-secondary)",
                      fontSize: "14px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-brand)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dc-text-secondary)"; }}
                  >
                    ⚙️ Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--dc-red)",
                      fontSize: "14px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-red)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dc-red)"; }}
                  >
                    🚪 Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}