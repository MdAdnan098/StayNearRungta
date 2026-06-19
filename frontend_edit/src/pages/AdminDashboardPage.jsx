import { useState, useEffect, useCallback } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const AdminDashboardPage = () => {
  const { t } = useTheme();
  const { admin, adminToken, logout } = useAuth();
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [owners, setOwners] = useState([]);
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const fetchProperties = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [pRes, aRes] = await Promise.all([
        fetch(`${API}/api/admin/pending`, { headers }),
        fetch(`${API}/api/admin/approved`, { headers }),
      ]);

      if (pRes.status === 401 || aRes.status === 401) {
        logout();
        return;
      }

      const pData = await pRes.json();
      const aData = await aRes.json();
      if (pRes.ok) setPending(pData);
      if (aRes.ok) setApproved(aData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminToken, logout]);

  const fetchOwners = useCallback(async () => {
    if (!adminToken) return;
    setOwnersLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/owners`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (res.ok) setOwners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOwnersLoading(false);
    }
  }, [adminToken, logout]);

  const fetchVisits = useCallback(async () => {
    if (!adminToken) return;
    setVisitsLoading(true);
    try {
      const res = await fetch(`${API}/api/visits`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (res.ok) setVisits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVisitsLoading(false);
    }
  }, [adminToken, logout]);

  useEffect(() => {
    fetchProperties();
    fetchOwners();
    fetchVisits();
  }, [fetchProperties, fetchOwners, fetchVisits]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setActionMsg("Property approved.");
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setActionMsg("Property rejected.");
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property permanently?")) return;
    try {
      const res = await fetch(`${API}/api/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setActionMsg("Property deleted.");
        fetchProperties();
        fetchOwners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOwner = async (id, fullName) => {
    if (
      !window.confirm(
        `Delete owner "${fullName}" and ALL of their properties permanently? This cannot be undone.`
      )
    )
      return;
    try {
      const res = await fetch(`${API}/api/admin/owners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setActionMsg("Owner and their properties deleted.");
        fetchOwners();
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!admin) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ padding: "120px 24px" }}>
          <h3 style={{ marginBottom: 12, color: t.textSub }}>Access Denied</h3>
          <p style={{ marginBottom: 24 }}>You must be an admin to view this page.</p>
          <a href="#/admin/login" className="btn btn-primary">
            Admin Login
          </a>
        </div>
      </MainLayout>
    );
  }

  const list = tab === "pending" ? pending : approved;
  const total = pending.length + approved.length;
  const rejected = 0; // not tracked separately in this view

  const TabBtn = ({ value, label, count }) => (
    <button
      onClick={() => setTab(value)}
      style={{
        padding: "10px 20px",
        borderBottom: `2px solid ${tab === value ? t.text : "transparent"}`,
        color: tab === value ? t.text : t.textMuted,
        fontWeight: tab === value ? 600 : 400,
        fontSize: "0.9rem",
        background: "none",
        cursor: "pointer",
      }}
    >
      {label}
      <span
        style={{
          marginLeft: 8,
          fontSize: "0.75rem",
          background: t.bgSub,
          padding: "2px 7px",
          borderRadius: 20,
          color: t.textMuted,
        }}
      >
        {count}
      </span>
    </button>
  );

  return (
    <MainLayout>
      <div className="section-sm">
        <div className="container">
          <div style={{ marginBottom: 40 }}>
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
              Administration
            </div>
            <h2>Admin Dashboard</h2>
            <p style={{ color: t.textSub, marginTop: 6, fontSize: "0.9rem" }}>
              Welcome, {admin.username}
            </p>
          </div>

          {actionMsg && (
            <div
              style={{
                background: t.bgSub,
                border: `1px solid ${t.border}`,
                padding: "10px 14px",
                borderRadius: 6,
                marginBottom: 24,
                fontSize: "0.85rem",
                color: t.text,
              }}
            >
              {actionMsg}
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 16,
              marginBottom: 40,
            }}
          >
            {[
              { label: "Total Properties", value: String(total) },
              { label: "Pending", value: String(pending.length) },
              { label: "Approved", value: String(approved.length) },
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 6 }}>{value}</div>
                <div
                  style={{
                    fontSize: "0.78rem",
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

          {/* Tabs */}
          <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: 32, display: "flex" }}>
            <TabBtn value="pending" label="Pending Properties" count={pending.length} />
            <TabBtn value="approved" label="Approved Properties" count={approved.length} />
            <TabBtn value="owners" label="Owners" count={owners.length} />
            <TabBtn value="visits" label="Visitor Locations" count={visits.length} />
          </div>

          {/* List */}
          {tab === "visits" ? (
            visitsLoading ? (
              <div style={{ padding: "40px 0", color: t.textMuted }}>Loading...</div>
            ) : visits.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: 60, paddingBottom: 60 }}>
                <h3 style={{ color: t.textSub }}>No visitor locations recorded yet.</h3>
                <p>When students allow location access on Explore PGs, it will show here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {visits.map((v) => (
                  <div
                    key={v._id}
                    className="card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                      fontSize: "0.85rem",
                    }}
                  >
                    <div>
                      <strong>Lat:</strong> {v.latitude.toFixed(5)} &nbsp;
                      <strong>Long:</strong> {v.longitude.toFixed(5)}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ color: t.textMuted, fontSize: "0.78rem" }}>
                        {new Date(v.createdAt).toLocaleString()}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "owners" ? (
            ownersLoading ? (
              <div style={{ padding: "40px 0", color: t.textMuted }}>Loading...</div>
            ) : owners.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: 60, paddingBottom: 60 }}>
                <h3 style={{ color: t.textSub }}>No owners registered yet.</h3>
                <p>Registered property owners will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {owners.map((o) => (
                  <div key={o._id} className="card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 16,
                        marginBottom: o.properties.length > 0 ? 16 : 0,
                      }}
                    >
                      <div>
                        <h4 style={{ marginBottom: 4 }}>{o.fullName}</h4>
                        <div style={{ fontSize: "0.85rem", color: t.textSub }}>
                          {o.mobileNumber}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: t.textMuted, marginTop: 4 }}>
                          {o.properties.length} propert{o.properties.length === 1 ? "y" : "ies"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOwner(o._id, o.fullName)}
                        className="btn btn-sm"
                        style={{ background: "#ef4444", color: "#fff", border: "none" }}
                      >
                        Delete Owner
                      </button>
                    </div>

                    {o.properties.length > 0 && (
                      <div
                        style={{
                          borderTop: `1px solid ${t.border}`,
                          paddingTop: 14,
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        {o.properties.map((p) => (
                          <div
                            key={p._id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 10,
                              fontSize: "0.85rem",
                            }}
                          >
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <span>{p.propertyName}</span>
                              <span className={`badge badge-${p.status}`}>{p.status}</span>
                            </div>
                            <a href={`#/property/${p._id}`} className="btn btn-outline btn-sm">
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : loading ? (
            <div style={{ padding: "40px 0", color: t.textMuted }}>Loading...</div>
          ) : list.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 60, paddingBottom: 60 }}>
              <h3 style={{ color: t.textSub }}>
                {tab === "pending" ? "No pending properties." : "No approved properties."}
              </h3>
              <p>
                {tab === "pending"
                  ? "New property submissions will appear here for review."
                  : "Approved listings will appear here once properties are approved."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {list.map((p) => (
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
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}
                    >
                      <h4>{p.propertyName}</h4>
                      <span className={`badge badge-${p.category?.toLowerCase()}`}>{p.category}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: t.textSub }}>
                      {p.address} · Rs. {p.rent}/month
                    </div>
                    <div style={{ fontSize: "0.8rem", color: t.textMuted, marginTop: 4 }}>
                      Owner: {p.ownerName} · {p.phoneNumber}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a href={`#/property/${p._id}`} className="btn btn-outline btn-sm">
                      View
                    </a>
                    {tab === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(p._id)}
                          className="btn btn-sm"
                          style={{ background: "#22c55e", color: "#fff", border: "none" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(p._id)}
                          className="btn btn-sm"
                          style={{ background: "#ef4444", color: "#fff", border: "none" }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {tab === "approved" && (
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="btn btn-sm"
                        style={{ background: "#ef4444", color: "#fff", border: "none" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
