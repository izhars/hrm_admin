import React from "react";

const PunchButton = React.memo(
  ({
    type,
    onClick,
    disabled,
    loading,
    themeColors,
  }) => {
    const config = {
      in: {
        label: "Punch In",
        icon: "📥",
        bgColor: "#10b981",
        hoverColor: "#0da271",
      },
      out: {
        label: "Punch Out",
        icon: "📤",
        bgColor: "#3b82f6",
        hoverColor: "#2563eb",
      },
    };

    const buttonConfig = config[type];

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px 24px",
          background: buttonConfig.bgColor,
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          transition: "all 0.2s ease",
          minWidth: "140px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = buttonConfig.hoverColor;
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0, 0, 0, 0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = buttonConfig.bgColor;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(0, 0, 0, 0.1)";
          }
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: "18px" }}>{buttonConfig.icon}</span>
            <span>{buttonConfig.label}</span>
          </>
        )}
      </button>
    );
  }
);

export default PunchButton;