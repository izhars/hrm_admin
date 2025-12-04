import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import DayTimeWidget from "../component/DayTimeWidget";
import TodayAttendanceCard from "../component/TodayAttendanceCard";
import { AdminContext } from "../context/AdminContext";
import { DashboardApi, AttendanceApi } from "../api";
import { useTheme } from "../context/ThemeContext";

// ====== Small UI components ======

const StatItem = React.memo(({ label, value, color, themeColors, isHours = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      background: themeColors.cardBgSecondary,
      borderRadius: "8px",
      border: `1px solid ${themeColors.border}`,
      transition: "all 0.2s ease",
    }}
  >
    <span
      style={{
        fontSize: "14px",
        color: themeColors.textSecondary,
        fontWeight: "500",
      }}
    >
      {label}:
    </span>
    <strong
      style={{
        fontSize: "16px",
        color,
        fontWeight: "700",
      }}
    >
      {isHours ? `${value}h` : value?.toLocaleString() || "0"}
    </strong>
  </div>
));

const MetricCard = React.memo(({ stat, themeColors, isDarkMode }) => (
  <div
    style={{
      background: themeColors.cardBg,
      borderRadius: "16px",
      padding: "24px",
      boxShadow: isDarkMode
        ? "0 4px 6px rgba(0, 0, 0, 0.1)"
        : "0 2px 8px rgba(0, 0, 0, 0.06)",
      border: `1px solid ${themeColors.borderLight}`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${stat.color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        {stat.icon}
      </div>
      <span
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: stat.color,
          background: `${stat.color}15`,
          padding: "4px 8px",
          borderRadius: "12px",
        }}
      >
        {stat.trend}
      </span>
    </div>

    <div
      style={{
        fontSize: "32px",
        fontWeight: "800",
        color: stat.color,
        marginBottom: "4px",
        lineHeight: 1,
      }}
    >
      {stat.value?.toLocaleString() || "0"}
    </div>

    <div
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: themeColors.textPrimary,
        marginBottom: "4px",
      }}
    >
      {stat.label}
    </div>

    <div
      style={{
        fontSize: "12px",
        color: themeColors.textSecondary,
      }}
    >
      {stat.description}
    </div>
  </div>
));

const GoodMorningCard = React.memo(({ admin, themeColors, getGreeting, punchError, successMessage }) => (
  <div
    style={{
      background: themeColors.cardBg,
      borderRadius: "16px",
      padding: "24px",
      border: `1px solid ${themeColors.border}`,
      boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
      animation: "fadeIn 0.3s ease",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.accent}20)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            border: `2px solid ${themeColors.primary}30`,
          }}
        >
          👋
        </div>
        <div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: themeColors.textPrimary,
              margin: "0 0 4px 0",
            }}
          >
            {getGreeting()}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: themeColors.textSecondary,
              margin: 0,
            }}
          >
            Welcome back, {admin?.fullName || admin?.firstName || admin?.email}!
          </p>
        </div>
      </div>

      <div
        style={{
          background: themeColors.cardBgSecondary,
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: themeColors.textSecondary,
            margin: "0 0 8px 0",
            fontWeight: "500",
          }}
        >
          Today's Focus
        </p>
        <p
          style={{
            fontSize: "15px",
            color: themeColors.textPrimary,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          "Success is not final, failure is not fatal: it is the courage to continue that counts."
        </p>
      </div>

      {punchError && (
        <div
          style={{
            background: `${themeColors.error}15`,
            border: `1px solid ${themeColors.error}`,
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            animation: "slideIn 0.3s ease",
          }}
        >
          <p
            style={{
              color: themeColors.error,
              margin: 0,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚠️ {punchError}
          </p>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            background: `${themeColors.success}15`,
            border: `1px solid ${themeColors.success}`,
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            animation: "slideIn 0.3s ease",
          }}
        >
          <p
            style={{
              color: themeColors.success,
              margin: 0,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ✅ {successMessage}
          </p>
        </div>
      )}
    </div>

    <DayTimeWidget isDarkMode={themeColors.isDarkMode} />
  </div>
));

// ====== Main Dashboard Page ======

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  // UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [leaveOverview, setLeaveOverview] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Punch states
  const [myAttendance, setMyAttendance] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchError, setPunchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Month/Year
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const handleMenuToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const themeColors = useMemo(
    () => ({
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
      isDarkMode,
    }),
    [isDarkMode]
  );

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  const getMonthYearLabel = useCallback(() => {
    return new Date(selectedYear, selectedMonth).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth, selectedYear]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  async function getAddressFromCoords(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "User-Agent": "MyApp" } }
      );

      const data = await res.json();

      // Nominatim success
      if (data?.display_name) return data.display_name;

    } catch (e) {
      console.warn("Nominatim failed:", e);
    }

    // Google Maps fallback (no API key needed)
    return `https://maps.google.com/?q=${lat},${lon}`;
  }


  const getLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          latitude: null,
          longitude: null,
          address: "Unable to access GPS",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Convert to proper address
          const address = await getAddressFromCoords(latitude, longitude);

          resolve({
            latitude,
            longitude,
            address,
            deviceInfo: JSON.stringify({
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              timestamp: new Date().toISOString(),
            }),
          });
        },

        // ----------- FALLBACK region ------------
        async (error) => {
          console.error("Geolocation error:", error);

          try {
            const res = await fetch("https://ipapi.co/json/");
            const ip = await res.json();

            if (ip?.latitude && ip?.longitude) {
              resolve({
                latitude: ip.latitude,
                longitude: ip.longitude,
                address: `${ip.city}, ${ip.region}, ${ip.country_name}`,
              });
              return;
            }
          } catch (e) {
            console.warn("IP fallback failed:", e);
          }

          resolve({
            latitude: null,
            longitude: null,
            address: "Unable to fetch location",
          });
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);



  const fetchMyAttendance = useCallback(async () => {

    try {
      const result = await AttendanceApi.getMyTodayAttendance();

      if (result.success) {
        setMyAttendance(result.data);
      } else {
        console.warn("[fetchMyAttendance] ⚠️ API returned success=false", result);
        setMyAttendance(null);
      }
    } catch (err) {
      console.error("[fetchMyAttendance] ❌ Error fetching today's attendance:", err);
      setMyAttendance(null);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!admin) return;

    setDataLoading(true);
    setError("");

    try {
      const statsRes = await DashboardApi.getDashboardStats();
      setDashboardStats(statsRes.data?.stats || null);

      await fetchMyAttendance();

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
  }, [admin, selectedMonth, selectedYear, fetchMyAttendance]);

  const handlePunchIn = useCallback(async () => {
    setPunchLoading(true);
    setPunchError("");
    setSuccessMessage("");

    try {
      const location = await getLocation();

      if (!location.latitude || !location.longitude) {
        setPunchError(
          "Location permission denied. Please enable location services."
        );
        setPunchLoading(false);
        return;
      }

      const result = await AttendanceApi.checkIn(location);

      if (result.success) {
        setSuccessMessage(result.message || "Successfully punched in!");
        await fetchMyAttendance();
        await fetchDashboardData();
      } else {
        setPunchError(result.message || "Failed to punch in");
      }
    } catch (err) {
      console.error("Punch in error:", err);
      setPunchError(err.message || "Failed to punch in. Please try again.");
    } finally {
      setPunchLoading(false);
    }
  }, [getLocation, fetchMyAttendance, fetchDashboardData]);

  const handlePunchOut = useCallback(async () => {
    setPunchLoading(true);
    setPunchError("");
    setSuccessMessage("");

    try {
      const location = await getLocation();
      const result = await AttendanceApi.checkOut(location);

      if (result.success) {
        setSuccessMessage(result.message || "Successfully punched out!");
        await fetchMyAttendance();
        await fetchDashboardData();
      } else {
        setPunchError(result.message || "Failed to punch out");
      }
    } catch (err) {
      console.error("Punch out error:", err);
      setPunchError(err.message || "Failed to punch out. Please try again.");
    } finally {
      setPunchLoading(false);
    }
  }, [getLocation, fetchMyAttendance, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const metrics = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      {
        label: "Total Employees",
        value: dashboardStats.totalEmployees,
        icon: "👥",
        color: themeColors.primary,
        trend: "+12%",
        description: "Registered workforce",
      },
      {
        label: "Present Today",
        value: dashboardStats.presentToday,
        icon: "✅",
        color: themeColors.success,
        trend: "+5%",
        description: "Active attendance",
      },
      {
        label: "Absent Today",
        value: dashboardStats.absentToday,
        icon: "❌",
        color: themeColors.error,
        trend: "-2%",
        description: "Missing today",
      },
      {
        label: "Pending Leaves",
        value: dashboardStats.pendingLeaves,
        icon: "⏳",
        color: themeColors.warning,
        trend: "+8%",
        description: "Awaiting approval",
      },
    ];
  }, [dashboardStats, themeColors]);

  // Enable/disable punch buttons based on today's attendance flags
  const canPunchIn = useMemo(() => {
    if (!myAttendance) return true;
    return !myAttendance.isCheckedIn;
  }, [myAttendance]);

  const canPunchOut = useMemo(() => {
    if (!myAttendance) return false;
    return myAttendance.isCheckedIn && !myAttendance.isCheckedOut;
  }, [myAttendance]);

  // Auth loading
  if (adminLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: themeColors.background,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: `3px solid ${themeColors.border}`,
              borderTop: `3px solid ${themeColors.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p
            style={{
              color: themeColors.textSecondary,
              fontSize: "16px",
            }}
          >
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!adminLoading && !admin) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: themeColors.background,
          color: themeColors.textPrimary,
        }}
      >
        <div
          style={{
            background: themeColors.cardBg,
            padding: "48px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "16px",
              opacity: 0.7,
            }}
          >
            🔒
          </div>
          <h2
            style={{
              marginBottom: "12px",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              color: themeColors.textSecondary,
              fontSize: "16px",
            }}
          >
            You are not authorized to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: themeColors.background,
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s ease",
          background: themeColors.background,
        }}
      >
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
            paddingTop: "88px",
            background: themeColors.background,
          }}
        >
          {/* Page Title */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                color: themeColors.textPrimary,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              📊 Dashboard
            </h1>
            <p
              style={{
                fontSize: "16px",
                margin: "0 0 16px 0",
                color: themeColors.textSecondary,
              }}
            >
              Welcome to your dashboard. Here&apos;s your overview for today.
            </p>
          </div>

          {/* Two-column layout for Good Morning and Today's Attendance cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Good Morning Card */}
            <div
              style={{
                background: themeColors.cardBg,
                borderRadius: "16px",
                padding: "24px",
                border: `1px solid ${themeColors.border}`,
                boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                animation: "fadeIn 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.accent}20)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      border: `2px solid ${themeColors.primary}30`,
                    }}
                  >
                    👋
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: themeColors.textPrimary,
                        margin: "0 0 4px 0",
                      }}
                    >
                      {getGreeting()}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: themeColors.textSecondary,
                        margin: 0,
                      }}
                    >
                      Welcome back, {admin?.fullName || admin?.firstName || admin?.email}!
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: themeColors.cardBgSecondary,
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: themeColors.textSecondary,
                      margin: "0 0 8px 0",
                      fontWeight: "500",
                    }}
                  >
                    Today's Focus
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      color: themeColors.textPrimary,
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    "Success is not final, failure is not fatal: it is the courage to continue that counts."
                  </p>
                </div>

                {punchError && (
                  <div
                    style={{
                      background: `${themeColors.error}15`,
                      border: `1px solid ${themeColors.error}`,
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "16px",
                      animation: "slideIn 0.3s ease",
                    }}
                  >
                    <p
                      style={{
                        color: themeColors.error,
                        margin: 0,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      ⚠️ {punchError}
                    </p>
                  </div>
                )}

                {successMessage && (
                  <div
                    style={{
                      background: `${themeColors.success}15`,
                      border: `1px solid ${themeColors.success}`,
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "16px",
                      animation: "slideIn 0.3s ease",
                    }}
                  >
                    <p
                      style={{
                        color: themeColors.success,
                        margin: 0,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      ✅ {successMessage}
                    </p>
                  </div>
                )}
              </div>

              <DayTimeWidget isDarkMode={themeColors.isDarkMode} />
            </div>

            {/* Today's Attendance Card */}
            <TodayAttendanceCard
              attendance={myAttendance}
              themeColors={themeColors}
              onPunchIn={handlePunchIn}
              onPunchOut={handlePunchOut}
              canPunchIn={canPunchIn}
              canPunchOut={canPunchOut}
              punchLoading={punchLoading}
            />
          </div>

          {/* Loading */}
          {dataLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                background: themeColors.cardBg,
                borderRadius: "16px",
                border: `1px solid ${themeColors.border}`,
                marginBottom: "24px",
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
                <p
                  style={{
                    color: themeColors.textSecondary,
                    fontSize: "14px",
                    margin: 0,
                  }}
                >
                  Loading dashboard data...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !dataLoading && (
            <div
              style={{
                background: themeColors.cardBg,
                border: `2px solid ${themeColors.error}`,
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "24px" }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong
                  style={{
                    color: themeColors.error,
                    fontSize: "14px",
                  }}
                >
                  Error:
                </strong>
                <p
                  style={{
                    color: themeColors.textSecondary,
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Main dashboard content */}
          {!dataLoading && dashboardStats && (
            <div>
              {/* Key metrics */}
              <div style={{ marginBottom: "32px" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: themeColors.textPrimary,
                  }}
                >
                  Key Metrics
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {metrics.map((stat, idx) => (
                    <MetricCard
                      key={idx}
                      stat={stat}
                      themeColors={themeColors}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>

              {/* HR / Manager / Superadmin */}
              {["hr", "manager", "superadmin"].includes(admin?.role) && (
                <div>
                  {/* Month / Year picker */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "500",
                        color: themeColors.textPrimary,
                        fontSize: "14px",
                      }}
                    >
                      📅 View Attendance for:
                    </span>

                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(Number(e.target.value))
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${themeColors.border}`,
                        background: themeColors.cardBg,
                        color: themeColors.textPrimary,
                        minWidth: "120px",
                        fontSize: "14px",
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(0, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(Number(e.target.value))
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${themeColors.border}`,
                        background: themeColors.cardBg,
                        color: themeColors.textPrimary,
                        fontSize: "14px",
                      }}
                    >
                      {Array.from(
                        { length: 6 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attendance & Leave overview */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {attendanceOverview && (
                      <div
                        style={{
                          background: themeColors.cardBg,
                          padding: "20px",
                          borderRadius: "12px",
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                            color: themeColors.textPrimary,
                          }}
                        >
                          📊 Attendance – {getMonthYearLabel()}
                        </h3>
                        <div
                          style={{
                            display: "grid",
                            gap: "12px",
                          }}
                        >
                          <StatItem
                            label="Present"
                            value={attendanceOverview.present}
                            color={themeColors.success}
                            themeColors={themeColors}
                          />
                          <StatItem
                            label="Absent"
                            value={attendanceOverview.absent}
                            color={themeColors.error}
                            themeColors={themeColors}
                          />
                          <StatItem
                            label="Half Days"
                            value={attendanceOverview.halfDay}
                            color={themeColors.warning}
                            themeColors={themeColors}
                          />
                          <StatItem
                            label="On Leave"
                            value={attendanceOverview.onLeave}
                            color={themeColors.primary}
                            themeColors={themeColors}
                          />
                        </div>
                      </div>
                    )}

                    {leaveOverview && (
                      <div
                        style={{
                          background: themeColors.cardBg,
                          padding: "20px",
                          borderRadius: "12px",
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                            color: themeColors.textPrimary,
                          }}
                        >
                          🏖️ Leave Overview
                        </h3>
                        <div
                          style={{
                            display: "grid",
                            gap: "12px",
                          }}
                        >
                          <StatItem
                            label="Pending"
                            value={leaveOverview.pending}
                            color={themeColors.warning}
                            themeColors={themeColors}
                          />
                          <StatItem
                            label="Approved"
                            value={leaveOverview.approved}
                            color={themeColors.success}
                            themeColors={themeColors}
                          />
                          <StatItem
                            label="Rejected"
                            value={leaveOverview.rejected}
                            color={themeColors.error}
                            themeColors={themeColors}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default React.memo(DashboardPage);