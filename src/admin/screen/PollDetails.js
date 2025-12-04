import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import PollApi from "../api/PollApi";

const PollDetails = () => {
    const { pollId } = useParams();
    const { admin, loading: adminLoading } = useContext(AdminContext);

    // Data states
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add these states to your existing states in PollDetails component
    const [isClosing, setIsClosing] = useState(false);
    const [closeError, setCloseError] = useState('');


    // UI states
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const fetchPoll = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await PollApi.getById(pollId);

            const pollData = res.data?.poll || res.polls?.[0];

            // Generate chart data for visualization
            const chartData = pollData.options.map((option, index) => {
                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                const votes = option.votes || 0;
                const totalVotes = pollData.totalVotes || 0;
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100 * 10) / 10 : 0;

                return {
                    label: option.text,
                    value: votes,
                    percent: percentage,
                    color: colors[index % colors.length]
                };
            });

            setPoll({ ...pollData, chartData });
        } catch (err) {
            console.error("🔴 Error fetching poll:", err.message || err);
            setError(err.message || 'Failed to fetch poll details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pollId) fetchPoll();
    }, [pollId]);

    const handleMenuToggle = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const handleThemeToggle = () => {
        setIsDarkMode(prev => !prev);
    };

    const handleClosePoll = async () => {
        if (!window.confirm('Are you sure you want to close this poll? This action cannot be undone.')) {
            return;
        }

        setIsClosing(true);
        setCloseError('');

        try {
            // Refresh the poll data to show updated status
            await fetchPoll();

        } catch (err) {
            console.error("🔴 Error closing poll:", err.message || err);
            setCloseError(err.message || 'Failed to close poll');
        } finally {
            setIsClosing(false);
        }
    };


    // Loading state
    if (adminLoading || loading) {
        return (
            <div style={{
                padding: '50px',
                textAlign: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ fontSize: '18px', color: '#64748b' }}>
                    Loading poll details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '50px',
                textAlign: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                    ❌ Error: {error}
                </div>
            </div>
        );
    }

    if (!poll) {
        return (
            <div style={{
                padding: '50px',
                textAlign: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ fontSize: '18px', color: '#64748b' }}>
                    Poll not found
                </div>
            </div>
        );
    }

    // Theme configuration
    const themeColors = {
        background: isDarkMode ? "#0f172a" : "#f8f9fa",
        cardBg: isDarkMode ? "#1e293b" : "white",
        textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
        textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
        border: isDarkMode ? "#334155" : "#e2e8f0",
        accent: isDarkMode ? "#3b82f6" : "#2563eb",
        success: isDarkMode ? "#10b981" : "#16a34a",
        danger: isDarkMode ? "#ef4444" : "#dc2626",
    };

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";
    const totalVotes = poll.totalVotes || 0;

    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: themeColors.background
            }}
        >
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={handleMenuToggle}
                isDarkMode={isDarkMode}
            />

            {/* Main content area */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    marginLeft: sidebarWidth,
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: themeColors.background
                }}
            >
                {/* Navbar */}
                <Navbar
                    onMenuClick={handleMenuToggle}
                    isCollapsed={sidebarCollapsed}
                    isDarkMode={isDarkMode}
                    onThemeToggle={handleThemeToggle}
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
                    {/* Poll Header */}
                    {/* Poll Header */}
                    <div style={{
                        background: themeColors.cardBg,
                        padding: '24px',
                        borderRadius: '12px',
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}>
                            <div>
                                <h1 style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: themeColors.textPrimary,
                                    marginBottom: '8px',
                                    margin: 0
                                }}>
                                    {poll.question}
                                </h1>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '12px'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        background: themeColors.accent,
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {poll.allowMultiple ? 'Multiple Choice' : 'Single Choice'}
                                    </span>
                                    <span style={{
                                        display: 'inline-block',
                                        background: poll.isAnonymous ? '#f59e0b' : '#10b981',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {poll.isAnonymous ? 'Anonymous' : 'Public'}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexDirection: 'column'
                            }}>
                                {/* Poll Status */}
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    backgroundColor: !poll.isClosed ? '#dcfce7' : '#fee2e2',
                                    color: !poll.isClosed ? themeColors.success : themeColors.danger
                                }}>
                                    {!poll.isClosed ? '✅ Active' : '❌ Closed'}
                                </span>

                                {/* Close Poll Button - Only show if poll is active */}
                                {!poll.isClosed && (
                                    <button
                                        onClick={handleClosePoll}
                                        disabled={isClosing}
                                        style={{
                                            background: isClosing ? '#94a3b8' : themeColors.danger,
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: isClosing ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'background 0.2s ease'
                                        }}
                                    >
                                        {isClosing ? (
                                            <>
                                                <span style={{ fontSize: '12px' }}>⏳</span>
                                                Closing...
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '12px' }}>🔒</span>
                                                Close Poll
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Error Message */}
                                {closeError && (
                                    <div style={{
                                        background: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        color: '#dc2626',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        textAlign: 'center'
                                    }}>
                                        {closeError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Poll Statistics Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        {/* Poll Statistics Card */}
                        <div style={{
                            background: themeColors.cardBg,
                            padding: '24px',
                            borderRadius: '12px',
                            border: `1px solid ${themeColors.border}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    background: '#dbeafe',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    marginRight: '12px'
                                }}>
                                    <span style={{ fontSize: '20px' }}>📊</span>
                                </div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: themeColors.textPrimary,
                                    margin: 0
                                }}>
                                    Poll Statistics
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: themeColors.background,
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: themeColors.textSecondary }}>Total Votes:</span>
                                    <strong style={{
                                        fontSize: '24px',
                                        color: themeColors.accent,
                                        fontWeight: '700'
                                    }}>
                                        {totalVotes}
                                    </strong>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: themeColors.background,
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: themeColors.textSecondary }}>Options:</span>
                                    <strong style={{ color: themeColors.textPrimary }}>
                                        {poll.options?.length || 0}
                                    </strong>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: themeColors.background,
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: themeColors.textSecondary }}>Your Vote:</span>
                                    <strong style={{
                                        color: poll.hasVoted ? themeColors.success : themeColors.textSecondary
                                    }}>
                                        {poll.hasVoted ? 'Voted ✅' : 'Not Voted ❌'}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Poll Timeline Card */}
                        <div style={{
                            background: themeColors.cardBg,
                            padding: '24px',
                            borderRadius: '12px',
                            border: `1px solid ${themeColors.border}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    background: '#fef3c7',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    marginRight: '12px'
                                }}>
                                    <span style={{ fontSize: '20px' }}>📅</span>
                                </div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: themeColors.textPrimary,
                                    margin: 0
                                }}>
                                    Timeline
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <strong style={{ color: themeColors.textPrimary }}>Created:</strong>
                                    <p style={{
                                        color: themeColors.textSecondary,
                                        margin: '4px 0 0 0',
                                        fontSize: '14px'
                                    }}>
                                        {new Date(poll.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <strong style={{ color: themeColors.textPrimary }}>Expires:</strong>
                                    <p style={{
                                        color: themeColors.textSecondary,
                                        margin: '4px 0 0 0',
                                        fontSize: '14px'
                                    }}>
                                        {new Date(poll.expiresAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Poll Results Section */}
                    <div style={{
                        background: themeColors.cardBg,
                        padding: '24px',
                        borderRadius: '12px',
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                background: '#dcfce7',
                                padding: '8px',
                                borderRadius: '8px',
                                marginRight: '12px'
                            }}>
                                <span style={{ fontSize: '20px' }}>📊</span>
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: themeColors.textPrimary,
                                margin: 0
                            }}>
                                Poll Results
                            </h3>
                        </div>

                        {totalVotes === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: themeColors.textSecondary
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗳️</div>
                                <p style={{ fontSize: '16px', margin: 0 }}>No votes yet. Be the first to vote!</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                {poll.chartData?.map((option, i) => (
                                    <div key={i} style={{
                                        background: themeColors.background,
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: `1px solid ${themeColors.border}`
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                color: themeColors.textPrimary
                                            }}>
                                                {option.label}
                                            </span>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: themeColors.textSecondary
                                                }}>
                                                    {option.value} votes
                                                </span>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: option.color
                                                }}>
                                                    {option.percent}%
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{
                                            width: '100%',
                                            height: '12px',
                                            background: '#e5e7eb',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            <div
                                                style={{
                                                    width: `${option.percent}%`,
                                                    height: '100%',
                                                    background: option.color,
                                                    borderRadius: '6px',
                                                    transition: 'width 0.6s ease-in-out'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PollDetails;
