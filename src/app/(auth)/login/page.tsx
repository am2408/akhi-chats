"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      router.push("/chat");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #5865f2, #7c3aed)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "28px",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            A
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#060607", margin: 0 }}>
            Welcome back!
          </h1>
          <p style={{ color: "#4e5058", marginTop: "8px", fontSize: "14px" }}>
            We're so excited to see you again!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#4e5058",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #e1e2e4",
                fontSize: "16px",
                outline: "none",
                background: "#f2f3f5",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#4e5058",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #e1e2e4",
                fontSize: "16px",
                outline: "none",
                background: "#f2f3f5",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#5865f2",
              fontSize: "13px",
              cursor: "pointer",
              padding: "4px 0",
              marginBottom: "20px",
              display: "block",
            }}
          >
            Forgot your password?
          </button>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#da373c",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#8b93f7" : "#5865f2",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginBottom: "16px",
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p style={{ fontSize: "14px", color: "#4e5058" }}>
            Need an account?{" "}
            <Link
              href="/register"
              style={{ color: "#5865f2", textDecoration: "none", fontWeight: 500 }}
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}