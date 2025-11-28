import React, { useState, useEffect } from "react";
import BadgeApi from "../api/BadgeApi";

const BadgeSelector = ({ 
    selectedBadge, 
    onBadgeSelect, 
    isDarkMode,
    disabled = false 
}) => {
    const [badges, setBadges] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch badges when component mounts
    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await BadgeApi.getBadges();
            if (response.success && response.data) {
                setBadges(response.data);
            }
        } catch (err) {
            console.error("Error fetching badges:", err);
            setError("Failed to load badges");
        } finally {
            setLoading(false);
        }
    };

    const handleBadgeClick = (badge) => {
        onBadgeSelect(badge);
        setShowModal(false);
    };

    const clearSelection = () => {
        onBadgeSelect(null);
    };

    // Badge Preview Component
    const BadgePreview = ({ badge, size = "medium" }) => {
        const sizeMap = {
            small: { width: "24px", height: "24px" },
            medium: { width: "40px", height: "40px" },
            large: { width: "60px", height: "60px" },
            xlarge: { width: "80px", height: "80px" }
        };

        return (
            <div style={{
                ...sizeMap[size],
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDarkMode ? '#334155' : '#f8fafc'
            }}>
                {badge ? (
                    <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : (
                    <svg 
                        width="50%" 
                        height="50%" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                        strokeWidth="2"
                    >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                )}
                {/* Fallback icon for broken images */}
                <div style={{
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%"
                }}>
                    <svg 
                        width="50%" 
                        height="50%" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="2"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                </div>
            </div>
        );
    };

    // Badge Grid Item
    const BadgeGridItem = ({ badge, isSelected, onClick }) => (
        <div
            onClick={() => onClick(badge)}
            style={{
                padding: "12px",
                borderRadius: "8px",
                border: `2px solid ${isSelected 
                    ? '#3b82f6' 
                    : (isDarkMode ? '#475569' : '#e2e8f0')
                }`,
                backgroundColor: isSelected 
                    ? (isDarkMode ? '#1e40af20' : '#dbeafe') 
                    : (isDarkMode ? '#334155' : 'white'),
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
            }}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.target.style.backgroundColor = isDarkMode ? '#475569' : '#f8fafc';
                    e.target.style.borderColor = isDarkMode ? '#64748b' : '#cbd5e1';
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.target.style.backgroundColor = isDarkMode ? '#334155' : 'white';
                    e.target.style.borderColor = isDarkMode ? '#475569' : '#e2e8f0';
                }
            }}
        >
            <BadgePreview badge={badge} size="large" />
            <div>
                <div style={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    marginBottom: "2px"
                }}>
                    {badge.name}
                </div>
                <div style={{
                    fontSize: "0.75rem",
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    lineHeight: "1.2"
                }}>
                    {badge.description}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Badge Selector Input */}
            <div style={{ marginBottom: "12px" }}>
                <label style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: isDarkMode ? '#e2e8f0' : '#374151'
                }}>
                    Badge Selection
                </label>
                
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                    borderRadius: "6px",
                    backgroundColor: isDarkMode ? '#334155' : 'white',
                    minHeight: "48px"
                }}>
                    {/* Badge Preview */}
                    <BadgePreview badge={selectedBadge} size="medium" />
                    
                    {/* Badge Info */}
                    <div style={{ flex: 1 }}>
                        {selectedBadge ? (
                            <div>
                                <div style={{
                                    fontWeight: "500",
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                    fontSize: "0.9rem"
                                }}>
                                    {selectedBadge.name}
                                </div>
                                <div style={{
                                    fontSize: "0.8rem",
                                    color: isDarkMode ? '#94a3b8' : '#64748b'
                                }}>
                                    {selectedBadge.description}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                color: isDarkMode ? '#94a3b8' : '#64748b',
                                fontSize: "0.9rem"
                            }}>
                                No badge selected
                            </div>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            disabled={disabled}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.6 : 1
                            }}
                        >
                            Choose
                        </button>
                        
                        {selectedBadge && (
                            <button
                                type="button"
                                onClick={clearSelection}
                                disabled={disabled}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "transparent",
                                    color: "#ef4444",
                                    border: `1px solid #ef4444`,
                                    borderRadius: "4px",
                                    fontSize: "0.85rem",
                                    cursor: disabled ? "not-allowed" : "pointer",
                                    opacity: disabled ? 0.6 : 1
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Badge Selection Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2000,
                    padding: "20px"
                }}>
                    <div style={{
                        backgroundColor: isDarkMode ? '#1e293b' : 'white',
                        borderRadius: "12px",
                        width: "100%",
                        maxWidth: "700px",
                        maxHeight: "80vh",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)"
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: isDarkMode ? '#e2e8f0' : '#1e293b'
                            }}>
                                Choose a Badge
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "4px",
                                    color: isDarkMode ? '#94a3b8' : '#64748b'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{
                            flex: 1,
                            padding: "24px",
                            overflow: "auto"
                        }}>
                            {loading ? (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "60px",
                                    flexDirection: "column",
                                    gap: "16px"
                                }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        border: `3px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                                        borderTop: "3px solid #3b82f6",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite"
                                    }}></div>
                                    <p style={{
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        margin: 0
                                    }}>
                                        Loading badges...
                                    </p>
                                </div>
                            ) : error ? (
                                <div style={{
                                    textAlign: "center",
                                    padding: "60px 20px",
                                    color: "#ef4444"
                                }}>
                                    <p>{error}</p>
                                    <button
                                        onClick={fetchBadges}
                                        style={{
                                            marginTop: "12px",
                                            padding: "8px 16px",
                                            backgroundColor: "#3b82f6",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : badges.length === 0 ? (
                                <div style={{
                                    textAlign: "center",
                                    padding: "60px 20px"
                                }}>
                                    <div style={{
                                        width: "60px",
                                        height: "60px",
                                        backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                        border: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`
                                    }}>
                                        <svg
                                            width="30"
                                            height="30"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                                            strokeWidth="1.5"
                                        >
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                            <path d="M4 22h16" />
                                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                        </svg>
                                    </div>
                                    <p style={{
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        margin: 0
                                    }}>
                                        No badges available
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: "16px",
                                    marginBottom: "20px"
                                }}>
                                    {badges.map((badge) => (
                                        <BadgeGridItem
                                            key={badge._id}
                                            badge={badge}
                                            isSelected={selectedBadge?._id === badge._id}
                                            onClick={handleBadgeClick}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: "16px 24px",
                            borderTop: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div style={{
                                fontSize: "0.875rem",
                                color: isDarkMode ? '#94a3b8' : '#64748b'
                            }}>
                                {badges.length} badge{badges.length !== 1 ? 's' : ''} available
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: isDarkMode ? '#475569' : '#e2e8f0',
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default BadgeSelector;
