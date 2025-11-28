import React, { useEffect, useState, useContext } from "react";
import PollApi from "../api/PollApi";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useTheme } from '../context/ThemeContext'; // Import theme context

const PollScreen = () => {
  const navigate = useNavigate(); // Add this hook

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};


  // Poll states
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    q: "",
    opts: "",
    exp: "",
    multi: false,
    anon: true,
  });
  const [options, setOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [editingPoll, setEditingPoll] = useState(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);
  const [editOptionText, setEditOptionText] = useState("");

  // Focus states for proper styling
  const [focusedInput, setFocusedInput] = useState(null);

  // Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
    success: isDarkMode ? "#10b981" : "#059669",
    warning: isDarkMode ? "#f59e0b" : "#d97706",
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  // ───── Fetch Polls ─────
  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await PollApi.getAll();
      const pollsData =
        res?.data?.data?.polls || res?.data?.polls || res?.polls || [];
      setPolls(pollsData);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError("Failed to fetch polls");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (pollId) => {
    navigate(`/poll-results/${pollId}`);
  };

  // ───── Option Management ─────
  const addOption = () => {
    const trimmedOption = form.opts.trim();
    if (trimmedOption && !options.includes(trimmedOption)) {
      setOptions([...options, trimmedOption]);
      setForm({ ...form, opts: "" });
    }
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (editingOptionIndex === index) {
      setEditingOptionIndex(null);
      setEditOptionText("");
    }
  };

  const startEditOption = (index, text) => {
    setEditingOptionIndex(index);
    setEditOptionText(text);
  };

  const saveEditedOption = () => {
    if (editOptionText.trim() && editingOptionIndex !== null) {
      const newOptions = [...options];
      newOptions[editingOptionIndex] = editOptionText.trim();
      setOptions(newOptions);
      setEditingOptionIndex(null);
      setEditOptionText("");
    }
  };

  const cancelEditOption = () => {
    setEditingOptionIndex(null);
    setEditOptionText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  // ───── Focus Handlers ─────
  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  // ───── Create Poll ─────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (options.length < 2) {
      alert("Please add at least 2 options for your poll");
      return;
    }

    try {
      const data = {
        q: form.q,
        opts: options,
        exp: form.exp || undefined,
        multi: form.multi,
        anon: form.anon,
      };

      const res = await PollApi.create(data);

      // Reset form and show success
      setForm({ q: "", opts: "", exp: "", multi: false, anon: true });
      setOptions([]);
      fetchPolls();
      setActiveTab("view");

    } catch (err) {
      console.error("Error creating poll:", err);
      alert("Failed to create poll");
    }
  };

  // ───── Edit Poll ─────
  const startEditPoll = (poll) => {
    setEditingPoll(poll);
    setForm({
      q: poll.question,
      opts: "",
      exp: poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : "",
      multi: poll.allowMultiple,
      anon: poll.isAnonymous,
    });
    setOptions(poll.options.map(opt => opt.text));
    setActiveTab("create");
  };

  const handleUpdatePoll = async (e) => {
    e.preventDefault();

    if (options.length < 2) {
      alert("Please add at least 2 options for your poll");
      return;
    }

    try {
      const data = {
        q: form.q,
        opts: options,
        exp: form.exp || undefined,
        multi: form.multi,
        anon: form.anon,
      };

      const res = await PollApi.update(editingPoll._id, data);

      // Reset form and show success
      setForm({ q: "", opts: "", exp: "", multi: false, anon: true });
      setOptions([]);
      setEditingPoll(null);
      fetchPolls();
      setActiveTab("view");

    } catch (err) {
      console.error("Error updating poll:", err);
      alert("Failed to update poll");
    }
  };

  const cancelEdit = () => {
    setEditingPoll(null);
    setForm({ q: "", opts: "", exp: "", multi: false, anon: true });
    setOptions([]);
  };

  // ───── Delete Poll ─────
  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;

    try {
      await PollApi.delete(pollId);
      setPolls(polls.filter(poll => poll._id !== pollId));
    } catch (err) {
      console.error("Error deleting poll:", err);
      alert("Failed to delete poll");
    }
  };

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Load data on component mount
  useEffect(() => {
    if (admin) {
      fetchPolls();
    }
  }, [admin]);

  // Loading / Unauthorized states
  if (adminLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: themeColors.background,
        color: themeColors.textPrimary
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: themeColors.background,
        color: themeColors.textPrimary
      }}>
        <div>You are not authorized to access this page.</div>
      </div>
    );
  }

  // ───── Helper function to get input styles ─────
  const getInputStyles = (inputName) => {
    const baseStyle = {
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '16px',
      border: `2px solid ${themeColors.border}`,
      background: themeColors.background,
      color: themeColors.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
      fontFamily: 'inherit',
    };

    const focusStyle = {
      borderColor: themeColors.accent,
      boxShadow: `0 0 0 3px ${themeColors.accent}20`,
    };

    return focusedInput === inputName ? { ...baseStyle, ...focusStyle } : baseStyle;
  };

  // ───── Modern Styles ─────
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: themeColors.background
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      marginLeft: sidebarWidth,
      transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: themeColors.background
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '30px',
      paddingTop: '94px',
      transition: 'all 0.3s ease'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '8px',
      color: themeColors.textPrimary,
      background: isDarkMode ? 'linear-gradient(45deg, #fff, #e0e7ff)' : 'linear-gradient(45deg, #1e293b, #374151)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
    },
    subtitle: {
      color: themeColors.textSecondary,
      fontSize: '16px'
    },
    tabContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '16px',
      padding: '0.5rem',
    },
    tab: {
      flex: 1,
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      border: 'none',
      background: 'transparent',
      color: themeColors.textSecondary,
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    activeTab: {
      background: themeColors.cardBg,
      color: themeColors.accent,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    card: {
      background: themeColors.cardBg,
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${themeColors.border}`,
      marginBottom: '2rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    optionInputContainer: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    addButton: {
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      background: `linear-gradient(45deg, ${themeColors.success}, #34d399)`,
      border: 'none',
      color: 'white',
      borderRadius: '16px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: `0 4px 12px ${themeColors.success}30`,
      fontFamily: 'inherit',
    },
    optionsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      margin: '1rem 0',
    },
    optionTag: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: `linear-gradient(45deg, ${themeColors.accent}, #7c3aed)`,
      padding: '0.75rem 1rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      color: 'white',
      fontWeight: '500',
      boxShadow: `0 4px 12px ${themeColors.accent}30`,
      animation: 'slideIn 0.3s ease',
    },
    optionEditContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: themeColors.background,
      padding: '0.5rem',
      borderRadius: '12px',
      border: `2px solid ${themeColors.accent}`,
    },
    optionEditInput: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem',
      borderRadius: '8px',
      border: `1px solid ${themeColors.border}`,
      background: themeColors.cardBg,
      color: themeColors.textPrimary,
      outline: 'none',
      fontFamily: 'inherit',
      minWidth: '150px',
    },
    editButtons: {
      display: 'flex',
      gap: '0.25rem',
    },
    smallButton: {
      padding: '0.4rem 0.75rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
    saveButton: {
      background: themeColors.success,
      color: 'white',
    },
    cancelButton: {
      background: themeColors.textSecondary,
      color: 'white',
    },
    removeOption: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1.2rem',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
    editOption: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.9rem',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      margin: '1rem 0',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      background: themeColors.background,
      borderRadius: '16px',
      border: `2px solid ${themeColors.border}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      color: themeColors.textPrimary,
    },
    checkbox: {
      width: '20px',
      height: '20px',
      borderRadius: '6px',
      border: `2px solid ${themeColors.border}`,
      cursor: 'pointer',
    },
    submitButton: {
      padding: '1.25rem 2rem',
      fontSize: '1.1rem',
      background: `linear-gradient(45deg, ${themeColors.accent}, #7c3aed)`,
      border: 'none',
      color: 'white',
      borderRadius: '16px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: `0 8px 20px ${themeColors.accent}40`,
      marginTop: '1rem',
      fontFamily: 'inherit',
    },
    secondaryButton: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      background: 'transparent',
      border: `2px solid ${themeColors.border}`,
      color: themeColors.textPrimary,
      borderRadius: '16px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      marginTop: '1rem',
      marginRight: '1rem',
      fontFamily: 'inherit',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
    },
    pollGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '2rem',
    },
    pollCard: {
      background: themeColors.cardBg,
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${themeColors.border}`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    pollQuestion: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: themeColors.textPrimary,
      marginBottom: '1.5rem',
      lineHeight: '1.4',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    pollMeta: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    metaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    metaLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: themeColors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    metaValue: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: themeColors.textPrimary,
    },
    optionsStack: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    optionItem: {
      padding: '0.75rem 1rem',
      background: themeColors.background,
      borderRadius: '12px',
      border: `1px solid ${themeColors.border}`,
      fontSize: '0.9rem',
      fontWeight: '500',
      color: themeColors.textPrimary,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    deleteButton: {
      padding: '0.5rem 1rem',
      background: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
    editButton: {
      padding: '0.5rem 1rem',
      background: themeColors.accent,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
    primaryButton: {
      background: themeColors.accent,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
    resultsButton: {
      padding: '0.5rem 1rem',
      background: themeColors.success,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    },
  };

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

        {/* Main content */}
        <main style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                🗳️ Poll Manager
              </h1>
              <p style={styles.subtitle}>
                {editingPoll ? `Editing: ${editingPoll.question}` : 'Create and manage interactive polls with ease'}
              </p>
            </div>
            {!editingPoll && (
              <button
                onClick={() => setActiveTab("create")}
                style={styles.primaryButton}
                onMouseOver={(e) => e.target.style.opacity = "0.9"}
                onMouseOut={(e) => e.target.style.opacity = "1"}
              >
                + Create Poll
              </button>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}>
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          {!editingPoll && (
            <div style={styles.tabContainer}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === "create" ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab("create")}
              >
                📝 Create Poll
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === "view" ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab("view")}
              >
                👁️ View Polls ({polls.length})
              </button>
            </div>
          )}

          {/* Create/Edit Poll Section */}
          {(activeTab === "create" || editingPoll) && (
            <div style={styles.card}>
              <form style={styles.form} onSubmit={editingPoll ? handleUpdatePoll : handleSubmit}>
                <input
                  key="question-input" // Add key to prevent re-mounting
                  type="text"
                  placeholder="What's your poll question?"
                  value={form.q}
                  onChange={(e) => setForm({ ...form, q: e.target.value })}
                  onFocus={() => handleInputFocus('question')}
                  onBlur={handleInputBlur}
                  required
                  style={getInputStyles('question')}
                />

                {/* Options Input */}
                <div style={styles.optionInputContainer}>
                  <input
                    key="option-input" // Add key to prevent re-mounting
                    type="text"
                    placeholder="Enter an option..."
                    value={form.opts}
                    onChange={(e) => setForm({ ...form, opts: e.target.value })}
                    onKeyPress={handleKeyPress}
                    onFocus={() => handleInputFocus('option')}
                    onBlur={handleInputBlur}
                    style={{ ...getInputStyles('option'), flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    style={styles.addButton}
                    onMouseOver={(e) => e.target.style.opacity = "0.9"}
                    onMouseOut={(e) => e.target.style.opacity = "1"}
                  >
                    + Add
                  </button>
                </div>

                {/* Display Added Options */}
                {options.length > 0 && (
                  <div style={styles.optionsList}>
                    {options.map((option, index) => (
                      <div key={`option-${index}-${option}`}>
                        {editingOptionIndex === index ? (
                          <div style={styles.optionEditContainer}>
                            <input
                              type="text"
                              value={editOptionText}
                              onChange={(e) => setEditOptionText(e.target.value)}
                              style={styles.optionEditInput}
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveEditedOption();
                                if (e.key === 'Escape') cancelEditOption();
                              }}
                            />
                            <div style={styles.editButtons}>
                              <button
                                type="button"
                                onClick={saveEditedOption}
                                style={{ ...styles.smallButton, ...styles.saveButton }}
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditOption}
                                style={{ ...styles.smallButton, ...styles.cancelButton }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={styles.optionTag}>
                            <span>{option}</span>
                            <button
                              type="button"
                              onClick={() => startEditOption(index, option)}
                              style={styles.editOption}
                              title="Edit option"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              style={styles.removeOption}
                              title="Remove option"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <input
                  key="datetime-input" // Add key to prevent re-mounting
                  type="datetime-local"
                  value={form.exp}
                  onChange={(e) => setForm({ ...form, exp: e.target.value })}
                  onFocus={() => handleInputFocus('datetime')}
                  onBlur={handleInputBlur}
                  style={getInputStyles('datetime')}
                />

                {/* Checkbox Group */}
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.multi}
                      onChange={(e) => setForm({ ...form, multi: e.target.checked })}
                      style={styles.checkbox}
                    />
                    Allow Multiple Choices
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.anon}
                      onChange={(e) => setForm({ ...form, anon: e.target.checked })}
                      style={styles.checkbox}
                    />
                    Anonymous Votes
                  </label>
                </div>

                <div style={styles.buttonGroup}>
                  {editingPoll && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={styles.secondaryButton}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    style={styles.submitButton}
                  >
                    {editingPoll ? 'Update Poll' : 'Create Poll'} • {options.length} options
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* View Polls Section */}
          {activeTab === "view" && !editingPoll && (
            <div>
              {loading ? (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "4rem",
                  color: themeColors.textSecondary
                }}>
                  <div>Loading polls...</div>
                </div>
              ) : polls.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: themeColors.textSecondary,
                  background: themeColors.cardBg,
                  borderRadius: "16px",
                  border: `1px solid ${themeColors.border}`
                }}>
                  No polls found. Create your first poll!
                </div>
              ) : (
                <div style={styles.pollGrid}>
                  {polls.map((poll) => (
                    <div
                      key={poll._id}
                      style={styles.pollCard}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <h3
                        style={styles.pollQuestion}
                        onClick={() => handleViewResults(poll._id)} // Updated click handler
                        onMouseOver={(e) => e.target.style.color = themeColors.accent}
                        onMouseOut={(e) => e.target.style.color = themeColors.textPrimary}
                      >
                        {poll.question}
                      </h3>

                      <div style={styles.pollMeta}>
                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Expires</span>
                          <span style={styles.metaValue}>
                            {poll.expiresAt ? new Date(poll.expiresAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Votes</span>
                          <span style={styles.metaValue}>{poll.totalVotes || 0}</span>
                        </div>
                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Multiple</span>
                          <span style={styles.metaValue}>
                            {poll.allowMultiple ? "✅ Yes" : "❌ No"}
                          </span>
                        </div>
                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Anonymous</span>
                          <span style={styles.metaValue}>
                            {poll.isAnonymous ? "✅ Yes" : "❌ No"}
                          </span>
                        </div>
                      </div>

                      <div style={styles.optionsStack}>
                        {poll.options.map((opt) => (
                          <div
                            key={opt._id}
                            style={styles.optionItem}
                            onMouseOver={(e) => e.target.style.borderColor = themeColors.accent}
                            onMouseOut={(e) => e.target.style.borderColor = themeColors.border}
                          >
                            {opt.text}
                          </div>
                        ))}
                      </div>

                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleViewResults(poll._id)} // New View Results button
                          style={styles.resultsButton}
                        >
                          📊 View Results
                        </button>
                        <button
                          onClick={() => startEditPoll(poll)}
                          style={styles.editButton}
                        >
                          Edit Poll
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll._id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PollScreen;
