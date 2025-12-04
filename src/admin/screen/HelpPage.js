// src/pages/HelpPage.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import HelpApi from "../api/HelpApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { useTheme } from "../context/ThemeContext";

const HelpPage = () => {
  const navigate = useNavigate();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};
  const { isDarkMode } = useTheme();

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  // Data & Form State
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", icon: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Combined loading state - prevents UI from showing until everything is ready
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Theme Colors
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? "#1e293b" : "#ffffff",
    cardBgSecondary: isDarkMode ? "#2d3748" : "#f7fafc",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1a202c",
    textSecondary: isDarkMode ? "#94a3b8" : "#718096",
    textMuted: isDarkMode ? "#64748b" : "#a0aec0",
    border: isDarkMode ? "#374151" : "#e2e8f0",
    borderLight: isDarkMode ? "#4b5563" : "#f1f5f9",
    primary: "#3b82f6",
    accent: isDarkMode ? "#6366f1" : "#4f46e5",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    gradient: isDarkMode
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const handleMenuToggle = () => setSidebarCollapsed((prev) => !prev);

  // Fetch Topics
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await HelpApi.getAllTopics();
      setTopics(res.data.data || []);
    } catch (err) {
      console.error("Error fetching topics:", err);
      alert(err.response?.data?.error || "Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetching
    fetchTopics();
  }, []);

  // Check when all initial loading is complete
  useEffect(() => {
    if (!adminLoading && !loading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [adminLoading, loading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await HelpApi.updateTopic(editingId, form);
      } else {
        await HelpApi.addTopic(form);
      }
      resetForm();
      fetchTopics();
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  const resetForm = () => {
    setForm({ title: "", icon: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (topic) => {
    setForm({
      title: topic.title,
      icon: topic.icon || "",
      description: topic.description || "",
    });
    setEditingId(topic._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await HelpApi.deleteTopic(id);
      fetchTopics();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete topic");
    }
  };

  // Show full loading screen until everything is ready
  if (isInitialLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.background,
          color: themeColors.textPrimary,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: `3px solid ${themeColors.border}`,
              borderTop: `3px solid ${themeColors.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Loading help topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: themeColors.background,
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          display: "flex",
          flexDirection: "column",
          backgroundColor: themeColors.background,
          transition: "margin 0.3s ease",
        }}
      >
        {/* Navbar */}
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
            paddingTop: "88px",
            background: `linear-gradient(135deg, ${themeColors.background} 0%, ${
              isDarkMode ? "#1e293b" : "#ffffff"
            } 100%)`,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: themeColors.accent,
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              ← Back
            </button>

            <div
              style={{
                background: themeColors.gradient,
                borderRadius: "16px",
                padding: "28px",
                color: "white",
                boxShadow: isDarkMode
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
                  : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0" }}>
                Help & FAQs Management
              </h1>
              <p style={{ fontSize: "16px", margin: 0, opacity: 0.9 }}>
                Manage help topics and frequently asked questions
              </p>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div
              style={{
                background: themeColors.cardBg,
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "32px",
                boxShadow: isDarkMode
                  ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: `1px solid ${themeColors.borderLight}`,
                maxWidth: "600px",
              }}
            >
              <h3 style={{ color: themeColors.textPrimary, margin: "0 0 20px 0" }}>
                {editingId ? "Edit Topic" : "Add New Topic"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  style={{
                    padding: "12px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: `1px solid ${themeColors.border}`,
                    background: themeColors.cardBgSecondary,
                    color: themeColors.textPrimary,
                  }}
                />
                <input
                  type="text"
                  name="icon"
                  placeholder="Icon (emoji)"
                  value={form.icon}
                  onChange={handleChange}
                  style={{
                    padding: "12px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: `1px solid ${themeColors.border}`,
                    background: themeColors.cardBgSecondary,
                    color: themeColors.textPrimary,
                  }}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    padding: "12px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: `1px solid ${themeColors.border}`,
                    background: themeColors.cardBgSecondary,
                    color: themeColors.textPrimary,
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: "10px 20px",
                      background: themeColors.cardBgSecondary,
                      color: themeColors.textSecondary,
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      background: themeColors.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {editingId ? "Update" : "Add"} Topic
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Button & Topics Grid */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ color: themeColors.textPrimary, margin: 0 }}>All Topics ({topics.length})</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: "12px 24px",
                background: themeColors.accent,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              + Add Topic
            </button>
          </div>

          {/* Topics Grid */}
          {topics.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: themeColors.textMuted,
                background: themeColors.cardBg,
                borderRadius: "16px",
                border: `1px dashed ${themeColors.borderLight}`,
              }}
            >
              <p style={{ fontSize: "18px" }}>No help topics yet.</p>
              <p>Add your first topic to get started!</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  style={{
                    background: themeColors.cardBg,
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: isDarkMode
                      ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                      : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: `1px solid ${themeColors.borderLight}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 12px 0", color: themeColors.textPrimary, fontSize: "18px" }}>
                      {topic.icon} {topic.title}
                    </h3>
                    <p style={{ color: themeColors.textSecondary, margin: "0 0 20px 0", lineHeight: "1.5" }}>
                      {topic.description || "No description provided."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => handleEdit(topic)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: themeColors.warning,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(topic._id)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: themeColors.error,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Spinner Animation */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default HelpPage;