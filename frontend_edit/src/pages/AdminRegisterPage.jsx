import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const API = "http://localhost:5000";

const AdminRegisterPage = () => {
  const { t } = useTheme();
  const { registerAdmin } = useAuth();
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    // Check if admin already exists – if yes, block this page
    fetch(`${API}/api/admin/status`)
      .then((r) => r.json())
      .then((data) => {
        setAdminExists(data.adminExists);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.confirm) {
      setError("Please fill all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await registerAdmin(form.username, form.password);
    setLoading(false);
    if (!result.success) setError(result.message || "Registration failed");
  };

  if (checking) {
    return (
      <MainLayout>
        <div style={{ display: "flex", justifyContent: "center", padding: "120px 24px" }}>
          <p style={{ color: t.textMuted }}>Checking...</p>
        </div>
      </MainLayout>
    );
  }

  if (adminExists) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ padding: "120px 24px" }}>
          <h3 style={{ marginBottom: 12, color: t.textSub }}>Setup Already Done</h3>
          <p style={{ marginBottom: 24 }}>
            An admin account already exists. Please use the login page.
          </p>
          <a href="#/admin/login" className="btn btn-primary">
            Admin Login
          </a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 16px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 40 }}>
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
              One-Time Setup
            </div>
            <h2>Create Admin Account</h2>
            <p style={{ color: t.textSub, marginTop: 10, fontSize: "0.9rem" }}>
              This page is only available once. After setup, this link will be deactivated.
            </p>
          </div>

          {error && (
            <div
              style={{
                border: `1px solid ${t.danger}`,
                color: t.danger,
                padding: "10px 14px",
                borderRadius: 6,
                marginBottom: 20,
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <FormField label="Admin Username">
            <input
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </FormField>

          <FormField label="Confirm Password">
            <PasswordInput
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
            />
          </FormField>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminRegisterPage;
