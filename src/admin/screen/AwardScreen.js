import React, { useEffect, useState, useContext } from "react";
import AwardApi from "../api/AwardApi";
import EmployeesApi from "../api/EmployeesApi"; // Add this import
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import BadgeSelector from '../component/BadgeSelector';

const AwardScreen = () => {
    const [awards, setAwards] = useState([]);
    const [employees, setEmployees] = useState([]); // New state for employees
    const [filteredEmployees, setFilteredEmployees] = useState([]); // For search
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false); // Dropdown visibility
    const [employeeSearch, setEmployeeSearch] = useState(""); // Search term
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state - Enhanced to include employee selection
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        awardedTo: "", // This will store employee ID
        selectedEmployee: null, // This will store the full employee object
        selectedBadge: null // Add this for badge selection
    });

    const { isDarkMode } = useTheme();
    const { admin } = useContext(AdminContext) || {};

    const isHRorAbove = ['superadmin', 'hr'].includes(admin?.role);

    // Fetch employees when component mounts
    useEffect(() => {
        if (isHRorAbove) {
            fetchEmployees();
        }
    }, [isHRorAbove]);

    // Fetch employees function
    const fetchEmployees = async () => {
        try {
            const res = await EmployeesApi.getAllEmployees();
            if (res.success && res.employees) {
                setEmployees(res.employees);
                setFilteredEmployees(res.employees);
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    // Add badge selection handler
    const handleBadgeSelect = (badge) => {
        setFormData({
            ...formData,
            selectedBadge: badge
        });
    };

    // Handle employee search
    const handleEmployeeSearch = (searchTerm) => {
        setEmployeeSearch(searchTerm);
        if (searchTerm.trim() === "") {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(emp =>
                emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    };

    // Handle employee selection
    const handleEmployeeSelect = (employee) => {
        setFormData({
            ...formData,
            awardedTo: employee._id, // ✅ Send MongoDB _id
            selectedEmployee: employee
        });
        setEmployeeSearch(employee.fullName);
        setShowEmployeeDropdown(false);
    };


    // Clear employee selection
    const clearEmployeeSelection = () => {
        setFormData({
            ...formData,
            awardedTo: "",
            selectedEmployee: null
        });
        setEmployeeSearch("");
        setFilteredEmployees(employees);
    };

    const fetchAwards = async () => {
        console.log("📦 Fetching awards...");
        setLoading(true);
        setError("");

        try {
            const res = isHRorAbove
                ? await AwardApi.getAwards()
                : await AwardApi.getMyAwards();

            console.log("✅ API Response:", res);

            const awardData = res.data?.data || [];

            if (res.success && Array.isArray(awardData)) {
                console.log(`📋 Received ${awardData.length} awards`);
                setAwards(awardData);
            } else {
                console.warn("⚠️ Invalid data structure:", res);
                setAwards([]);
                setError(res.message || "Invalid data received");
            }
        } catch (err) {
            console.error("❌ Error fetching awards:", err);
            setError("Something went wrong");
        } finally {
            console.log("✅ Fetch complete");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAwards();
    }, [isHRorAbove]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                awardedTo: formData.awardedTo,
                badgeUrl: formData.selectedBadge?.imageUrl || "" // Use selected badge URL
            };

            console.log("📤 Sending award data:", payload);

            const res = await AwardApi.createAward(payload);
            if (res.success) {
                // Instead of manually updating state, refetch all awards
                await fetchAwards(); // ✅ This ensures complete data with populated fields

                setShowCreateForm(false);
                setFormData({
                    name: "",
                    description: "",
                    awardedTo: "",
                    selectedEmployee: null,
                    selectedBadge: null // Add this
                });
                setEmployeeSearch("");
            } else {
                setError(res.message || "Failed to create award");
            }
        } catch (err) {
            console.error("❌ Create award error:", err);
            setError("Failed to create award");
        } finally {
            setLoading(false);
        }
    };


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMenuToggle = () => setSidebarCollapsed(prev => !prev);
    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    // Employee Selector Component
    const EmployeeSelector = () => (
        <div style={{ position: "relative", marginBottom: "12px" }}>
            <div style={{ position: "relative" }}>
                <input
                    type="text"
                    placeholder="Search and select employee *"
                    value={employeeSearch}
                    onChange={(e) => {
                        handleEmployeeSearch(e.target.value);
                        setShowEmployeeDropdown(true);
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    required
                    style={{
                        ...inputStyle(isDarkMode),
                        paddingRight: formData.selectedEmployee ? "80px" : "40px"
                    }}
                />

                {/* Search Icon */}
                <div style={{
                    position: "absolute",
                    right: formData.selectedEmployee ? "40px" : "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                </div>

                {/* Clear Button */}
                {formData.selectedEmployee && (
                    <button
                        type="button"
                        onClick={clearEmployeeSelection}
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: "2px"
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showEmployeeDropdown && filteredEmployees.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: isDarkMode ? '#334155' : 'white',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000
                }}>
                    {filteredEmployees.map((employee) => (
                        <div
                            key={employee._id}
                            onClick={() => handleEmployeeSelect(employee)}
                            style={{
                                padding: "12px",
                                cursor: "pointer",
                                borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                                backgroundColor: isDarkMode ? '#334155' : 'white',
                                transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = isDarkMode ? '#475569' : '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = isDarkMode ? '#334155' : 'white';
                            }}
                        >
                            <div style={{
                                fontWeight: "500",
                                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                marginBottom: "2px"
                            }}>
                                {employee.fullName}
                            </div>
                            <div style={{
                                fontSize: "0.8rem",
                                color: isDarkMode ? '#94a3b8' : '#64748b'
                            }}>
                                {employee.employeeId} • {employee.email}
                            </div>
                            <div style={{
                                fontSize: "0.75rem",
                                color: isDarkMode ? '#94a3b8' : '#64748b'
                            }}>
                                {employee.designation} • {employee.department?.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No results message */}
            {showEmployeeDropdown && filteredEmployees.length === 0 && employeeSearch && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: isDarkMode ? '#334155' : 'white',
                    border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                    borderRadius: "6px",
                    padding: "12px",
                    textAlign: "center",
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    zIndex: 1000
                }}>
                    No employees found
                </div>
            )}
        </div>
    );

    // Enhanced Empty State Component
    const EmptyState = () => (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center",
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
            {/* Award Icon */}
            <div style={{
                width: "80px",
                height: "80px",
                backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
                border: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`
            }}>
                <svg
                    width="40"
                    height="40"
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

            {/* Title */}
            <h2 style={{
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: "1.5rem",
                fontWeight: "600",
                margin: "0 0 12px 0"
            }}>
                {isHRorAbove ? "No Awards Created Yet" : "No Awards Received"}
            </h2>

            {/* Description */}
            <p style={{
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: "1rem",
                lineHeight: "1.5",
                margin: "0 0 32px 0",
                maxWidth: "400px"
            }}>
                {isHRorAbove
                    ? "Start recognizing outstanding performance by creating your first award. Build a culture of appreciation and motivation."
                    : "Awards will appear here when you receive recognition for your outstanding work. Keep up the great effort!"
                }
            </p>

            {/* Action Button - Only for HR and above */}
            {isHRorAbove && (
                <button
                    onClick={() => setShowCreateForm(true)}
                    style={{
                        padding: "12px 24px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create First Award
                </button>
            )}

            {/* Alternative actions for employees */}
            {!isHRorAbove && (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                        onClick={fetchAwards}
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                            color: isDarkMode ? '#e2e8f0' : '#475569',
                            border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                            borderRadius: "6px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "0.9rem"
                        }}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            )}
        </div>
    );

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
                marginLeft: sidebarWidth,
                display: "flex",
                flexDirection: "column",
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
                            color: isDarkMode ? '#e2e8f0' : '#1e293b',
                            fontSize: "1.8rem",
                            fontWeight: "600"
                        }}>
                            {isHRorAbove ? "Manage Awards" : "My Awards"}
                        </h1>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={fetchAwards}
                                disabled={loading}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? "Loading..." : "Refresh"}
                            </button>

                            {isHRorAbove && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    + Add Award
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: isDarkMode ? "#1f1917" : "#fef2f2",
                            color: "#ef4444",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "20px"
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Create Form Modal */}
                    {showCreateForm && (
                        <div style={{
                            position: "fixed",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000
                        }} onClick={(e) => {
                            // Close dropdown when clicking outside
                            if (e.target === e.currentTarget) {
                                setShowEmployeeDropdown(false);
                            }
                        }}>
                            <div style={{
                                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                                padding: "24px",
                                borderRadius: "12px",
                                width: "90%",
                                maxWidth: "500px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                            }}>
                                <h2 style={{ marginTop: 0, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                    Create New Award
                                </h2>
                                <form onSubmit={handleCreate}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Award Name *"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle(isDarkMode)}
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        style={{ ...inputStyle(isDarkMode), resize: "vertical" }}
                                    />

                                    {/* Replace the employee ID input with the EmployeeSelector */}
                                    <EmployeeSelector />

                                    <BadgeSelector
                                        selectedBadge={formData.selectedBadge}
                                        onBadgeSelect={handleBadgeSelect}
                                        isDarkMode={isDarkMode}
                                        disabled={loading}
                                    />

                                    <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                                        <button
                                            type="submit"
                                            disabled={loading || !formData.selectedEmployee}
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                backgroundColor: !formData.selectedEmployee ? "#94a3b8" : "#10b981",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: loading || !formData.selectedEmployee ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {loading ? "Creating..." : "Create Award"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                clearEmployeeSelection();
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                backgroundColor: isDarkMode ? '#475569' : '#e2e8f0',
                                                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Main Content - Show Empty State or Awards Table */}
                    {loading && awards.length === 0 ? (
                        <div style={{
                            backgroundColor: isDarkMode ? '#1e293b' : 'white',
                            borderRadius: "12px",
                            padding: "40px",
                            textAlign: "center",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{
                                display: "inline-block",
                                width: "40px",
                                height: "40px",
                                border: `3px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                                borderTop: "3px solid #3b82f6",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                marginBottom: "16px"
                            }}></div>
                            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', margin: 0 }}>
                                Loading awards...
                            </p>
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    ) : awards.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div style={{
                            backgroundColor: isDarkMode ? '#1e293b' : 'white',
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: isDarkMode ? '#334155' : '#f8fafc' }}>
                                            <th style={thStyle(isDarkMode)}>Award</th>
                                            <th style={thStyle(isDarkMode)}>Recipient</th>
                                            <th style={thStyle(isDarkMode)}>Given By</th>
                                            <th style={thStyle(isDarkMode)}>Date</th>
                                            {isHRorAbove && <th style={thStyle(isDarkMode)}>Badge</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {awards.map((award) => (
                                            <tr key={award._id} style={{
                                                borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`
                                            }}>
                                                <td style={tdStyle(isDarkMode)}>
                                                    <div>
                                                        <div style={{ fontWeight: "600" }}>{award.name}</div>
                                                        {award.description && (
                                                            <div style={{ fontSize: "0.875rem", color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: "4px" }}>
                                                                {award.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={tdStyle(isDarkMode)}>
                                                    {award.awardedTo?.firstName} {award.awardedTo?.lastName}
                                                    <div style={{ fontSize: "0.8rem", color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                                        {award.awardedTo?.email}
                                                    </div>
                                                </td>
                                                <td style={tdStyle(isDarkMode)}>
                                                    {award.awardedBy?.firstName} {award.awardedBy?.lastName}
                                                </td>
                                                <td style={tdStyle(isDarkMode)}>
                                                    {new Date(award.dateAwarded).toLocaleDateString()}
                                                </td>
                                                {isHRorAbove && (
                                                    <td style={tdStyle(isDarkMode)}>
                                                        {award.badgeUrl ? (
                                                            <img
                                                                src={award.badgeUrl}
                                                                alt="Badge"
                                                                style={{ width: "40px", height: "40px", objectFit: "contain" }}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#94a3b8' }}>—</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable styles
const inputStyle = (isDark) => ({
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
    backgroundColor: isDark ? '#334155' : 'white',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: "1rem"
});

const thStyle = (isDark) => ({
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: "0.875rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
});

const tdStyle = (isDark) => ({
    padding: "16px 12px",
    color: isDark ? '#cbd5e1' : '#334155',
    fontSize: "0.95rem"
});

export default AwardScreen;
