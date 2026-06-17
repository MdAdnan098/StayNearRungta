import { useTheme } from "../context/ThemeContext.jsx";

const ThemeToggle = ({ style = {} }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title="Toggle dark mode"
      style={{ color: "#fff", fontSize: "1rem", padding: "4px 8px", opacity: 0.7, ...style }}
    >
      {theme === "dark" ? "Sun" : "Moon"}
    </button>
  );
};

export default ThemeToggle;
