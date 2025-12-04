import React, { useEffect, useState, useContext } from "react";
import BadgeApi from "../api/BadgeApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

const BadgeManagement = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null
    });

    const { isDarkMode } = useTheme();
    const { admin, loading: adminLoading } = useContext(AdminContext) || {};

    const fetchBadges = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await BadgeApi.getBadges();
            if (res.success) {
                
                setBadges(res.data);
            } else {
                // Log the API-specific error message
                console.error("API Error: Failed to load badges.", res.message);
                setError(res.message || "Failed to load badges");
            }
        } catch (err) {
            // Log the general catch-block error details
            console.error("Catch Error: Something went wrong during the fetch operation.", err);
            setError("Something went wrong while fetching badges");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBadges();
    }, []);

    const handleMenuToggle = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const handleCreateBadge = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setError("");

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const res = await BadgeApi.createBadge(formDataToSend);
            if (res.success) {
                setShowCreateModal(false);
                setFormData({ name: "", description: "", image: null });
                fetchBadges(); // Refresh the list
            } else {
                setError(res.message || "Failed to create badge");
            }
        } catch (err) {
            setError("Something went wrong while creating badge");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteBadge = async (badgeId) => {
        setDeleteLoading(badgeId);
        setError("");

        try {
            const res = await BadgeApi.deleteBadge(badgeId);
            if (res.success) {
                fetchBadges(); // Refresh the list
            } else {
                setError(res.message || "Failed to delete badge");
            }
        } catch (err) {
            setError("Something went wrong while deleting badge");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
            setError("");
        }
    };

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
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
                backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
            }}>
                <Navbar
                    onMenuClick={handleMenuToggle}
                    isCollapsed={sidebarCollapsed}
                    isDarkMode={isDarkMode}
                    admin={admin}
                />

                <div style={{
                    flex: 1,
                    padding: "20px",
                    paddingTop: "80px",
                    overflow: "auto"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}>
                        <h1 style={{
                            margin: 0,
                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>
                            Badge Management
                        </h1>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={fetchBadges}
                                disabled={loading}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "transparent",
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                    border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                    borderRadius: "6px",
                                    cursor: loading ? "not-allowed" : "pointer"
                                }}
                            >
                                {loading ? "Loading..." : "Refresh"}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                Create Badge
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            color: "#ef4444",
                            padding: "10px",
                            marginBottom: "20px",
                            backgroundColor: isDarkMode ? "#1f1917" : "#fef2f2",
                            borderRadius: "6px"
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{
                        backgroundColor: isDarkMode ? '#1e293b' : 'white',
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        {loading && badges.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px" }}>
                                Loading badges...
                            </div>
                        ) : badges.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px" }}>
                                No badges found. Create your first badge!
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: "20px"
                            }}>
                                {badges.map((badge) => (
                                    <div
                                        key={badge._id}
                                        style={{
                                            backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                                            borderRadius: "8px",
                                            padding: "20px",
                                            border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                                            position: "relative"
                                        }}
                                    >
                                        <div style={{ textAlign: "center", marginBottom: "15px" }}>
                                            <img
                                                src={badge.imageUrl}
                                                alt={badge.name}
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    objectFit: "contain",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                        </div>
                                        <h3 style={{
                                            margin: "0 0 8px 0",
                                            color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                            textAlign: "center"
                                        }}>
                                            {badge.name}
                                        </h3>
                                        <p style={{
                                            margin: "0 0 15px 0",
                                            color: isDarkMode ? '#94a3b8' : '#64748b',
                                            textAlign: "center",
                                            fontSize: "14px"
                                        }}>
                                            {badge.description}
                                        </p>
                                        <button
                                            onClick={() => handleDeleteBadge(badge._id)}
                                            disabled={deleteLoading === badge._id}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                backgroundColor: "#ef4444",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: deleteLoading === badge._id ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {deleteLoading === badge._id ? "Deleting..." : "Delete Badge"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Badge Modal */}
            {showCreateModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: isDarkMode ? '#1e293b' : 'white',
                        padding: "30px",
                        borderRadius: "12px",
                        width: "90%",
                        maxWidth: "500px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                    }}>
                        <h2 style={{
                            margin: "0 0 20px 0",
                            color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>
                            Create New Badge
                        </h2>

                        <form onSubmit={handleCreateBadge}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                    fontWeight: "500"
                                }}>
                                    Badge Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                        borderRadius: "6px",
                                        backgroundColor: isDarkMode ? '#334155' : 'white',
                                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                    fontWeight: "500"
                                }}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="3"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                        borderRadius: "6px",
                                        backgroundColor: isDarkMode ? '#334155' : 'white',
                                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                        boxSizing: "border-box",
                                        resize: "vertical"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                    fontWeight: "500"
                                }}>
                                    Badge Image *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={handleFileChange}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                        borderRadius: "6px",
                                        backgroundColor: isDarkMode ? '#334155' : 'white',
                                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                        boxSizing: "border-box"
                                    }}
                                />
                                <div style={{
                                    fontSize: "12px",
                                    color: isDarkMode ? '#94a3b8' : '#64748b',
                                    marginTop: "5px"
                                }}>
                                    Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)
                                </div>
                            </div>

                            {formData.image && (
                                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                                    <p style={{
                                        margin: "0 0 8px 0",
                                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                        fontSize: "14px"
                                    }}>
                                        Preview:
                                    </p>
                                    <img
                                        src={URL.createObjectURL(formData.image)}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "100px",
                                            maxHeight: "100px",
                                            borderRadius: "8px",
                                            border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "transparent",
                                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                        border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: createLoading ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {createLoading ? "Creating..." : "Create Badge"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BadgeManagement;