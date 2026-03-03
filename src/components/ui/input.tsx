"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ style, ...props }: InputProps) {
  return (
    <input
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e1e2e4",
        fontSize: "14px",
        outline: "none",
        background: "#f2f3f5",
        ...style,
      }}
      {...props}
    />
  );
}

export { Input };