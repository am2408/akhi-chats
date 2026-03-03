"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({ children, variant = "primary", size = "md", style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    ...(size === "sm" && { padding: "6px 12px", fontSize: "13px" }),
    ...(size === "md" && { padding: "10px 20px", fontSize: "14px" }),
    ...(size === "lg" && { padding: "14px 28px", fontSize: "16px" }),
    ...(variant === "primary" && { background: "#5865f2", color: "#fff" }),
    ...(variant === "secondary" && { background: "#f2f3f5", color: "#060607" }),
    ...(variant === "danger" && { background: "#da373c", color: "#fff" }),
    ...style,
  };

  return <button style={baseStyle} {...props}>{children}</button>;
}

export { Button };