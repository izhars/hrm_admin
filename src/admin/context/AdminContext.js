import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from '../api';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setAdmin(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError("");
    
    try {
      const data = await AuthApi.login({ email, password });

      if (!data.success) {
        setError(data.message || "Login failed");
        return false;
      }

      const allowedRoles = ["superadmin", "admin", "hr"];
      if (!allowedRoles.includes(data.user.role)) {
        setError("Only admins or HR can login here!");
        return false;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setAdmin(data.user);
      navigate("/admin/dashboard", { replace: true });
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add forgotPassword function
  const handleForgotPassword = async (email) => {
    try {
      const data = await AuthApi.forgotPassword(email);
      return data; // This returns { success: boolean, message: string }
    } catch (err) {
      console.error("Forgot password error:", err);
      return { 
        success: false, 
        message: err.message || "Failed to send reset email" 
      };
    }
  };

  const handleLogout = () => {
    setAdmin(null);
    setError("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <AdminContext.Provider
      value={{ 
        admin, 
        error, 
        loading, 
        login: handleLogin, 
        logout: handleLogout,
        forgotPassword: handleForgotPassword // Add this
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AdminContext.Provider>
  );
};