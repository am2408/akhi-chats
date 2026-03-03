"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e1e2e4",
    fontSize: "16px",
    outline: "none",
    background: "#f2f3f5",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    color: "#4e5058",
    marginBottom: "8px",
    letterSpacing: "0.5px",
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
            Create an account
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              style={inputStyle}
            />
          </div>

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
            {loading ? "Creating account..." : "Continue"}
          </button>

          <p style={{ fontSize: "14px", color: "#4e5058" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "#5865f2", textDecoration: "none", fontWeight: 500 }}
            >
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}