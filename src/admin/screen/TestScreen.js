import React, { useState, useEffect, useContext, useMemo } from "react";
import { AdminContext } from "../context/AdminContext";
import AttendanceApi from "../api/AttendanceApi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import LocationCell from "../component/LocationCell";
import { useTheme } from '../context/ThemeContext';

const AllDayAttendance = () => {
  /* --------------------- Context & Navigation --------------------- */
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  /* --------------------- All Hooks Must Come First --------------------- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    onLeaveCount: 0,
  });

  /* --------------------- API --------------------- */
  const fetchAttendance = async (date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const result = await AttendanceApi.getAttendanceByDate(formattedDate);

      const responseData = result.data || result;
      if (result.success) {
        const attendanceArray = responseData.attendance || [];

        setAttendanceData(attendanceArray);

        // Enhanced stats calculation
        const presentCount = attendanceArray.filter(r => r.status === 'present').length;
        const onLeaveCount = attendanceArray.filter(r => r.status === 'on-leave').length;
        const lateCount = attendanceArray.filter(r => r.isLate).length;
        const totalEmployees = responseData.totalEmployees || attendanceArray.length;
        const absentCount = totalEmployees - presentCount - onLeaveCount;

        setStats({
          totalEmployees,
          presentCount,
          absentCount: Math.max(0, absentCount),
          lateCount,
          onLeaveCount
        });
      } else {
        console.error("Failed to fetch attendance:", result.message);
        setAttendanceData([]);
        setStats({ totalEmployees: 0, presentCount: 0, absentCount: 0, lateCount: 0, onLeaveCount: 0 });
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setAttendanceData([]);
      setStats({ totalEmployees: 0, presentCount: 0, absentCount: 0, lateCount: 0, onLeaveCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  /* --------------------- React Hooks (must come before early returns) --------------------- */

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const today = new Date();
    switch (dateRange) {
      case "today":
        setSelectedDate(new Date());
        break;
      case "yesterday":
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setSelectedDate(yesterday);
        break;
      case "tomorrow":
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
        break;
      default:
        break;
    }
  }, [dateRange]);

  const filteredData = useMemo(() => {
    return attendanceData.filter((record) => {
      const matchesSearch =
        record.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attendanceData, searchTerm, statusFilter]);

  /* --------------------- Theme Colors --------------------- */
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? "#1e293b" : "#ffffff",
    cardBgSecondary: isDarkMode ? "#2d3748" : "#f8fafc",
    textPrimary: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkMode ? "#cbd5e1" : "#64748b",
    textMuted: isDarkMode ? "#94a3b8" : "#94a3b8",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    borderLight: isDarkMode ? "#475569" : "#f1f5f9",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    primary: "#3b82f6",
    accent: isDarkMode ? "#6366f1" : "#4f46e5",
    gradient: isDarkMode
      ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";
  const handleMenuToggle = () => setSidebarCollapsed((p) => !p);

  /* --------------------- Enhanced Helpers --------------------- */
  const formatWorkHours = (hours) => {
    if (!hours || hours === 0) return "0h 0m";
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      const date = timeString.includes("T")
        ? parseISO(timeString)
        : new Date(timeString.replace(" ", "T"));
      return format(date, "HH:mm");
    } catch {
      return timeString;
    }
  };

  const formatDisplayDate = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  /* --------------------- Admin Check & Loading --------------------- */
  if (adminLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: themeColors.background,
        color: themeColors.textPrimary,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: `3px solid ${themeColors.border}`,
            borderTop: `3px solid ${themeColors.primary}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }} />
          <p style={{ fontSize: "16px", color: themeColors.textSecondary }}>Loading dashboard...</p>
        </div>
        <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
      </div>
    );
  }

  if (!admin?.role) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: themeColors.background,
        color: themeColors.textPrimary,
      }}>
        <div style={{ textAlign: "center", padding: "32px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.7 }}>🚫</div>
          <h2 style={{ marginBottom: "12px", fontSize: "24px", fontWeight: "700" }}>Access Denied</h2>
          <p style={{ color: themeColors.textSecondary, fontSize: "16px" }}>
            You are not authorized to access this page.
          </p>
        </div>
      </div>
    );
  }

  /* --------------------- Render --------------------- */
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: themeColors.background
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
        transition: "margin-left 0.3s ease",
        background: themeColors.background
      }}>
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        {/* ---------- Page Content ---------- */}
        <main style={{
          flex: 1,
          overflow: "auto",
          padding: "24px",
          paddingTop: "88px",
          background: themeColors.background,
        }}>
          {/* Enhanced Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              background: themeColors.cardBg,
              borderRadius: "20px",
              padding: "32px",
              boxShadow: isDarkMode
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: `1px solid ${themeColors.border}`,
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                transform: "translate(30%, -30%)"
              }} />

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px"
              }}>
                <div>
                  <h1 style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    margin: "0 0 8px 0",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    📊 Attendance Dashboard
                  </h1>
                  <p style={{
                    fontSize: "16px",
                    margin: 0,
                    color: themeColors.textSecondary,
                    fontWeight: "500"
                  }}>
                    {formatDisplayDate(selectedDate)}
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  gap: "8px",
                  background: themeColors.cardBgSecondary,
                  padding: "8px",
                  borderRadius: "12px",
                  border: `1px solid ${themeColors.borderLight}`
                }}>
                  {quickDateOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: dateRange === option.value ? themeColors.primary : "transparent",
                        color: dateRange === option.value ? "white" : themeColors.textSecondary,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: `${getDateBadgeType(selectedDate).color}15`,
                color: getDateBadgeType(selectedDate).color,
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600"
              }}>
                <span>📅</span>
                {getDateBadgeType(selectedDate).text} • {format(selectedDate, "MMM d, yyyy")}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}>
            {[
              {
                label: "Total Employees",
                value: stats.totalEmployees,
                icon: "👥",
                color: themeColors.primary,
                trend: "+2%",
                description: "Registered employees"
              },
              {
                label: "Present Today",
                value: stats.presentCount,
                icon: "✅",
                color: themeColors.success,
                trend: "+5%",
                description: `${Math.round((stats.presentCount / stats.totalEmployees) * 100) || 0}% attendance`
              },
              {
                label: "On Leave",
                value: stats.onLeaveCount,
                icon: "🏖️",
                color: themeColors.warning,
                trend: "-1%",
                description: "Leave applications"
              },
              {
                label: "Absent",
                value: stats.absentCount,
                icon: "❌",
                color: themeColors.error,
                trend: "+3%",
                description: "Without leave"
              },
              {
                label: "Late Arrivals",
                value: stats.lateCount,
                icon: "⏰",
                color: themeColors.warning,
                trend: "-2%",
                description: "Late today"
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: themeColors.cardBg,
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: isDarkMode
                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
                  border: `1px solid ${themeColors.borderLight}`,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? "0 12px 25px rgba(0, 0, 0, 0.2)"
                    : "0 12px 25px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "0 2px 8px rgba(0, 0, 0, 0.06)";
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}>
                    {stat.icon}
                  </div>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: stat.color,
                    background: `${stat.color}15`,
                    padding: "4px 8px",
                    borderRadius: "12px"
                  }}>
                    {stat.trend}
                  </span>
                </div>

                <div style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: stat.color,
                  marginBottom: "4px",
                  lineHeight: 1
                }}>
                  {stat.value}
                </div>

                <div style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                  marginBottom: "4px"
                }}>
                  {stat.label}
                </div>

                <div style={{
                  fontSize: "12px",
                  color: themeColors.textSecondary,
                }}>
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Controls Section */}
          <div style={{
            background: themeColors.cardBg,
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: isDarkMode
              ? "0 4px 6px rgba(0, 0, 0, 0.1)"
              : "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: `1px solid ${themeColors.borderLight}`,
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              alignItems: "end",
            }}>
              {/* Date Picker */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                  marginBottom: "8px",
                }}>
                  📅 Select Date
                </label>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    setSelectedDate(new Date(e.target.value));
                    setDateRange("custom");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `2px solid ${themeColors.border}`,
                    outline: "none",
                    fontSize: "15px",
                    backgroundColor: themeColors.cardBg,
                    color: themeColors.textPrimary,
                    transition: "all 0.2s ease",
                    fontWeight: "500"
                  }}
                  onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                  onBlur={(e) => e.target.style.borderColor = themeColors.border}
                />
              </div>

              {/* Search */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                  marginBottom: "8px",
                }}>
                  🔍 Search Employees
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 44px",
                      borderRadius: "10px",
                      border: `2px solid ${themeColors.border}`,
                      outline: "none",
                      fontSize: "15px",
                      backgroundColor: themeColors.cardBg,
                      color: themeColors.textPrimary,
                      transition: "all 0.2s ease",
                      fontWeight: "500"
                    }}
                    onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                    onBlur={(e) => e.target.style.borderColor = themeColors.border}
                  />
                  <div style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: themeColors.textSecondary,
                    fontSize: "16px"
                  }}>
                    🔍
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                  marginBottom: "8px",
                }}>
                  🎯 Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `2px solid ${themeColors.border}`,
                    outline: "none",
                    fontSize: "15px",
                    backgroundColor: themeColors.cardBg,
                    color: themeColors.textPrimary,
                    cursor: "pointer",
                    fontWeight: "500",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='${isDarkMode ? '%23cbd5e1' : '%2364748b'}' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    backgroundSize: "8px 10px"
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="on-leave">On Leave</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${themeColors.border}`,
                  background: themeColors.cardBgSecondary,
                  color: themeColors.textPrimary,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseOver={(e) => e.target.style.background = themeColors.borderLight}
                onMouseOut={(e) => e.target.style.background = themeColors.cardBgSecondary}
              >
                🗑️ Clear Filters
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${themeColors.border}`,
                  background: themeColors.cardBgSecondary,
                  color: themeColors.textPrimary,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseOver={(e) => e.target.style.background = themeColors.borderLight}
                onMouseOut={(e) => e.target.style.background = themeColors.cardBgSecondary}
              >
                🖨️ Export
              </button>
            </div>
          </div>

          {/* Results Summary */}
          {(searchTerm || statusFilter !== "all") && (
            <div style={{
              background: themeColors.cardBgSecondary,
              padding: "16px 20px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "14px",
              color: themeColors.textSecondary,
              border: `1px solid ${themeColors.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>📊</span>
              Showing <strong style={{ color: themeColors.textPrimary, margin: "0 4px" }}>{filteredData.length}</strong>
              of <strong style={{ color: themeColors.textPrimary, margin: "0 4px" }}>{attendanceData.length}</strong> records
              {searchTerm && ` matching "${searchTerm}"`}
              {statusFilter !== "all" && ` with status "${statusFilter}"`}
            </div>
          )}

          {/* Enhanced Table */}
          {loading ? (
            <div style={{
              background: themeColors.cardBg,
              borderRadius: "20px",
              padding: "80px 40px",
              textAlign: "center",
              boxShadow: isDarkMode
                ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                : "0 2px 8px rgba(0, 0, 0, 0.06)",
              border: `1px solid ${themeColors.borderLight}`,
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                border: `3px solid ${themeColors.border}`,
                borderTop: `3px solid ${themeColors.primary}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }} />
              <h3 style={{
                color: themeColors.textPrimary,
                marginBottom: "8px",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                Loading Attendance Data
              </h3>
              <p style={{
                color: themeColors.textSecondary,
                fontSize: "14px",
                margin: 0
              }}>
                Fetching records for {formatDisplayDate(selectedDate)}...
              </p>
            </div>
          ) : (
            <div style={{
              background: themeColors.cardBg,
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: isDarkMode
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
              border: `1px solid ${themeColors.borderLight}`,
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  minWidth: "1000px",
                }}>
                  <thead>
                    <tr style={{
                      background: isDarkMode
                        ? "linear-gradient(135deg, #2d3748 0%, #1e293b 100%)"
                        : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    }}>
                      {[
                        { label: "Employee", icon: "👤", width: "200px" },
                        { label: "Status", icon: "📊", width: "120px" },
                        { label: "Check In", icon: "🕐", width: "100px" },
                        { label: "Check Out", icon: "🕑", width: "100px" },
                        { label: "Work Hours", icon: "⏱️", width: "100px" },
                        { label: "Late By", icon: "⏰", width: "100px" },
                        { label: "Device", icon: "📱", width: "120px" },
                        { label: "Location", icon: "📍", width: "150px" }
                      ].map((header, idx) => (
                        <th
                          key={idx}
                          style={{
                            padding: "20px 16px",
                            textAlign: "left",
                            fontWeight: "600",
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: `2px solid ${themeColors.border}`,
                            color: themeColors.textPrimary,
                            width: header.width
                          }}
                        >
                          <span style={{ marginRight: "8px" }}>{header.icon}</span>
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((record, idx) => {
                        const sc = statusConfig[record.status] || statusConfig.absent;
                        const isEvenRow = idx % 2 === 0;
                        const rowBg = isEvenRow
                          ? themeColors.cardBg
                          : themeColors.cardBgSecondary;

                        return (
                          <tr
                            key={record.employee?.id || idx}
                            style={{
                              backgroundColor: rowBg,
                              borderBottom: `1px solid ${themeColors.borderLight}`,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? "#374151"
                                : "#f8fafc";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = rowBg;
                            }}
                          >
                            {/* Employee Column */}
                            <td style={{ padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "10px",
                                  background: `${themeColors.primary}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: themeColors.primary
                                }}>
                                  {record.employee?.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      color: themeColors.textPrimary,
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      transition: "color 0.2s ease",
                                      fontSize: "14px"
                                    }}
                                    onClick={() => navigate(`/employee-attendance/${record.employee?.id}`)}
                                    onMouseEnter={(e) => e.target.style.color = themeColors.primary}
                                    onMouseLeave={(e) => e.target.style.color = themeColors.textPrimary}
                                  >
                                    {record.employee?.fullName || record.employee?.name || "-"}
                                  </div>
                                  <div style={{
                                    fontSize: "12px",
                                    color: themeColors.textSecondary,
                                    fontFamily: "monospace",
                                    marginTop: "2px"
                                  }}>
                                    {record.employee?.employeeId || "-"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td style={{ padding: "16px" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "8px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  background: sc.bg,
                                  color: sc.color,
                                  textTransform: "capitalize",
                                }}
                              >
                                <span>{sc.icon}</span>
                                {sc.text}
                              </span>
                            </td>

                            {/* Time Columns */}
                            {["checkIn", "checkOut"].map((type) => (
                              <td key={type} style={{
                                padding: "16px",
                                fontFamily: "monospace",
                                color: themeColors.textPrimary,
                                fontWeight: "500",
                                fontSize: "13px"
                              }}>
                                {formatTime(record[type]?.time) || "-"}
                              </td>
                            ))}

                            {/* Work Hours */}
                            <td style={{
                              padding: "16px",
                              fontFamily: "monospace",
                              color: themeColors.textPrimary,
                              fontWeight: "600",
                              fontSize: "13px"
                            }}>
                              {formatWorkHours(record.workHours)}
                            </td>

                            {/* Late By */}
                            <td style={{ padding: "16px" }}>
                              {record.isLate ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: themeColors.warning,
                                    fontWeight: "600",
                                    fontSize: "13px"
                                  }}
                                >
                                  ⚠️ {record.lateBy ? `${record.lateBy}m` : "Late"}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: themeColors.success,
                                    fontWeight: "500",
                                    fontSize: "13px"
                                  }}
                                >
                                  ✅ On Time
                                </span>
                              )}
                            </td>

                            {/* Device Info */}
                            <td style={{ padding: "16px" }}>
                              <span
                                style={{
                                  background: isDarkMode ? "#374151" : "#f1f5f9",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  color: themeColors.textSecondary,
                                  display: "inline-block",
                                  maxWidth: "120px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {record.checkIn?.deviceInfo
                                  ? (() => {
                                    try {
                                      const info = JSON.parse(record.checkIn.deviceInfo);
                                      return `${info.platform} | ${info.userAgent.split(" ")[0]}`; // Android-style simple display
                                    } catch {
                                      return record.checkIn.deviceInfo;
                                    }
                                  })()
                                  : "-"}
                              </span>
                            </td>

                            {/* Location */}
                            <td style={{ padding: "16px" }}>
                              <LocationCell
                                address={record.checkIn?.location?.address || "No location"}
                                isDarkMode={isDarkMode}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            padding: "80px 40px",
                            textAlign: "center",
                            color: themeColors.textSecondary,
                          }}
                        >
                          <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.5 }}>📋</div>
                          <h3 style={{
                            margin: "0 0 12px 0",
                            color: themeColors.textPrimary,
                            fontSize: "20px",
                            fontWeight: "600"
                          }}>
                            No Records Found
                          </h3>
                          <p style={{
                            margin: 0,
                            fontSize: "15px",
                            maxWidth: "400px",
                            margin: "0 auto"
                          }}>
                            {attendanceData.length === 0
                              ? `No attendance records found for ${formatDisplayDate(selectedDate).toLowerCase()}.`
                              : "No records match your current filters."
                            }
                          </p>
                          {(searchTerm || statusFilter !== "all") && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                              }}
                              style={{
                                marginTop: "16px",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: `1px solid ${themeColors.primary}`,
                                background: themeColors.primary,
                                color: "white",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "all 0.2s ease"
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = themeColors.accent;
                                e.target.style.borderColor = themeColors.accent;
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = themeColors.primary;
                                e.target.style.borderColor = themeColors.primary;
                              }}
                            >
                              Clear Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------- Animations ---------- */}
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

export default AllDayAttendance;
