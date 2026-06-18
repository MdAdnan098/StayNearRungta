import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const StatsWidget = () => {
  const { t } = useTheme();
  const { owner, admin } = useAuth();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);

  // Track visit once per session
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
    try {
      const res = await fetch(`${API}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  const handleToggle = () => {
    if (!open) fetchStats();
    setOpen(!open);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <div style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 10,
          minWidth: 230,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: "0.95rem", color: t.text }}>
            📊 Site Statistics
          </div>
          {stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: t.textSub }}>
                <span>👁️ Total Visitors</span>
                <span style={{ fontWeight: 700, color: t.text }}>{stats.visitors}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: t.textSub }}>
                <span>🎓 Students Visited</span>
                <span style={{ fontWeight: 700, color: t.text }}>{stats.students}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: t.textSub }}>
                <span>🏠 Property Owners</span>
                <span style={{ fontWeight: 700, color: t.text }}>{stats.owners}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: t.textSub }}>
                <span>📋 Properties Listed</span>
                <span style={{ fontWeight: 700, color: t.text }}>{stats.properties}</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.85rem", color: t.textMuted }}>Loading...</div>
          )}
        </div>
      )}
      <button
        onClick={handleToggle}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: t.card,
          border: `1.5px solid ${t.border}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          marginLeft: "auto",
        }}
      >
        👁️
      </button>
    </div>
  );
};

export default StatsWidget;
