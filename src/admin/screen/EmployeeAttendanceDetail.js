// src/pages/EmployeeAttendanceDetail.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import AttendanceApi from "../api/AttendanceApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import LocationCell from "../component/LocationCell";
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext'; // Import theme context
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
    // Get theme from context instead of local state
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

    useEffect(() => {
        fetchEmployeeAttendance();
    }, [employeeId]);

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

    // Prepare chart data
    // Prepare chart data
    const prepareChartData = () => {
        const last30Days = attendanceData.slice(0, 30).reverse();

        return {
            labels: last30Days.map(record => format(new Date(record.date), 'MM/dd')),
            datasets: [
                {
                    label: 'Work Minutes', // Changed from 'Work Hours'
                    data: last30Days.map(record => (record.workHours || 0) * 60), // Convert hours to minutes
                    borderColor: themeColors.primary,
                    backgroundColor: `${themeColors.primary}20`,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Late Minutes',
                    data: last30Days.map(record => record.isLate ? (record.lateBy || 0) : 0),
                    borderColor: themeColors.error,
                    backgroundColor: `${themeColors.error}20`,
                    tension: 0.4,
                    fill: false
                }
            ]
        };
    };


    if (adminLoading || loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: themeColors.background,
                color: themeColors.textPrimary,
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        border: `3px solid ${themeColors.border}`,
                        borderTop: `3px solid ${themeColors.primary}`,
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px",
                    }} />
                    <p>Loading employee details...</p>
                </div>
            </div>
        );
    }

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
                {/* Page Content */}
                <main style={{
                    flex: 1,
                    overflow: "auto",
                    padding: "24px",
                    paddingTop: "88px",
                    background: `linear-gradient(135deg, ${isDarkMode ? '#0f172a' : '#f8fafc'} 0%, ${isDarkMode ? '#1e293b' : '#ffffff'} 100%)`,
                }}>
                    {/* Back Button & Header */}
                    <div style={{ marginBottom: "24px" }}>
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
                            ← Back to Attendance
                        </button>

                        {employee && (
                            <div style={{
                                background: themeColors.gradient,
                                borderRadius: "16px",
                                padding: "24px",
                                color: "white",
                                boxShadow: isDarkMode
                                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
                                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}>
                                <h1 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    margin: "0 0 8px 0",
                                }}>
                                    📊 {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                                </h1>
                                <p style={{ fontSize: "16px", margin: 0, opacity: 0.9 }}>
                                    Employee ID: {employee.employeeId} | Email: {employee.email}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                        marginBottom: "32px",
                    }}>
                        {[
                            {
                                label: "Total Records",
                                value: monthlyStats.totalDays,
                                icon: "📋",
                                color: themeColors.primary,
                            },
                            {
                                label: "Present Days",
                                value: monthlyStats.presentDays,
                                icon: "✅",
                                color: themeColors.success,
                            },
                            {
                                label: "Late Days",
                                value: monthlyStats.lateDays,
                                icon: "⏰",
                                color: themeColors.warning,
                            },
                            {
                                label: "Total Work Hours",
                                value: formatWorkHours(monthlyStats.totalWorkHours),
                                icon: "⏱️",
                                color: themeColors.accent,
                            },
                        ].map((stat, idx) => (
                            <div key={idx} style={{
                                background: themeColors.cardBg,
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: isDarkMode
                                    ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
                                border: `1px solid ${themeColors.borderLight}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px", marginRight: "8px" }}>{stat.icon}</span>
                                    <span style={{
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        color: themeColors.textSecondary,
                                        textTransform: "uppercase",
                                    }}>
                                        {stat.label}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: stat.color,
                                }}>
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Section */}
                    {/* Chart Section */}
                    {attendanceData.length > 0 && (
                        <div style={{
                            background: themeColors.cardBg,
                            borderRadius: "16px",
                            padding: "24px",
                            marginBottom: "24px",
                            boxShadow: isDarkMode
                                ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                : "0 4px 6px rgba(0, 0, 0, 0.1)",
                            border: `1px solid ${themeColors.borderLight}`,
                        }}>
                            <h3 style={{
                                color: themeColors.textPrimary,
                                marginBottom: "20px",
                                fontSize: "18px",
                                fontWeight: "600",
                            }}>
                                📈 Attendance Trend (Last 30 Days)
                            </h3>
                            {/* Add this container with fixed height */}
                            <div style={{
                                width: "100%",
                                height: "400px",  // Fixed height
                                position: "relative"
                            }}>
                                <Line
                                    data={prepareChartData()}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,  // This is crucial
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: {
                                                    color: themeColors.textPrimary
                                                }
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { color: themeColors.textSecondary },
                                                grid: { color: themeColors.borderLight }
                                            },
                                            x: {
                                                ticks: { color: themeColors.textSecondary },
                                                grid: { color: themeColors.borderLight }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}


                    {/* Attendance Records Table */}
                    <div style={{
                        background: themeColors.cardBg,
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: isDarkMode
                            ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                            : "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: `1px solid ${themeColors.borderLight}`,
                    }}>
                        <div style={{ padding: "20px", borderBottom: `1px solid ${themeColors.borderLight}` }}>
                            <h3 style={{
                                color: themeColors.textPrimary,
                                margin: 0,
                                fontSize: "18px",
                                fontWeight: "600",
                            }}>
                                📅 Attendance Records ({attendanceData.length} total)
                            </h3>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "14px",
                            }}>
                                <thead>
                                    <tr style={{
                                        background: isDarkMode
                                            ? "linear-gradient(90deg, #2d3748 0%, #1a202c 100%)"
                                            : "linear-gradient(90deg, #f7fafc 0%, #edf2f7 100%)",
                                        color: themeColors.textPrimary,
                                    }}>
                                        {[
                                            { label: "Date", icon: "📅" },
                                            { label: "Status", icon: "📊" },
                                            { label: "Check In", icon: "🕐" },
                                            { label: "Check Out", icon: "🕑" },
                                            { label: "Work Hours", icon: "⏱️" },
                                            { label: "Late By", icon: "⏰" },
                                            { label: "Location", icon: "📍" }
                                        ].map((header, idx) => (
                                            <th key={idx} style={{
                                                padding: "16px",
                                                textAlign: "left",
                                                fontWeight: "600",
                                                fontSize: "12px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                            }}>
                                                <span style={{ marginRight: "6px" }}>{header.icon}</span>
                                                {header.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.length > 0 ? attendanceData.map((record, idx) => {
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
                                        const rowBg = isEvenRow ? themeColors.cardBg : themeColors.cardBgSecondary;

                                        return (
                                            <tr key={record.id || idx} style={{
                                                backgroundColor: rowBg,
                                                borderBottom: `1px solid ${themeColors.borderLight}`,
                                            }}>
                                                <td style={{
                                                    padding: "16px",
                                                    color: themeColors.textPrimary,
                                                    fontWeight: "500",
                                                }}>
                                                    {formatDate(record.date)}
                                                </td>
                                                <td style={{ padding: "16px" }}>
                                                    <span style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        padding: "4px 10px",
                                                        borderRadius: "16px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        backgroundColor: sc.bg,
                                                        color: sc.color,
                                                    }}>
                                                        {sc.icon} {sc.text}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: "16px",
                                                    fontFamily: "monospace",
                                                    color: themeColors.textPrimary,
                                                }}>
                                                    {formatTime(record.checkIn?.time)}
                                                </td>
                                                <td style={{
                                                    padding: "16px",
                                                    fontFamily: "monospace",
                                                    color: themeColors.textPrimary,
                                                }}>
                                                    {formatTime(record.checkOut?.time)}
                                                </td>
                                                <td style={{
                                                    padding: "16px",
                                                    fontFamily: "monospace",
                                                    color: themeColors.textPrimary,
                                                }}>
                                                    {formatWorkHours(record.workHours)}
                                                </td>
                                                <td style={{ padding: "16px" }}>
                                                    {record.isLate ? (
                                                        <span style={{
                                                            color: themeColors.error,
                                                            fontWeight: "600",
                                                        }}>
                                                            ⚠️ {record.lateBy ? `${record.lateBy}m` : "Yes"}
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            color: themeColors.success,
                                                            fontWeight: "500",
                                                        }}>
                                                            ✅ No
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "16px", fontSize: "12px" }}>
                                                    <LocationCell
                                                        address={record.checkIn?.location?.address}
                                                        isDarkMode={isDarkMode}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={7} style={{
                                                padding: "40px",
                                                textAlign: "center",
                                                color: themeColors.textSecondary,
                                            }}>
                                                No attendance records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

export default EmployeeAttendanceDetail;
