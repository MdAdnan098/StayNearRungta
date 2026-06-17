import { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useRouter from "../hooks/useRouter.js";

const Navbar = () => {
  const { path } = useRouter();
  const { theme, toggleTheme, t } = useTheme();
  const { owner, admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!(owner || admin);

  const NavLink = ({ to, children }) => (
    <a
      href={to}
      onClick={() => setMenuOpen(false)}
      style={{
        color: "#fff",
        fontSize: "0.88rem",
        fontWeight: 500,
        opacity: path === to ? 1 : 0.7,
        padding: "4px 0",
        borderBottom: path === to ? "1.5px solid #fff" : "1.5px solid transparent",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </a>
  );

  return (
    <>
      <style>{`
        .mobile-menu-btn { display: none; }
        .nav-theme-mobile { display: none; }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block; }
          .nav-theme-mobile { display: block; }
          .nav-desktop { display: none !important; }
        }
      `}</style>

      <nav
        style={{
          background: t.navbar,
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid #222",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <a
            href="#/"
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.05rem",
              letterSpacing: "-0.01em",
            }}
          >
            StayNearRungta
          </a>

          {/* Desktop */}
          <div
            className="nav-desktop"
            style={{ display: "flex", alignItems: "center", gap: 28 }}
          >
            <NavLink to="#/">Home</NavLink>
            <NavLink to="#/explore">Explore PGs</NavLink>
            {owner && <NavLink to="#/dashboard">Dashboard</NavLink>}
            {admin && <NavLink to="#/admin">Admin</NavLink>}
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
                style={{ color: "#fff", borderColor: "#444" }}
              >
                Logout
              </button>
            ) : (
              <a
                href="#/owner/login"
                className="btn btn-outline btn-sm"
                style={{ color: "#fff", borderColor: "#444" }}
              >
                Owner Login
              </a>
            )}
            <button
              onClick={toggleTheme}
              title="Toggle dark mode"
              style={{ color: "#fff", fontSize: "0.8rem", opacity: 0.7, padding: "4px 6px" }}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {/* Mobile controls */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={toggleTheme}
              className="nav-theme-mobile"
              style={{ color: "#fff", fontSize: "0.75rem", opacity: 0.7 }}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="mobile-menu-btn"
              style={{ color: "#fff", fontSize: "1.2rem", lineHeight: 1 }}
            >
              {menuOpen ? "X" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              background: t.navbar,
              borderTop: "1px solid #222",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <NavLink to="#/">Home</NavLink>
            <NavLink to="#/explore">Explore PGs</NavLink>
            {owner && <NavLink to="#/dashboard">Dashboard</NavLink>}
            {admin && <NavLink to="#/admin">Admin</NavLink>}
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                style={{ color: "#fff", fontSize: "0.88rem", textAlign: "left" }}
              >
                Logout
              </button>
            ) : (
              <a
                href="#/owner/login"
                style={{ color: "#fff", fontSize: "0.88rem" }}
                onClick={() => setMenuOpen(false)}
              >
                Owner Login
              </a>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
