import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const LandingPage = () => {
  const { t } = useTheme();
  const [adminExists, setAdminExists] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem("landingTracked") && navigator.geolocation) {
      sessionStorage.setItem("landingTracked", "true");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetch(`${API}/api/visits`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              deviceInfo: navigator.userAgent,
            }),
          }).catch(() => {});
        },
        () => {},
        { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
      );
    }
  }, []); // default true to hide link

  useEffect(() => {
    fetch(`${API}/api/admin/status`)
      .then((r) => r.json())
      .then((data) => setAdminExists(data.adminExists))
      .catch(() => {}); // silently fail
  }, []);

  return (
    <MainLayout>
      {/* Hero */}
      <section style={{ padding: "96px 0 80px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: t.textMuted,
              marginBottom: 24,
              borderBottom: `1.5px solid ${t.border}`,
              paddingBottom: 6,
            }}
          >
            Bhilai · Chhattisgarh
          </div>

          <h1 style={{ marginBottom: 32 }}>
            PG dhoondhna ab
            <br />
            <span style={{ color: t.textSub }}>itna mushkil nahi.</span>
          </h1>

          <div
            style={{
              fontSize: "1.05rem",
              color: t.textSub,
              lineHeight: 1.9,
              marginBottom: 48,
              maxWidth: 580,
            }}
          >
            <p style={{ marginBottom: 16 }}>Har saal bahut saare freshers Bhilai aate hain.</p>
            <p style={{ marginBottom: 16 }}>
              Classes shuru hone se pehle hi ek sawaal saamne aa jaata hai:
              <br />
              <strong style={{ color: t.text }}>
                'Rehne ke liye achhi jagah kahan milegi?'
              </strong>
            </p>
            <p style={{ marginBottom: 16 }}>
              Humne bhi ye struggle face ki hai. Isi liye StayNearRungta banaya gaya — taaki PG,
              Hostel aur Lodge ki information aasani se ek hi jagah mil sake.
            </p>
            <p style={{ marginBottom: 16 }}>
              <em>Not just a website. A solution we wished existed when we arrived.</em>
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: t.textMuted,
                marginBottom: 6,
              }}
            >
              CSE (Data Science) 2023–27 batch ke students ki taraf se freshers ke liye ek
              chhota sa effort.
            </p>
            <p style={{ fontSize: "0.85rem", color: t.textMuted }}>
              Inspired by the belief that every problem deserves a smarter solution — a thought
              we learned from our Former HoD Dr. Anurag Sharma Sir. ❤️
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#/explore" className="btn btn-primary btn-lg">
              Explore PGs
            </a>
            <a href="#/owner/register" className="btn btn-outline btn-lg">
              Add Your Property
            </a>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: t.textMuted,
                marginBottom: 12,
              }}
            >
              How it works
            </div>
            <h2>Simple. Direct. Transparent.</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 32,
            }}
          >
            {[
              {
                step: "01",
                title: "Browse Listings",
                desc: "Owners list their PGs with full details — rent, location, photos, and contact info.",
              },
              {
                step: "02",
                title: "Filter and Compare",
                desc: "Filter by Boys or Girls accommodation. See everything in one place, no WhatsApp groups needed.",
              },
              {
                step: "03",
                title: "Contact Directly",
                desc: "Call or WhatsApp the owner directly. No middlemen, no commissions.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: t.textMuted,
                    marginBottom: 12,
                  }}
                >
                  {step}
                </div>
                <h3 style={{ marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: "0.9rem", color: t.textSub }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ marginBottom: 16 }}>Apna PG list karo.</h2>
          <p style={{ color: t.textSub, marginBottom: 32 }}>
            Agar aap ek property owner hain, toh apna PG ya hostel is platform par add karein.
            Students seedha aapse contact karenge.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#/owner/register" className="btn btn-primary">
              Register as Owner
            </a>
            <a href="#/owner/login" className="btn btn-outline">
              Owner Login
            </a>
          </div>
        </div>
      </section>

      {/* Admin section – only shown when no admin exists yet (one-time setup) */}
      {!adminExists && (
        <>
          <hr className="divider" style={{ margin: 0 }} />
          <section className="section">
            <div className="container" style={{ maxWidth: 600 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: t.textMuted,
                  marginBottom: 12,
                }}
              >
                Platform Setup
              </div>
              <h3 style={{ marginBottom: 12 }}>Admin Setup</h3>
              <p style={{ color: t.textSub, marginBottom: 24, fontSize: "0.9rem" }}>
                No admin account has been created yet. Set up the admin account to start reviewing property submissions.
              </p>
              <a href="#/admin/setup" className="btn btn-outline">
                Create Admin Account
              </a>
            </div>
          </section>
        </>
      )}

      {/* Admin login link – always visible in footer area, subtle */}
      <hr className="divider" style={{ margin: 0 }} />
      <section style={{ padding: "24px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <a
            href="#/admin/login"
            style={{ fontSize: "0.78rem", color: t.textMuted, opacity: 0.5 }}
          >
            Admin Login
          </a>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
