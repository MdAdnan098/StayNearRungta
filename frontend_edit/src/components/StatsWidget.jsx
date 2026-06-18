import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const StatsWidget = () => {
  const { t } = useTheme();
  const { owner, admin } = useAuth();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("visited")) {
      const isOwner = !!(owner || admin);
      fetch(`${API}/api/stats/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOwner }),
      });
      sessionStorage.setItem("visited", "true");
    }
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open) fetchStats();
    setOpen(!open);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={handleToggle}
        title="See total visitors"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#fff",
          opacity: open ? 1 : 0.7,
          fontSize: "0.8rem",
          fontWeight: 500,
          padding: "4px 6px",
          borderRadius: 6,
          transition: "opacity 0.15s",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Visitors
      </button>

      {/* Dropdown popup */}
      {open && (
        <>
          {/* Backdrop to close */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 998 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              zIndex: 999,
              background: t.card,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "14px 18px",
              minWidth: 220,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            {/* Arrow */}
            <div style={{
              position: "absolute",
              top: -7,
              right: 14,
              width: 12,
              height: 12,
              background: t.card,
              border: `1px solid ${t.border}`,
              borderBottom: "none",
              borderRight: "none",
              transform: "rotate(45deg)",
            }} />

            <div style={{
              fontWeight: 700,
              marginBottom: 12,
              fontSize: "0.88rem",
              color: t.text,
              borderBottom: `1px solid ${t.border}`,
              paddingBottom: 8,
            }}>
              📊 Site Statistics
            </div>

            {loading ? (
              <div style={{ fontSize: "0.82rem", color: t.textMuted, textAlign: "center", padding: "8px 0" }}>
                Loading...
              </div>
            ) : stats ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Total Visitors", value: stats.visitors, icon: "👁️" },
                  { label: "Students Visited", value: stats.students, icon: "🎓" },
                  { label: "Property Owners", value: stats.owners, icon: "🏠" },
                  { label: "Properties Listed", value: stats.properties, icon: "📋" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.84rem",
                    color: t.textSub,
                  }}>
                    <span>{icon} {label}</span>
                    <span style={{ fontWeight: 700, color: t.text, marginLeft: 16 }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.82rem", color: t.textMuted, textAlign: "center" }}>
                Failed to load
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsWidget;
