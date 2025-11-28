import React, { useEffect, useState, useContext } from 'react';
import FeedbackApi from '../api/FeedbackApi';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

const HRFeedbackDashboard = () => {
  // State management
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    count: 0
  });
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feedbacks');
  const [filters, setFilters] = useState({
    category: '',
    start: '',
    end: '',
    page: 1,
    limit: 10
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Get theme from context
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  // Theme colors configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [feedbacksRes, summaryRes, analyticsRes] = await Promise.all([
        FeedbackApi.getAllFeedbacks(filters),
        FeedbackApi.getFeedbackSummary(),
        FeedbackApi.getFeedbackAnalytics({
          start: filters.start,
          end: filters.end
        })
      ]);

      const {
        feedbacks = [],
        count = 0,
        total = 0,
        page = 1,
        pages = 1
      } = feedbacksRes?.data || {};

      setFeedbacks(feedbacks);
      setPagination({ count, total, page, pages });

      // Summary
      const summaryData = summaryRes?.data?.summary || [];
      const totalFeedbacks = summaryRes?.data?.total || 0;
      setSummary({ summaryData, totalFeedbacks });

      // Analytics
      const sentimentData = analyticsRes?.data?.sentiment || {};
      const dailyTrendData = analyticsRes?.data?.dailyTrend || [];
      setAnalytics({ sentimentData, dailyTrendData });
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
      console.log("⏹ Loading state set to false");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filters.page, filters.limit]);

  // Filter and response handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const applyDateFilter = () => {
    fetchAllData();
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      start: '',
      end: '',
      page: 1,
      limit: 10
    });
  };

  const handleRespond = async (feedbackId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      await FeedbackApi.respondToFeedback(feedbackId, responseMessage);
      alert('Response submitted successfully!');
      setResponseMessage('');
      setRespondingTo(null);
      fetchAllData();
    } catch (err) {
      console.error('Error responding to feedback:', err);
      alert('Failed to submit response');
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await FeedbackApi.exportFeedbacks(format, {
        category: filters.category,
        start: filters.start,
        end: filters.end
      });

      const blob = new Blob([response.data], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedbacks.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Export completed! Downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed');
    }
  };

  // Enhanced Styles with dark mode support
  const styles = {
    container: {
      padding: '24px',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    },

    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '32px',
      backdropFilter: 'blur(20px)',
      boxShadow: isDarkMode 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: `2px solid ${themeColors.border}`,
    },

    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      margin: 0,
      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },

    exportButtons: {
      display: 'flex',
      gap: '12px'
    },

    primaryButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
    },

    secondaryButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
    },

    card: {
      background: themeColors.cardBg,
      padding: '28px',
      borderRadius: '16px',
      boxShadow: isDarkMode 
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' 
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px',
      border: `1px solid ${themeColors.border}`,
      transition: 'all 0.3s ease'
    },

    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '24px',
      alignItems: 'end'
    },

    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },

    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      fontSize: '14px',
      color: themeColors.textPrimary
    },

    input: {
      padding: '12px 16px',
      border: `2px solid ${themeColors.border}`,
      borderRadius: '10px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      background: themeColors.cardBg,
      color: themeColors.textPrimary,
      ':focus': {
        borderColor: '#667eea',
        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
        outline: 'none'
      }
    },

    select: {
      padding: '12px 16px',
      border: `2px solid ${themeColors.border}`,
      borderRadius: '10px',
      fontSize: '14px',
      background: themeColors.cardBg,
      color: themeColors.textPrimary,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },

    tabContainer: {
      display: 'flex',
      gap: '4px',
      marginBottom: '24px',
      background: isDarkMode ? '#334155' : '#f3f4f6',
      padding: '4px',
      borderRadius: '12px'
    },

    tab: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      color: themeColors.textSecondary,
      transition: 'all 0.3s ease',
      minWidth: '120px'
    },

    activeTab: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      minWidth: '120px'
    },

    feedbackCard: {
      background: themeColors.cardBg,
      padding: '24px',
      borderRadius: '12px',
      boxShadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '16px',
      borderLeft: '4px solid #667eea',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: isDarkMode 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }
    },

    userInfo: {
      fontWeight: '600',
      marginBottom: '12px',
      fontSize: '16px',
      color: themeColors.textPrimary
    },

    category: {
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: isDarkMode ? '#3730a3' : '#ede9fe',
      color: isDarkMode ? '#c7d2fe' : '#7c3aed',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '12px'
    },

    messageBox: {
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '16px',
      borderRadius: '10px',
      marginBottom: '12px',
      fontSize: '14px',
      lineHeight: '1.6',
      border: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary
    },

    timestamp: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      fontWeight: '500'
    },

    sentimentBadge: {
      positive: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        backgroundColor: isDarkMode ? '#065f46' : '#d1fae5',
        color: isDarkMode ? '#a7f3d0' : '#065f46',
        marginLeft: '12px'
      },
      negative: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        backgroundColor: isDarkMode ? '#991b1b' : '#fee2e2',
        color: isDarkMode ? '#fca5a5' : '#991b1b',
        marginLeft: '12px'
      },
      neutral: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        backgroundColor: isDarkMode ? '#92400e' : '#fef3c7',
        color: isDarkMode ? '#fcd34d' : '#92400e',
        marginLeft: '12px'
      }
    },

    responseBox: {
      marginTop: '16px',
      padding: '16px',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' 
        : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
      borderRadius: '10px',
      borderLeft: '4px solid #10b981'
    },

    responseTitle: {
      fontWeight: '700',
      fontSize: '14px',
      color: isDarkMode ? '#a7f3d0' : '#065f46',
      marginBottom: '8px'
    },

    responseMessage: {
      fontSize: '14px',
      color: isDarkMode ? '#d1fae5' : '#064e3b',
      lineHeight: '1.5'
    },

    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      border: `2px solid ${themeColors.border}`,
      borderRadius: '10px',
      fontSize: '14px',
      marginBottom: '12px',
      resize: 'vertical',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease',
      background: themeColors.cardBg,
      color: themeColors.textPrimary
    },

    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      marginTop: '32px'
    },

    paginationButton: {
      padding: '10px 20px',
      background: themeColors.cardBg,
      border: `2px solid ${themeColors.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: themeColors.textPrimary,
      transition: 'all 0.3s ease'
    },

    paginationButtonActive: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid transparent',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: 'white'
    },

    paginationInfo: {
      fontSize: '14px',
      fontWeight: '600',
      color: themeColors.textPrimary
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },

    statCard: {
      textAlign: 'center',
      padding: '24px',
      borderRadius: '16px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },

    statNumber: {
      fontSize: '3rem',
      fontWeight: '800',
      marginBottom: '8px'
    },

    statLabel: {
      fontSize: '14px',
      fontWeight: '600',
      opacity: 0.9
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px'
    },

    tableHeader: {
      background: isDarkMode 
        ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontWeight: '600'
    },

    tableCell: {
      padding: '12px 16px',
      textAlign: 'left',
      borderBottom: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary
    },

    tableCellCenter: {
      padding: '12px 16px',
      textAlign: 'center',
      borderBottom: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary
    },

    noData: {
      textAlign: 'center',
      padding: '60px 20px',
      color: themeColors.textSecondary,
      fontSize: '16px'
    },

    loadingOverlay: {
      position: 'relative',
      minHeight: '400px'
    },

    loadingSpinner: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: isDarkMode 
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' 
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    },

    spinnerIcon: {
      width: '50px',
      height: '50px',
      border: `5px solid ${isDarkMode ? '#334155' : '#f3f4f6'}`,
      borderTop: '5px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    },

    loadingText: {
      fontSize: '16px',
      fontWeight: '600',
      color: themeColors.textPrimary
    }
  };

  // Loading Component that overlays the content
  const LoadingOverlay = () => (
    <div style={styles.loadingOverlay}>
      <div style={styles.loadingSpinner}>
        <div style={styles.spinnerIcon}></div>
        <div style={styles.loadingText}>Loading Dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: themeColors.background,
      color: themeColors.textPrimary
    }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
      />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: sidebarWidth,
        backgroundColor: themeColors.background
      }}>
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        {/* Main content - Shows loading overlay when loading */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '30px',
            paddingTop: '94px',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          {/* Show loading overlay only when loading AND no data exists yet */}
          {loading && !feedbacks.length && <LoadingOverlay />}

          {/* Content - Always rendered but may be overlaid */}
          <div style={{ opacity: loading && !feedbacks.length ? 0.3 : 1 }}>
            <div style={styles.header}>
              <h1 style={styles.title}>HR Feedback Dashboard</h1>
              <div style={styles.exportButtons}>
                <button
                  style={styles.primaryButton}
                  onClick={() => handleExport('csv')}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  📊 Export CSV
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => handleExport('xlsx')}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                >
                  📈 Export Excel
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={styles.card}>
              <h3 style={{ 
                marginTop: 0, 
                color: themeColors.textPrimary, 
                fontSize: '1.5rem', 
                fontWeight: '700' 
              }}>
                🔍 Filter Options
              </h3>
              <div style={styles.filterGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    disabled={loading}
                  >
                    <option value="">All Categories</option>
                    <option value="work_environment">🏢 Work Environment</option>
                    <option value="management">👥 Management</option>
                    <option value="benefits">💼 Benefits</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={filters.start}
                    onChange={(e) => handleFilterChange('start', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={filters.end}
                    onChange={(e) => handleFilterChange('end', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Items per page</label>
                  <select
                    style={styles.select}
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    disabled={loading}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    style={{
                      ...styles.primaryButton,
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onClick={applyDateFilter}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Apply Filters'}
                  </button>
                  <button
                    style={{
                      ...styles.primaryButton,
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onClick={clearFilters}
                    disabled={loading}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabContainer}>
              <button
                style={activeTab === 'feedbacks' ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab('feedbacks')}
                disabled={loading}
              >
                📝 Feedbacks ({pagination.total || 0})
              </button>
              <button
                style={activeTab === 'summary' ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab('summary')}
                disabled={loading}
              >
                📊 Summary
              </button>
              <button
                style={activeTab === 'analytics' ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab('analytics')}
                disabled={loading}
              >
                📈 Analytics
              </button>
            </div>

            {/* Feedbacks Tab */}
            {activeTab === 'feedbacks' && (
              <div style={styles.card}>
                <h3 style={{ 
                  marginTop: 0, 
                  color: themeColors.textPrimary, 
                  fontSize: '1.5rem', 
                  fontWeight: '700' 
                }}>
                  💬 All Feedbacks
                </h3>

                {feedbacks.length === 0 && !loading ? (
                  <div style={styles.noData}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
                    No feedbacks found matching your filters.
                  </div>
                ) : (
                  <>
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback._id}
                        style={styles.feedbackCard}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDarkMode 
                              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' 
                              : '0 10px 25px -5px rgba(0, 0, 0, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isDarkMode 
                              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={styles.userInfo}>
                              {feedback.isAnonymous ? '👤 Anonymous User' : `👨‍💼 ${feedback.userId?.email || 'Unknown User'}`}
                              <span style={styles.sentimentBadge[feedback.sentiment]}>
                                {feedback.sentiment === 'positive' ? '😊' : feedback.sentiment === 'negative' ? '😞' : '😐'}
                                {feedback.sentiment?.toUpperCase()}
                              </span>
                            </div>

                            <div style={styles.category}>
                              📂 {feedback.category.replace('_', ' ').toUpperCase()}
                            </div>

                            <div style={styles.messageBox}>
                              {feedback.message}
                            </div>

                            <div style={styles.timestamp}>
                              📅 Submitted: {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>

                            {feedback.adminResponse && (
                              <div style={styles.responseBox}>
                                <div style={styles.responseTitle}>
                                  ✅ HR Response:
                                </div>
                                <div style={styles.responseMessage}>
                                  {feedback.adminResponse.message}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: isDarkMode ? '#a7f3d0' : '#065f46', 
                                  marginTop: '8px', 
                                  fontWeight: '500' 
                                }}>
                                  📅 Responded: {new Date(feedback.adminResponse.respondedAt).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </div>

                          {!feedback.adminResponse && (
                            <div style={{ marginLeft: '16px' }}>
                              <button
                                style={{
                                  ...styles.primaryButton,
                                  fontSize: '12px',
                                  padding: '8px 16px',
                                  background: respondingTo === feedback._id
                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  opacity: loading ? 0.6 : 1,
                                  cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                                onClick={() => setRespondingTo(respondingTo === feedback._id ? null : feedback._id)}
                                disabled={loading}
                              >
                                {respondingTo === feedback._id ? '❌ Cancel' : '💬 Respond'}
                              </button>
                            </div>
                          )}
                        </div>

                        {respondingTo === feedback._id && (
                          <div style={{
                            marginTop: '16px',
                            padding: '20px',
                            background: isDarkMode 
                              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '12px',
                            border: `2px solid ${themeColors.border}`
                          }}>
                            <textarea
                              style={styles.textarea}
                              placeholder="Enter your professional response here..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = themeColors.border}
                              disabled={loading}
                            />
                            <button
                              style={{
                                ...styles.primaryButton,
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => handleRespond(feedback._id)}
                              disabled={loading}
                            >
                              ✅ Submit Response
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Enhanced Pagination */}
                    {pagination.pages > 1 && (
                      <div style={styles.pagination}>
                        <button
                          style={
                            filters.page === 1 || loading
                              ? { ...styles.paginationButton, opacity: 0.5, cursor: 'not-allowed' }
                              : styles.paginationButton
                          }
                          disabled={filters.page === 1 || loading}
                          onClick={() => handleFilterChange('page', filters.page - 1)}
                        >
                          ⬅️ Previous
                        </button>

                        <span style={styles.paginationInfo}>
                          Page {filters.page} of {pagination.pages} ({pagination.total} total)
                        </span>

                        <button
                          style={
                            filters.page === pagination.pages || loading
                              ? { ...styles.paginationButton, opacity: 0.5, cursor: 'not-allowed' }
                              : styles.paginationButton
                          }
                          disabled={filters.page === pagination.pages || loading}
                          onClick={() => handleFilterChange('page', filters.page + 1)}
                        >
                          Next ➡️
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Enhanced Summary Tab */}
            {activeTab === 'summary' && summary && (
              <div style={styles.card}>
                <h3 style={{ 
                  marginTop: 0, 
                  color: themeColors.textPrimary, 
                  fontSize: '1.5rem', 
                  fontWeight: '700' 
                }}>
                  📊 Feedback Summary
                </h3>
                <div style={{
                  fontSize: '18px',
                  marginBottom: '24px',
                  padding: '16px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)' 
                    : 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
                  borderRadius: '12px',
                  color: isDarkMode ? '#c7d2fe' : '#6b46c1',
                  fontWeight: '700'
                }}>
                  🎯 Total Feedbacks: <strong>{summary.totalFeedbacks}</strong>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {summary.summaryData?.map((item, index) => (
                    <div key={item.category} style={{
                      padding: '20px',
                      background: isDarkMode 
                        ? `linear-gradient(135deg, ${['#451a03', '#3730a3', '#450a0a', '#064e3b'][index % 4]
                          } 0%, ${['#713f12', '#4f46e5', '#7f1d1d', '#065f46'][index % 4]
                          } 100%)`
                        : `linear-gradient(135deg, ${['#fef3c7', '#ddd6fe', '#fecaca', '#d1fae5'][index % 4]
                          } 0%, ${['#fde68a', '#c4b5fd', '#fca5a5', '#a7f3d0'][index % 4]
                          } 100%)`,
                      borderRadius: '12px',
                      borderLeft: `5px solid ${['#f59e0b', '#8b5cf6', '#ef4444', '#10b981'][index % 4]
                        }`
                    }}>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '18px',
                        textTransform: 'capitalize',
                        color: isDarkMode ? '#f8fafc' : '#1f2937',
                        marginBottom: '8px'
                      }}>
                        {item.category.replace('_', ' ')} Feedback
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#1f2937' }}>
                          📊 Count: {item.count}
                        </span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: isDarkMode ? '#f8fafc' : '#1f2937',
                          background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)',
                          padding: '4px 12px',
                          borderRadius: '20px'
                        }}>
                          {item.percentage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div style={styles.card}>
                <h3 style={{ 
                  marginTop: 0, 
                  color: themeColors.textPrimary, 
                  fontSize: '1.5rem', 
                  fontWeight: '700' 
                }}>
                  📈 Feedback Analytics
                </h3>

                {/* Enhanced Sentiment Distribution */}
                <div style={{ marginBottom: '40px' }}>
                  <h4 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '20px', 
                    color: themeColors.textPrimary 
                  }}>
                    😊 Sentiment Distribution
                  </h4>
                  <div style={styles.statsGrid}>
                    <div style={{
                      ...styles.statCard,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}>
                      <div style={styles.statNumber}>
                        {analytics.sentimentData?.positive || 0}
                      </div>
                      <div style={styles.statLabel}>😊 Positive</div>
                    </div>

                    <div style={{
                      ...styles.statCard,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    }}>
                      <div style={styles.statNumber}>
                        {analytics.sentimentData?.negative || 0}
                      </div>
                      <div style={styles.statLabel}>😞 Negative</div>
                    </div>

                    <div style={{
                      ...styles.statCard,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    }}>
                      <div style={styles.statNumber}>
                        {analytics.sentimentData?.neutral || 0}
                      </div>
                      <div style={styles.statLabel}>😐 Neutral</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Daily Trend */}
                <div>
                  <h4 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '20px', 
                    color: themeColors.textPrimary 
                  }}>
                    📅 Daily Trend (Last 30 Days)
                  </h4>
                  {analytics.dailyTrendData?.length === 0 ? (
                    <div style={styles.noData}>
                      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
                      No trend data available for the selected period.
                    </div>
                  ) : (
                    <div style={{ 
                      overflowX: 'auto', 
                      borderRadius: '12px', 
                      border: `1px solid ${themeColors.border}` 
                    }}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeader}>
                            <th style={styles.tableCell}>📅 Date</th>
                            <th style={styles.tableCellCenter}>😊 Positive</th>
                            <th style={styles.tableCellCenter}>😞 Negative</th>
                            <th style={styles.tableCellCenter}>😐 Neutral</th>
                            <th style={styles.tableCellCenter}>📊 Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.dailyTrendData?.map((day) => (
                            <tr key={day._id} style={{ 
                              ':hover': { 
                                backgroundColor: isDarkMode ? '#334155' : '#f9fafb' 
                              } 
                            }}>
                              <td style={styles.tableCell}>
                                {new Date(day._id).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td style={{ ...styles.tableCellCenter, color: '#059669', fontWeight: '600' }}>
                                {day.positive}
                              </td>
                              <td style={{ ...styles.tableCellCenter, color: '#dc2626', fontWeight: '600' }}>
                                {day.negative}
                              </td>
                              <td style={{ ...styles.tableCellCenter, color: '#d97706', fontWeight: '600' }}>
                                {day.neutral}
                              </td>
                              <td style={{ ...styles.tableCellCenter, fontWeight: '700', color: themeColors.textPrimary }}>
                                {day.positive + day.negative + day.neutral}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .feedback-card:hover {
            transform: translateY(-2px);
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          input:focus, select:focus, textarea:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
            outline: none !important;
          }

          button:disabled {
            cursor: not-allowed !important;
            opacity: 0.6 !important;
          }

          input:disabled, select:disabled, textarea:disabled {
            background-color: ${isDarkMode ? '#334155' : '#f9fafb'} !important;
            color: ${isDarkMode ? '#94a3b8' : '#9ca3af'} !important;
            cursor: not-allowed !important;
          }

          @media (max-width: 768px) {
            .filter-grid {
              grid-template-columns: 1fr !important;
            }
            
            .stats-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default HRFeedbackDashboard;