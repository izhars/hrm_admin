import React, { useEffect, useState, useContext } from 'react';
import celebrationApi from "../api/CelebrationApi";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Celebration() {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { admin, loading: adminLoading } = useContext(AdminContext) || {};

    // UI states
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('today'); // 'today', 'upcoming'
    const [viewType, setViewType] = useState('grid'); // 'grid', 'list'

    // Data states
    const [upcoming, setUpcoming] = useState([]);
    const [today, setToday] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        purple: isDarkMode ? "#a78bfa" : "#8b5cf6",
        danger: isDarkMode ? "#ef4444" : "#dc2626",
    };

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    // Load celebrations data
    useEffect(() => {
        if (!admin) return;

        const loadData = async () => {
            try {
                setLoading(true);
                const [upcomingRes, todayRes] = await Promise.all([
                    celebrationApi.getAllUpcoming(),
                    celebrationApi.getAllToday(),
                ]);

                // Process today's data
                const todayData = todayRes?.data?.data?.today;
                if (todayData) {
                    const mergedToday = [
                        ...(todayData.birthdays?.data || []).map(item => ({
                            ...item,
                            type: 'birthday',
                            celebrationDate: item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : null
                        })),
                        ...(todayData.marriageAnniversaries?.data || []).map(item => ({
                            ...item,
                            type: 'marriage',
                            celebrationDate: item.marriageDate ? new Date(item.marriageDate).toLocaleDateString() : null
                        })),
                        ...(todayData.workAnniversaries?.data || []).map(item => ({
                            ...item,
                            type: 'work',
                            celebrationDate: item.dateOfJoining ? new Date(item.dateOfJoining).toLocaleDateString() : null
                        })),
                    ];
                    setToday(mergedToday);
                }

                // Process upcoming data
                const upcomingData = upcomingRes?.data?.data?.upcoming;
                if (upcomingData) {
                    const mergedUpcoming = [
                        ...(upcomingData.birthdays || []).map(item => ({
                            ...item,
                            type: 'birthday',
                            celebrationDate: item.dateField ? new Date(item.dateField).toLocaleDateString() : null
                        })),
                        ...(upcomingData.marriageAnniversaries || []).map(item => ({
                            ...item,
                            type: 'marriage',
                            celebrationDate: item.dateField ? new Date(item.dateField).toLocaleDateString() : null
                        })),
                        ...(upcomingData.workAnniversaries || []).map(item => ({
                            ...item,
                            type: 'work',
                            celebrationDate: item.dateField ? new Date(item.dateField).toLocaleDateString() : null
                        })),
                    ];
                    setUpcoming(mergedUpcoming);
                }

            } catch (err) {
                setError(err.message || "Failed to load celebrations");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [admin]);

    const handleMenuToggle = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const getCurrentData = () => {
        switch (activeTab) {
            case 'today':
                return today;
            case 'upcoming':
                return upcoming;
            default:
                return [];
        }
    };

    const getTabStats = () => ({
        today: today.length,
        upcoming: upcoming.length,
    });

    // Loading states
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

    // Styles
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
        pageContainer: {
            maxWidth: '1400px',
            margin: '0 auto',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: themeColors.textPrimary,
            margin: '0 0 0.5rem 0',
            background: isDarkMode
                ? 'linear-gradient(45deg, #fff, #e0e7ff)'
                : 'linear-gradient(45deg, #1e293b, #374151)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
        },
        subtitle: {
            fontSize: '1rem',
            color: themeColors.textSecondary,
            margin: 0,
        },
        statsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
        },
        section: {
            marginBottom: '3rem',
        },
        grid: {
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: activeTab === 'today' ? 'repeat(auto-fill, minmax(450px, 1fr))' : 'repeat(auto-fill, minmax(380px, 1fr))',
        },
    };

    const StatsChip = ({ count, label, color, active = false, onClick }) => (
        <div
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: active ? color : `${color}20`,
                color: active ? 'white' : color,
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: `1px solid ${color}40`,
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: `0 2px 8px ${color}20`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.backgroundColor = `${color}30`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.backgroundColor = `${color}20`;
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            <div
                style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: active ? 'white' : color,
                }}
            />
            {label}: {count}
        </div>
    );

    const TabNavigation = () => {
        const tabs = [
            { id: 'today', label: "Today's Celebrations", color: themeColors.success, icon: '🎉' },
            { id: 'upcoming', label: 'Upcoming', color: themeColors.purple, icon: '📅' },
        ];

        return (
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                padding: '0.5rem',
                backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                borderRadius: '12px',
                border: `1px solid ${themeColors.border}`,
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: activeTab === tab.id ? tab.color : 'transparent',
                            color: activeTab === tab.id ? 'white' : themeColors.textSecondary,
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.backgroundColor = `${tab.color}15`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                        {tab.label}
                        <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : `${tab.color}20`,
                            fontSize: '0.75rem',
                            fontWeight: '700',
                        }}>
                            {getTabStats()[tab.id]}
                        </span>
                    </button>
                ))}
            </div>
        );
    };

    const CelebrationCard = ({ person, type, isToday = false, daysUntil }) => {
        const icons = {
            birthday: "🎂",
            marriage: "💍",
            work: "💼",
            anniversary: "🎉",
        };

        const typeLabels = {
            birthday: "Birthday",
            marriage: "Marriage Anniversary",
            work: "Work Anniversary",
            anniversary: "Anniversary",
        };

        const accentColor = isToday ? themeColors.success : themeColors.purple;
        const bgColor = isToday ? `${themeColors.success}10` : themeColors.cardBg;

        // Special larger dimensions for Today's cards
        const cardPadding = isToday ? '2rem' : '1.5rem';
        const nameSize = isToday ? '1.375rem' : '1.125rem';
        const avatarSize = isToday ? '4rem' : '3.5rem';
        const iconSize = isToday ? '2rem' : '1.75rem';

        return (
            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: isToday ? '24px' : '20px',
                    border: `1px solid ${themeColors.border}`,
                    padding: cardPadding,
                    backgroundColor: bgColor,
                    boxShadow: `0 8px 32px ${themeColors.border}20`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    ...(isToday && {
                        borderWidth: '2px',
                        borderColor: `${accentColor}40`,
                    })
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 40px ${accentColor}20`;
                    e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 32px ${themeColors.border}20`;
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: isToday ? '6px' : '4px',
                        background: `linear-gradient(180deg, ${accentColor}, ${accentColor}80)`,
                    }}
                />

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            width: avatarSize,
                            height: avatarSize,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.purple})`,
                            color: 'white',
                            fontWeight: '700',
                            boxShadow: `0 8px 20px ${themeColors.accent}30`,
                            fontSize: '1.25rem',
                        }}>
                            <span>
                                {person.firstName?.[0]}{person.lastName?.[0]}
                            </span>
                            <span style={{
                                position: 'absolute',
                                bottom: '-0.25rem',
                                right: '-0.25rem',
                                width: iconSize,
                                height: iconSize,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                fontSize: isToday ? '1.25rem' : '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                border: '3px solid white',
                            }}>
                                {icons[type] || "🎉"}
                            </span>
                        </div>

                        <div>
                            <h3 style={{
                                fontSize: nameSize,
                                fontWeight: '700',
                                color: themeColors.textPrimary,
                                margin: '0 0 0.25rem 0'
                            }}>
                                {person.firstName} {person.lastName}
                            </h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: themeColors.textSecondary,
                                margin: '0 0 0.5rem 0'
                            }}>
                                {person.designation || "Employee"} •{' '}
                                <span style={{ fontWeight: '600', color: themeColors.accent }}>
                                    {/* {person.department?.name || "No department"} */}
                                </span>
                            </p>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginTop: isToday ? '1rem' : '0.75rem',
                                fontSize: '0.875rem'
                            }}>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: isToday ? '0.625rem 1.25rem' : '0.5rem 1rem',
                                        borderRadius: '9999px',
                                        fontWeight: '600',
                                        backgroundColor: `${accentColor}15`,
                                        color: accentColor,
                                        border: `1px solid ${accentColor}30`,
                                        fontSize: isToday ? '1rem' : '0.875rem',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: isToday ? '0.625rem' : '0.5rem',
                                            height: isToday ? '0.625rem' : '0.5rem',
                                            borderRadius: '50%',
                                            backgroundColor: accentColor,
                                        }}
                                    />
                                    {typeLabels[type] || "Celebration"}
                                    {isToday && " • Today"}
                                </span>

                                {person.celebrationDate && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        color: themeColors.textSecondary,
                                        fontSize: isToday ? '1rem' : '0.875rem',
                                    }}>
                                        📅 {person.celebrationDate}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isToday && daysUntil !== undefined && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                background: `linear-gradient(45deg, ${themeColors.purple}, ${themeColors.accent})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                            }}>
                                {daysUntil}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: themeColors.textSecondary,
                                fontWeight: '600'
                            }}>
                                days left
                            </div>
                        </div>
                    )}

                    {isToday && (
                        <>
                            <style>{`
                                @keyframes softFloat {
                                    0% { transform: translateY(0) rotate(0); opacity: 0.8; }
                                    50% { transform: translateY(-25px) rotate(180deg); opacity: 1; }
                                    100% { transform: translateY(0) rotate(360deg); opacity: 0.8; }
                                }

                                @keyframes sparklePulse {
                                    0%, 100% { transform: scale(1); opacity: 0.4; }
                                    50% { transform: scale(1.5); opacity: 1; }
                                }

                                @keyframes gradientSweep {
                                    0% { background-position: 0% 50%; }
                                    100% { background-position: 200% 50%; }
                                }

                                @keyframes glowPulse {
                                    0%, 100% {
                                        box-shadow: 0 0 20px ${themeColors.accent}40,
                                                    0 0 40px ${themeColors.purple}30;
                                    }
                                    50% {
                                        box-shadow: 0 0 40px ${themeColors.accent}70,
                                                    0 0 60px ${themeColors.purple}60;
                                    }
                                }

                                @keyframes bounce {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-15px); }
                                }
                            `}</style>

                            {/* Enhanced confetti */}
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        width: "12px",
                                        height: "12px",
                                        borderRadius: Math.random() > 0.5 ? "50%" : "3px",
                                        background: [
                                            "#FF6B6B77",
                                            "#4ECDC477",
                                            "#FFE66D77",
                                            "#A8E6CF77",
                                            "#B57BFF77"
                                        ][i % 5],
                                        filter: "blur(1px)",
                                        animation: `softFloat ${3 + Math.random() * 2}s ease-in-out infinite`,
                                        zIndex: 0,
                                    }}
                                />
                            ))}

                            {/* Larger sparkles */}
                            {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos, i) => (
                                <div
                                    key={pos}
                                    style={{
                                        position: "absolute",
                                        ...(pos.includes("top") ? { top: `${1 + i * 0.5}rem` } : { bottom: `${1 + i * 0.5}rem` }),
                                        ...(pos.includes("left") ? { left: `${1 + i * 0.5}rem` } : { right: `${1 + i * 0.5}rem` }),
                                        fontSize: "2rem",
                                        animation: `sparklePulse ${1.5 + i * 0.5}s ease-in-out infinite`,
                                        color: themeColors.accent,
                                        filter: "drop-shadow(0 0 12px rgba(255,255,255,0.8))",
                                        zIndex: 1,
                                    }}
                                >
                                    ✨
                                </div>
                            ))}

                            {/* Larger gradient sweep banner */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "6px",
                                    background: `linear-gradient(90deg,
                                        ${themeColors.accent},
                                        ${themeColors.purple},
                                        ${themeColors.success},
                                        ${themeColors.accent}
                                    )`,
                                    backgroundSize: "250% 100%",
                                    animation: "gradientSweep 3s linear infinite",
                                    filter: "blur(1px)",
                                }}
                            />

                            {/* Stronger glow aura */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: '-25px',
                                    background: `radial-gradient(circle at center,
                                        ${themeColors.success}30 0%,
                                        ${themeColors.purple}20 30%,
                                        transparent 70%
                                    )`,
                                    animation: "glowPulse 3s ease-in-out infinite",
                                    pointerEvents: "none",
                                    zIndex: 0,
                                }}
                            />

                            {/* Celebration text */}
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                right: "1.5rem",
                                transform: "translateY(-50%)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                zIndex: 2,
                            }}>
                                <div style={{
                                    fontSize: "3.5rem",
                                    fontWeight: "900",
                                    background: `linear-gradient(45deg, ${themeColors.success}, ${themeColors.purple})`,
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    color: "transparent",
                                    animation: "bounce 2s ease-in-out infinite",
                                }}>
                                    🎊
                                </div>
                                <div style={{
                                    fontSize: "0.875rem",
                                    fontWeight: "700",
                                    color: themeColors.success,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    marginTop: "0.5rem",
                                }}>
                                    CELEBRATE!
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const LoadingSpinner = () => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6rem 2rem',
            gap: '1rem',
            color: themeColors.textSecondary,
            fontWeight: '600',
            fontSize: '1rem'
        }}>
            <div style={{
                width: '1rem',
                height: '1rem',
                borderRadius: '50%',
                border: `3px solid ${themeColors.border}`,
                borderTopColor: themeColors.success,
                animation: 'spin 1s linear infinite',
            }} />
            Loading celebrations...
        </div>
    );

    const ErrorMessage = ({ error }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6rem 2rem',
        }}>
            <div style={{
                backgroundColor: isDarkMode ? '#451a03' : '#fef2f2',
                padding: '2rem',
                borderRadius: '20px',
                border: `1px solid ${isDarkMode ? '#7c2d12' : '#fecaca'}`,
                color: themeColors.textPrimary,
                boxShadow: `0 8px 32px ${themeColors.border}40`,
                maxWidth: '400px',
                textAlign: 'center',
            }}>
                <p style={{ fontWeight: '700', margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>
                    Something went wrong
                </p>
                <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>{error}</p>
            </div>
        </div>
    );

    const EmptyState = ({ icon, title, message }) => (
        <div
            style={{
                borderRadius: '20px',
                border: `2px dashed ${themeColors.border}`,
                backgroundColor: themeColors.cardBg,
                padding: '3rem 2rem',
                textAlign: 'center',
                color: themeColors.textSecondary,
                boxShadow: `0 4px 12px ${themeColors.border}20`,
            }}
        >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
            <p style={{
                fontWeight: '700',
                color: themeColors.textPrimary,
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem'
            }}>
                {title}
            </p>
            <p style={{ fontSize: '1rem', margin: 0 }}>{message}</p>
        </div>
    );

    const renderContent = () => {
        const data = getCurrentData();

        if (loading) return <LoadingSpinner />;
        if (error) return <ErrorMessage error={error} />;

        if (data.length === 0) {
            const emptyStates = {
                today: { icon: '🌤️', title: 'No celebrations today', message: 'Check the upcoming list to see what\'s around the corner.' },
                upcoming: { icon: '📆', title: 'No upcoming celebrations', message: 'Once new events are added, they will appear here.' },
            };

            const emptyState = emptyStates[activeTab];
            return <EmptyState {...emptyState} />;
        }

        return (
            <div style={styles.grid}>
                {data.map((item) => (
                    <CelebrationCard
                        key={item._id}
                        person={item}
                        type={item.type}
                        isToday={activeTab === 'today'}
                        daysUntil={item.daysUntil}
                    />
                ))}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={handleMenuToggle}
                isDarkMode={isDarkMode}
            />

            <div style={styles.mainContent}>
                <Navbar
                    onMenuClick={handleMenuToggle}
                    isCollapsed={sidebarCollapsed}
                    isDarkMode={isDarkMode}
                    admin={admin}
                />

                <main style={styles.content}>
                    <div style={styles.pageContainer}>
                        <header style={styles.header}>
                            <div>
                                <h1 style={styles.title}>🎉 Team Celebrations</h1>
                                <p style={styles.subtitle}>
                                    Celebrate your teammates' birthdays and milestones together.
                                </p>
                            </div>
                            <div style={styles.statsContainer}>
                                <StatsChip
                                    count={today.length}
                                    label="Today"
                                    color={themeColors.success}
                                    active={activeTab === 'today'}
                                    onClick={() => setActiveTab('today')}
                                />
                                <StatsChip
                                    count={upcoming.length}
                                    label="Upcoming"
                                    color={themeColors.purple}
                                    active={activeTab === 'upcoming'}
                                    onClick={() => setActiveTab('upcoming')}
                                />
                            </div>
                        </header>

                        <TabNavigation />

                        <div style={styles.section}>
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                button {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                button:hover {
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}