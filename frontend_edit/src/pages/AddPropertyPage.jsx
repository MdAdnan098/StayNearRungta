import { useRef, useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";

const API = "https://staynearrungta-backend.onrender.com";

const AddPropertyPage = () => {
  const { t } = useTheme();
  const { owner, token } = useAuth();

  const editId = window.location.hash.startsWith("#/property/edit/")
    ? window.location.hash.split("/property/edit/")[1]
    : null;
  const isEditMode = !!editId;

  const [form, setForm] = useState({
    name: "",
    rent: "",
    ownerName: "",
    phone: "",
    alternateNumber: "",
    type: "boys",
    description: "",
    address: "",
    hasCooler: null,
    attachedBathroom: null,
    independent: null,
    electricityIncluded: null,
    bedGaddaTakiya: null,
  });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [photoError, setPhotoError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  useEffect(() => {
    if (!isEditMode || !token) return;
    const fetchExisting = async () => {
      try {
        const res = await fetch(`${API}/api/properties/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load property");

        setForm({
          name: data.propertyName || "",
          rent: data.rent != null ? String(data.rent) : "",
          ownerName: data.ownerName || "",
          phone: data.phoneNumber || "",
          alternateNumber: data.alternateNumber || "",
          type: data.category === "Girls" ? "girls" : "boys",
          description: data.description || "",
          address: data.address || "",
          hasCooler: !!data.hasCooler,
          attachedBathroom: !!data.attachedBathroom,
          independent: !!data.isIndependent,
          electricityIncluded: !!data.electricityIncluded,
          bedGaddaTakiya: !!data.bedGaddaTakiyaProvided,
        });
        setLatitude(data.latitude ?? null);
        setLongitude(data.longitude ?? null);
        setExistingPhotos(data.photos || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingExisting(false);
      }
    };
    fetchExisting();
  }, [isEditMode, editId, token]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        set("address", `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      },
      () => alert("Unable to get location. Please enter manually."),
    );
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setPhotoError("");
    if (selected.length > 10) {
      setPhotoError("Aap 10 se jyada photo upload nahi kar sakte");
      const files = selected.slice(0, 10);
      setPhotoFiles(files);
      setPhotoCount(files.length);
      return;
    }
    setPhotoFiles(selected);
    setPhotoCount(selected.length);
  };

  const handleCameraCapture = (e) => {
    const captured = Array.from(e.target.files || []);
    setPhotoError("");
    const total = photoFiles.length + captured.length;
    if (total > 10) {
      setPhotoError("Aap 10 se jyada photo upload nahi kar sakte");
      return;
    }
    const merged = [...photoFiles, ...captured];
    setPhotoFiles(merged);
    setPhotoCount(merged.length);
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.rent || !form.phone || !form.address) {
      setError("Please fill all required fields.");
      return;
    }
    if (form.phone.length !== 10) {
      setError("WhatsApp number must be 10 digits.");
      return;
    }
    if (form.alternateNumber && form.alternateNumber.length !== 10) {
      setError("Alternate number must be 10 digits.");
      return;
    }
    if (!latitude || !longitude) {
      setError("Please capture your location using Get Current Location.");
      return;
    }

    const fd = new FormData();
    fd.append("propertyName", form.name);
    fd.append("rent", String(form.rent));
    fd.append("ownerName", form.ownerName || "");
    fd.append("phoneNumber", form.phone);
    fd.append("alternateNumber", form.alternateNumber || "");
    fd.append("category", form.type === "boys" ? "Boys" : "Girls");
    fd.append("description", form.description || "");
    fd.append("address", form.address);
    fd.append("latitude", String(latitude));
    fd.append("longitude", String(longitude));
    fd.append("hasCooler", String(form.hasCooler));
    fd.append("attachedBathroom", String(form.attachedBathroom));
    fd.append("isIndependent", String(form.independent));
    fd.append("electricityIncluded", String(form.electricityIncluded));
    fd.append("bedGaddaTakiyaProvided", String(form.bedGaddaTakiya));

    existingPhotos.forEach((url) => fd.append("retainPhotos", url));
    photoFiles.forEach((f) => fd.append("photos", f));

    setPublishing(true);
    try {
      const url = isEditMode
        ? `${API}/api/properties/${editId}`
        : `${API}/api/properties`;
      const method = isEditMode ? "PUT" : "POST";

      // 2 minute timeout — Cloudinary upload le sakta hai time
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      let res;
      try {
        res = await fetch(url, {
          method,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: fd,
          signal: controller.signal,
        });
      } catch (fetchErr) {
        if (fetchErr.name === "AbortError") {
          throw new Error("Upload mein zyada time lag raha hai. Internet check karein aur dobara try karein.");
        }
        throw fetchErr;
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to submit property");
      setSubmitted(true);
      setForm({
        name: "",
        rent: "",
        ownerName: "",
        phone: "",
        alternateNumber: "",
        type: "boys",
        description: "",
        address: "",
        hasCooler: null,
        attachedBathroom: null,
        independent: null,
        electricityIncluded: null,
        bedGaddaTakiya: null,
      });
      setPhotoFiles([]);
      setPhotoCount(0);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (!owner) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ padding: "120px 24px" }}>
          <h3 style={{ marginBottom: 12, color: t.textSub }}>Login Required</h3>
          <p style={{ marginBottom: 24 }}>Please login to add a property.</p>
          <a href="#/owner/login" className="btn btn-primary">
            Login
          </a>
        </div>
      </MainLayout>
    );
  }

  if (loadingExisting) {
    return (
      <MainLayout>
        <div className="section-sm">
          <div className="container" style={{ maxWidth: 660 }}>
            <p style={{ color: t.textMuted }}>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Success screen (hinglish message) ──────────────────────────────────────
  if (submitted) {
    return (
      <MainLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 16px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            {/* Big checkmark */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#d4edda",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "2rem",
              }}
            >
              ✓
            </div>
            <h2 style={{ marginBottom: 16 }}>
              {isEditMode ? "Property Update Ho Gayi! 🎉" : "Property Add Ho Gayi! 🎉"}
            </h2>
            <p
              style={{
                color: t.textSub,
                marginBottom: 12,
                lineHeight: 1.7,
                fontSize: "0.95rem",
              }}
            >
              {isEditMode
                ? "Aapki property successfully update ho gayi hai aur ab Explore mein dikhai degi. 🏠"
                : "Aapki property successfully add ho gayi hai! Admin ke approve karne ke baad ye dashboard par show hona start ho jayega. Thodi der mein notification mil sakti hai."}
            </p>
            <p
              style={{
                color: t.textMuted,
                marginBottom: 32,
                fontSize: "0.85rem",
              }}
            >
              {isEditMode
                ? "Aapke changes turant Explore mein reflect ho jayenge."
                : "Approval mein aamtaur par 24 ghante tak ka time lagta hai. Patience rakhen! 😊"}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a href="#/dashboard" className="btn btn-primary">
                Dashboard Dekho
              </a>
              {!isEditMode && (
                <a
                  href="#/property/add"
                  className="btn btn-outline"
                  onClick={() => setSubmitted(false)}
                >
                  Aur Property Add Karo
                </a>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      {publishing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 10, 20, 0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto",
                borderRadius: "50%",
                padding: 5,
                background:
                  "conic-gradient(from 0deg, #6366f1, #ec4899, #f59e0b, #6366f1)",
                animation: "publishSpin 0.8s linear infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#1c1c28",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 18,
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.92rem",
                letterSpacing: "0.01em",
              }}
            >
              {isEditMode ? "Changes save ho rahi hain..." : "Property publish ho rahi hai..."}
            </div>
            <div style={{ marginTop: 6, color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
              Thoda intezaar karein, photos upload ho rahi hain
            </div>
          </div>
          <style>{`@keyframes publishSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <MainLayout>
      <div className="section-sm">
        <div className="container" style={{ maxWidth: 660 }}>
          <div style={{ marginBottom: 40 }}>
            <a
              href="#/dashboard"
              style={{ fontSize: "0.85rem", color: t.textMuted }}
            >
              ← Back to Dashboard
            </a>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: t.textMuted,
                marginBottom: 12,
                marginTop: 20,
              }}
            >
              {isEditMode ? "Edit Listing" : "New Listing"}
            </div>
            <h2>{isEditMode ? "Edit Property" : "Add Property"}</h2>
          </div>

          <FormField label="Property Name *">
            <input
              type="text"
              placeholder="e.g. Sharma Boys PG"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormField label="Monthly Rent (Rs.) *">
              <input
                type="number"
                placeholder="e.g. 4500"
                value={form.rent}
                onChange={(e) => set("rent", e.target.value)}
              />
            </FormField>
            <FormField label="Type *">
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </FormField>
          </div>

          <FormField label="Owner Name *">
            <input
              type="text"
              placeholder="Full name"
              value={form.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
            />
          </FormField>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "end" }}
          >
            <FormField label="WhatsApp Number *">
              <input
                type="tel"
                placeholder="Apna WhatsApp number"
                maxLength={10}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </FormField>
            <FormField label="Alternate Number (optional)">
              <input
                type="tel"
                placeholder="Backup number (10 digit)"
                maxLength={10}
                value={form.alternateNumber}
                onChange={(e) => set("alternateNumber", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Facilities (Suvidhayen)">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Cooler Available?", field: "hasCooler" },
                { label: "Attached Bathroom?", field: "attachedBathroom" },
                { label: "Independent Room/PG?", field: "independent" },
                { label: "Bijli Bill Included in Rent?", field: "electricityIncluded" },
                { label: "Bed, Takiya, Gadda Provided?", field: "bedGaddaTakiya" },
              ].map(({ label, field }) => (
                <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: `1px solid ${t.border}`, borderRadius: 8 }}>
                  <span style={{ fontSize: "0.9rem" }}>{label}</span>
                  <div style={{ display: "flex", gap: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form[field] === true}
                        onChange={() => set(field, true)}
                      />
                      <span style={{ fontSize: "0.85rem", color: "green" }}>Yes</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form[field] === false}
                        onChange={() => set(field, false)}
                      />
                      <span style={{ fontSize: "0.85rem", color: "red" }}>No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </FormField>

          <FormField label="Full Address *">
            <textarea
              placeholder="Full address with landmark"
              style={{ minHeight: 72 }}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
            <div style={{ marginTop: 10 }}>
              <button
                onClick={handleLocation}
                className="btn btn-outline btn-sm"
                type="button"
              >
                Get Current Location
              </button>
            </div>
          </FormField>

          <FormField
            label={
              isEditMode
                ? "Upload New Photos (added to existing photos, max 10 total)"
                : "Upload Photos (max 10)"
            }
          >
            {isEditMode && existingPhotos.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {existingPhotos.map((url, idx) => (
                  <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: `1px solid ${t.border}`,
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setExistingPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "red",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        lineHeight: "20px",
                        textAlign: "center",
                        padding: 0,
                        fontWeight: "bold",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif,.avif,.webp,.bmp,.tiff,.tif"
              multiple
              style={{ padding: "10px 0", color: t.textSub }}
              onChange={handleFiles}
            />
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                className="btn btn-outline btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                📷 Camera
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleCameraCapture}
              />
            </div>
            {photoError && (
              <div style={{ marginTop: 8, fontSize: "0.82rem", color: "red", fontWeight: 600 }}>
                {photoError}
              </div>
            )}
            {photoCount > 0 && (
              <div
                style={{ marginTop: 8, fontSize: "0.82rem", color: t.textSub }}
              >
                {photoCount} photo(s) selected.
              </div>
            )}
          </FormField>

          {error && (
            <div style={{ color: t.danger, marginBottom: 12 }}>{error}</div>
          )}

          <hr className="divider" />

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-block btn-lg"
            disabled={publishing}
            style={{ opacity: publishing ? 0.8 : 1, cursor: publishing ? "not-allowed" : "pointer" }}
          >
            {publishing ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{
                  width: 18, height: 18,
                  border: "2.5px solid rgba(255,255,255,0.35)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.75s linear infinite",
                }} />
                {isEditMode ? "Saving..." : "Publishing..."}
              </span>
            ) : (
              isEditMode ? "Save Changes" : "Publish Property"
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              marginTop: 12,
              fontSize: "0.78rem",
              color: t.textMuted,
              textAlign: "center",
            }}
          >
            {isEditMode
              ? "Changes save hote hi turant Explore mein update ho jayega."
              : "Your listing will be reviewed by an admin before going live."}
          </div>
        </div>
      </div>
      </MainLayout>
    </>
  );
};

export default AddPropertyPage;
