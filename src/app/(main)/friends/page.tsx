"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/use-auth";

interface Friend {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
  friendshipId: string;
  friendshipStatus: string;
}

interface SearchUser {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"online" | "all" | "pending" | "blocked" | "add">("online");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const fetchFriends = useCallback(() => {
    if (!user) return;
    fetch(`/api/friends?userId=${user.id}&status=accepted`)
      .then((r) => r.json())
      .then((d) => setFriends(d.friends || []))
      .catch(console.error);
  }, [user]);

  const fetchPending = useCallback(() => {
    if (!user) return;
    fetch(`/api/friends?userId=${user.id}&status=pending`)
      .then((r) => r.json())
      .then((d) => setPendingFriends(d.friends || []))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    fetchFriends();
    fetchPending();
    const interval = setInterval(() => { fetchFriends(); fetchPending(); }, 10000);
    return () => clearInterval(interval);
  }, [fetchFriends, fetchPending]);

  // Live search
  useEffect(() => {
    if (tab !== "add" || searchQuery.length < 2 || !user) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.users || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, tab, user]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addFriend = async (friendId: string) => {
    if (!user) return;
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, friendId }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Friend request sent!`, "success");
      setSearchResults((prev) => prev.filter((u) => u.id !== friendId));
    } else {
      showToast(data.error || "Failed", "error");
    }
  };

  const acceptFriend = async (friendshipId: string) => {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, status: "accepted" }),
    });
    showToast("Friend request accepted!", "success");
    fetchFriends();
    fetchPending();
  };

  const removeFriend = async (friendshipId: string) => {
    await fetch(`/api/friends?friendshipId=${friendshipId}`, { method: "DELETE" });
    setFriends((p) => p.filter((f) => f.friendshipId !== friendshipId));
    setPendingFriends((p) => p.filter((f) => f.friendshipId !== friendshipId));
    showToast("Removed", "success");
  };

  if (authLoading || !user) return null;

  const onlineFriends = friends.filter((f) => f.status === "online");
  const displayFriends = tab === "online" ? onlineFriends : friends;

  const statusColor = (s: string) => {
    switch (s) {
      case "online": return "var(--dc-status-online)";
      case "idle": return "var(--dc-status-idle)";
      case "dnd": return "var(--dc-status-dnd)";
      default: return "var(--dc-status-offline)";
    }
  };

  type TabType = "online" | "all" | "pending" | "blocked" | "add";
  const tabs: { key: TabType; label: string; count?: number; green?: boolean }[] = [
    { key: "online", label: "Online" },
    { key: "all", label: "All" },
    { key: "pending", label: "Pending", count: pendingFriends.length },
    { key: "blocked", label: "Blocked" },
    { key: "add", label: "Add Friend", green: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Top bar ── */}
      <div style={{
        height: "48px",
        borderBottom: "1px solid var(--dc-bg-tertiary)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "16px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingRight: "16px", borderRight: "1px solid var(--dc-divider)" }}>
          <span style={{ fontSize: "20px" }}>👥</span>
          <span style={{ fontWeight: 700, color: "var(--dc-text-primary)", fontSize: "15px" }}>Friends</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              data-tab={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
                background: tab === t.key
                  ? t.green ? "transparent" : "var(--dc-bg-active)"
                  : "transparent",
                color: tab === t.key
                  ? t.green ? "var(--dc-green)" : "var(--dc-text-primary)"
                  : t.green ? "var(--dc-green)" : "var(--dc-text-secondary)",
                transition: "all 0.1s",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                lineHeight: "22px",
              }}
              onMouseEnter={(e) => {
                if (tab !== t.key) {
                  e.currentTarget.style.background = "var(--dc-bg-hover)";
                  e.currentTarget.style.color = "var(--dc-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== t.key) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = t.green ? "var(--dc-green)" : "var(--dc-text-secondary)";
                }
              }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span style={{
                  background: "var(--dc-red)",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "0 5px",
                  fontSize: "11px",
                  fontWeight: 700,
                  minWidth: "16px",
                  textAlign: "center",
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="animate-fade-in" style={{
          padding: "8px 16px",
          background: toast.type === "success" ? "var(--dc-green)" : "var(--dc-red)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "center",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 16px 30px" }}>

        {/* ADD FRIEND */}
        {tab === "add" && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "15px", fontWeight: 700, textTransform: "uppercase", color: "var(--dc-text-primary)", marginBottom: "8px" }}>
              Add Friend
            </h2>
            <p style={{ fontSize: "14px", color: "var(--dc-text-secondary)", marginBottom: "16px" }}>
              You can add friends by their username.
            </p>

            <div style={{
              display: "flex",
              background: "var(--dc-input-bg)",
              borderRadius: "8px",
              border: "1px solid var(--dc-input-bg)",
              padding: "0 4px 0 16px",
              alignItems: "center",
              marginBottom: "24px",
              transition: "border-color 0.15s",
            }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="You can add friends by their username or email."
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  color: "var(--dc-text-primary)",
                }}
              />
              <button
                disabled={searchQuery.length < 2}
                style={{
                  padding: "6px 16px",
                  borderRadius: "4px",
                  border: "none",
                  background: searchQuery.length >= 2 ? "var(--dc-brand)" : "var(--dc-brand)",
                  opacity: searchQuery.length >= 2 ? 1 : 0.5,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: searchQuery.length >= 2 ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </button>
            </div>

            <div style={{ borderTop: "1px solid var(--dc-divider)", paddingTop: "16px" }}>
              {searchLoading && (
                <div style={{ textAlign: "center", color: "var(--dc-text-muted)", padding: "20px" }}>
                  <span style={{ animation: "pulse 1s infinite" }}>Searching...</span>
                </div>
              )}

              {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--dc-text-muted)" }}>
                  <div style={{ fontSize: "60px", marginBottom: "16px", opacity: 0.4 }}>🔍</div>
                  <p>Wumpus looked, but couldn&apos;t find anyone with that name.</p>
                </div>
              )}

              {searchResults.map((u) => (
                <div
                  key={u.id}
                  className="animate-fade-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    borderTop: "1px solid var(--dc-divider)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: u.avatar ? `url(${u.avatar}) center/cover` : "var(--dc-brand)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 600, fontSize: "16px",
                      }}>
                        {!u.avatar && u.username[0].toUpperCase()}
                      </div>
                      <div style={{
                        position: "absolute", bottom: "-1px", right: "-1px",
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: statusColor(u.status),
                        border: "3px solid var(--dc-bg-primary)",
                      }} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>{u.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addFriend(u.id)}
                    style={{
                      padding: "6px 16px", borderRadius: "4px", border: "1px solid var(--dc-green)",
                      background: "transparent", color: "var(--dc-green)",
                      cursor: "pointer", fontWeight: 600, fontSize: "13px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-green)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dc-green)"; }}
                  >
                    Send Friend Request
                  </button>
                </div>
              ))}
            </div>

            {searchQuery.length < 2 && (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--dc-text-muted)" }}>
                <div style={{ fontSize: "80px", marginBottom: "16px", opacity: 0.3 }}>🤝</div>
                <p style={{ fontSize: "14px" }}>Type a username above to search for friends</p>
              </div>
            )}
          </div>
        )}

        {/* ALL / ONLINE */}
        {(tab === "all" || tab === "online") && (
          <div className="animate-fade-in">
            <h3 style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              color: "var(--dc-text-muted)", marginBottom: "8px", letterSpacing: "0.02em",
              padding: "0 0 0 4px",
            }}>
              {tab === "online" ? "Online" : "All Friends"} — {displayFriends.length}
            </h3>

            {displayFriends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "var(--dc-text-muted)" }}>
                <div style={{ fontSize: "80px", marginBottom: "16px", opacity: 0.3 }}>
                  {tab === "online" ? "😴" : "👥"}
                </div>
                <p style={{ fontSize: "14px" }}>
                  {tab === "online"
                    ? "No one's around to play with Wumpus."
                    : "You don't have any friends yet. Click \"Add Friend\" to get started!"
                  }
                </p>
              </div>
            ) : (
              displayFriends.map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="animate-fade-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    borderTop: "1px solid var(--dc-divider)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: friend.avatar ? `url(${friend.avatar}) center/cover` : "var(--dc-brand)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 600, fontSize: "16px",
                      }}>
                        {!friend.avatar && friend.username[0].toUpperCase()}
                      </div>
                      <div style={{
                        position: "absolute", bottom: "-1px", right: "-1px",
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: statusColor(friend.status),
                        border: "3px solid var(--dc-bg-primary)",
                      }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{friend.username}</div>
                      <div style={{ fontSize: "12px", color: "var(--dc-text-muted)", textTransform: "capitalize" }}>
                        {friend.status}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/dm/${friend.id}`); }}
                      data-tooltip="Message"
                      className="tooltip tooltip-top"
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--dc-bg-secondary)", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "16px", color: "var(--dc-text-secondary)",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-text-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-secondary)"; }}
                    >
                      💬
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFriend(friend.friendshipId); }}
                      data-tooltip="Remove Friend"
                      className="tooltip tooltip-top"
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--dc-bg-secondary)", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "16px", color: "var(--dc-text-secondary)",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-red)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-secondary)"; }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PENDING */}
        {tab === "pending" && (
          <div className="animate-fade-in">
            <h3 style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              color: "var(--dc-text-muted)", marginBottom: "8px", letterSpacing: "0.02em",
              padding: "0 0 0 4px",
            }}>
              Pending — {pendingFriends.length}
            </h3>

            {pendingFriends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "var(--dc-text-muted)" }}>
                <div style={{ fontSize: "80px", marginBottom: "16px", opacity: 0.3 }}>📭</div>
                <p style={{ fontSize: "14px" }}>There are no pending friend requests. Here&apos;s Wumpus for now.</p>
              </div>
            ) : (
              pendingFriends.map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="animate-fade-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    borderTop: "1px solid var(--dc-divider)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dc-bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "var(--dc-brand)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 600, fontSize: "16px",
                    }}>
                      {friend.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{friend.username}</div>
                      <div style={{ fontSize: "12px", color: "var(--dc-text-muted)" }}>Incoming Friend Request</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => acceptFriend(friend.friendshipId)}
                      data-tooltip="Accept"
                      className="tooltip tooltip-top"
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--dc-bg-secondary)", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "18px", color: "var(--dc-text-secondary)",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-green)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-secondary)"; }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => removeFriend(friend.friendshipId)}
                      data-tooltip="Decline"
                      className="tooltip tooltip-top"
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--dc-bg-secondary)", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "18px", color: "var(--dc-text-secondary)",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dc-red)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dc-text-secondary)"; }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            )}
          </div>
        )}

        {/* BLOCKED */}
        {tab === "blocked" && (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "60px", color: "var(--dc-text-muted)" }}>
            <div style={{ fontSize: "80px", marginBottom: "16px", opacity: 0.3 }}>🚫</div>
            <p style={{ fontSize: "14px" }}>You can&apos;t unblock the Wumpus.</p>
          </div>
        )}
      </div>
    </div>
  );
}