// src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { AdminContext } from "../context/AdminContext";
import EmployeesApi from "../api/EmployeesApi"; // ✅ NEW: Add this import

const ChatPage = () => {
    const { employeeId } = useParams();
    const location = useLocation();
    const { fullName } = location.state || {};

    /* ---------- ADMIN & LAYOUT STATE ---------- */
    const { admin, loading: adminLoading } = useContext(AdminContext);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) : false;
    });

    /* ---------- CHAT STATE ---------- */
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const [activeUsers, setActiveUsers] = useState([]);
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const messagesEndRef = useRef(null);

    /* ---------- ✅ NEW: LAST SEEN STATE ---------- */
    const [lastSeen, setLastSeen] = useState(null);
    const [lastSeenLoading, setLastSeenLoading] = useState(false);

    /* ---------- THEME & SIDEBAR HANDLERS ---------- */
    const handleMenuToggle = () => setSidebarCollapsed((prev) => !prev);
    const handleThemeToggle = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem("darkMode", JSON.stringify(newMode));
    };

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    const themeColors = {
        background: isDarkMode ? "#0f172a" : "#f8f9fa",
        cardBg: isDarkMode ? "#1e293b" : "white",
        textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
        textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
        border: isDarkMode ? "#334155" : "#e2e8f0",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
    };

    /* ---------- ✅ NEW: FETCH LAST SEEN FUNCTION ---------- */
    const fetchLastSeen = async (employeeId) => {
        if (!employeeId) return;

        setLastSeenLoading(true);
        try {
            const result = await EmployeesApi.getLastSeen(employeeId);

            // Safely handle Axios-style wrapped response
            const employeeData = result?.data?.data || result?.data;

            if (employeeData?.lastSeen) {
                setLastSeen(employeeData.lastSeen);
            } else {
                console.error('Failed to fetch last seen:', result);
                setLastSeen(null);
            }
        } catch (error) {
            console.error('Error fetching last seen:', error);
            setLastSeen(null);
        } finally {
            setLastSeenLoading(false);
        }
    };


    /* ---------- SCROLL TO BOTTOM ---------- */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => scrollToBottom(), [messages]);

    /* ---------- SOCKET INITIALIZATION ---------- */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const newSocket = io("http://localhost:5000", { auth: { token } });
        setSocket(newSocket);

        newSocket.on("connect", () => setConnectionStatus("connected"));
        newSocket.on("connect_error", () => setConnectionStatus("error"));
        newSocket.on("disconnect", () => setConnectionStatus("disconnected"));

        newSocket.on("receive-message", (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    ...data,
                    from: "employee",
                    timestamp: new Date(data.timestamp).toLocaleTimeString(),
                    delivered: true,
                },
            ]);
        });

        newSocket.on("message-sent", (data) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.optimistic && msg.text === data.text
                        ? { ...data, from: "hr", timestamp: new Date(data.timestamp).toLocaleTimeString(), delivered: true }
                        : msg
                )
            );
        });

        newSocket.on("user-online", (user) => {
            setActiveUsers((prev) => {
                const filtered = prev.filter((u) => u.userId !== user.id);
                return [...filtered, { ...user, userId: user.id.toString() }];
            });

            if (user.id.toString() === employeeId) {
                setEmployeeInfo(prev => ({ ...prev, online: true }));
                // ✅ Clear last seen when user comes online
                setLastSeen(null);
            }
        });

        // ✅ UPDATED: Handle user offline status with last seen fetch
        newSocket.on("user-offline", (user) => {
            setActiveUsers((prev) => prev.filter((u) => u.userId !== user.id.toString()));

            // Update current employee status if this is the user we're chatting with
            if (user.id.toString() === employeeId) {
                setEmployeeInfo(prev => ({ ...prev, online: false }));
                // ✅ NEW: Fetch last seen when user goes offline
                fetchLastSeen(employeeId);
            }
        });

        newSocket.on("chat-history", (history) => {
            const formatted = history.map((msg) => ({
                ...msg,
                from: msg.fromRole === "hr" ? "hr" : "employee",
                timestamp: new Date(msg.timestamp).toLocaleTimeString(),
                delivered: true,
            }));
            setMessages(formatted);
        });

        newSocket.on("active-users-list", (users) => {
            const usersWithStringIds = users.map(user => ({
                ...user,
                userId: user.userId.toString()
            }));
            setActiveUsers(usersWithStringIds);

            const isOnline = usersWithStringIds.some((u) => u.userId === employeeId);
            setEmployeeInfo(prev => ({ ...prev, online: isOnline }));
        });

        return () => newSocket.disconnect();
    }, [employeeId]);

    /* ---------- LOAD HISTORY WHEN SOCKET READY ---------- */
    useEffect(() => {
        if (socket && employeeId && connectionStatus === "connected") {
            socket.emit("load-history", { targetUserId: employeeId });
            socket.emit("get-active-users");

            setEmployeeInfo(prev => ({
                ...prev,
                online: activeUsers.some((u) => u.userId === employeeId)
            }));
        }
    }, [socket, employeeId, connectionStatus]);

    /* ---------- ✅ NEW: FETCH LAST SEEN ON COMPONENT MOUNT ---------- */
    useEffect(() => {
        if (employeeId && !isEmployeeOnline) {
            fetchLastSeen(employeeId);
        }
    }, [employeeId]);

    /* ---------- DEBUG STATE CHANGES ---------- */
    useEffect(() => {
    }, [activeUsers, employeeInfo]);

    const sendMessage = () => {
        if (!input.trim() || !socket || !employeeId) return;

        const tempId = Date.now();
        socket.emit("send-message", { toUserId: employeeId, text: input, tempId });

        setMessages((prev) => [
            ...prev,
            {
                text: input,
                from: "hr",
                timestamp: new Date().toLocaleTimeString(),
                tempId,
                optimistic: true,
                delivered: false,
            },
        ]);
        setInput("");
    };

    const getActiveUsers = () => socket?.emit("get-active-users");

    const isEmployeeOnline = employeeInfo?.online ||
        activeUsers.some((u) => u.userId && u.userId.toString() === employeeId);

    /* ---------- DYNAMIC STYLES ---------- */
    const getStatusDotStyle = (online) => ({
        width: "0.5rem",
        height: "0.5rem",
        borderRadius: "50%",
        backgroundColor: online ? "#10b981" : "#9ca3af",
    });

    const getConnectionBadgeStyle = (status) => ({
        padding: "0.5rem 1rem",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        backgroundColor:
            status === "connected" ? "#dcfce7" : status === "error" ? "#fee2e2" : "#fef3c7",
        color:
            status === "connected" ? "#166534" : status === "error" ? "#991b1b" : "#92400e",
    });

    const getConnectionDotStyle = (status) => ({
        ...getStatusDotStyle(status === "connected"),
        backgroundColor:
            status === "connected" ? "#10b981" : status === "error" ? "#ef4444" : "#f59e0b",
    });

    const getMessageWrapperStyle = (isHr) => ({
        display: "flex",
        animation: "fadeIn 0.3s ease-out",
        justifyContent: isHr ? "flex-end" : "flex-start",
        marginBottom: "1rem",
        width: "100%",
    });

    const getMessageBubbleStyle = (isHr, optimistic) => ({
        maxWidth: "70%",
        minWidth: "120px",
        borderRadius: "1rem",
        padding: "0.75rem 1rem",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        background: isHr
            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
            : isDarkMode ? "#374151" : "#f3f4f6",
        color: isHr ? "white" : isDarkMode ? "#f9fafb" : "#1f2937",
        borderBottomRightRadius: isHr ? "0.25rem" : "1rem",
        borderBottomLeftRadius: isHr ? "1rem" : "0.25rem",
        opacity: optimistic ? 0.7 : 1,
        wordWrap: "break-word",
        overflowWrap: "break-word",
    });

    const getSendButtonStyle = (canSend) => ({
        padding: "0.75rem",
        borderRadius: "50%",
        border: "none",
        cursor: canSend ? "pointer" : "not-allowed",
        background: canSend
            ? "linear-gradient(to right, #3b82f6, #2563eb)"
            : "#d1d5db",
        transition: "all 0.2s, transform 0.1s",
    });

    /* ---------- EARLY RETURNS ---------- */
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
                Loading...
            </div>
        );
    }

    if (!admin || !admin.role) {
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
                You are not authorized to access this page.
            </div>
        );
    }

    /* ---------- MAIN RENDER ---------- */
    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                backgroundColor: themeColors.background,
            }}
        >
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={handleMenuToggle}
                isDarkMode={isDarkMode}
            />

            <div
                style={{
                    flex: 1,
                    marginLeft: sidebarWidth,
                    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    overflow: "hidden",
                }}
            >
                <div style={{ flexShrink: 0 }}>
                    <Navbar
                        onMenuClick={handleMenuToggle}
                        isCollapsed={sidebarCollapsed}
                        isDarkMode={isDarkMode}
                        onThemeToggle={handleThemeToggle}
                        admin={admin}
                    />
                </div>

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: themeColors.cardBg,
                        overflow: "hidden",
                        minHeight: 0,
                    }}
                >
                    {/* ✅ UPDATED: Chat Header with Last Seen */}
                    <div
                        style={{
                            flexShrink: 0,
                            backgroundColor: themeColors.cardBg,
                            borderBottom: `2px solid ${themeColors.border}`,
                            padding: "4.5rem 1.5rem 1rem",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ position: "relative" }}>
                                    <div
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "700",
                                            fontSize: "1.1rem",
                                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                                        }}
                                    >
                                        {employeeId?.substring(0, 2).toUpperCase() || "E"}
                                    </div>
                                    {isEmployeeOnline && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                right: 0,
                                                width: "1rem",
                                                height: "1rem",
                                                backgroundColor: "#10b981",
                                                borderRadius: "50%",
                                                border: "3px solid white",
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: "1.5rem",
                                        fontWeight: "700",
                                        color: themeColors.textPrimary,
                                        margin: 0,
                                        marginBottom: "0.25rem"
                                    }}>
                                        {fullName}
                                    </h2>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        <div style={getStatusDotStyle(isEmployeeOnline)} />

                                        <span
                                            style={{
                                                color: isEmployeeOnline ? "#059669" : "#6b7280",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {isEmployeeOnline ? "Online" : "Offline"}
                                        </span>

                                        {/* ✅ NEW: Show last seen only if offline */}
                                        {!isEmployeeOnline && (
                                            <>
                                                <span style={{ color: "#9ca3af" }}>•</span>
                                                {lastSeenLoading ? (
                                                    <span style={{ color: themeColors.textSecondary, fontStyle: "italic" }}>
                                                        Loading...
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: themeColors.textSecondary,
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {formatLastSeen(lastSeen)}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={getConnectionBadgeStyle(connectionStatus)}>
                                    <div style={getConnectionDotStyle(connectionStatus)} />
                                    <span>
                                        {connectionStatus === "connected"
                                            ? "Connected"
                                            : connectionStatus === "error"
                                                ? "Error"
                                                : "Connecting"}
                                    </span>
                                </div>
                                <button
                                    onClick={getActiveUsers}
                                    style={{
                                        padding: "0.75rem",
                                        borderRadius: "0.5rem",
                                        background: isDarkMode ? "#374151" : "#f3f4f6",
                                        border: `1px solid ${themeColors.border}`,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? "#4b5563" : "#e5e7eb")}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = isDarkMode ? "#374151" : "#f3f4f6")}
                                >
                                    <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke={themeColors.textSecondary} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Users Bar */}
                    {activeUsers.length > 0 && (
                        <div
                            style={{
                                flexShrink: 0,
                                backgroundColor: isDarkMode ? "#1e3a8a" : "#eff6ff",
                                padding: "0.75rem 2rem",
                                borderBottom: `1px solid ${isDarkMode ? "#1e40af" : "#dbeafe"}`,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                                <span style={{ fontWeight: "600", color: themeColors.textPrimary }}>Online Users:</span>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {activeUsers.map((u) => (
                                        <span
                                            key={u.userId}
                                            style={{
                                                padding: "0.25rem 0.75rem",
                                                backgroundColor: isDarkMode ? "#1e40af" : "white",
                                                borderRadius: "9999px",
                                                fontSize: "0.75rem",
                                                fontWeight: "500",
                                                color: "#1d4ed8",
                                                border: `1px solid ${isDarkMode ? "#2563eb" : "#bfdbfe"}`,
                                            }}
                                        >
                                            {u.name} ({u.role})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "1.5rem 2rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                                width: "100%",
                            }}
                        >
                            {messages.length === 0 ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: themeColors.textSecondary,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "6rem",
                                            height: "6rem",
                                            borderRadius: "50%",
                                            backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        <svg style={{ width: "3rem", height: "3rem", color: themeColors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                    <p style={{ fontWeight: "600", fontSize: "1.1rem", color: themeColors.textPrimary }}>No messages yet</p>
                                    <p style={{ fontSize: "0.875rem" }}>Start a conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} style={getMessageWrapperStyle(msg.from === "hr")}>
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: msg.from === "hr" ? "flex-end" : "flex-start",
                                            width: "100%",
                                        }}>
                                            <div style={getMessageBubbleStyle(msg.from === "hr", msg.optimistic)}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: "0.875rem",
                                                    lineHeight: "1.5",
                                                    wordBreak: "break-word",
                                                }}>{msg.text}</p>
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                marginTop: "0.25rem",
                                                fontSize: "0.75rem",
                                                color: themeColors.textSecondary,
                                                maxWidth: "70%",
                                            }}>
                                                <svg style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12,6 12,12 16,14" />
                                                </svg>
                                                <span>{msg.timestamp}</span>
                                                {msg.from === "hr" && (
                                                    <span style={{ display: "flex", alignItems: "center" }}>
                                                        {msg.optimistic ? (
                                                            <svg style={{ width: "0.75rem", height: "0.75rem" }} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <polyline points="12,6 12,12 16,14" />
                                                            </svg>
                                                        ) : msg.delivered ? (
                                                            <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div
                        style={{
                            flexShrink: 0,
                            borderTop: `2px solid ${themeColors.border}`,
                            padding: "1.5rem 2rem",
                            backgroundColor: isDarkMode ? "#1e293b" : "#f9fafb",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Type your message..."
                                style={{
                                    flex: 1,
                                    padding: "1rem 1.25rem",
                                    backgroundColor: themeColors.cardBg,
                                    border: `2px solid ${themeColors.border}`,
                                    borderRadius: "1rem",
                                    outline: "none",
                                    fontSize: "0.875rem",
                                    color: themeColors.textPrimary,
                                    transition: "border-color 0.2s",
                                }}
                                disabled={!socket || connectionStatus !== "connected"}
                                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                                onBlur={(e) => e.target.style.borderColor = themeColors.border}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || !socket || connectionStatus !== "connected"}
                                style={getSendButtonStyle(!!input.trim() && socket && connectionStatus === "connected")}
                            >
                                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

/* ---------- ✅ ENHANCED FORMAT LAST SEEN FUNCTION ---------- */
function formatLastSeen(dateString) {
    if (!dateString) return "Unknown";

    try {
        const date = new Date(dateString);
        const now = new Date();

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Unknown";
        }

        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        // Use Intl.RelativeTimeFormat for modern browsers
        if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
            const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

            if (diffInMinutes < 1) {
                return "Just now";
            } else if (diffInMinutes < 60) {
                return rtf.format(-diffInMinutes, 'minute');
            } else if (diffInHours < 24) {
                return rtf.format(-diffInHours, 'hour');
            } else if (diffInDays < 7) {
                return rtf.format(-diffInDays, 'day');
            }
        }

        // Fallback formatting for older browsers
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });

        let formatted;

        if (diffInMinutes < 1) {
            formatted = "Just now";
        } else if (diffInMinutes < 60) {
            formatted = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
        } else if (isToday) {
            formatted = `Today at ${time}`;
        } else if (isYesterday) {
            formatted = `Yesterday at ${time}`;
        } else if (diffInDays < 7) {
            formatted = `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
        } else {
            formatted = date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return formatted;
    } catch (error) {
        console.error("Error formatting last seen:", error);
        return "Unknown";
    }
}

export default ChatPage;