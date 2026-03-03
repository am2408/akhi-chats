"use client";

import React from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
}

export default function Avatar({ src, name = "?", size = 40 }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#5865f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}