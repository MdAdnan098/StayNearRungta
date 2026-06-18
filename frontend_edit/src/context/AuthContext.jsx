import { createContext, useContext, useEffect, useState } from "react";
import { navigate } from "../utils/router.js";

const AuthContext = createContext();
const API = "https://staynearrungta-backend.onrender.com";

export const AuthProvider = ({ children }) => {
  const [owner, setOwner] = useState(() => {
    try {
      const s = localStorage.getItem("owner");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  // Admin state – persisted in localStorage so refresh doesn't log out
  const [admin, setAdmin] = useState(() => {
    try {
      const s = localStorage.getItem("admin");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("adminToken") || null,
  );

  // Persist owner
  useEffect(() => {
    if (owner) localStorage.setItem("owner", JSON.stringify(owner));
    else localStorage.removeItem("owner");
  }, [owner]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // Persist admin
  useEffect(() => {
    if (admin) localStorage.setItem("admin", JSON.stringify(admin));
    else localStorage.removeItem("admin");
  }, [admin]);

  useEffect(() => {
    if (adminToken) localStorage.setItem("adminToken", adminToken);
    else localStorage.removeItem("adminToken");
  }, [adminToken]);

  const loginOwner = async (mobileNumber, password) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setOwner(data.owner);
      setToken(data.token);
      navigate("#/dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const registerOwner = async (fullName, mobileNumber, password) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, mobileNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setOwner(data.owner);
      setToken(data.token);
      navigate("#/dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Admin register – one-time setup
  const registerAdmin = async (username, password) => {
    try {
      const res = await fetch(`${API}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setAdmin(data.admin);
      setAdminToken(data.token);
      navigate("#/admin");
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Admin login – real API call
  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setAdmin(data.admin);
      setAdminToken(data.token);
      navigate("#/admin");
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setOwner(null);
    setToken(null);
    setAdmin(null);
    setAdminToken(null);
    navigate("#/");
  };

  return (
    <AuthContext.Provider
      value={{
        owner,
        token,
        admin,
        adminToken,
        loginOwner,
        registerOwner,
        loginAdmin,
        registerAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
