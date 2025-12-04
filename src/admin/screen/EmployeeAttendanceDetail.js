// src/pages/EmployeeAttendanceDetail.js
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import AttendanceApi from "../api/AttendanceApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    getMonth,
    getYear,
    isToday
} from "date-fns";
import LocationCell from "../component/LocationCell";
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const EmployeeAttendanceDetail = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    // UI State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { isDarkMode } = useTheme();
    const { admin, loading: adminLoading } = useContext(AdminContext) || {};

    // Data State
    const [attendanceData, setAttendanceData] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [monthlyStats, setMonthlyStats] = useState({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        averageWorkHours: 0,
        totalWorkHours: 0
    });

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

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
        overlay: isDarkMode ? "rgba(15, 23, 42, 0.8)" : "rgba(248, 250, 252, 0.8)",
    };

    const handleMenuToggle = () => setSidebarCollapsed((p) => !p);

    // API Call to fetch employee attendance
    const fetchEmployeeAttendance = async () => {
        if (!employeeId) return;

        setLoading(true);
        try {
            const result = await AttendanceApi.getAttendanceRecords(`employee/${employeeId}`);

            const responseData = result.data || result;
            if (result.success) {
                const attendanceArray = responseData.attendance || [];
                setAttendanceData(attendanceArray);

                // Set employee info from first record
                if (attendanceArray.length > 0) {
                    setEmployee(attendanceArray[0].employee);
                }

                // Calculate monthly stats
                calculateMonthlyStats(attendanceArray);
            } else {
                console.error("Failed to fetch attendance:", result.message);
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Error fetching employee attendance:", error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyStats = (data) => {
        if (!data || data.length === 0) {
            setMonthlyStats({
                totalDays: 0,
                presentDays: 0,
                absentDays: 0,
                lateDays: 0,
                averageWorkHours: 0,
                totalWorkHours: 0
            });
            return;
        }

        const presentDays = data.filter(record => record.status === 'present').length;
        const lateDays = data.filter(record => record.isLate).length;
        const totalWorkHours = data.reduce((sum, record) => sum + (record.workHours || 0), 0);
        const averageWorkHours = presentDays > 0 ? totalWorkHours / presentDays : 0;

        setMonthlyStats({
            totalDays: data.length,
            presentDays,
            absentDays: data.length - presentDays,
            lateDays,
            averageWorkHours,
            totalWorkHours
        });
    };

    // Memoized attendance data by date
    const attendanceByDate = useMemo(() => {
        return attendanceData.reduce((map, record) => {
            const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
            map[dateKey] = record;
            return map;
        }, {});
    }, [attendanceData]);

    // Calendar days for current month
    const calendarDays = useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth),
        });
    }, [currentMonth]);

    useEffect(() => {
        fetchEmployeeAttendance();
    }, [employeeId]);

    // Calendar Navigation
    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
        setSelectedDay(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
        setSelectedDay(null);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDay(null);
    };

    // Helper functions
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

    const formatWorkHours = (hours) => {
        if (!hours || hours === 0) return "0h 0m";
        const totalMinutes = Math.round(hours * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m}m`;
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return dateString;
        }
    };

    const statusConfig = {
        present: {
            bg: isDarkMode ? "linear-gradient(135deg, #065f46, #047857)" : "linear-gradient(135deg, #dcfce7, #bbf7d0)",
            color: isDarkMode ? "#10b981" : "#059669",
            text: "Present",
            icon: "✅",
        },
        absent: {
            bg: isDarkMode ? "linear-gradient(135deg, #7f1d1d, #991b1b)" : "linear-gradient(135deg, #fecaca, #fca5a5)",
            color: isDarkMode ? "#ef4444" : "#dc2626",
            text: "Absent",
            icon: "❌",
        },
        "on-leave": {
            bg: isDarkMode ? "linear-gradient(135deg, #92400e, #b45309)" : "linear-gradient(135deg, #fed7aa, #fdba74)",
            color: isDarkMode ? "#f59e0b" : "#d97706",
            text: "On Leave",
            icon: "🏖️",
        },
        "half-day": {
            bg: isDarkMode ? "linear-gradient(135deg, #78350f, #92400e)" : "linear-gradient(135deg, #fde68a, #fcd34d)",
            color: isDarkMode ? "#ca8a04" : "#a16207",
            text: "Half Day",
            icon: "🕒",
        },
        "public-holiday": {
            bg: isDarkMode ? "linear-gradient(135deg, #1e3a8a, #3730a3)" : "linear-gradient(135deg, #bfdbfe, #93c5fd)",
            color: isDarkMode ? "#60a5fa" : "#2563eb",
            text: "Public Holiday",
            icon: "🎉",
        },
        "combo-off": {
            bg: isDarkMode ? "linear-gradient(135deg, #4b5563, #6b7280)" : "linear-gradient(135deg, #d1d5db, #9ca3af)",
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            text: "Combo Off",
            icon: "🛑",
        },
        "non-working-day": {
            bg: isDarkMode ? "linear-gradient(135deg, #374151, #4b5563)" : "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            text: "Non-working Day",
            icon: "🚫",
        },
    };

    // Prepare chart data
    const prepareChartData = () => {
        const last30Days = attendanceData.slice(0, 30).reverse();

        return {
            labels: last30Days.map(record => format(new Date(record.date), 'MM/dd')),
            datasets: [
                {
                    label: 'Work Hours',
                    data: last30Days.map(record => record.workHours || 0),
                    borderColor: themeColors.primary,
                    backgroundColor: `${themeColors.primary}15`,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: themeColors.primary,
                    pointBorderColor: themeColors.cardBg,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                },
                {
                    label: 'Late Minutes',
                    data: last30Days.map(record => record.isLate ? (record.lateBy || 0) / 60 : 0),
                    borderColor: themeColors.warning,
                    backgroundColor: `${themeColors.warning}15`,
                    tension: 0.4,
                    fill: false,
                    borderDash: [5, 5],
                    pointBackgroundColor: themeColors.warning,
                    pointBorderColor: themeColors.cardBg,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                }
            ]
        };
    };

    // Calendar day click handler
    const onDayClick = (day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        if (attendanceByDate[dayKey]) {
            setSelectedDay(attendanceByDate[dayKey]);
        } else {
            setSelectedDay({
                date: dayKey,
                status: 'non-working-day',
                noRecord: true
            });
        }
    };

    // Close selected day details
    const closeSelectedDay = () => {
        setSelectedDay(null);
    };

    if (adminLoading || loading) {
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
                    <p style={{ fontSize: "16px", color: themeColors.textSecondary }}>Loading employee details...</p>
                </div>
            </div>
        );
    }

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

                {/* Page Content */}
                <main style={{
                    flex: 1,
                    overflow: "auto",
                    padding: "24px",
                    paddingTop: "88px",
                    background: themeColors.background,
                }}>
                    {/* Back Button & Header */}
                    <div style={{ marginBottom: "32px" }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: "transparent",
                                color: themeColors.primary,
                                padding: "10px 16px",
                                borderRadius: "8px",
                                border: `1px solid ${themeColors.primary}30`,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "20px",
                                transition: "all 0.2s ease",
                                backdropFilter: "blur(10px)",
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = `${themeColors.primary}15`;
                                e.target.style.transform = "translateX(-4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            ← Back to Attendance
                        </button>

                        {employee && (
                            <div style={{
                                background: themeColors.gradient,
                                borderRadius: "20px",
                                padding: "32px",
                                color: themeColors.textPrimary,
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
                                <h1 style={{
                                    fontSize: "32px",
                                    fontWeight: "800",
                                    margin: "0 0 8px 0",
                                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                    📊 {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                                </h1>
                                <div style={{
                                    display: "flex",
                                    gap: "16px",
                                    flexWrap: "wrap",
                                    fontSize: "15px",
                                    opacity: 0.9
                                }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        🆔 Employee ID: {employee.employeeId}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        📧 {employee.email}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "24px",
                        marginBottom: "40px",
                    }}>
                        {[
                            {
                                label: "Total Records",
                                value: monthlyStats.totalDays,
                                icon: "📋",
                                color: themeColors.primary,
                                trend: "+12%",
                            },
                            {
                                label: "Present Days",
                                value: monthlyStats.presentDays,
                                icon: "✅",
                                color: themeColors.success,
                                trend: "+5%",
                            },
                            {
                                label: "Late Days",
                                value: monthlyStats.lateDays,
                                icon: "⏰",
                                color: themeColors.warning,
                                trend: "-2%",
                            },
                            {
                                label: "Total Work Hours",
                                value: formatWorkHours(monthlyStats.totalWorkHours),
                                icon: "⏱️",
                                color: themeColors.accent,
                                trend: "+8%",
                            },
                        ].map((stat, idx) => (
                            <div key={idx} style={{
                                background: themeColors.cardBg,
                                borderRadius: "16px",
                                padding: "24px",
                                boxShadow: isDarkMode
                                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
                                border: `1px solid ${themeColors.borderLight}`,
                                transition: "all 0.3s ease",
                                position: "relative",
                                overflow: "hidden"
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = isDarkMode
                                        ? "0 12px 25px rgba(0, 0, 0, 0.2)"
                                        : "0 12px 25px rgba(0, 0, 0, 0.1)";
                                }}
                                onMouseOut={(e) => {
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
                                    marginBottom: "12px"
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
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: stat.color,
                                    marginBottom: "4px"
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: themeColors.textSecondary,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 400px",
                        gap: "24px",
                        alignItems: "start"
                    }}>
                        {/* Left Column - Chart & Calendar */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {/* Chart Section */}
                            {attendanceData.length > 0 && (
                                <div style={{
                                    background: themeColors.cardBg,
                                    borderRadius: "20px",
                                    padding: "24px",
                                    boxShadow: isDarkMode
                                        ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                                    border: `1px solid ${themeColors.borderLight}`,
                                }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "20px"
                                    }}>
                                        <h3 style={{
                                            color: themeColors.textPrimary,
                                            margin: 0,
                                            fontSize: "18px",
                                            fontWeight: "700",
                                        }}>
                                            📈 Attendance Trend (Last 30 Days)
                                        </h3>
                                        <div style={{
                                            display: "flex",
                                            gap: "8px",
                                            fontSize: "12px",
                                            color: themeColors.textSecondary
                                        }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <div style={{ width: "8px", height: "8px", background: themeColors.primary, borderRadius: "50%" }} />
                                                Work Hours
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <div style={{ width: "8px", height: "8px", background: themeColors.warning, borderRadius: "50%" }} />
                                                Late Hours
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: "100%",
                                        height: "300px",
                                        position: "relative"
                                    }}>
                                        <Line
                                            data={prepareChartData()}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    },
                                                    tooltip: {
                                                        backgroundColor: themeColors.cardBg,
                                                        titleColor: themeColors.textPrimary,
                                                        bodyColor: themeColors.textPrimary,
                                                        borderColor: themeColors.border,
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                        callbacks: {
                                                            label: function (context) {
                                                                let label = context.dataset.label || '';
                                                                if (label) {
                                                                    label += ': ';
                                                                }
                                                                if (context.dataset.label === 'Work Hours') {
                                                                    label += context.parsed.y.toFixed(1) + 'h';
                                                                } else {
                                                                    label += context.parsed.y.toFixed(0) + 'm';
                                                                }
                                                                return label;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            color: themeColors.textSecondary,
                                                            callback: function (value) {
                                                                return value + 'h';
                                                            }
                                                        },
                                                        grid: {
                                                            color: themeColors.borderLight,
                                                            borderDash: [4, 4]
                                                        }
                                                    },
                                                    x: {
                                                        ticks: { color: themeColors.textSecondary },
                                                        grid: {
                                                            color: themeColors.borderLight,
                                                            borderDash: [4, 4]
                                                        }
                                                    }
                                                },
                                                interaction: {
                                                    intersect: false,
                                                    mode: 'index'
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Calendar Section */}
                            <div style={{
                                background: themeColors.cardBg,
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: isDarkMode
                                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
                                border: `1px solid ${themeColors.borderLight}`,
                            }}>
                                {/* Calendar Header */}
                                <div style={{
                                    padding: "24px",
                                    borderBottom: `1px solid ${themeColors.borderLight}`,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <h3 style={{
                                        color: themeColors.textPrimary,
                                        margin: 0,
                                        fontSize: "18px",
                                        fontWeight: "700",
                                    }}>
                                        📅 Attendance Calendar
                                    </h3>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <button
                                            onClick={goToPreviousMonth}
                                            style={{
                                                padding: "10px 12px",
                                                borderRadius: "10px",
                                                border: `1px solid ${themeColors.border}`,
                                                background: themeColors.cardBgSecondary,
                                                color: themeColors.textPrimary,
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => e.target.style.background = themeColors.borderLight}
                                            onMouseOut={(e) => e.target.style.background = themeColors.cardBgSecondary}
                                        >
                                            ‹
                                        </button>
                                        <span style={{
                                            fontSize: "16px",
                                            fontWeight: "700",
                                            color: themeColors.textPrimary,
                                            minWidth: "140px",
                                            textAlign: "center"
                                        }}>
                                            {format(currentMonth, 'MMMM yyyy')}
                                        </span>
                                        <button
                                            onClick={goToNextMonth}
                                            style={{
                                                padding: "10px 12px",
                                                borderRadius: "10px",
                                                border: `1px solid ${themeColors.border}`,
                                                background: themeColors.cardBgSecondary,
                                                color: themeColors.textPrimary,
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => e.target.style.background = themeColors.borderLight}
                                            onMouseOut={(e) => e.target.style.background = themeColors.cardBgSecondary}
                                        >
                                            ›
                                        </button>
                                        <button
                                            onClick={goToToday}
                                            style={{
                                                padding: "10px 16px",
                                                borderRadius: "10px",
                                                border: `1px solid ${themeColors.primary}`,
                                                background: themeColors.primary,
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                transition: "all 0.2s ease",
                                                marginLeft: "8px"
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
                                            Today
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div style={{ padding: "20px" }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(7, 1fr)',
                                        gap: '8px',
                                        fontSize: '14px',
                                    }}>
                                        {/* Weekday Headers */}
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dow => (
                                            <div key={dow} style={{
                                                fontWeight: '700',
                                                textAlign: 'center',
                                                color: themeColors.textSecondary,
                                                fontSize: '12px',
                                                padding: '12px 0',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {dow}
                                            </div>
                                        ))}

                                        {/* Calendar Days */}
                                        {calendarDays.map((day) => {
                                            const dayKey = format(day, 'yyyy-MM-dd');
                                            const record = attendanceByDate[dayKey];
                                            const status = record?.status || 'non-working-day';
                                            const isSelected = selectedDay && isSameDay(new Date(selectedDay.date || selectedDay.date), day);
                                            const config = statusConfig[status];
                                            const isCurrentMonth = getMonth(day) === getMonth(currentMonth);
                                            const isTodayDate = isToday(day);

                                            return (
                                                <div
                                                    key={dayKey}
                                                    onClick={() => onDayClick(day)}
                                                    style={{
                                                        aspectRatio: '1',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        border: isSelected ? `3px solid ${themeColors.accent}` :
                                                            isTodayDate ? `2px solid ${themeColors.primary}` : 'none',
                                                        background: config.bg,
                                                        color: config.color,
                                                        opacity: isCurrentMonth ? 1 : 0.3,
                                                        transition: 'all 0.2s ease',
                                                        position: 'relative',
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        userSelect: 'none',
                                                        boxShadow: isSelected ? `0 4px 12px ${themeColors.accent}40` : 'none',
                                                        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                                    }}
                                                    title={record ? `${config?.text || status} - ${formatTime(record.checkIn?.time)}` : 'No record'}
                                                    onMouseOver={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                                        }
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '15px',
                                                        lineHeight: 1,
                                                        marginBottom: '4px'
                                                    }}>
                                                        {format(day, 'd')}
                                                    </div>
                                                    <div style={{ fontSize: '16px' }}>
                                                        {config?.icon}
                                                    </div>
                                                    {record?.isLate && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            width: '6px',
                                                            height: '6px',
                                                            backgroundColor: themeColors.warning,
                                                            borderRadius: '50%',
                                                        }} />
                                                    )}
                                                    {isTodayDate && !isSelected && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '2px',
                                                            width: '4px',
                                                            height: '4px',
                                                            backgroundColor: themeColors.primary,
                                                            borderRadius: '50%',
                                                        }} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status Legend & Day Details */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "100px" }}>
                            {/* Status Legend */}
                            <div style={{
                                background: themeColors.cardBg,
                                borderRadius: "20px",
                                padding: "24px",
                                boxShadow: isDarkMode
                                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
                                border: `1px solid ${themeColors.borderLight}`,
                            }}>
                                <h4 style={{
                                    marginBottom: "20px",
                                    fontWeight: "700",
                                    color: themeColors.textPrimary,
                                    fontSize: "16px"
                                }}>
                                    Status Legend
                                </h4>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px"
                                }}>
                                    {Object.entries(statusConfig).map(([key, { bg, color, text, icon }]) => (
                                        <div key={key} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px 16px",
                                            background: bg,
                                            color: color,
                                            borderRadius: "12px",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            userSelect: "none",
                                            transition: "transform 0.2s ease"
                                        }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = "translateX(4px)"}
                                            onMouseOut={(e) => e.currentTarget.style.transform = "translateX(0)"}
                                        >
                                            <span style={{ fontSize: "18px", width: "24px" }}>{icon}</span>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Day Details */}
                            {selectedDay ? (
                                <div style={{
                                    background: themeColors.cardBg,
                                    borderRadius: "20px",
                                    padding: "24px",
                                    boxShadow: isDarkMode
                                        ? "0 8px 25px rgba(0, 0, 0, 0.2)"
                                        : "0 8px 25px rgba(0, 0, 0, 0.1)",
                                    border: `2px solid ${themeColors.accent}`,
                                    position: 'sticky',
                                    top: "100px"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "20px"
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            color: themeColors.textPrimary,
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            📋 Day Details
                                        </h3>
                                        <button
                                            onClick={closeSelectedDay}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                fontSize: "20px",
                                                cursor: "pointer",
                                                color: themeColors.textSecondary,
                                                padding: "4px",
                                                borderRadius: "6px",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.background = themeColors.borderLight;
                                                e.target.style.color = themeColors.textPrimary;
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.background = "none";
                                                e.target.style.color = themeColors.textSecondary;
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div style={{
                                        marginBottom: "20px",
                                        padding: "16px",
                                        background: themeColors.cardBgSecondary,
                                        borderRadius: "12px",
                                        textAlign: "center"
                                    }}>
                                        <div style={{
                                            fontSize: "15px",
                                            fontWeight: "600",
                                            color: themeColors.textSecondary,
                                            marginBottom: "4px"
                                        }}>
                                            {format(new Date(selectedDay.date), 'EEEE')}
                                        </div>
                                        <div style={{
                                            fontSize: "18px",
                                            fontWeight: "700",
                                            color: themeColors.textPrimary
                                        }}>
                                            {format(new Date(selectedDay.date), 'MMM dd, yyyy')}
                                        </div>
                                    </div>

                                    {selectedDay.noRecord ? (
                                        <div style={{
                                            textAlign: 'center',
                                            color: themeColors.textSecondary,
                                            padding: '40px 20px'
                                        }}>
                                            <div style={{
                                                fontSize: '64px',
                                                marginBottom: '16px',
                                                opacity: 0.5
                                            }}>
                                                🚫
                                            </div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: "15px",
                                                fontWeight: "500"
                                            }}>
                                                No attendance record for this day
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px'
                                        }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px 20px',
                                                background: statusConfig[selectedDay.status]?.bg || statusConfig.absent.bg,
                                                color: statusConfig[selectedDay.status]?.color || statusConfig.absent.color,
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '15px',
                                                alignSelf: 'flex-start'
                                            }}>
                                                {statusConfig[selectedDay.status]?.icon}
                                                {statusConfig[selectedDay.status]?.text || selectedDay.status}
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '16px'
                                            }}>
                                                <DetailCard
                                                    label="Check In"
                                                    value={formatTime(selectedDay.checkIn?.time)}
                                                    themeColors={themeColors}
                                                />
                                                <DetailCard
                                                    label="Check Out"
                                                    value={formatTime(selectedDay.checkOut?.time)}
                                                    themeColors={themeColors}
                                                />
                                                <DetailCard
                                                    label="Work Hours"
                                                    value={formatWorkHours(selectedDay.workHours)}
                                                    themeColors={themeColors}
                                                    highlight
                                                />
                                                <DetailCard
                                                    label="Late By"
                                                    value={selectedDay.isLate ? `⚠️ ${selectedDay.lateBy ? `${selectedDay.lateBy}m` : 'Yes'}` : '✅ On Time'}
                                                    themeColors={themeColors}
                                                    warning={selectedDay.isLate}
                                                />
                                                {selectedDay.isShortAttendance && (
                                                    <DetailCard
                                                        label="Short Attendance"
                                                        value={`⚠️ Short by ${selectedDay.shortByMinutes} min`}
                                                        themeColors={themeColors}
                                                        warning
                                                    />
                                                )}
                                            </div>

                                            {selectedDay.checkIn?.location?.address && (
                                                <div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: themeColors.textSecondary,
                                                        marginBottom: '8px',
                                                        fontWeight: '600'
                                                    }}>
                                                        Location
                                                    </div>
                                                    <LocationCell
                                                        address={selectedDay.checkIn.location.address}
                                                        isDarkMode={isDarkMode}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{
                                    background: themeColors.cardBg,
                                    borderRadius: "20px",
                                    padding: "40px 24px",
                                    textAlign: 'center',
                                    color: themeColors.textSecondary,
                                    boxShadow: isDarkMode
                                        ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                                    border: `1px solid ${themeColors.borderLight}`,
                                    fontStyle: 'italic'
                                }}>
                                    <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>👆</div>
                                    <p style={{ margin: 0, fontSize: "15px" }}>
                                        Click on any day to view detailed attendance information
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Helper component for detail cards
const DetailCard = ({ label, value, themeColors, highlight = false, warning = false }) => (
    <div style={{
        background: themeColors.cardBgSecondary,
        borderRadius: "10px",
        padding: "12px",
        border: `1px solid ${themeColors.borderLight}`
    }}>
        <div style={{
            fontSize: '12px',
            color: themeColors.textSecondary,
            marginBottom: '6px',
            fontWeight: '600'
        }}>
            {label}
        </div>
        <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: warning ? themeColors.warning :
                highlight ? themeColors.primary : themeColors.textPrimary,
            fontFamily: 'monospace'
        }}>
            {value}
        </div>
    </div>
);

export default EmployeeAttendanceDetail;