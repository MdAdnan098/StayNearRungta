import { useTheme } from "../context/ThemeContext.jsx";

const EmptyState = ({ title, description, action }) => {
  const { t } = useTheme();

  return (
    <div className="empty-state">
      <h3 style={{ marginBottom: 12, color: t.textSub }}>{title}</h3>
      <p style={{ marginBottom: action ? 28 : 0 }}>{description}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
