import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { AdminContext } from '../context/AdminContext';
import AnnouncementApi from "../api/AnnouncementApi";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { useTheme } from '../context/ThemeContext'; // Import theme context

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
  });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  /* ------------------------------------------------------------------ */
  /* 1. FETCH + SORT                                                   */
  /* ------------------------------------------------------------------ */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await AnnouncementApi.getAll();               // <-- your API call
      const list = res?.data?.announcements || [];              // <-- NEW PATH
      // Sort newest first
      const sorted = list.sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
      setAnnouncements(sorted);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      alert("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* ------------------------------------------------------------------ */
  /* 2. SUBMIT (with loading)                                          */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AnnouncementApi.create(formData);
      alert("Announcement created successfully!");
      setFormData({ title: "", description: "", type: "", priority: "" });
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to create: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await AnnouncementApi.delete(id);
      alert("Deleted!");
      fetchAnnouncements();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 3. THEMING (memoised)                                             */
  /* ------------------------------------------------------------------ */
  const themeColors = useMemo(() => ({
    background: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : 'white',
    textPrimary: isDarkMode ? '#e2e8f0' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  }), [isDarkMode]);

  const getPriorityColor = useCallback((p) => {
    switch (p) {
      case 'high': return themeColors.error;
      case 'medium': return themeColors.warning;
      case 'low': return themeColors.success;
      default: return '#6b7280';
    }
  }, [themeColors]);

  const getPriorityText = (p) => {
    switch (p) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return '—';
    }
  };

  /* ------------------------------------------------------------------ */
  /* 4. HELPERS – DATE & AUTHOR                                        */
  /* ------------------------------------------------------------------ */
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  const handleMenuToggle = () => setSidebarCollapsed(p => !p);

  /* ------------------------------------------------------------------ */
  /* 5. EARLY RETURNS                                                  */
  /* ------------------------------------------------------------------ */
  if (adminLoading) {
    return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: themeColors.background, color: themeColors.textPrimary }}>Loading…</div>;
  }
  if (!admin?.role) {
    return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: themeColors.background, color: themeColors.textPrimary }}>Unauthorized</div>;
  }

  /* ------------------------------------------------------------------ */
  /* 6. RENDER                                                         */
  /* ------------------------------------------------------------------ */
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
    }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
        isDarkMode={isDarkMode} // Pass from context
      />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: sidebarWidth,
        backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
      }}>
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode} // Pass from context
          // Remove onThemeToggle prop since Navbar now uses context directly
          admin={admin}
        />

        <main style={{ flex: 1, overflow: 'auto', padding: '30px', paddingTop: '94px' }}>
          {/* ---------- TITLE ---------- */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: themeColors.textPrimary, marginBottom: '8px' }}>
              Announcements
            </h1>
            <p style={{ color: themeColors.textSecondary, fontSize: '16px' }}>
              Create and manage announcements for your organization
            </p>
          </div>

          {/* ---------- CREATE FORM ---------- */}
          <div style={{
            background: themeColors.cardBg,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: isDarkMode ? "0 4px 6px rgba(0,0,0,.3)" : "0 1px 3px rgba(0,0,0,.1)",
            border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: themeColors.textPrimary, fontSize: '20px', fontWeight: 600 }}>
              Add New Announcement
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                style={inputStyle(themeColors)}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                style={inputStyle(themeColors, true)}
              />
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                required
                style={inputStyle(themeColors)}
              >
                <option value="">Select Type</option>
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
                <option value="policy">Policy</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                required
                style={inputStyle(themeColors)}
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...btnStyle,
                  opacity: loading ? .7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating…' : 'Create Announcement'}
              </button>
            </form>
          </div>

          {/* ---------- LIST TITLE ---------- */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: themeColors.textPrimary, fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
              All Announcements
            </h2>
            <p style={{ color: themeColors.textSecondary, fontSize: '14px' }}>
              {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* ---------- LOADING / EMPTY / LIST ---------- */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: themeColors.textSecondary }}>
              Loading announcements…
            </div>
          ) : announcements.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: themeColors.cardBg,
              borderRadius: '12px',
              border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>No announcements</div>
              <p style={{ color: themeColors.textSecondary }}>Create your first one above.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}>
              {announcements.map(a => (
                <div
                  key={a._id}
                  style={{
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: "12px",
                    padding: "20px",
                    background: themeColors.cardBg,
                    boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,.2)" : "0 2px 8px rgba(0,0,0,.1)",
                    transition: 'transform .2s, box-shadow .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isDarkMode ? "0 8px 25px rgba(0,0,0,.3)" : "0 8px 25px rgba(0,0,0,.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = isDarkMode ? "0 2px 8px rgba(0,0,0,.2)" : "0 2px 8px rgba(0,0,0,.1)";
                  }}
                >
                  {/* PRIORITY BADGE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: themeColors.textPrimary, flex: 1 }}>
                      {a.title}
                    </h3>
                    <span style={{
                      background: `${getPriorityColor(a.priority)}20`,
                      color: getPriorityColor(a.priority),
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      {getPriorityText(a.priority)}
                    </span>
                  </div>

                  {/* DATE + AUTHOR */}
                  <div style={{ fontSize: '13px', color: themeColors.textSecondary, marginBottom: '8px' }}>
                    <div>Published: {formatDate(a.publishDate)}</div>
                    <div>By: <strong style={{ color: themeColors.textPrimary }}>{a.createdBy.fullName}</strong></div>
                  </div>

                  {/* DESCRIPTION */}
                  <p style={{ fontSize: '14px', color: themeColors.textSecondary, lineHeight: 1.5, marginBottom: '12px' }}>
                    {a.description}
                  </p>

                  {/* TYPE + DELETE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: themeColors.textSecondary }}>
                    <span style={{ textTransform: 'capitalize' }}>
                      Type: <strong style={{ color: themeColors.textPrimary }}>{a.type}</strong>
                    </span>
                    <button
                      onClick={() => handleDelete(a._id)}
                      aria-label={`Delete ${a.title}`}
                      style={{
                        background: themeColors.error,
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        transition: 'background .2s',
                      }}
                      onMouseEnter={e => e.target.style.background = '#dc2626'}
                      onMouseLeave={e => e.target.style.background = themeColors.error}
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
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Helper styles (kept inline for brevity)                           */
/* ------------------------------------------------------------------ */
const inputStyle = (t, textarea = false) => ({
  padding: "12px",
  borderRadius: "8px",
  border: `1px solid ${t.border}`,
  background: t.cardBg,
  color: t.textPrimary,
  fontSize: "14px",
  resize: textarea ? 'vertical' : 'none',
});

const btnStyle = {
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "#007bff",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "14px",
  transition: "background .2s",
};

export default Announcements;