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
  direction?: "incoming" | "outgoing";
}

interface SearchUser {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
}

type TabType = "online" | "all" | "pending" | "blocked" | "add";

const STATUS_COLORS: Record<string, string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

function AvatarCircle({
  avatar,
  username,
  size,
  status,
}: {
  avatar: string | null;
  username: string;
  size: number;
  status?: string;
}) {
  const colors = ["#5865f2", "#eb459e", "#fee75c", "#57f287", "#ed4245", "#3ba55c"];
  const colorIndex = username.charCodeAt(0) % colors.length;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: avatar ? `url(${avatar}) center/cover` : colors[colorIndex],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: Math.round(size * 0.4),
        }}
      >
        {!avatar && username[0].toUpperCase()}
      </div>
      {status && (
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: size > 32 ? 14 : 10,
            height: size > 32 ? 14 : 10,
            borderRadius: "50%",
            background: STATUS_COLORS[status] || STATUS_COLORS.offline,
            border: `3px solid var(--dc-bg-primary)`,
          }}
        />
      )}
    </div>
  );
}

function IconButton({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--dc-bg-tertiary)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: danger ? "#f23f43" : "var(--dc-text-secondary)",
        transition: "color 0.15s, background 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

// SVG Icons instead of emoji
const Icons = {
  friends: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-2-4a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/>
      <path d="M3 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
      <path d="M13 12c-3.87 0-7 2.69-7 6v2h14v-2c0-3.31-3.13-6-7-6Zm-5 6c0-2.21 2.24-4 5-4s5 1.79 5 4H8Z"/>
      <path d="M7 12c-3.31 0-6 2.24-6 5v2h5v-2c0-1.6.58-3.07 1.54-4.2A7.2 7.2 0 0 0 7 12Z"/>
    </svg>
  ),
  message: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0.5,1.5 L15.5,1.5 L15.5,11.5 L9,11.5 L5.5,14.5 L5.5,11.5 L0.5,11.5Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,9 7,13 15,5"/>
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="4" x2="14" y2="14"/>
      <line x1="14" y1="4" x2="4" y2="14"/>
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="5"/>
      <line x1="12" y1="12" x2="16" y2="16"/>
    </svg>
  ),
  add: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="3" x2="9" y2="15"/>
      <line x1="3" y1="9" x2="15" y2="9"/>
    </svg>
  ),
};

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabType>("online");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

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
    const interval = setInterval(() => {
      fetchFriends();
      fetchPending();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchFriends, fetchPending]);

  useEffect(() => {
    if (tab !== "add" || searchQuery.length < 2 || !user) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}&userId=${user.id}`
      )
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
      showToast(data.message || "Friend request sent!", "success");
      setSearchResults((prev) => prev.filter((u) => u.id !== friendId));
      fetchPending();
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
    await fetch(`/api/friends?friendshipId=${friendshipId}`, {
      method: "DELETE",
    });
    setFriends((p) => p.filter((f) => f.friendshipId !== friendshipId));
    setPendingFriends((p) => p.filter((f) => f.friendshipId !== friendshipId));
    showToast("Removed", "success");
  };

  if (authLoading || !user) return null;

  const onlineFriends = friends.filter((f) => f.status === "online");
  const displayFriends = tab === "online" ? onlineFriends : friends;
  const incomingPending = pendingFriends.filter(
    (f) => f.direction === "incoming"
  );
  const outgoingPending = pendingFriends.filter(
    (f) => f.direction === "outgoing"
  );

  const tabs: {
    key: TabType;
    label: string;
    count?: number;
    green?: boolean;
  }[] = [
    { key: "online", label: "Online" },
    { key: "all", label: "All" },
    { key: "pending", label: "Pending", count: incomingPending.length },
    { key: "blocked", label: "Blocked" },
    { key: "add", label: "Add Friend", green: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top bar */}
      <div
        style={{
          height: 48,
          borderBottom: "1px solid var(--dc-bg-tertiary)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingRight: 16,
            borderRight: "1px solid var(--dc-divider)",
            color: "var(--dc-text-secondary)",
          }}
        >
          {Icons.friends}
          <span
            style={{
              fontWeight: 700,
              color: "var(--dc-text-primary)",
              fontSize: 15,
            }}
          >
            Friends
          </span>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
                background:
                  tab === t.key && !t.green
                    ? "var(--dc-bg-active)"
                    : "transparent",
                color:
                  tab === t.key
                    ? t.green
                      ? "#23a55a"
                      : "var(--dc-text-primary)"
                    : t.green
                      ? "#23a55a"
                      : "var(--dc-text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                lineHeight: "22px",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  style={{
                    background: "#f23f43",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "0 5px",
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 16,
                    textAlign: "center",
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            padding: "8px 16px",
            background: toast.type === "success" ? "#23a55a" : "#f23f43",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 16px 30px" }}>
        {/* ==================== ADD FRIEND TAB ==================== */}
        {tab === "add" && (
          <div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--dc-text-primary)",
                marginBottom: 8,
              }}
            >
              Add Friend
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--dc-text-secondary)",
                marginBottom: 16,
              }}
            >
              You can add friends by their username.
            </p>

            <div
              style={{
                display: "flex",
                background: "var(--dc-input-bg)",
                borderRadius: 8,
                border: "1px solid var(--dc-input-bg)",
                padding: "0 4px 0 16px",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="You can add friends by their username..."
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "var(--dc-text-primary)",
                }}
              />
              <button
                disabled={searchQuery.length < 2}
                style={{
                  padding: "6px 16px",
                  borderRadius: 4,
                  border: "none",
                  background: "#5865f2",
                  opacity: searchQuery.length >= 2 ? 1 : 0.5,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: searchQuery.length >= 2 ? "pointer" : "not-allowed",
                }}
              >
                Search
              </button>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--dc-divider)",
                paddingTop: 16,
              }}
            >
              {searchLoading && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--dc-text-muted)",
                    padding: 20,
                  }}
                >
                  Searching...
                </div>
              )}

              {!searchLoading &&
                searchResults.length === 0 &&
                searchQuery.length >= 2 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--dc-text-muted)",
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>{Icons.search}</div>
                    <p>
                      Wumpus looked, but couldn&apos;t find anyone with that
                      name.
                    </p>
                  </div>
                )}

              {searchResults.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    borderTop: "1px solid var(--dc-divider)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <AvatarCircle
                      avatar={u.avatar}
                      username={u.username}
                      size={40}
                      status={u.status}
                    />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {u.username}
                    </span>
                  </div>
                  <button
                    onClick={() => addFriend(u.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 4,
                      border: "1px solid #23a55a",
                      background: "transparent",
                      color: "#23a55a",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      transition: "background 0.15s",
                    }}
                  >
                    Send Friend Request
                  </button>
                </div>
              ))}

              {searchQuery.length < 2 && !searchLoading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--dc-text-muted)",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 16,
                      opacity: 0.5,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {Icons.friends}
                  </div>
                  <p style={{ fontSize: 14 }}>
                    Type a username above to search for friends
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== ALL / ONLINE ==================== */}
        {(tab === "all" || tab === "online") && (
          <div>
            <h3
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--dc-text-muted)",
                marginBottom: 8,
                letterSpacing: "0.02em",
                paddingLeft: 4,
              }}
            >
              {tab === "online" ? "Online" : "All Friends"} —{" "}
              {displayFriends.length}
            </h3>

            {displayFriends.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: "var(--dc-text-muted)",
                }}
              >
                <div
                  style={{
                    marginBottom: 16,
                    opacity: 0.3,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {Icons.friends}
                </div>
                <p style={{ fontSize: 14 }}>
                  {tab === "online"
                    ? "No one is online right now."
                    : "You don't have any friends yet. Click \"Add Friend\" to get started!"}
                </p>
              </div>
            )}

            {displayFriends.map((friend) => (
              <div
                key={friend.friendshipId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  borderTop: "1px solid var(--dc-divider)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <AvatarCircle
                    avatar={friend.avatar}
                    username={friend.username}
                    size={40}
                    status={friend.status}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {friend.username}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--dc-text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {friend.status}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <IconButton
                    icon={Icons.message}
                    title="Message"
                    onClick={() => router.push(`/dm/${friend.id}`)}
                  />
                  <IconButton
                    icon={Icons.close}
                    title="Remove Friend"
                    onClick={() => removeFriend(friend.friendshipId)}
                    danger
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== PENDING ==================== */}
        {tab === "pending" && (
          <div>
            {/* Incoming requests */}
            {incomingPending.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--dc-text-muted)",
                    marginBottom: 8,
                    letterSpacing: "0.02em",
                    paddingLeft: 4,
                  }}
                >
                  Incoming — {incomingPending.length}
                </h3>

                {incomingPending.map((friend) => (
                  <div
                    key={friend.friendshipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 8,
                      borderTop: "1px solid var(--dc-divider)",
                      transition: "background 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <AvatarCircle
                        avatar={friend.avatar}
                        username={friend.username}
                        size={40}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {friend.username}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--dc-text-muted)",
                          }}
                        >
                          Incoming Friend Request
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <IconButton
                        icon={Icons.check}
                        title="Accept"
                        onClick={() => acceptFriend(friend.friendshipId)}
                      />
                      <IconButton
                        icon={Icons.close}
                        title="Decline"
                        onClick={() => removeFriend(friend.friendshipId)}
                        danger
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Outgoing requests */}
            {outgoingPending.length > 0 && (
              <div style={{ marginTop: incomingPending.length > 0 ? 24 : 0 }}>
                <h3
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--dc-text-muted)",
                    marginBottom: 8,
                    letterSpacing: "0.02em",
                    paddingLeft: 4,
                  }}
                >
                  Outgoing — {outgoingPending.length}
                </h3>

                {outgoingPending.map((friend) => (
                  <div
                    key={friend.friendshipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 8,
                      borderTop: "1px solid var(--dc-divider)",
                      transition: "background 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <AvatarCircle
                        avatar={friend.avatar}
                        username={friend.username}
                        size={40}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {friend.username}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--dc-text-muted)",
                          }}
                        >
                          Outgoing Friend Request
                        </div>
                      </div>
                    </div>

                    <IconButton
                      icon={Icons.close}
                      title="Cancel"
                      onClick={() => removeFriend(friend.friendshipId)}
                      danger
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {pendingFriends.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: "var(--dc-text-muted)",
                }}
              >
                <div
                  style={{
                    marginBottom: 16,
                    opacity: 0.3,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {Icons.friends}
                </div>
                <p style={{ fontSize: 14 }}>
                  There are no pending friend requests. Here&apos;s Wumpus for
                  now.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== BLOCKED ==================== */}
        {tab === "blocked" && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "var(--dc-text-muted)",
            }}
          >
            <div
              style={{
                marginBottom: 16,
                opacity: 0.3,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {Icons.close}
            </div>
            <p style={{ fontSize: 14 }}>
              You can&apos;t unblock the Wumpus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}