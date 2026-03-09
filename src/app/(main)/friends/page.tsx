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
  const [tab, setTab] = useState<"all" | "pending" | "add">("all");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch accepted friends
  const fetchFriends = useCallback(() => {
    if (!user) return;
    fetch(`/api/friends?userId=${user.id}&status=accepted`)
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []))
      .catch(console.error);
  }, [user]);

  // Fetch pending friends
  const fetchPending = useCallback(() => {
    if (!user) return;
    fetch(`/api/friends?userId=${user.id}&status=pending`)
      .then((res) => res.json())
      .then((data) => setPendingFriends(data.friends || []))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, [fetchFriends, fetchPending]);

  // Live search — triggers as you type (debounced)
  useEffect(() => {
    if (tab !== "add" || searchQuery.length < 2 || !user) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearchLoading(true);
      fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data.users || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, tab, user]);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  // Send friend request
  const addFriend = async (friendId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, friendId }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("Friend request sent!", "success");
        setSearchResults((prev) => prev.filter((u) => u.id !== friendId));
      } else {
        showMessage(data.error || "Failed to send request", "error");
      }
    } catch {
      showMessage("Something went wrong", "error");
    }
  };

  // Accept friend request
  const acceptFriend = async (friendshipId: string) => {
    try {
      await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, status: "accepted" }),
      });
      showMessage("Friend request accepted!", "success");
      fetchFriends();
      fetchPending();
    } catch {
      showMessage("Failed to accept", "error");
    }
  };

  // Remove / decline friend
  const removeFriend = async (friendshipId: string) => {
    try {
      await fetch(`/api/friends?friendshipId=${friendshipId}`, { method: "DELETE" });
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      setPendingFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      showMessage("Removed", "success");
    } catch {
      showMessage("Failed to remove", "error");
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#5c5e66" }}>
        Loading...
      </div>
    );
  }

  if (!user) return null;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    background: active ? "#5865f2" : "transparent",
    color: active ? "#fff" : "#4e5058",
    transition: "all 0.2s",
  });

  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "#f2f3f5",
    borderRadius: "8px",
    marginBottom: "8px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#5865f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 600,
    fontSize: "16px",
    marginRight: "12px",
    flexShrink: 0,
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    background: color,
    color: "#fff",
    marginLeft: "8px",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ height: "48px", borderBottom: "1px solid #e1e2e4", display: "flex", alignItems: "center", padding: "0 16px", gap: "8px" }}>
        <span style={{ fontWeight: 700, marginRight: "16px" }}>👥 Friends</span>
        <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>All</button>
        <button style={tabStyle(tab === "pending")} onClick={() => setTab("pending")}>
          Pending {pendingFriends.length > 0 && `(${pendingFriends.length})`}
        </button>
        <button style={tabStyle(tab === "add")} onClick={() => setTab("add")}>Add Friend</button>
      </div>

      {/* Toast */}
      {message && (
        <div style={{ padding: "10px 16px", background: messageType === "success" ? "#23a55a" : "#da373c", color: "#fff", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
          {message}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 24px", overflowY: "auto" }}>
        {/* ALL */}
        {tab === "all" && (
          <>
            <h3 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#5c5e66", marginBottom: "12px" }}>
              All Friends — {friends.length}
            </h3>
            {friends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#5c5e66" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>👥</div>
                <p>No friends yet. Click &quot;Add Friend&quot; to find people!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.friendshipId} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={avatarStyle}>
                      {friend.avatar ? (
                        <img src={friend.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                      ) : (
                        friend.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{friend.username}</div>
                      <div style={{ fontSize: "12px", color: friend.status === "online" ? "#23a55a" : "#80848e" }}>
                        {friend.status}
                      </div>
                    </div>
                  </div>
                  <div>
                    <button style={btnStyle("#5865f2")} onClick={() => router.push(`/dm/${friend.id}`)}>
                      💬 Message
                    </button>
                    <button style={btnStyle("#da373c")} onClick={() => removeFriend(friend.friendshipId)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* PENDING */}
        {tab === "pending" && (
          <>
            <h3 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#5c5e66", marginBottom: "12px" }}>
              Pending — {pendingFriends.length}
            </h3>
            {pendingFriends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#5c5e66" }}>
                <p>No pending friend requests.</p>
              </div>
            ) : (
              pendingFriends.map((friend) => (
                <div key={friend.friendshipId} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={avatarStyle}>{friend.username.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{friend.username}</div>
                      <div style={{ fontSize: "12px", color: "#5c5e66" }}>Incoming friend request</div>
                    </div>
                  </div>
                  <div>
                    <button style={btnStyle("#23a55a")} onClick={() => acceptFriend(friend.friendshipId)}>✓ Accept</button>
                    <button style={btnStyle("#da373c")} onClick={() => removeFriend(friend.friendshipId)}>✗ Decline</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ADD FRIEND */}
        {tab === "add" && (
          <>
            <h3 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#5c5e66", marginBottom: "12px" }}>
              Add Friend
            </h3>
            <p style={{ fontSize: "14px", color: "#4e5058", marginBottom: "16px" }}>
              Start typing a username or email to search.
            </p>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or email..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #e1e2e4",
                fontSize: "14px",
                outline: "none",
                background: "#ebedef",
                marginBottom: "24px",
                boxSizing: "border-box",
              }}
            />

            {searchLoading && <p style={{ color: "#5c5e66" }}>Searching...</p>}

            {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#5c5e66" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <p>No users found for &quot;{searchQuery}&quot;</p>
              </div>
            )}

            {searchResults.map((u) => (
              <div key={u.id} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={avatarStyle}>
                    {u.avatar ? (
                      <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                    ) : (
                      u.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    <div style={{ fontSize: "12px", color: u.status === "online" ? "#23a55a" : "#80848e" }}>{u.status}</div>
                  </div>
                </div>
                <button style={btnStyle("#23a55a")} onClick={() => addFriend(u.id)}>+ Add Friend</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}