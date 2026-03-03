"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ServerPage() {
  const params = useParams();
  const serverId = params?.serverId as string;
  const [server, setServer] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (!serverId) return;
    fetch(`/api/servers/${serverId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.server) setServer(data.server);
      })
      .catch(console.error);
  }, [serverId]);

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
        {server?.name || "Loading..."}
      </h1>
      <p style={{ color: "#5c5e66", marginTop: "8px" }}>
        Select a channel to start chatting.
      </p>
    </div>
  );
}