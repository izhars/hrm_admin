import React, { useContext, useEffect, useState, useCallback } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import DayTimeWidget from '../component/DayTimeWidget';
import { AdminContext } from "../context/AdminContext";
import { DashboardApi } from "../api";
import { useTheme } from '../context/ThemeContext';

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dashboard data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [leaveOverview, setLeaveOverview] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Month/Year picker state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Memoize toggle
  const handleMenuToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Fetch data when admin, month, or year changes
  useEffect(() => {
    if (!admin) return;

    const fetchDashboardData = async () => {
      setDataLoading(true);
      setError("");

      try {
        const statsRes = await DashboardApi.getDashboardStats();
        setDashboardStats(statsRes.data?.stats || null);

        if (["hr", "manager", "superadmin"].includes(admin.role)) {
          const [attendanceRes, leaveRes] = await Promise.all([
            DashboardApi.getAttendanceOverview({
              month: selectedMonth + 1,
              year: selectedYear,
            }),
            DashboardApi.getLeaveOverview(),
          ]);

          setAttendanceOverview(attendanceRes.data?.overview || null);
          setLeaveOverview(leaveRes.data?.overview || null);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [admin, selectedMonth, selectedYear]);

  // Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  // Helper functions
  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  const getMonthYearLabel = () => {
    return new Date(selectedYear, selectedMonth).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  // Show full page loading only for initial admin auth check
  if (adminLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Show unauthorized only if admin check is complete and no admin
  if (!adminLoading && !admin) {
    return (
      <div className="unauthorized-container">
        <div>You are not authorized to access this page.</div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: themeColors.background
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

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '30px',
            paddingTop: '94px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header Section - Always visible */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
              Dashboard
            </h1>
            <p style={{ color: themeColors.textSecondary, fontSize: "16px" }}>
              Welcome back, {admin?.fullName || admin?.firstName || admin?.email}
            </p>
          </div>

          {/* Day Time Widget - Always visible */}
          <DayTimeWidget isDarkMode={isDarkMode} />

          {/* Data Loading State */}
          {dataLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                background: themeColors.cardBg,
                borderRadius: "12px",
                border: `1px solid ${themeColors.border}`,
                marginBottom: "24px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div className="loading-spinner">Loading dashboard data...</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !dataLoading && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              {error}
            </div>
          )}

          {/* Dashboard Content - Only show when not loading */}
          {!dataLoading && (
            <>
              {/* Key Metrics Grid */}
              {dashboardStats && (
                <div style={{ marginBottom: "32px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
                    Key Metrics
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    {/* Total Employees */}
                    <div
                      style={{
                        background: themeColors.cardBg,
                        padding: "20px",
                        borderRadius: "12px",
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <div
                          style={{
                            background: "#dbeafe",
                            padding: "8px",
                            borderRadius: "8px",
                            marginRight: "12px",
                          }}
                        >
                          <span style={{ color: themeColors.accent }}>People</span>
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", color: themeColors.textSecondary }}>
                            Total Employees
                          </p>
                          <p style={{ fontSize: "24px", fontWeight: "700" }}>
                            {formatNumber(dashboardStats.totalEmployees)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Present Today */}
                    <div
                      style={{
                        background: themeColors.cardBg,
                        padding: "20px",
                        borderRadius: "12px",
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <div
                          style={{
                            background: "#dcfce7",
                            padding: "8px",
                            borderRadius: "8px",
                            marginRight: "12px",
                          }}
                        >
                          <span style={{ color: "#16a34a" }}>Check</span>
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", color: themeColors.textSecondary }}>
                            Present Today
                          </p>
                          <p style={{ fontSize: "24px", fontWeight: "700" }}>
                            {formatNumber(dashboardStats.presentToday)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Absent Today */}
                    <div
                      style={{
                        background: themeColors.cardBg,
                        padding: "20px",
                        borderRadius: "12px",
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "8px",
                            borderRadius: "8px",
                            marginRight: "12px",
                          }}
                        >
                          <span style={{ color: "#d97706" }}>Cross</span>
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", color: themeColors.textSecondary }}>
                            Absent Today
                          </p>
                          <p style={{ fontSize: "24px", fontWeight: "700" }}>
                            {formatNumber(dashboardStats.absentToday)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pending Leaves */}
                    <div
                      style={{
                        background: themeColors.cardBg,
                        padding: "20px",
                        borderRadius: "12px",
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <div
                          style={{
                            background: "#fce7f3",
                            padding: "8px",
                            borderRadius: "8px",
                            marginRight: "12px",
                          }}
                        >
                          <span style={{ color: "#db2777" }}>Palm Tree</span>
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", color: themeColors.textSecondary }}>
                            Pending Leaves
                          </p>
                          <p style={{ fontSize: "24px", fontWeight: "700" }}>
                            {formatNumber(dashboardStats.pendingLeaves)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Departments Overview */}
                  <div
                    style={{
                      background: themeColors.cardBg,
                      padding: "24px",
                      borderRadius: "12px",
                      border: `1px solid ${themeColors.border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                      Departments Overview
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {dashboardStats.departments?.map((dept) => (
                        <div
                          key={dept._id}
                          style={{
                            padding: "16px",
                            border: `1px solid ${themeColors.border}`,
                            borderRadius: "8px",
                            textAlign: "center",
                          }}
                        >
                          <p style={{ fontWeight: "600", marginBottom: "4px" }}>{dept.name}</p>
                          <p style={{ fontSize: "14px", color: themeColors.textSecondary, marginBottom: "4px" }}>
                            {dept.code}
                          </p>
                          <p style={{ fontSize: "18px", fontWeight: "700", color: themeColors.accent }}>
                            {formatNumber(dept.employeeCount)} employees
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HR/Manager/Superadmin Section */}
              {["hr", "manager", "superadmin"].includes(admin.role) && (
                <>
                  {/* Month/Year Picker */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <label
                      htmlFor="attendance-month"
                      style={{ fontWeight: "600", color: themeColors.textPrimary }}
                    >
                      Attendance for:
                    </label>

                    <select
                      id="attendance-month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${themeColors.border}`,
                        background: themeColors.cardBg,
                        color: themeColors.textPrimary,
                        minWidth: "140px",
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(0, i).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>

                    <select
                      id="attendance-year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${themeColors.border}`,
                        background: themeColors.cardBg,
                        color: themeColors.textPrimary,
                      }}
                    >
                      {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const now = new Date();
                        setSelectedMonth(now.getMonth());
                        setSelectedYear(now.getFullYear());
                      }}
                      style={{
                        marginLeft: "auto",
                        padding: "6px 12px",
                        background: themeColors.accent,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Today
                    </button>
                  </div>

                  {/* Attendance & Leave Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    {/* Attendance Overview */}
                    {attendanceOverview && (
                      <div
                        style={{
                          background: themeColors.cardBg,
                          padding: "24px",
                          borderRadius: "12px",
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                          Attendance Overview – {getMonthYearLabel()}
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Present:</span>
                            <strong>{formatNumber(attendanceOverview.present)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Absent:</span>
                            <strong>{formatNumber(attendanceOverview.absent)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Half Days:</span>
                            <strong>{formatNumber(attendanceOverview.halfDay)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>On Leave:</span>
                            <strong>{formatNumber(attendanceOverview.onLeave)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Late:</span>
                            <strong>{formatNumber(attendanceOverview.late)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Total Work Hours:</span>
                            <strong>{formatNumber(attendanceOverview.totalWorkHours)}</strong>
                          </div>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "8px",
                            fontSize: "0.9rem",
                            color: themeColors.textSecondary
                          }}>
                            <span>Total Records:</span>
                            <strong>{formatNumber(attendanceOverview.totalRecords)}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leave Overview */}
                    {leaveOverview && (
                      <div
                        style={{
                          background: themeColors.cardBg,
                          padding: "24px",
                          borderRadius: "12px",
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                          Leave Overview
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Pending:</span>
                            <strong>{formatNumber(leaveOverview.pending)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Approved:</span>
                            <strong>{formatNumber(leaveOverview.approved)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Rejected:</span>
                            <strong>{formatNumber(leaveOverview.rejected)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Total Days:</span>
                            <strong>{formatNumber(leaveOverview.totalDays)}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .loading-container,
        .unauthorized-container {
          padding: 50px;
          text-align: center;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-spinner {
          font-size: 18px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;