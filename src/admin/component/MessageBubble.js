import React from 'react';

const MessageBubble = ({ message, isHr, isDarkMode, themeColors, messageStatus }) => {
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

    const getStatusIcon = (message) => {
        if (!isHr) return null;

        if (message.optimistic) {
            return (
                <svg style={{ width: "0.75rem", height: "0.75rem" }} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
            );
        }

        const status = messageStatus[message._id];
        
        if (status === 'read') {
            return (
                <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="#10b981" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
                </svg>
            );
        } else if (status === 'delivered' || message.delivered) {
            return (
                <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
                </svg>
            );
        } else {
            return (
                <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        }
    };

    return (
        <div style={getMessageWrapperStyle(isHr)}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isHr ? "flex-end" : "flex-start",
                width: "100%",
            }}>
                <div style={getMessageBubbleStyle(isHr, message.optimistic)}>
                    <p style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        wordBreak: "break-word",
                    }}>{message.text}</p>
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
                    <span>{message.timestamp}</span>
                    {isHr && getStatusIcon(message)}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;