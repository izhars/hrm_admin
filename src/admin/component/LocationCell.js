import React, { useState } from "react";
import { createPortal } from "react-dom";

const LocationCell = ({ address, isDarkMode }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <td
        style={{
          padding: "16px",
          fontSize: "12px",
          color: isDarkMode ? "#d1d5db" : "#475569",
          textAlign: "center",
        }}
      >
        {address ? (
          <button
            onClick={() => setShowPopup(true)}
            style={{
              background: isDarkMode ? "#374151" : "#e2e8f0",
              color: isDarkMode ? "#f9fafb" : "#111827",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 0.8)}
            onMouseLeave={(e) => (e.target.style.opacity = 1)}
          >
            📍 View Location
          </button>
        ) : (
          "-"
        )}
      </td>

      {/* Popup */}
      {showPopup &&
        createPortal(
          <div
            onClick={() => setShowPopup(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: isDarkMode ? "#1f2937" : "#fff",
                color: isDarkMode ? "#f9fafb" : "#111827",
                borderRadius: "12px",
                padding: "20px",
                width: "90%",
                maxWidth: "400px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>
                📍 Location Details
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.4",
                  marginBottom: "12px",
                }}
              >
                {address}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "#3b82f6",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "13px",
                }}
              >
                Open in Google Maps
              </a>

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => setShowPopup(false)}
                  style={{
                    background: isDarkMode ? "#374151" : "#e5e7eb",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default LocationCell;
