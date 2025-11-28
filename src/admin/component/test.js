import React, { useEffect, useState, useContext } from "react";
import AuthApi from "../api/AuthApi";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext'; // Import theme context

const TestScreen = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get theme from context instead of local state
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  const fetchManagers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await AuthApi.getManagers();
      if (res.success) {
        setManagers(res.data);
      } else {
        setError(res.message || "Failed to load managers");
      }
    } catch (err) {
      setError("Something went wrong while fetching managers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
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
        isDarkMode={isDarkMode} // Pass from context
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
          isDarkMode={isDarkMode} // Pass from context
          // Remove onThemeToggle prop since Navbar now uses context directly
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
              Managers Directory
            </h1>
            <button
              onClick={fetchManagers}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
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
            {loading && managers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                Loading managers...
              </div>
            ) : managers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                No managers found
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: isDarkMode ? '#1e293b' : 'white'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: isDarkMode ? '#334155' : '#f8fafc'
                    }}>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }}>
                        Name
                      </th>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }}>
                        Email
                      </th>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }}>
                        Department
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager) => (
                      <tr key={manager._id}>
                        <td style={{
                          padding: "12px",
                          borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                          color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>
                          {manager.fullName}
                        </td>
                        <td style={{
                          padding: "12px",
                          borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                          color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>
                          {manager.email}
                        </td>
                        <td style={{
                          padding: "12px",
                          borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                          color: isDarkMode ? '#e2e8f0' : '#1e293b'
                        }}>
                          {manager.department?.name || "Not assigned"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;