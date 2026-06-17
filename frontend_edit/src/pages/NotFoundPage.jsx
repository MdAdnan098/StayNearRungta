import MainLayout from "../layouts/MainLayout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const NotFoundPage = () => {
  const { t } = useTheme();

  return (
    <MainLayout>
      <div className="empty-state" style={{ padding: "120px 24px" }}>
        <div style={{ fontSize: "4rem", fontWeight: 700, color: t.textMuted, marginBottom: 16 }}>
          404
        </div>
        <h3 style={{ marginBottom: 12, color: t.textSub }}>Page not found</h3>
        <p style={{ marginBottom: 32 }}>The page you are looking for does not exist.</p>
        <a href="#/" className="btn btn-primary">
          Go Home
        </a>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;
