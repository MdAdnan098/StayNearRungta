import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const Placeholder = ({ label, height = 48 }) => {
  const { t } = useTheme();
  return (
    <div
      style={{
        height,
        background: t.bgSub,
        border: `1.5px dashed ${t.border}`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        color: t.textMuted,
      }}
    >
      {label}
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ photos, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent((i) => (i + 1) % photos.length);

  // Close on ESC, navigate with arrow keys
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "2rem",
          cursor: "pointer",
          lineHeight: 1,
          zIndex: 10000,
        }}
      >
        ×
      </button>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: "0.85rem",
          opacity: 0.7,
        }}
      >
        {current + 1} / {photos.length}
      </div>

      {/* Prev arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          style={{
            position: "absolute",
            left: 16,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            fontSize: "1.8rem",
            width: 48,
            height: 48,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={photos[current]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "88vh",
          objectFit: "contain",
          borderRadius: 8,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      />

      {/* Next arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          style={{
            position: "absolute",
            right: 16,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            fontSize: "1.8rem",
            width: 48,
            height: 48,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ›
        </button>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PropertyDetailsPage = () => {
  const { t } = useTheme();
  const { token, adminToken } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const id = window.location.hash.split("/property/")[1];

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("Property not found");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const headers = {};
        const authToken = adminToken || token;
        if (authToken) headers.Authorization = `Bearer ${authToken}`;

        const res = await fetch(`${API}/api/properties/${id}`, { headers });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Property not found");
          setProperty(null);
        } else {
          setProperty(data);
        }
      } catch (err) {
        setError("Could not load property");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, token, adminToken]);

  if (loading) {
    return (
      <MainLayout>
        <div className="section-sm">
          <div className="container" style={{ maxWidth: 820 }}>
            <p style={{ color: t.textMuted }}>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !property) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ padding: "120px 24px" }}>
          <h3 style={{ marginBottom: 12, color: t.textSub }}>
            {error || "Property not found"}
          </h3>
          <a href="#/explore" className="btn btn-primary">
            Back to Explore
          </a>
        </div>
      </MainLayout>
    );
  }

  const photos = property.photos && property.photos.length > 0 ? property.photos : [];
  const whatsappNumber = property.phoneNumber ? property.phoneNumber.replace(/\D/g, "") : "";

  // Pre-filled WhatsApp message (hinglish)
  const whatsappMsg = encodeURIComponent(
    `Hey, Maine StayNearRungta Website par aapki property "${property.propertyName}" dekhi hai. Kya ye abhi available hai? Please mujhe reply karein.`
  );

  return (
    <MainLayout>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="section-sm">
        <div className="container" style={{ maxWidth: 820 }}>
          <a
            href="#/explore"
            style={{
              fontSize: "0.85rem",
              color: t.textMuted,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 32,
            }}
          >
            ← Back to Explore
          </a>

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: 8 }}>{property.propertyName}</h2>
              <div style={{ fontSize: "0.9rem", color: t.textSub }}>{property.address}</div>
            </div>
            <div style={{ textAlign: "right", minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: "1.6rem" }}>
                Rs. {property.rent}/month
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge badge-${property.category?.toLowerCase()}`}>
                  {property.category}
                </span>
                {property.status && property.status !== "approved" && (
                  <span
                    className={`badge badge-${property.status}`}
                    style={{ marginLeft: 8 }}
                  >
                    {property.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ marginBottom: 16 }}>Photos</h3>
            {photos.length === 0 ? (
              <Placeholder label="No Photos Uploaded" height={200} />
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: photos.length > 1 ? "2fr 1fr 1fr" : "1fr",
                    gap: 10,
                    borderRadius: 8,
                    overflow: "hidden",
                    height: 280,
                  }}
                >
                  <img
                    src={photos[0]}
                    alt={property.propertyName}
                    onClick={() => setLightboxIndex(0)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                  />
                  {photos.length > 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {photos[1] && (
                        <img
                          src={photos[1]}
                          alt=""
                          onClick={() => setLightboxIndex(1)}
                          style={{
                            width: "100%",
                            height: "48%",
                            objectFit: "cover",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        />
                      )}
                      {photos[2] && (
                        <img
                          src={photos[2]}
                          alt=""
                          onClick={() => setLightboxIndex(2)}
                          style={{
                            width: "100%",
                            height: "48%",
                            objectFit: "cover",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        />
                      )}
                    </div>
                  )}
                  {photos.length > 3 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {photos[3] && (
                        <img
                          src={photos[3]}
                          alt=""
                          onClick={() => setLightboxIndex(3)}
                          style={{
                            width: "100%",
                            height: "48%",
                            objectFit: "cover",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        />
                      )}
                      {photos[4] && (
                        <div style={{ position: "relative", height: "48%" }}>
                          <img
                            src={photos[4]}
                            alt=""
                            onClick={() => setLightboxIndex(4)}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                          />
                          {photos.length > 5 && (
                            <div
                              onClick={() => setLightboxIndex(4)}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.55)",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                cursor: "pointer",
                              }}
                            >
                              +{photos.length - 5} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Thumbnail strip for all photos */}
                {photos.length > 5 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {photos.slice(5).map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt=""
                        onClick={() => setLightboxIndex(idx + 5)}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: `1.5px solid ${t.border}`,
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Left column */}
            <div>
              <div style={{ marginBottom: 36 }}>
                <h3 style={{ marginBottom: 16 }}>About this Property</h3>
                <ul style={{ fontSize: "0.92rem", color: t.textSub, lineHeight: 2, paddingLeft: 20 }}>
                  {property.hasCooler && <li>Cooler is Available</li>}
                  {property.attachedBathroom && <li>Attached Bathroom</li>}
                  {property.isIndependent && <li>Room/PG/Lodge/Flat is Independent</li>}
                  {property.electricityIncluded && <li>Bijli Bill is Included in Room Rent</li>}
                  {property.bedGaddaTakiyaProvided && <li>Bed, Takiya, Gadda Available</li>}
                </ul>
              </div>

              <div>
                <h3 style={{ marginBottom: 16 }}>Location</h3>
                {property.mapUrl ? (
                  <button
                    className="btn btn-outline"
                    onClick={() => window.open(property.mapUrl, "_blank")}
                  >
                    Open in Google Maps
                  </button>
                ) : (
                  <Placeholder label="Location not available" height={48} />
                )}
              </div>
            </div>

            {/* Contact card */}
            <div className="card" style={{ position: "sticky", top: 80 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: t.textMuted,
                  marginBottom: 20,
                }}
              >
                Contact Owner
              </div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{property.ownerName}</div>

              {/* WhatsApp number (main contact) */}
              <div style={{ fontSize: "0.85rem", color: t.textSub, marginTop: 4 }}>
                📱 WhatsApp: {property.phoneNumber}
              </div>

              {/* Alternate number - show if present */}
              {property.alternateNumber && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: "0.82rem",
                    color: t.textSub,
                    background: t.bgSub,
                    border: `1px solid ${t.border}`,
                    borderRadius: 6,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>📞 Alternate: {property.alternateNumber}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(property.alternateNumber);
                      alert("Alternate number copied!");
                    }}
                    style={{
                      fontSize: "0.75rem",
                      color: t.textMuted,
                      background: "none",
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                      cursor: "pointer",
                    }}
                  >
                    Copy
                  </button>
                </div>
              )}

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {/* WhatsApp with pre-filled message */}
                <a
                  href={`https://wa.me/91${whatsappNumber}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-block"
                  style={{ background: "#25D366", color: "#fff" }}
                >
                  WhatsApp
                </a>
                {/* Call goes to WhatsApp number */}
                <a
                  href={`tel:+91${whatsappNumber}`}
                  className="btn btn-outline btn-block"
                >
                  Call Owner
                </a>
              </div>

              {property.alternateNumber && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: "0.75rem",
                    color: t.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  WhatsApp pe response nahi mila? Upar diya alternate number copy karke directly call karein.
                </div>
              )}

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: `1px solid ${t.border}`,
                  fontSize: "0.78rem",
                  color: t.textMuted,
                }}
              >
                Contact the owner directly. This platform does not charge any commission.
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PropertyDetailsPage;
