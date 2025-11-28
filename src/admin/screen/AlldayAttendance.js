// src/pages/AllDayAttendance.js
import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import AttendanceApi from "../api/AttendanceApi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { format, parseISO } from "date-fns";
import LocationCell from "../component/LocationCell";
import { useTheme } from '../context/ThemeContext'; // Import theme context

const AllDayAttendance = () => {
    /* --------------------- Admin / UI State --------------------- */
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { isDarkMode } = useTheme();
    const { admin, loading: adminLoading } = useContext(AdminContext) || {};

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    const themeColors = {
        background: isDarkMode ? "#0f172a" : "#f8fafc",
        cardBg: isDarkMode ? "#1e293b" : "#ffffff",
        cardBgSecondary: isDarkMode ? "#2d3748" : "#f7fafc",
        textPrimary: isDarkMode ? "#e2e8f0" : "#1a202c",
        textSecondary: isDarkMode ? "#94a3b8" : "#718096",
        textMuted: isDarkMode ? "#64748b" : "#a0aec0",
        border: isDarkMode ? "#374151" : "#e2e8f0",
        borderLight: isDarkMode ? "#4b5563" : "#f1f5f9",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        primary: "#3b82f6",
        accent: isDarkMode ? "#6366f1" : "#4f46e5",
        gradient: isDarkMode
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    };

    const handleMenuToggle = () => setSidebarCollapsed((p) => !p);

    /* --------------------- Attendance State --------------------- */
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
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
                setStats({
                    totalEmployees: responseData.totalEmployees || 0,
                    presentCount: responseData.presentCount || 0,
                    absentCount:
                        (responseData.totalEmployees || 0) -
                        (responseData.presentCount || 0),
                    lateCount: attendanceArray.filter((r) => r.isLate).length,
                });
            } else {
                alert(result.message || "Failed to fetch attendance");
                setAttendanceData([]);
                setStats({ totalEmployees: 0, presentCount: 0, absentCount: 0, lateCount: 0 });
            }
        } catch (err) {
            alert("Error fetching attendance data: " + err.message);
            setAttendanceData([]);
            setStats({ totalEmployees: 0, presentCount: 0, absentCount: 0, lateCount: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance(selectedDate);
    }, [selectedDate]);

    /* --------------------- Filters --------------------- */
    const filteredData = attendanceData.filter((record) => {
        const matchesSearch =
            record.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || record.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    /* --------------------- Helpers --------------------- */
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

    const formatDisplayDate = (date) => format(date, "EEEE, MMMM d, yyyy");

    /* --------------------- Early Returns --------------------- */
    if (adminLoading) {
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
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!admin?.role) {
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
                <div style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</div>
                    <h2 style={{ marginBottom: "8px", fontSize: "24px" }}>Access Denied</h2>
                    <p style={{ color: themeColors.textSecondary }}>
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

                {/* ---------- Page Content ---------- */}
                <main
                    style={{
                        flex: 1,
                        overflow: "auto",
                        padding: "24px",
                        paddingTop: "88px",
                        background: `linear-gradient(135deg, ${isDarkMode ? '#0f172a' : '#f8fafc'} 0%, ${isDarkMode ? '#1e293b' : '#ffffff'} 100%)`,
                    }}
                >
                    {/* Enhanced Header */}
                    <div style={{ marginBottom: "32px" }}>
                        <div
                            style={{
                                background: themeColors.gradient,
                                borderRadius: "16px",
                                padding: "32px",
                                textAlign: "center",
                                color: "white",
                                boxShadow: isDarkMode
                                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
                                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: "32px",
                                    fontWeight: "700",
                                    margin: "0 0 8px 0",
                                    letterSpacing: "-0.025em",
                                }}
                            >
                                📊 Attendance Dashboard
                            </h1>
                            <p style={{ fontSize: "18px", margin: 0, opacity: 0.9 }}>
                                {formatDisplayDate(selectedDate)}
                            </p>
                        </div>
                    </div>

                    {/* Enhanced Stats Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "20px",
                            marginBottom: "32px",
                        }}
                    >
                        {[
                            {
                                label: "Total Employees",
                                value: stats.totalEmployees,
                                icon: "👥",
                                color: themeColors.primary,
                                bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            },
                            {
                                label: "Present Today",
                                value: stats.presentCount,
                                icon: "✅",
                                color: themeColors.success,
                                bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            },
                            {
                                label: "Absent Today",
                                value: stats.absentCount,
                                icon: "❌",
                                color: themeColors.error,
                                bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            },
                            {
                                label: "Late Arrivals",
                                value: stats.lateCount,
                                icon: "⏰",
                                color: themeColors.warning,
                                bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: themeColors.cardBg,
                                    borderRadius: "16px",
                                    padding: "24px",
                                    boxShadow: isDarkMode
                                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                                        : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                    border: `1px solid ${themeColors.borderLight}`,
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = isDarkMode
                                        ? "0 20px 25px -5px rgba(0, 0, 0, 0.4)"
                                        : "0 20px 25px -5px rgba(0, 0, 0, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = isDarkMode
                                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                                        : "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "4px",
                                        background: stat.bgGradient,
                                    }}
                                />
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "24px", marginRight: "12px" }}>{stat.icon}</span>
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: themeColors.textSecondary,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: "36px",
                                        fontWeight: "700",
                                        color: stat.color,
                                        lineHeight: 1,
                                    }}
                                >
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Controls Section */}
                    <div
                        style={{
                            background: themeColors.cardBg,
                            borderRadius: "16px",
                            padding: "24px",
                            marginBottom: "24px",
                            boxShadow: isDarkMode
                                ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                : "0 4px 6px rgba(0, 0, 0, 0.07)",
                            border: `1px solid ${themeColors.borderLight}`,
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "20px",
                                alignItems: "end",
                            }}
                        >
                            {/* Date Picker */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: themeColors.textPrimary,
                                        marginBottom: "8px",
                                    }}
                                >
                                    📅 Select Date
                                </label>
                                <input
                                    type="date"
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: `2px solid ${themeColors.border}`,
                                        outline: "none",
                                        fontSize: "15px",
                                        backgroundColor: themeColors.cardBg,
                                        color: themeColors.textPrimary,
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                                    onBlur={(e) => e.target.style.borderColor = themeColors.border}
                                />
                            </div>

                            {/* Search */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: themeColors.textPrimary,
                                        marginBottom: "8px",
                                    }}
                                >
                                    🔍 Search Employees
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name, ID, or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: `2px solid ${themeColors.border}`,
                                        outline: "none",
                                        fontSize: "15px",
                                        backgroundColor: themeColors.cardBg,
                                        color: themeColors.textPrimary,
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                                    onBlur={(e) => e.target.style.borderColor = themeColors.border}
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: themeColors.textPrimary,
                                        marginBottom: "8px",
                                    }}
                                >
                                    🎯 Filter by Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: `2px solid ${themeColors.border}`,
                                        outline: "none",
                                        fontSize: "15px",
                                        backgroundColor: themeColors.cardBg,
                                        color: themeColors.textPrimary,
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Summary */}
                    {searchTerm || statusFilter !== "all" ? (
                        <div
                            style={{
                                background: themeColors.cardBgSecondary,
                                padding: "12px 20px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                                fontSize: "14px",
                                color: themeColors.textSecondary,
                            }}
                        >
                            Showing {filteredData.length} of {attendanceData.length} records
                            {searchTerm && ` matching "${searchTerm}"`}
                            {statusFilter !== "all" && ` with status "${statusFilter}"`}
                        </div>
                    ) : null}

                    {/* Enhanced Table */}
                    {loading ? (
                        <div
                            style={{
                                background: themeColors.cardBg,
                                borderRadius: "16px",
                                padding: "60px",
                                textAlign: "center",
                                boxShadow: isDarkMode
                                    ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                    : "0 4px 6px rgba(0, 0, 0, 0.07)",
                            }}
                        >
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    border: `3px solid ${themeColors.border}`,
                                    borderTop: `3px solid ${themeColors.primary}`,
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                    margin: "0 auto 16px",
                                }}
                            />
                            <p style={{ color: themeColors.textSecondary, fontSize: "16px" }}>
                                Loading attendance data...
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{
                                background: themeColors.cardBg,
                                borderRadius: "16px",
                                overflow: "hidden",
                                boxShadow: isDarkMode
                                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.2)"
                                    : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                border: `1px solid ${themeColors.borderLight}`,
                            }}
                        >
                            <div style={{ overflowX: "hidden" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        fontSize: "14px",
                                        minWidth: "1000px",
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                background: isDarkMode
                                                    ? "linear-gradient(90deg, #2d3748 0%, #1a202c 100%)"
                                                    : "linear-gradient(90deg, #f7fafc 0%, #edf2f7 100%)",
                                                color: themeColors.textPrimary,
                                            }}
                                        >
                                            {[
                                                { label: "Employee ID", icon: "🆔" },
                                                { label: "Name", icon: "👤" },
                                                //  { label: "Department", icon: "🏢" },
                                                { label: "Status", icon: "📊" },
                                                { label: "Check In", icon: "🕐" },
                                                { label: "Check Out", icon: "🕑" },
                                                { label: "Work Hours", icon: "⏱️" },
                                                { label: "Late By", icon: "⏰" },
                                                { label: "Device", icon: "📱" },
                                                { label: "Location", icon: "📍" }
                                            ].map((header, idx) => (
                                                <th
                                                    key={idx}
                                                    style={{
                                                        padding: "20px 16px",
                                                        textAlign: "left",
                                                        fontWeight: "600",
                                                        fontSize: "13px",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                        borderBottom: `2px solid ${themeColors.border}`,
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
                                                const statusConfig = {
                                                    present: {
                                                        bg: isDarkMode ? "#064e3b" : "#dcfce7",
                                                        color: isDarkMode ? "#10b981" : "#059669",
                                                        text: "Present",
                                                        icon: "✅",
                                                    },
                                                    absent: {
                                                        bg: isDarkMode ? "#7f1d1d" : "#fecaca",
                                                        color: isDarkMode ? "#ef4444" : "#dc2626",
                                                        text: "Absent",
                                                        icon: "❌",
                                                    },
                                                    "on-leave": {
                                                        bg: isDarkMode ? "#92400e" : "#fed7aa",
                                                        color: isDarkMode ? "#f59e0b" : "#d97706",
                                                        text: "On Leave",
                                                        icon: "🏖️",
                                                    },
                                                };

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
                                                                : "#f1f5f9";
                                                            e.currentTarget.style.transform = "scale(1.005)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = rowBg;
                                                            e.currentTarget.style.transform = "scale(1)";
                                                        }}
                                                    >
                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontWeight: "600",
                                                                color: themeColors.accent,
                                                                fontFamily: "monospace",
                                                            }}
                                                        >
                                                            {record.employee?.employeeId || "-"}
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                color: themeColors.textPrimary,
                                                                fontWeight: "500",
                                                                cursor: "pointer",
                                                                textDecoration: "underline",
                                                            }}
                                                            onClick={() => navigate(`/employee-attendance/${record.employee?.id}`)}
                                                        >
                                                            {record.employee?.fullName || record.employee?.name || "-"}
                                                        </td>

                                                        {/* <td
                                                            style={{
                                                                padding: "16px",
                                                                color: themeColors.textSecondary,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    background: isDarkMode ? "#374151" : "#e2e8f0",
                                                                    padding: "4px 8px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "500",
                                                                }}
                                                            >
                                                                {record.employee?.department || "-"}
                                                            </span>
                                                        </td> */}
                                                        <td style={{ padding: "16px" }}>
                                                            <span
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    padding: "6px 12px",
                                                                    borderRadius: "20px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "600",
                                                                    backgroundColor: sc.bg,
                                                                    color: sc.color,
                                                                    textTransform: "capitalize",
                                                                }}
                                                            >
                                                                <span>{sc.icon}</span>
                                                                {sc.text}
                                                            </span>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontFamily: "monospace",
                                                                color: themeColors.textPrimary,
                                                                fontWeight: "500",
                                                            }}
                                                        >
                                                            {formatTime(record.checkIn?.time) || "-"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontFamily: "monospace",
                                                                color: themeColors.textPrimary,
                                                                fontWeight: "500",
                                                            }}
                                                        >
                                                            {formatTime(record.checkOut?.time) || "-"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontFamily: "monospace",
                                                                color: themeColors.textPrimary,
                                                                fontWeight: "500",
                                                            }}
                                                        >
                                                            {formatWorkHours(record.workHours)}
                                                        </td>
                                                        <td style={{ padding: "16px" }}>
                                                            {record.isLate ? (
                                                                <span
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "4px",
                                                                        color: themeColors.error,
                                                                        fontWeight: "600",
                                                                    }}
                                                                >
                                                                    ⚠️ {record.lateBy ? `${record.lateBy}m` : "Yes"}
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "4px",
                                                                        color: themeColors.success,
                                                                        fontWeight: "500",
                                                                    }}
                                                                >
                                                                    ✅ No
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontSize: "12px",
                                                                color: themeColors.textMuted,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    background: isDarkMode ? "#374151" : "#f1f5f9",
                                                                    padding: "2px 6px",
                                                                    borderRadius: "4px",
                                                                }}
                                                            >
                                                                {record.checkIn?.deviceInfo || "-"}
                                                            </span>
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontSize: "12px",
                                                                color: themeColors.textMuted,
                                                            }}
                                                        >
                                                            <LocationCell address={record.checkIn?.location?.address || "No location"} isDarkMode={isDarkMode} />

                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    style={{
                                                        padding: "60px",
                                                        textAlign: "center",
                                                        color: themeColors.textSecondary,
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                                                    <h3 style={{ margin: "0 0 8px 0", color: themeColors.textPrimary }}>
                                                        No Records Found
                                                    </h3>
                                                    <p style={{ margin: 0 }}>
                                                        No attendance records found for the selected criteria.
                                                    </p>
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
