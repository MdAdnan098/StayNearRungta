import MainLayout from "../layouts/MainLayout.jsx";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const DashboardPage = () => {
  const { t } = useTheme();
  const { owner, token, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState(null);
  const [propertyActionMsg, setPropertyActionMsg] = useState("");

  useEffect(() => {
    const fetchProps = async () => {
      if (!token) return setLoading(false);
      try {
        const res = await fetch(`${API}/api/properties/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProperties(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, [token]);

  const handleDeleteProperty = async (id, name) => {
    if (
      !window.confirm(
        `"${name}" ko permanently delete karein? Ye action undo nahi ho sakta.`
      )
    )
      return;
    setDeletingPropertyId(id);
    setPropertyActionMsg("");
    try {
      const res = await fetch(`${API}/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
        setPropertyActionMsg("Property delete ho gayi.");
      } else {
        const data = await res.json();
        setPropertyActionMsg(data.message || "Property delete nahi ho payi.");
      }
    } catch (err) {
      setPropertyActionMsg("Property delete nahi ho payi.");
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Delete your account permanently? This will also delete all of your properties. This cannot be undone."
      )
    )
      return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        logout();
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Could not delete account");
      }
    } catch (err) {
      setDeleteError("Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (!owner) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ padding: "120px 24px" }}>
          <h3 style={{ marginBottom: 12, color: t.textSub }}>Not logged in</h3>
          <p style={{ marginBottom: 24 }}>
            Please login to view your dashboard.
          </p>
          <a href="#/owner/login" className="btn btn-primary">
            Login
          </a>
        </div>
      </MainLayout>
    );
  }

  const total = properties.length;
  const pending = properties.filter((p) => p.status === "pending").length;
  const approved = properties.filter((p) => p.status === "approved").length;

  return (
    <MainLayout>
      <div className="section-sm">
        <div className="container">
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 48,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: t.textMuted,
                  marginBottom: 8,
                }}
              >
                Owner Dashboard
              </div>
              <h2>My Properties</h2>
            </div>
            <a href="#/property/add" className="btn btn-primary">
              + Add New Property
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 16,
              marginBottom: 48,
            }}
          >
            {[
              { label: "Total Listed", value: String(total) },
              { label: "Pending Review", value: String(pending) },
              { label: "Approved", value: String(approved) },
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 6 }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: t.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          <hr className="divider" />

          {propertyActionMsg && (
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                fontSize: "0.85rem",
                color: t.textSub,
              }}
            >
              {propertyActionMsg}
            </div>
          )}

          {/* Property list or empty state */}
          {loading ? (
            <div>Loading...</div>
          ) : properties.length === 0 ? (
            <EmptyState
              title="You haven't added any properties yet."
              description="Add your PG or hostel so students can find and contact you directly."
              action={
                <a href="#/property/add" className="btn btn-primary">
                  Add Your First Property
                </a>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {properties.map((p) => (
                <div
                  key={p._id}
                  className="card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{p.propertyName}</h4>
                    <div style={{ fontSize: "0.85rem", color: t.textSub }}>
                      {p.address}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <span className={`badge badge-${p.status}`}>
                      {p.status}
                    </span>
                    <a
                      href={`#/property/${p._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      View
                    </a>
                    <a
                      href={`#/property/edit/${p._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDeleteProperty(p._id, p.propertyName)}
                      className="btn btn-sm"
                      style={{ background: "#ef4444", color: "#fff", border: "none" }}
                      disabled={deletingPropertyId === p._id}
                    >
                      {deletingPropertyId === p._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Danger zone – permanently delete own account */}
          <hr className="divider" style={{ marginTop: 48 }} />
          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 8, color: t.textSub }}>Danger Zone</h3>
            <p style={{ fontSize: "0.85rem", color: t.textMuted, marginBottom: 16 }}>
              Deleting your account will permanently remove your profile and all properties you have listed. This action cannot be undone.
            </p>
            {deleteError && (
              <div
                style={{
                  border: `1px solid ${t.danger}`,
                  color: t.danger,
                  padding: "10px 14px",
                  borderRadius: 6,
                  marginBottom: 16,
                  fontSize: "0.85rem",
                }}
              >
                {deleteError}
              </div>
            )}
            <button
              onClick={handleDeleteAccount}
              className="btn btn-sm"
              style={{ background: "#ef4444", color: "#fff", border: "none" }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
