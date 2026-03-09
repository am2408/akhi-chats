"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/friends");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f2f3f5" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>Welcome back!</h1>
        <p style={{ textAlign: "center", color: "#5c5e66", marginBottom: "24px" }}>Login to Akhi Chats</p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#da373c", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#4e5058", marginBottom: "6px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e1e2e4", fontSize: "14px", outline: "none", background: "#f2f3f5", marginBottom: "16px", boxSizing: "border-box" }}
          />

          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#4e5058", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e1e2e4", fontSize: "14px", outline: "none", background: "#f2f3f5", marginBottom: "24px", boxSizing: "border-box" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#5865f2", color: "#fff", fontWeight: 600, fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ marginTop: "16px", fontSize: "14px", color: "#5c5e66", textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <a href="/register" style={{ color: "#5865f2", textDecoration: "none", fontWeight: 600 }}>Register</a>
        </p>
      </div>
    </div>
  );
}