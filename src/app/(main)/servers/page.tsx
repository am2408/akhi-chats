"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Server {
  id: string;
  name: string;
  icon: string | null;
}

export default function ServersPage() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/servers")
      .then((res) => res.json())
      .then((data) => { if (data.servers) setServers(data.servers); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--dc-text-primary)" }}>Your Servers</h1>
      {loading ? (
        <p style={{ color: "var(--dc-text-muted)" }}>Loading...</p>
      ) : servers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--dc-text-muted)" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3" style={{ marginBottom: 16 }}>
            <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
          <p>No servers yet. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {servers.map((server) => (
            <div key={server.id} onClick={() => router.push(`/servers/${server.id}`)}
              style={{
                padding: 16, background: "var(--dc-bg-secondary)", borderRadius: 12,
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--dc-bg-hover)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "var(--dc-bg-secondary)")}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: "var(--dc-brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 12,
              }}>
                {server.name[0].toUpperCase()}
              </div>
              <h3 style={{ fontWeight: 600, color: "var(--dc-text-primary)" }}>{server.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}