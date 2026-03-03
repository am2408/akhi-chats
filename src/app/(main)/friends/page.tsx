"use client";

import { useEffect, useState } from "react";

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

// TODO: Replace with actual auth — get current user ID from session
const CURRENT_USER_ID = "";

export default function FriendsPage() {
  const [tab, setTab] = useState<"all" | "pending" | "add">("all");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch friends
  useEffect(() => {
    if (!CURRENT_USER_ID) return;
    fetch(`/api/friends?userId=${CURRENT_USER_ID}&status=accepted`)
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []))
      .catch(console.error);
  }, []);

  // Fetch pending requests
  useEffect(() => {
    if (!CURRENT_USER_ID) return;
    fetch(`/api/friends?userId=${CURRENT_USER_ID}&status=pending`)
      .then((res) => res.json())
      .then((data) => setPendingFriends(data.friends || []))
      .catch(console.error);
  }, []);

  // Search users
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&userId=${CURRENT_USER_ID}`);
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send friend request
  const addFriend = async (friendId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: CURRENT_USER_ID, friendId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Friend request sent!");
        setSearchResults((prev) => prev.filter((u) => u.id !== friendId));
      } else {
        setMessage(data.error || "Failed to send request");
      }
    } catch {
      setMessage("Something went wrong");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  // Accept friend request
  const acceptFriend = async (friendshipId: string) => {
    try {
      await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, status: "accepted" }),
      });
      setPendingFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      // Refresh friends list
      const res = await fetch(`/api/friends?userId=${CURRENT_USER_ID}&status=accepted`);
      const data = await res.json();
      setFriends(data.friends || []);
    } catch {
      console.error("Failed to accept");
    }
  };

  // Remove friend
  const removeFriend = async (friendshipId: string) => {
    try {
      await fetch(`/api/friends?friendshipId=${friendshipId}`, { method: "DELETE" });
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      setPendingFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
    } catch {
      console.error("Failed to remove");
    }
  };

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
      <div
        style={{
          height: "48px",
          borderBottom: "1px solid #e1e2e4",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "8px",
        }}
      >
        <span style={{ fontWeight: 700, marginRight: "16px" }}>👥 Friends</span>
        <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>
          All
        </button>
        <button style={tabStyle(tab === "pending")} onClick={() => setTab("pending")}>
          Pending {pendingFriends.length > 0 && `(${pendingFriends.length})`}
        </button>
        <button style={tabStyle(tab === "add")} onClick={() => setTab("add")}>
          Add Friend
        </button>
      </div>

      {/* Toast message */}
      {message && (
        <div
          style={{
            padding: "10px 16px",
            background: "#23a55a",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 24px", overflowY: "auto" }}>
        {/* ============ ALL FRIENDS ============ */}
        {tab === "all" && (
          <>
            <h3 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#5c5e66", marginBottom: "12px" }}>
              All Friends — {friends.length}
            </h3>
            {friends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#5c5e66" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>👥</div>
                <p>No friends yet. Add someone to get started!</p>
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
                    <a
                      href={`/dm/${friend.id}`}
                      style={{
                        ...btnStyle("#5865f2"),
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      💬 Message
                    </a>
                    <button style={btnStyle("#da373c")} onClick={() => removeFriend(friend.friendshipId)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ============ PENDING ============ */}
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
                    <div style={avatarStyle}>
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{friend.username}</div>
                      <div style={{ fontSize: "12px", color: "#5c5e66" }}>Incoming friend request</div>
                    </div>
                  </div>
                  <div>
                    <button style={btnStyle("#23a55a")} onClick={() => acceptFriend(friend.friendshipId)}>
                      ✓ Accept
                    </button>
                    <button style={btnStyle("#da373c")} onClick={() => removeFriend(friend.friendshipId)}>
                      ✗ Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ============ ADD FRIEND ============ */}
        {tab === "add" && (
          <>
            <h3 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#5c5e66", marginBottom: "12px" }}>
              Add Friend
            </h3>
            <p style={{ fontSize: "14px", color: "#4e5058", marginBottom: "16px" }}>
              Search by username or email to find friends.
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter a username or email..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e1e2e4",
                  fontSize: "14px",
                  outline: "none",
                  background: "#ebedef",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#5865f2",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Search
              </button>
            </div>

            {searchLoading && <p style={{ color: "#5c5e66" }}>Searching...</p>}

            {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#5c5e66" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <p>No users found for &quot;{searchQuery}&quot;</p>
              </div>
            )}

            {searchResults.map((user) => (
              <div key={user.id} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={avatarStyle}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.username}</div>
                    <div style={{ fontSize: "12px", color: user.status === "online" ? "#23a55a" : "#80848e" }}>
                      {user.status}
                    </div>
                  </div>
                </div>
                <button style={btnStyle("#23a55a")} onClick={() => addFriend(user.id)}>
                  + Add Friend
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}