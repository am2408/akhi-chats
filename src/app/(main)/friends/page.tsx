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

type TabType = "online" | "all" | "pending" | "blocked" | "add";

function Avatar({ avatar, username, size, status }: { avatar: string | null; username: string; size: number; status?: string }) {
  const statusColor = (s: string) => {
    if (s === "online") return "var(--dc-status-online)";
    if (s === "idle") return "var(--dc-status-idle)";
    if (s === "dnd") return "var(--dc-status-dnd)";
    return "var(--dc-status-offline)";
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: avatar ? `url(${avatar}) center/cover` : "var(--dc-brand)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 600, fontSize: Math.round(size * 0.4),
      }}>
        {!avatar && username[0].toUpperCase()}
      </div>
      {status && (
        <div style={{
          position: "absolute", bottom: -1, right: -1,
          width: 14, height: 14, borderRadius: "50%",
          background: statusColor(status),
          border: "3px solid var(--dc-bg-primary)",
        }} />
      )}
    </div>
  );
}

function FriendRow({ friend, onMessage, onRemove }: { friend: Friend; onMessage: () => void; onRemove: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px", borderRadius: 8, borderTop: "1px solid var(--dc-divider)",
      cursor: "pointer", transition: "background 0.1s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar avatar={friend.avatar} username={friend.username} size={40} status={friend.status} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{friend.username}</div>
          <div style={{ fontSize: 12, color: "var(--dc-text-muted)", textTransform: "capitalize" }}>{friend.status}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={(e) => { e.stopPropagation(); onMessage(); }} title="Message" style={{
          width: 36, height: 36, borderRadius: "50%", background: "var(--dc-bg-secondary)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, color: "var(--dc-text-secondary)",
        }}>💬</button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove" style={{
          width: 36, height: 36, borderRadius: "50%", background: "var(--dc-bg-secondary)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, color: "var(--dc-text-secondary)",
        }}>✕</button>
      </div>
    </div>
  );
}

function PendingRow({ friend, onAccept, onDecline }: { friend: Friend; onAccept: () => void; onDecline: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px", borderRadius: 8, borderTop: "1px solid var(--dc-divider)",
      transition: "background 0.1s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar avatar={null} username={friend.username} size={40} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{friend.username}</div>
          <div style={{ fontSize: 12, color: "var(--dc-text-muted)" }}>Incoming Friend Request</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onAccept} title="Accept" style={{
          width: 36, height: 36, borderRadius: "50%", background: "var(--dc-bg-secondary)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, color: "var(--dc-text-secondary)",
        }}>✓</button>
        <button onClick={onDecline} title="Decline" style={{
          width: 36, height: 36, borderRadius: "50%", background: "var(--dc-bg-secondary)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, color: "var(--dc-text-secondary)",
        }}>✕</button>
      </div>
    </div>
  );
}

function SearchResultRow({ user, onAdd }: { user: SearchUser; onAdd: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", borderRadius: 8, borderTop: "1px solid var(--dc-divider)",
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar avatar={user.avatar} username={user.username} size={40} status={user.status} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>{user.username}</span>
      </div>
      <button onClick={onAdd} style={{
        padding: "6px 16px", borderRadius: 4, border: "1px solid var(--dc-green)",
        background: "transparent", color: "var(--dc-green)", cursor: "pointer",
        fontWeight: 600, fontSize: 13,
      }}>Send Friend Request</button>
    </div>
  );
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--dc-text-muted)" }}>
      <div style={{ fontSize: 80, marginBottom: 16, opacity: 0.3 }}>{emoji}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabType>("online");
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
      showToast("Friend request sent!", "success");
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

  const tabs: { key: TabType; label: string; count?: number; green?: boolean }[] = [
    { key: "online", label: "Online" },
    { key: "all", label: "All" },
    { key: "pending", label: "Pending", count: pendingFriends.length },
    { key: "blocked", label: "Blocked" },
    { key: "add", label: "Add Friend", green: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top bar */}
      <div style={{
        height: 48, borderBottom: "1px solid var(--dc-bg-tertiary)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          paddingRight: 16, borderRight: "1px solid var(--dc-divider)",
        }}>
          <span style={{ fontSize: 20 }}>👥</span>
          <span style={{ fontWeight: 700, color: "var(--dc-text-primary)", fontSize: 15 }}>Friends</span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              data-tab={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "2px 8px", borderRadius: 4, border: "none", cursor: "pointer",
                fontWeight: 500, fontSize: 14,
                background: tab === t.key && !t.green ? "var(--dc-bg-active)" : "transparent",
                color: tab === t.key
                  ? (t.green ? "var(--dc-green)" : "var(--dc-text-primary)")
                  : (t.green ? "var(--dc-green)" : "var(--dc-text-secondary)"),
                display: "flex", alignItems: "center", gap: 4, lineHeight: "22px",
              }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span style={{
                  background: "var(--dc-red)", color: "#fff", borderRadius: 8,
                  padding: "0 5px", fontSize: 11, fontWeight: 700, minWidth: 16, textAlign: "center",
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          padding: "8px 16px",
          background: toast.type === "success" ? "var(--dc-green)" : "var(--dc-red)",
          color: "#fff", fontSize: 14, fontWeight: 500, textAlign: "center",
        }}>{toast.msg}</div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 16px 30px" }}>

        {tab === "add" && (
          <div>
            <h2 style={{
              fontSize: 15, fontWeight: 700, textTransform: "uppercase",
              color: "var(--dc-text-primary)", marginBottom: 8,
            }}>Add Friend</h2>
            <p style={{ fontSize: 14, color: "var(--dc-text-secondary)", marginBottom: 16 }}>
              You can add friends by their username.
            </p>

            <div style={{
              display: "flex", background: "var(--dc-input-bg)", borderRadius: 8,
              border: "1px solid var(--dc-input-bg)", padding: "0 4px 0 16px",
              alignItems: "center", marginBottom: 24,
            }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="You can add friends by their username or email."
                style={{
                  flex: 1, padding: "12px 0", background: "transparent",
                  border: "none", outline: "none", fontSize: 15, color: "var(--dc-text-primary)",
                }}
              />
              <button
                disabled={searchQuery.length < 2}
                style={{
                  padding: "6px 16px", borderRadius: 4, border: "none", background: "var(--dc-brand)",
                  opacity: searchQuery.length >= 2 ? 1 : 0.5, color: "#fff",
                  fontSize: 13, fontWeight: 600,
                  cursor: searchQuery.length >= 2 ? "pointer" : "not-allowed",
                }}
              >Search</button>
            </div>

            <div style={{ borderTop: "1px solid var(--dc-divider)", paddingTop: 16 }}>
              {searchLoading && (
                <div style={{ textAlign: "center", color: "var(--dc-text-muted)", padding: 20 }}>
                  Searching...
                </div>
              )}

              {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                <EmptyState emoji="🔍" text="Wumpus looked, but couldn't find anyone with that name." />
              )}

              {searchResults.map((u) => (
                <SearchResultRow key={u.id} user={u} onAdd={() => addFriend(u.id)} />
              ))}

              {searchQuery.length < 2 && !searchLoading && (
                <EmptyState emoji="🤝" text="Type a username above to search for friends" />
              )}
            </div>
          </div>
        )}

        {(tab === "all" || tab === "online") && (
          <div>
            <h3 style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              color: "var(--dc-text-muted)", marginBottom: 8, letterSpacing: "0.02em", paddingLeft: 4,
            }}>
              {tab === "online" ? "Online" : "All Friends"} — {displayFriends.length}
            </h3>

            {displayFriends.length === 0 && (
              <EmptyState
                emoji={tab === "online" ? "😴" : "👥"}
                text={tab === "online"
                  ? "No one's around to play with Wumpus."
                  : "You don't have any friends yet. Click \"Add Friend\" to get started!"}
              />
            )}

            {displayFriends.map((friend) => (
              <FriendRow
                key={friend.friendshipId}
                friend={friend}
                onMessage={() => router.push(`/dm/${friend.id}`)}
                onRemove={() => removeFriend(friend.friendshipId)}
              />
            ))}
          </div>
        )}

        {tab === "pending" && (
          <div>
            <h3 style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              color: "var(--dc-text-muted)", marginBottom: 8, letterSpacing: "0.02em", paddingLeft: 4,
            }}>
              Pending — {pendingFriends.length}
            </h3>

            {pendingFriends.length === 0 && (
              <EmptyState emoji="📭" text="There are no pending friend requests. Here's Wumpus for now." />
            )}

            {pendingFriends.map((friend) => (
              <PendingRow
                key={friend.friendshipId}
                friend={friend}
                onAccept={() => acceptFriend(friend.friendshipId)}
                onDecline={() => removeFriend(friend.friendshipId)}
              />
            ))}
          </div>
        )}

        {tab === "blocked" && (
          <EmptyState emoji="🚫" text="You can't unblock the Wumpus." />
        )}
      </div>
    </div>
  );
}