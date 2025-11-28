// src/components/Departments/DepartmentDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { DepartmentsApi } from '../api';
import { useTheme } from '../context/ThemeContext'; // Import theme context

const DepartmentDetails = () => {
  const { id } = useParams();

  // Data states
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
// Get theme from context instead of local state
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  const fetchDepartmentDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await DepartmentsApi.getById(id);
      setDepartment(response.department);
      setEmployees(response.employees || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch department details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDepartmentDetails();
    }
  }, [id]);

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Loading state
  if (adminLoading || loading) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>
          Loading department details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>
          Department not found
        </div>
      </div>
    );
  }

  // Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
    success: isDarkMode ? "#10b981" : "#16a34a",
    danger: isDarkMode ? "#ef4444" : "#dc2626",
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

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '30px',
            paddingTop: '94px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Department Header */}
          <div style={{
            background: themeColors.cardBg,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${themeColors.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: themeColors.textPrimary,
                  marginBottom: '8px',
                  margin: 0
                }}>
                  {department.name}
                </h1>
                <div style={{
                  display: 'inline-block',
                  background: themeColors.accent,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Code: {department.code}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: department.isActive ? '#dcfce7' : '#fee2e2',
                  color: department.isActive ? themeColors.success : themeColors.danger
                }}>
                  {department.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Department Information Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Department Info Card */}
            <div style={{
              background: themeColors.cardBg,
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${themeColors.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: '#dbeafe',
                  padding: '8px',
                  borderRadius: '8px',
                  marginRight: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>📋</span>
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: themeColors.textPrimary,
                  margin: 0
                }}>
                  Department Information
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: themeColors.textPrimary }}>Description:</strong>
                  <p style={{
                    color: themeColors.textSecondary,
                    margin: '4px 0 0 0',
                    lineHeight: '1.5'
                  }}>
                    {department.description || 'No description available'}
                  </p>
                </div>

                {department.head && (
                  <div>
                    <strong style={{ color: themeColors.textPrimary }}>Department Head:</strong>
                    <p style={{
                      color: themeColors.textSecondary,
                      margin: '4px 0 0 0'
                    }}>
                      {department.head.firstName} {department.head.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div style={{
              background: themeColors.cardBg,
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${themeColors.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: '#dcfce7',
                  padding: '8px',
                  borderRadius: '8px',
                  marginRight: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>📊</span>
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: themeColors.textPrimary,
                  margin: 0
                }}>
                  Quick Stats
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: themeColors.background,
                  borderRadius: '8px'
                }}>
                  <span style={{ color: themeColors.textSecondary }}>Total Employees:</span>
                  <strong style={{
                    fontSize: '24px',
                    color: themeColors.accent,
                    fontWeight: '700'
                  }}>
                    {employees.length}
                  </strong>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: themeColors.background,
                  borderRadius: '8px'
                }}>
                  <span style={{ color: themeColors.textSecondary }}>Status:</span>
                  <strong style={{
                    color: department.isActive ? themeColors.success : themeColors.danger
                  }}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Employees Section */}
          <div style={{
            background: themeColors.cardBg,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${themeColors.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                background: '#fef3c7',
                padding: '8px',
                borderRadius: '8px',
                marginRight: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>👥</span>
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: themeColors.textPrimary,
                margin: 0
              }}>
                Department Employees ({employees.length})
              </h3>
            </div>

            {employees.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: themeColors.textSecondary
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                <p style={{ fontSize: '16px', margin: 0 }}>No employees in this department</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    style={{
                      background: themeColors.background,
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${themeColors.border}`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: themeColors.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginRight: '12px'
                      }}>
                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: themeColors.textPrimary,
                          margin: '0 0 4px 0'
                        }}>
                          {employee.firstName} {employee.lastName}
                        </h4>
                        {employee.designation && (
                          <p style={{
                            fontSize: '14px',
                            color: themeColors.textSecondary,
                            margin: 0
                          }}>
                            {employee.designation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: themeColors.textSecondary }}>ID:</span>
                        <strong style={{ color: themeColors.textPrimary }}>
                          {employee.employeeId}
                        </strong>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: themeColors.textSecondary }}>Email:</span>
                        <span style={{
                          color: themeColors.textPrimary,
                          fontSize: '12px',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {employee.email}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DepartmentDetails;
