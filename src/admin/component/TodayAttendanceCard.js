import React from "react";
import PunchButton from "../component/PunchButton";

const TodayAttendanceCard = React.memo(({
  attendance,
  themeColors,
  onPunchIn,
  onPunchOut,
  canPunchIn,
  canPunchOut,
  punchLoading
}) => {
  if (!attendance) return null;

  // Extract data from API response structure
  const {
    isComboOff = false,
    isCheckedIn = false,
    isCheckedOut = false,
    checkInTimeFormatted = "",
    checkOutTimeFormatted = "",
    currentWorkHours = 0,
    success = false,
  } = attendance;

  // Extract nested attendance data
  const attendanceData = attendance.attendance || {};
  const {
    status = "N/A",
    date: attendanceDate = "",
    createdAt = "",
    updatedAt = "",
    checkIn = {},
    checkOut = {},
    isLate = false,
    lateBy = 0,
    isShortAttendance = false,
    shortByMinutes = 0,
    workHours = 0,
  } = attendanceData;

  // Location data
  const location = checkIn?.location || checkOut?.location || {};
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const address = location?.address || 'Auto-detected location';

  // Parse device info if it's a string
  let deviceInfo = checkIn?.deviceInfo || checkOut?.deviceInfo;
  if (typeof deviceInfo === "string") {
    try {
      deviceInfo = JSON.parse(deviceInfo);
    } catch (e) {
      deviceInfo = { raw: deviceInfo };
    }
  }

  // Determine border color based on late status
  const borderColor = isLate ? themeColors.warning : themeColors.border;

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return themeColors.success;
      case 'absent': return themeColors.error;
      case 'half-day': return themeColors.warning;
      case 'holiday': return themeColors.accent;
      default: return themeColors.textMuted;
    }
  };

  // Format dates
  const formattedDate = attendanceDate 
  ? new Date(attendanceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
  : 'N/A';
  const formattedCreatedAt = createdAt ? new Date(createdAt).toLocaleString() : 'N/A';
  const formattedUpdatedAt = updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A';

  return (
    <div
      style={{
        background: themeColors.cardBg,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${borderColor}`,
        marginBottom: "0",
        boxShadow: isLate
          ? `0 10px 25px ${themeColors.warning}20`
          : "0 10px 25px rgba(15,23,42,0.08)",
        animation: "fadeIn 0.3s ease",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Late indicator ribbon */}
      {isLate && (
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            background: themeColors.warning,
            color: "#fff",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
            borderBottomLeftRadius: "8px",
            zIndex: 1,
          }}
        >
          ⏰ Late Entry
        </div>
      )}

      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "20px",
          color: themeColors.textPrimary,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "20px" }}>📅</span>
        Today&apos;s Attendance
        {attendanceDate && (
          <span style={{ fontSize: "14px", color: themeColors.textMuted, marginLeft: "auto" }}>
            {formattedDate}
          </span>
        )}
      </h3>

      {/* Punch buttons section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "24px",
          padding: "16px",
          background: themeColors.cardBgSecondary,
          borderRadius: "12px",
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <PunchButton
          type="in"
          onClick={onPunchIn}
          disabled={!canPunchIn}
          loading={punchLoading}
          themeColors={themeColors}
        />
        <PunchButton
          type="out"
          onClick={onPunchOut}
          disabled={!canPunchOut}
          loading={punchLoading}
          themeColors={themeColors}
        />
      </div>

      {/* Status message */}
      <div
        style={{
          fontSize: "12px",
          color: themeColors.textMuted,
          textAlign: "center",
          padding: "8px",
          background: themeColors.cardBgSecondary,
          borderRadius: "6px",
          marginBottom: "20px",
        }}
      >
        {canPunchIn
          ? "Ready to start your day?"
          : canPunchOut
            ? "Working... Ready to punch out?"
            : "Great work today!"}
      </div>

      {/* Top status grid - Enhanced with more fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {/* Attendance Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: themeColors.cardBgSecondary,
            borderRadius: "10px",
            border: `1px solid ${getStatusColor(status)}30`,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: getStatusColor(status),
            }}
          />
          <div>
            <div
              style={{ fontSize: "14px", color: themeColors.textSecondary }}
            >
              Status
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: getStatusColor(status),
                textTransform: "capitalize",
              }}
            >
              {status}
            </div>
          </div>
        </div>

        {/* Punch status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: themeColors.cardBgSecondary,
            borderRadius: "10px",
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: isCheckedIn ? themeColors.success : themeColors.error,
            }}
          />
          <div>
            <div
              style={{ fontSize: "14px", color: themeColors.textSecondary }}
            >
              Punch Status
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: themeColors.textPrimary,
              }}
            >
              {isCheckedIn ? "Checked In" : "Not Checked In"}
              {isCheckedOut && " & Out"}
            </div>
          </div>
        </div>

        {/* Late indicator */}
        {isLate && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: `${themeColors.warning}15`,
              borderRadius: "10px",
              border: `1px solid ${themeColors.warning}30`,
            }}
          >
            <span style={{ fontSize: "20px" }}>⏰</span>
            <div>
              <div style={{ fontSize: "14px", color: themeColors.warning }}>
                Late By
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                }}
              >
                {lateBy} minutes
              </div>
            </div>
          </div>
        )}

        {/* Work hours */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: themeColors.cardBgSecondary,
            borderRadius: "10px",
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <span style={{ fontSize: "20px" }}>⏱️</span>
          <div>
            <div
              style={{ fontSize: "14px", color: themeColors.textSecondary }}
            >
              Work Hours
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: themeColors.primary,
              }}
            >
              {currentWorkHours?.toFixed
                ? currentWorkHours.toFixed(2)
                : Number(currentWorkHours || 0).toFixed(2)}{" "}
              hours
            </div>
          </div>
        </div>

        {/* Short attendance */}
        {isShortAttendance && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: `${themeColors.error}10`,
              borderRadius: "10px",
              border: `1px solid ${themeColors.error}30`,
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "14px", color: themeColors.error }}>
                Short Attendance
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                }}
              >
                Short by {shortByMinutes} minutes
              </div>
            </div>
          </div>
        )}

        {/* Combo off */}
        {isComboOff && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: `${themeColors.accent}15`,
              borderRadius: "10px",
              border: `1px solid ${themeColors.accent}30`,
            }}
          >
            <span style={{ fontSize: "20px" }}>🎯</span>
            <div>
              <div style={{ fontSize: "14px", color: themeColors.accent }}>
                Combo Off
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: themeColors.textPrimary,
                }}
              >
                Active
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time details section */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h4
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: themeColors.textSecondary,
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Time Details
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {checkInTimeFormatted && (
            <div
              style={{
                padding: "16px",
                background: themeColors.cardBgSecondary,
                borderRadius: "10px",
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: themeColors.textSecondary,
                  marginBottom: "4px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>⏰</span> Check In Time
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: themeColors.textPrimary,
                  fontWeight: "600",
                }}
              >
                {new Date(checkInTimeFormatted.replace(" ", "T")).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          )}

          {checkOutTimeFormatted && (
            <div
              style={{
                padding: "16px",
                background: themeColors.cardBgSecondary,
                borderRadius: "10px",
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: themeColors.textSecondary,
                  marginBottom: "4px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🏃</span> Check Out Time
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: themeColors.textPrimary,
                  fontWeight: "600",
                }}
              >
                {checkOutTimeFormatted}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Information */}
      {location && address && (
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: themeColors.textSecondary,
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Location Information
          </h4>

          <div
            style={{
              padding: "16px",
              background: themeColors.cardBgSecondary,
              borderRadius: "10px",
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: themeColors.textSecondary,
                marginBottom: "8px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📍</span> Check-in Location
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div>
                <div style={{ color: themeColors.textSecondary }}>Address:</div>
                <div style={{ color: themeColors.textPrimary }}>
                  {address}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device info */}
      {deviceInfo && (
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: themeColors.textSecondary,
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Device Information
          </h4>

          <div
            style={{
              padding: "16px",
              background: themeColors.cardBgSecondary,
              borderRadius: "10px",
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              {deviceInfo.userAgent && (
                <div>
                  <div style={{ color: themeColors.textSecondary }}>Browser:</div>
                  <div
                    style={{
                      color: themeColors.textPrimary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {deviceInfo.userAgent.split("/")[0]}
                  </div>
                </div>
              )}

              {deviceInfo.platform && (
                <div>
                  <div style={{ color: themeColors.textSecondary }}>Platform:</div>
                  <div style={{ color: themeColors.textPrimary }}>
                    {deviceInfo.platform}
                  </div>
                </div>
              )}

              {deviceInfo.language && (
                <div>
                  <div style={{ color: themeColors.textSecondary }}>Language:</div>
                  <div style={{ color: themeColors.textPrimary }}>
                    {deviceInfo.language}
                  </div>
                </div>
              )}

              {deviceInfo.timezone && (
                <div>
                  <div style={{ color: themeColors.textSecondary }}>Timezone:</div>
                  <div style={{ color: themeColors.textPrimary }}>
                    {deviceInfo.timezone}
                  </div>
                </div>
              )}

              {deviceInfo.screenResolution && (
                <div>
                  <div style={{ color: themeColors.textSecondary }}>Resolution:</div>
                  <div style={{ color: themeColors.textPrimary }}>
                    {deviceInfo.screenResolution}
                  </div>
                </div>
              )}

              {deviceInfo.timestamp && (
                <div>
                  <div style={{ color: themeColors.textSecondary }}>Device Time:</div>
                  <div style={{ color: themeColors.textPrimary }}>
                    {new Date(deviceInfo.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TodayAttendanceCard;