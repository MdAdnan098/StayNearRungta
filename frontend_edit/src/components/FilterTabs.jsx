import { useTheme } from "../context/ThemeContext.jsx";

const FilterTabs = ({ value, onChange }) => {
  const { t } = useTheme();

  const options = [
    { value: "all", label: "All" },
    { value: "boys", label: "Boys" },
    { value: "girls", label: "Girls" },
  ];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="btn btn-sm"
          style={{
            background: value === opt.value ? t.accent : "transparent",
            color: value === opt.value ? t.accentText : t.textSub,
            border: `1.5px solid ${value === opt.value ? t.accent : t.border}`,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
