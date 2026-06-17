import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import GlobalStyles from "./assets/GlobalStyles.jsx";
import useRouter from "./hooks/useRouter.js";

import LandingPage from "./pages/LandingPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";
import OwnerLoginPage from "./pages/OwnerLoginPage.jsx";
import OwnerRegisterPage from "./pages/OwnerRegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AddPropertyPage from "./pages/AddPropertyPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminRegisterPage from "./pages/AdminRegisterPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const Router = () => {
  const { path } = useRouter();
  const route = path.replace("#", "") || "/";

  if (route === "/") return <LandingPage />;
  if (route === "/explore") return <ExplorePage />;
  if (route === "/owner/login") return <OwnerLoginPage />;
  if (route === "/owner/register") return <OwnerRegisterPage />;
  if (route === "/dashboard") return <DashboardPage />;
  if (route === "/property/add") return <AddPropertyPage />;
  if (route.startsWith("/property/edit/")) return <AddPropertyPage />;
  if (route.startsWith("/property/")) return <PropertyDetailsPage />;
  if (route === "/admin/login") return <AdminLoginPage />;
  if (route === "/admin/setup") return <AdminRegisterPage />;
  if (route === "/admin") return <AdminDashboardPage />;
  return <NotFoundPage />;
};

const AppInner = () => {
  const { t } = useTheme();
  return (
    <>
      <GlobalStyles t={t} />
      <Router />
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
