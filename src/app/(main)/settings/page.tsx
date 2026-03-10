"use client";

import useAuth from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "var(--dc-text-primary)" }}>My Account</h1>

      <div style={{
        background: "var(--dc-bg-secondary)", borderRadius: 8, overflow: "hidden",
      }}>
        {/* Banner */}
        <div style={{ height: 100, background: "linear-gradient(135deg, #5865f2, #eb459e)" }} />

        {/* Profile */}
        <div style={{ padding: "0 16px 16px", marginTop: -40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: user?.avatar ? `url(${user.avatar}) center/cover` : "#5865f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 36, fontWeight: 700,
            border: "6px solid var(--dc-bg-secondary)",
          }}>
            {!user?.avatar && (user?.username?.[0] || "?").toUpperCase()}
          </div>

          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--dc-text-primary)" }}>{user?.username}</h2>
            <p style={{ fontSize: 14, color: "var(--dc-text-muted)", marginTop: 4 }}>{user?.email}</p>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{
            background: "var(--dc-bg-primary)", borderRadius: 8, padding: 16,
          }}>
            {[
              { label: "DISPLAY NAME", value: user?.username },
              { label: "EMAIL", value: user?.email },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid var(--dc-divider)",
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--dc-text-muted)", marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 15, color: "var(--dc-text-primary)" }}>{item.value}</div>
                </div>
                <button style={{
                  padding: "4px 16px", borderRadius: 3, border: "none",
                  background: "var(--dc-text-muted)", color: "#fff",
                  fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: 0.6,
                }}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}