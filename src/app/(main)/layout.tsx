"use client";

import React from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "72px",
          background: "#e3e5e8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 0",
          gap: "8px",
          overflowY: "auto",
        }}
      >
        <a
          href="/chat"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            background: "#5865f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "20px",
            textDecoration: "none",
          }}
        >
          A
        </a>
        <div style={{ width: "32px", height: "2px", background: "#c9ccd1", borderRadius: "1px" }} />
        <a
          href="/servers"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#23a55a",
            fontWeight: "bold",
            fontSize: "24px",
            textDecoration: "none",
            transition: "border-radius 0.2s",
          }}
        >
          +
        </a>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}