import { useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const AdminLoginPage = () => {
  const { t } = useTheme();
  const { loginAdmin } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Please fill all fields.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await loginAdmin(form.username, form.password);
    setLoading(false);
    if (!result.success) setError(result.message || "Login failed");
  };

  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 16px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
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
              Platform Administration
            </div>
            <h2>Admin Sign In</h2>
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

          <FormField label="Username">
            <input
              type="text"
              placeholder="Admin username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              placeholder="Admin password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </FormField>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminLoginPage;
