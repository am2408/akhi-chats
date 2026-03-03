"use client";

import React from "react";

export default function ChatHeader({ name = "Channel" }: { name?: string }) {
  return (
    <div style={{ height: "48px", borderBottom: "1px solid #e1e2e4", display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 600 }}>
      # {name}
    </div>
  );
}