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
      .then((data) => {
        if (data.servers) setServers(data.servers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Your Servers</h1>
      {loading ? (
        <p style={{ color: "#5c5e66" }}>Loading...</p>
      ) : servers.length === 0 ? (
        <p style={{ color: "#5c5e66" }}>No servers yet. Create one to get started!</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {servers.map((server) => (
            <div
              key={server.id}
              onClick={() => router.push(`/servers/${server.id}`)}
              style={{
                padding: "16px",
                background: "#f2f3f5",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🖥️</div>
              <h3 style={{ fontWeight: 600 }}>{server.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}