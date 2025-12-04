import React, { useEffect, useState, useContext } from 'react';
import ComboApi from "../api/ComboApi";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { useTheme } from '../context/ThemeContext';
import { AdminContext } from '../context/AdminContext';

const ComboOffReviewScreen = () => {
    const [comboOffs, setComboOffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [viewMode, setViewMode] = useState("list");
    const { isDarkMode } = useTheme();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { admin, loading: adminLoading } = useContext(AdminContext) || {};

    // Fetch combo off requests
    const fetchComboOffs = async () => {
        try {
            setLoading(true);
            const res = await ComboApi.getAllComboOffs(statusFilter);

            if (res.success) {
                setComboOffs(res.data.comboOffs || res.data);
            }
            setError("");
        } catch (err) {
            console.error("Error fetching combo offs:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch monthly summary
    const fetchMonthlySummary = async () => {
        try {
            const res = await ComboApi.getMonthlyComboOffSummary(selectedMonth, selectedYear);
            if (res.success) setMonthlySummary(res.data);
        } catch (err) {
            console.error("Error fetching summary:", err);
        }
    };

    // Handle approve/reject action
    const handleAction = async (id, action) => {
        try {
            const res = await ComboApi.reviewComboOff(id, action);
            if (res.success) {
                fetchComboOffs();
                showNotification(`Combo off ${action}d successfully`, "success");
            }
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    const themeColors = {
        background: isDarkMode ? '#0f172a' : '#f1f5f9',
        cardBg: isDarkMode ? '#1e293b' : 'white',
        textPrimary: isDarkMode ? '#f1f5f9' : '#0f172a',
        textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        accent: '#3b82f6',
        hoverBg: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)',
        inputBg: isDarkMode ? '#334155' : 'white',
        inputBorder: isDarkMode ? '#475569' : '#e2e8f0',
        tableHeaderBg: isDarkMode ? 'linear-gradient(135deg, #475569 0%, #334155 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        tableRowHover: isDarkMode ? '#334155' : '#f7fafc',
        statCardBg: isDarkMode ? '#1e293b' : 'white',
        filterSectionBg: isDarkMode ? '#1e293b' : 'white',
        toggleBtnActive: isDarkMode ? '#3b82f6' : '#667eea',
        toggleBtnBg: isDarkMode ? '#334155' : '#f7fafc',
        badgeBg: isDarkMode ? '#334155' : '#edf2f7',
        badgeText: isDarkMode ? '#cbd5e1' : '#4a5568',
        emptyStateText: isDarkMode ? '#94a3b8' : '#718096',
        spinnerBorder: isDarkMode ? '#475569' : '#e2e8f0',
        spinnerTop: isDarkMode ? '#3b82f6' : '#667eea'
    };

    const handleMenuToggle = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const showNotification = (message, type) => {
        const notification = document.createElement("div");
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      transform: translateX(400px);
      transition: transform 0.3s ease;
      z-index: 1000;
      background: ${type === "success" ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)" : "linear-gradient(135deg, #f87171 0%, #ef4444 100%)"};
    `;
        document.body.appendChild(notification);
        setTimeout(() => notification.style.transform = "translateX(0)", 10);
        setTimeout(() => {
            notification.style.transform = "translateX(400px)";
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    useEffect(() => {
        fetchComboOffs();
    }, [statusFilter]);

    useEffect(() => {
        if (viewMode === "summary") {
            fetchMonthlySummary();
        }
    }, [viewMode, selectedMonth, selectedYear]);

    const filteredComboOffs = comboOffs.filter((c) => {
        const employeeName = `${c.employee?.firstName || ""} ${c.employee?.lastName || ""}`.toLowerCase();
        return employeeName.includes(searchTerm.toLowerCase());
    });

    const getStatusBadgeStyle = (status) => {
        const styles = {
            pending: {
                background: isDarkMode ? "rgba(217, 119, 6, 0.2)" : "#fef5e7",
                color: isDarkMode ? "#fbbf24" : "#d97706"
            },
            approved: {
                background: isDarkMode ? "rgba(5, 150, 105, 0.2)" : "#d1fae5",
                color: isDarkMode ? "#34d399" : "#059669"
            },
            rejected: {
                background: isDarkMode ? "rgba(220, 38, 38, 0.2)" : "#fee2e2",
                color: isDarkMode ? "#f87171" : "#dc2626"
            },
        };
        return styles[status] || {
            background: isDarkMode ? "#334155" : "#edf2f7",
            color: isDarkMode ? "#cbd5e1" : "#4a5568"
        };
    };

    const stats = {
        total: comboOffs.length,
        pending: comboOffs.filter((c) => c.status === "pending").length,
        approved: comboOffs.filter((c) => c.status === "approved").length,
        rejected: comboOffs.filter((c) => c.status === "rejected").length,
    };

    // Inline Styles
    const styles = {
        container: {
            padding: "12px",
            background: themeColors.background,
            minHeight: "100vh",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
            transition: 'background 0.3s ease'
        },
        pageHeader: {
            fontSize: "36px",
            fontWeight: "800",
            color: themeColors.textPrimary,
            marginBottom: "8px",
            letterSpacing: '-0.5px',
            transition: 'color 0.3s ease'
        },
        headerContent: {
            flex: 1,
            minWidth: "300px",
            padding: "10px",
        },
        pageTitle: {
            fontSize: "32px",
            fontWeight: 700,
            color: themeColors.textPrimary,
            margin: "0 0 8px 0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: 'color 0.3s ease'
        },
        pageSubtitle: {
            color: themeColors.textSecondary,
            margin: 0,
            fontSize: "15px",
            transition: 'color 0.3s ease'
        },
        viewToggle: {
            display: "flex",
            gap: "8px",
            background: themeColors.toggleBtnBg,
            padding: "4px",
            borderRadius: "12px",
            transition: 'background 0.3s ease'
        },
        toggleBtn: (isActive) => ({
            padding: "10px 20px",
            border: "none",
            background: isActive ? themeColors.toggleBtnActive : "transparent",
            color: isActive ? "white" : themeColors.textSecondary,
            fontWeight: 600,
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            boxShadow: isActive ? `0 2px 8px ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(102,126,234,0.3)'}` : "none",
        }),
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
        },
        statCard: (gradient) => ({
            background: themeColors.statCardBg,
            padding: "24px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            boxShadow: isDarkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.07)",
            transition: "all 0.3s ease",
            border: isDarkMode ? `1px solid ${themeColors.border}` : 'none'
        }),
        statIcon: (gradient) => ({
            width: "60px",
            height: "60px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            flexShrink: 0,
            background: gradient,
        }),
        statValue: {
            fontSize: "32px",
            fontWeight: 700,
            color: themeColors.textPrimary,
            margin: "0 0 4px 0",
            transition: 'color 0.3s ease'
        },
        statLabel: {
            color: themeColors.textSecondary,
            margin: 0,
            fontSize: "14px",
            fontWeight: 500,
            transition: 'color 0.3s ease'
        },
        filtersSection: {
            background: themeColors.filterSectionBg,
            padding: "20px 24px",
            borderRadius: "16px",
            marginBottom: "24px",
            display: "flex",
            gap: "20px",
            alignItems: "center",
            boxShadow: isDarkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.07)",
            flexWrap: "wrap",
            border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
            transition: 'all 0.3s ease'
        },
        searchBox: {
            flex: 1,
            minWidth: "250px",
            position: "relative",
        },
        searchIcon: {
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "18px",
            color: themeColors.textSecondary,
            pointerEvents: "none",
            transition: 'color 0.3s ease'
        },
        searchInput: {
            width: "100%",
            padding: "12px 16px 12px 48px",
            border: `2px solid ${themeColors.inputBorder}`,
            borderRadius: "12px",
            fontSize: "15px",
            transition: "all 0.3s ease",
            outline: "none",
            background: themeColors.inputBg,
            color: themeColors.textPrimary
        },
        filterGroup: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        filterLabel: {
            fontWeight: 600,
            color: themeColors.textSecondary,
            fontSize: "14px",
            transition: 'color 0.3s ease'
        },
        filterSelect: {
            padding: "10px 16px",
            border: `2px solid ${themeColors.inputBorder}`,
            borderRadius: "10px",
            fontSize: "14px",
            color: themeColors.textPrimary,
            background: themeColors.inputBg,
            cursor: "pointer",
            transition: "all 0.3s ease",
            minWidth: "150px",
            outline: "none",
        },
        tableContainer: {
            background: themeColors.cardBg,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: isDarkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.07)",
            border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
            transition: 'all 0.3s ease'
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
        },
        thead: {
            background: themeColors.tableHeaderBg,
        },
        th: {
            padding: "16px 20px",
            textAlign: "left",
            fontWeight: 600,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "white",
        },
        tr: {
            borderBottom: `1px solid ${themeColors.border}`,
            transition: "background-color 0.2s ease",
        },
        td: {
            padding: "20px",
            color: themeColors.textPrimary,
            fontSize: "14px",
            transition: 'color 0.3s ease'
        },
        employeeInfo: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        employeeAvatar: {
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: isDarkMode ? "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "14px",
            flexShrink: 0,
        },
        employeeName: {
            fontWeight: 600,
            color: themeColors.textPrimary,
            transition: 'color 0.3s ease'
        },
        textMuted: {
            color: themeColors.textSecondary,
            transition: 'color 0.3s ease'
        },
        dateBadge: {
            background: themeColors.badgeBg,
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            color: themeColors.badgeText,
            whiteSpace: "nowrap",
            display: "inline-block",
            transition: 'all 0.3s ease'
        },
        statusBadge: (status) => ({
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "capitalize",
            whiteSpace: "nowrap",
            transition: 'all 0.3s ease',
            ...getStatusBadgeStyle(status),
        }),
        reasonCell: {
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        actionButtons: {
            display: "flex",
            gap: "8px",
        },
        btnApprove: {
            padding: "8px 16px",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
            color: "white",
        },
        btnReject: {
            padding: "8px 16px",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
            color: "white",
        },
        loadingState: {
            padding: "60px 20px",
            textAlign: "center",
            color: themeColors.textSecondary,
            transition: 'color 0.3s ease'
        },
        spinner: {
            width: "48px",
            height: "48px",
            border: `4px solid ${themeColors.spinnerBorder}`,
            borderTopColor: themeColors.spinnerTop,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
        },
        errorState: {
            padding: "60px 20px",
            textAlign: "center",
            color: themeColors.error,
        },
        emptyState: {
            padding: "80px 20px",
            textAlign: "center",
        },
        emptyIcon: {
            fontSize: "64px",
            display: "block",
            marginBottom: "16px",
            opacity: 0.6,
        },
        summarySection: {
            background: themeColors.cardBg,
            borderRadius: "16px",
            padding: "32px",
            boxShadow: isDarkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.07)",
            border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
            transition: 'all 0.3s ease'
        },
        summaryHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            paddingBottom: "20px",
            borderBottom: `2px solid ${themeColors.border}`,
            flexWrap: "wrap",
            gap: "20px",
            transition: 'border-color 0.3s ease'
        },
        summaryTitle: {
            fontSize: "24px",
            fontWeight: 700,
            color: themeColors.textPrimary,
            margin: 0,
            transition: 'color 0.3s ease'
        },
        dateSelectors: {
            display: "flex",
            gap: "12px",
        },
        summaryCard: {
            background: isDarkMode ? "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "32px",
            borderRadius: "16px",
            textAlign: "center",
            marginBottom: "32px",
            transition: 'background 0.3s ease'
        },
        countBadge: {
            background: isDarkMode ? "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "6px 16px",
            borderRadius: "20px",
            fontWeight: 700,
            fontSize: "16px",
            display: "inline-block",
            transition: 'background 0.3s ease'
        },
        summaryTableHeader: {
            background: isDarkMode ? themeColors.filterSectionBg : "#f7fafc",
            borderBottom: `2px solid ${themeColors.border}`,
            transition: 'all 0.3s ease'
        },
        summaryTh: {
            ...{
                padding: "16px 20px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
            },
            color: themeColors.textPrimary,
            transition: 'color 0.3s ease'
        }
    };


    return (
        <div style={{
            display: "flex",
            height: "100vh",
            backgroundColor: themeColors.background
        }}>
            <style>
                {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          table tbody tr:hover {
            background-color: ${themeColors.tableRowHover} !important;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .stat-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: ${isDarkMode ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.12)'};
          }
          input:focus, select:focus {
            border-color: ${themeColors.toggleBtnActive} !important;
            box-shadow: 0 0 0 3px ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(102,126,234,0.1)'} !important;
          }
        `}
            </style>
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
                backgroundColor: themeColors.background,
                transition: 'all 0.3s ease'
            }}>
                <Navbar
                    onMenuClick={handleMenuToggle}
                    isCollapsed={sidebarCollapsed}
                    isDarkMode={isDarkMode}
                    admin={admin}
                />

                <main style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '30px',
                    paddingTop: '94px',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Header Section */}
                    <div style={styles.pageHeader}>
                        <div style={styles.headerContent}>
                            <h1 style={styles.pageTitle}>
                                <span>📋</span>
                                Combo Off Management
                            </h1>
                            <p style={styles.pageSubtitle}>Review and manage employee combo off requests</p>
                        </div>


                        <div style={styles.viewToggle}>
                            <button
                                style={styles.toggleBtn(viewMode === "list")}
                                onClick={() => setViewMode("list")}
                            >
                                <span>📝</span> Requests
                            </button>
                            <button
                                style={styles.toggleBtn(viewMode === "summary")}
                                onClick={() => setViewMode("summary")}
                            >
                                <span>📊</span> Summary
                            </button>
                        </div>
                    </div>


                    {/* Statistics Cards */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard()} className="stat-card-hover">
                            <div style={styles.statIcon("linear-gradient(135deg, #667eea 0%, #764ba2 100%)")}>📊</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.total}</h3>
                                <p style={styles.statLabel}>Total Requests</p>
                            </div>
                        </div>


                        <div style={styles.statCard()} className="stat-card-hover">
                            <div style={styles.statIcon("linear-gradient(135deg, #f093fb 0%, #f5576c 100%)")}>⏳</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.pending}</h3>
                                <p style={styles.statLabel}>Pending Review</p>
                            </div>
                        </div>


                        <div style={styles.statCard()} className="stat-card-hover">
                            <div style={styles.statIcon("linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)")}>✅</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.approved}</h3>
                                <p style={styles.statLabel}>Approved</p>
                            </div>
                        </div>


                        <div style={styles.statCard()} className="stat-card-hover">
                            <div style={styles.statIcon("linear-gradient(135deg, #fa709a 0%, #fee140 100%)")}>❌</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.rejected}</h3>
                                <p style={styles.statLabel}>Rejected</p>
                            </div>
                        </div>
                    </div>


                    {viewMode === "list" ? (
                        <>
                            {/* Filters Section */}
                            <div style={styles.filtersSection}>
                                <div style={styles.searchBox}>
                                    <span style={styles.searchIcon}>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by employee name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={styles.searchInput}
                                    />
                                </div>


                                <div style={styles.filterGroup}>
                                    <label style={styles.filterLabel}>Status:</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={styles.filterSelect}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>


                            {/* Requests Table */}
                            <div style={styles.tableContainer}>
                                {loading ? (
                                    <div style={styles.loadingState}>
                                        <div style={styles.spinner}></div>
                                        <p>Loading combo off requests...</p>
                                    </div>
                                ) : error ? (
                                    <div style={styles.errorState}>
                                        <span style={{ fontSize: "48px", display: "block", marginBottom: "12px" }}>⚠️</span>
                                        <p>{error}</p>
                                    </div>
                                ) : filteredComboOffs.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <span style={styles.emptyIcon}>📭</span>
                                        <h3 style={{ color: themeColors.textPrimary, margin: "0 0 8px 0", fontSize: "20px", transition: 'color 0.3s ease' }}>No requests found</h3>
                                        <p style={{ color: themeColors.emptyStateText, margin: 0, fontSize: "15px", transition: 'color 0.3s ease' }}>There are no combo off requests matching your filters.</p>
                                    </div>
                                ) : (
                                    <table style={styles.table}>
                                        <thead style={styles.thead}>
                                            <tr>
                                                <th style={styles.th}>Employee</th>
                                                <th style={styles.th}>Employee Id</th>
                                                <th style={styles.th}>Work Date</th>
                                                <th style={styles.th}>Reason</th>
                                                <th style={styles.th}>Applied On</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredComboOffs.map((c) => (
                                                <tr key={c._id} style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={styles.employeeInfo}>
                                                            <div style={styles.employeeAvatar}>
                                                                {c.employee?.firstName?.charAt(0)}
                                                                {c.employee?.lastName?.charAt(0)}
                                                            </div>
                                                            <span style={styles.employeeName}>
                                                                {c.employee?.firstName} {c.employee?.lastName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...styles.td, ...styles.textMuted }}>{c.employee?.employeeId}</td>
                                                    <td style={styles.td}>
                                                        <span style={styles.dateBadge}>
                                                            {new Date(c.workDate).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...styles.td, ...styles.reasonCell }}>{c.reason}</td>
                                                    <td style={{ ...styles.td, ...styles.textMuted }}>
                                                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        })}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={styles.statusBadge(c.status)}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.actionButtons}>
                                                            {c.status === "pending" ? (
                                                                <>
                                                                    <button
                                                                        style={styles.btnApprove}
                                                                        onClick={() => handleAction(c._id, "approve")}
                                                                        title="Approve request"
                                                                    >
                                                                        <span>✓</span>
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        style={styles.btnReject}
                                                                        onClick={() => handleAction(c._id, "reject")}
                                                                        title="Reject request"
                                                                    >
                                                                        <span>✕</span>
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span style={styles.textMuted}>
                                                                    {c.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Monthly Summary View */
                        <div style={styles.summarySection}>
                            <div style={styles.summaryHeader}>
                                <h2 style={styles.summaryTitle}>Monthly Summary</h2>
                                <div style={styles.dateSelectors}>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        style={styles.filterSelect}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(2000, i).toLocaleString("en", { month: "long" })}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        style={styles.filterSelect}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <option key={i} value={new Date().getFullYear() - i}>
                                                {new Date().getFullYear() - i}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>


                            {monthlySummary ? (
                                <div>
                                    <div style={styles.summaryCard}>
                                        <h3 style={{ fontSize: "48px", fontWeight: 700, margin: "0 0 8px 0" }}>
                                            {monthlySummary.totalEmployees}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "16px", opacity: 0.95 }}>
                                            Employees with Approved Combo Offs
                                        </p>
                                    </div>


                                    {monthlySummary.summary && monthlySummary.summary.length > 0 ? (
                                        <table style={styles.table}>
                                            <thead style={styles.summaryTableHeader}>
                                                <tr>
                                                    <th style={styles.summaryTh}>Employee Name</th>
                                                    <th style={styles.summaryTh}>Employee Id</th>
                                                    <th style={styles.summaryTh}>Total Approved</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlySummary.summary.map((emp, idx) => (
                                                    <tr key={idx} style={styles.tr}>
                                                        <td style={styles.td}>
                                                            <div style={styles.employeeInfo}>
                                                                <div style={styles.employeeAvatar}>
                                                                    {emp.name.split(" ")[0]?.charAt(0)}
                                                                    {emp.name.split(" ")[1]?.charAt(0)}
                                                                </div>
                                                                <span style={styles.employeeName}>{emp.name}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ ...styles.td, ...styles.textMuted }}>{emp.employeeId}</td>
                                                        <td style={styles.td}>
                                                            <span style={styles.countBadge}>{emp.totalApproved}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={styles.emptyState}>
                                            <span style={styles.emptyIcon}>📭</span>
                                            <h3 style={{ color: themeColors.textPrimary, margin: "0 0 8px 0", fontSize: "20px", transition: 'color 0.3s ease' }}>No approved combo offs</h3>
                                            <p style={{ color: themeColors.emptyStateText, margin: 0, fontSize: "15px", transition: 'color 0.3s ease' }}>No approved combo offs found for the selected period.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.loadingState}>
                                    <div style={styles.spinner}></div>
                                    <p>Loading summary...</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}


export default ComboOffReviewScreen;
