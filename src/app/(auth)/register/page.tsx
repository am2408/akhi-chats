"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      router.push("/friends");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: "3px",
    border: "none",
    background: "var(--dc-input-bg)",
    color: "var(--dc-text-primary)",
    fontSize: "16px",
    outline: "none",
    marginBottom: "20px",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--dc-brand)",
    }}>
      <div style={{
        background: "var(--dc-bg-primary)",
        borderRadius: "5px",
        padding: "32px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}>
        <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: 600, marginBottom: "8px", color: "var(--dc-text-primary)" }}>
          Create an account
        </h1>

        {error && (
          <div style={{ background: "rgba(218, 55, 60, 0.1)", border: "1px solid var(--dc-red)", color: "var(--dc-red)", padding: "10px", borderRadius: "5px", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--dc-text-secondary)", marginBottom: "8px" }}>
            Email <span style={{ color: "var(--dc-red)" }}>*</span>
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--dc-text-secondary)", marginBottom: "8px" }}>
            Display Name <span style={{ color: "var(--dc-red)" }}>*</span>
          </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />

          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--dc-text-secondary)", marginBottom: "8px" }}>
            Password <span style={{ color: "var(--dc-red)" }}>*</span>
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />

          <button type="submit" disabled={loading} style={{
            width: "100%",
            padding: "12px",
            borderRadius: "3px",
            border: "none",
            background: "var(--dc-brand)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background 0.15s",
          }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--dc-brand-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--dc-brand)"; }}
          >
            {loading ? "Creating..." : "Continue"}
          </button>
        </form>

        <p style={{ marginTop: "16px", fontSize: "14px", color: "var(--dc-text-muted)" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--dc-text-link)", textDecoration: "none", fontWeight: 500 }}>Log In</a>
        </p>

        <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--dc-text-muted)", lineHeight: "16px" }}>
          By registering, you agree to Akhi Chats&apos; Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}