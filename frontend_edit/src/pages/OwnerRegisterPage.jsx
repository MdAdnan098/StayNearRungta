import { useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const OwnerRegisterPage = () => {
  const { t } = useTheme();
  const { registerOwner } = useAuth();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.mobile || !form.password || !form.confirm) {
      setError("Please fill all fields.");
      return;
    }
    if (form.mobile.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    const result = await registerOwner(form.name, form.mobile, form.password);
    if (!result.success) setError(result.message || "Registration failed");
  };

  if (success) {
    return (
      <MainLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 16px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <h2 style={{ marginBottom: 12 }}>Registration Submitted</h2>
            <p style={{ color: t.textSub, marginBottom: 32 }}>
              Your account request has been received. You will be able to login
              once approved.
            </p>
            <a href="#/owner/login" className="btn btn-primary">
              Go to Login
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

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
            <h2>Create Account</h2>
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

          <FormField label="Full Name">
            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          <FormField label="Mobile Number">
            <input
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </FormField>

          <FormField label="Confirm Password">
            <PasswordInput
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
            />
          </FormField>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 8 }}
          >
            Create Account
          </button>

          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: "0.85rem",
              color: t.textSub,
            }}
          >
            Already have an account?{" "}
            <a href="#/owner/login" style={{ fontWeight: 600, color: t.text }}>
              Sign in
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerRegisterPage;
