"use client";

import React from "react";
import Link from "next/link";

export default function Sidebar() {
  const links = [
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/friends", label: "Friends", icon: "👥" },
    { href: "/servers", label: "Servers", icon: "🖥️" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      style={{
        width: "240px",
        background: "#f2f3f5",
        borderRight: "1px solid #e1e2e4",
        display: "flex",
        flexDirection: "column",
        padding: "12px 8px",
        gap: "4px",
      }}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#4e5058",
            fontSize: "14px",
            fontWeight: 500,
            transition: "background 0.2s",
          }}
        >
          <span style={{ fontSize: "18px" }}>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export { Sidebar };