import { useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const OwnerLoginPage = () => {
  const { t } = useTheme();
  const { loginOwner } = useAuth();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [error, setError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.mobile || !form.password) {
      setError("Please fill all fields.");
      return;
    }
    setError("");
    const result = await loginOwner(form.mobile, form.password);
    if (!result.success) setError(result.message || "Login failed");
  };

  return (
    <MainLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "80px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
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
              Property Owner
            </div>
            <h2>Sign In</h2>
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

          <FormField label="Mobile Number">
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              placeholder="Your password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </FormField>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 8 }}
          >
            Sign In
          </button>

          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: "0.85rem",
              color: t.textSub,
            }}
          >
            New owner?{" "}
            <a
              href="#/owner/register"
              style={{ fontWeight: 600, color: t.text }}
            >
              Register here
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerLoginPage;
