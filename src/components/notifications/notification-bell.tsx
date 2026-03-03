"use client";

import React from "react";

export default function NotificationBell() {
  return (
    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", position: "relative" }}>
      🔔
    </button>
  );
}

export { NotificationBell };