import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

// Keys match the boolean fields returned by the Property API directly,
// so filtering can be done with a simple property[key] === true check.
export const AMENITY_OPTIONS = [
  { key: "hasCooler", label: "Cooler hai" },
  { key: "attachedBathroom", label: "Attached bathroom hai" },
  { key: "isIndependent", label: "Independent hai" },
  { key: "electricityIncluded", label: "Bijli bill included" },
  { key: "bedGaddaTakiyaProvided", label: "Bed, gadda, takiya diya" },
];

const AmenityFilterPanel = ({ filters, onChange, onClear }) => {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-sm"
        type="button"
        style={{
          background: activeCount > 0 ? t.accent : "transparent",
          color: activeCount > 0 ? t.accentText : t.textSub,
          border: `1.5px solid ${activeCount > 0 ? t.accent : t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ⚙ Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 250,
            zIndex: 50,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.textMuted,
              marginBottom: 14,
            }}
          >
            Amenities se filter karo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AMENITY_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "0.85rem",
                  color: t.textSub,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!filters[opt.key]}
                  onChange={(e) => onChange(opt.key, e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: t.accent, cursor: "pointer" }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="btn btn-outline btn-sm"
              type="button"
              style={{ marginTop: 16, width: "100%" }}
            >
              Sab Clear Karo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AmenityFilterPanel;
