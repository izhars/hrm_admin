// CelebrationScreen.jsx
import React, { useEffect, useState, useRef } from "react";
import CelebrationApi from "../api/CelebrationApi";

const eventIcons = {
  Birthday: "🎂",
  Anniversary: "💍",
  "Work Anniversary": "💼",
};

const UPCOMING_DAYS = 7;

export default function TestScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const isMounted = useRef(true);

  // Cleanup on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadUpcomingCelebrations = async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("⏳ Fetching upcoming celebrations...");
      const res = await CelebrationApi.getUpcomingCelebrations({ upcomingDays: UPCOMING_DAYS });
      console.log("Raw API response:", res);

      if (res?.success) {
        const events = Array.isArray(res.data) ? res.data : [];
        
        // Sort by daysUntil (closest first), fallback to high number if missing/invalid
        const sortedEvents = [...events].sort((a, b) => {
          const daysA = Number(a.daysUntil) || 999;
          const daysB = Number(b.daysUntil) || 999;
          return daysA - daysB;
        });

        if (isMounted.current) {
          setUpcomingEvents(sortedEvents);
          console.log("🎉 Upcoming celebrations set:", sortedEvents);
        }
      } else {
        const errorMsg = res?.message || "Failed to load upcoming celebrations";
        if (isMounted.current) setError(errorMsg);
      }
    } catch (err) {
      console.error("❌ Error fetching upcoming celebrations:", err);
      if (isMounted.current) {
        setError(err.message || "Something went wrong");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUpcomingCelebrations();
  }, []);

  const getDaysText = (days) => {
    const num = Number(days);
    if (isNaN(num)) return "?";
    if (num === 0) return "Today";
    if (num === 1) return "Tomorrow";
    return `${num}d`;
  };

  return (
    <div style={{ minHeight: "100vh", padding: 20, background: "#f8fafc" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 28, color: "#111827", fontWeight: "bold" }}>
          Upcoming Celebrations
        </h1>
        <button
          onClick={loadUpcomingCelebrations}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: isLoading ? "#a5b4fc" : "#6366F1",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          style={{
            color: "#ef4444",
            background: "#fee2e2",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            borderLeft: "4px solid #ef4444",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, fontSize: 16, color: "#6b7280" }}>
          Loading upcoming celebrations...
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, fontSize: 16, color: "#9ca3af" }}>
          🎉 No upcoming celebrations in the next {UPCOMING_DAYS} days
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcomingEvents.map((item, idx) => {
            // Fallbacks for missing data
            const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ") || "—";
            const designation = item.designation || "—";
            const department = item.department?.name || "—";
            const icon = eventIcons[item.type] || "🎁";
            const key = item._id || `event-${idx}`;

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderLeft: item.daysUntil === 0 ? "4px solid #10b981" : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 16, color: "#111827" }}>
                    {fullName}
                  </div>
                  <div style={{ fontSize: 14, color: "#6B7280" }}>
                    {designation} • {department}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 20 }}>{icon}</div>
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: 8,
                      backgroundColor: item.daysUntil === 0 ? "#10b981" : "#6366F1",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    {getDaysText(item.daysUntil)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}