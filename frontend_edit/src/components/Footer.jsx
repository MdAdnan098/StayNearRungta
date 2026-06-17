import { useTheme } from "../context/ThemeContext.jsx";

const Footer = () => {
  const { t } = useTheme();

  return (
    <footer style={{ borderTop: `1px solid ${t.border}`, padding: "32px 0", marginTop: "auto" }}>
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>StayNearRungta</div>
          <div style={{ fontSize: "0.8rem", color: t.textMuted }}>
            Finding PGs near Rungta College, Bhilai.
          </div>
        </div>

        <div style={{ fontSize: "0.82rem", color: t.textMuted }}>
          Made with ❤️ by your seniors.
        </div>

        <div style={{ display: "flex", gap: 20, fontSize: "0.85rem", color: t.textSub }}>
          <a href="#/explore">Explore PGs</a>
          <a href="#/owner/login">Owner Login</a>
          <a href="#/owner/register">Register</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
