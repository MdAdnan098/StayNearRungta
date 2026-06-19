import { useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const OwnerLoginPage = () => {
  const { t } = useTheme();
  const { loginOwner } = useAuth();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetForm, setResetForm] = useState({ mobile: "", newPassword: "", confirmPassword: "" });
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async () => {
    if (!resetForm.mobile || !resetForm.newPassword || !resetForm.confirmPassword) {
      setResetError("Please fill all fields.");
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetError("");
    setResetLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: resetForm.mobile, newPassword: resetForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess("Password reset successful! Please login.");
        setResetForm({ mobile: "", newPassword: "", confirmPassword: "" });
      } else {
        setResetError(data.message || "Reset failed.");
      }
    } catch {
      setResetError("Something went wrong.");
    } finally {
      setResetLoading(false);
    }
  };

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
            <a href="#/owner/register" style={{ fontWeight: 600, color: t.text }}>
              Register here
            </a>
          </div>

          <div style={{ marginTop: 12, textAlign: "center", display: "flex", justifyContent: "center", gap: 16 }}>
            <button
              onClick={() => { setShowReset(!showReset); setResetError(""); setResetSuccess(""); }}
              style={{ background: "none", border: "none", color: t.textMuted, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Forgot Password?
            </button>
            <button
              onClick={() => { setShowReset(!showReset); setResetError(""); setResetSuccess(""); }}
              style={{ background: "none", border: "none", color: t.textMuted, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Reset Password
            </button>
          </div>

          {showReset && (
            <div style={{ marginTop: 24, padding: "20px", border: `1px solid ${t.border}`, borderRadius: 8 }}>
              <h4 style={{ marginBottom: 16 }}>Reset Password</h4>

              {resetError && (
                <div style={{ border: `1px solid ${t.danger}`, color: t.danger, padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: "0.85rem" }}>
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div style={{ border: `1px solid green`, color: "green", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: "0.85rem" }}>
                  {resetSuccess}
                </div>
              )}

              <FormField label="Registered Mobile Number">
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={resetForm.mobile}
                  onChange={(e) => setResetForm((f) => ({ ...f, mobile: e.target.value }))}
                />
              </FormField>

              <FormField label="New Password">
                <PasswordInput
                  placeholder="New password"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm((f) => ({ ...f, newPassword: e.target.value }))}
                />
              </FormField>

              <FormField label="Confirm New Password">
                <PasswordInput
                  placeholder="Confirm new password"
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                />
              </FormField>

              <button
                onClick={handleReset}
                className="btn btn-primary btn-block"
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerLoginPage;
