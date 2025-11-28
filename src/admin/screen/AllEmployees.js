// src/pages/AllEmployees.js
import React, { useEffect, useState, useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { EmployeesApi, AuthApi } from '../api';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await EmployeesApi.getAllEmployees();
      if (!res.success) throw new Error(res.message || 'Failed to fetch employees');
      setEmployees(res.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (id, fullName, lastSeen) => {
    navigate(`/admin/chat/${id}`, {
      state: { fullName, lastSeen },
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleResetDevice = async (e, employeeId, fullName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to reset ${fullName}'s device?`)) {
      return;
    }

    try {
      const res = await AuthApi.resetDevice(employeeId);
      if (res.success) {
        alert(`✅ ${fullName}'s device has been reset.`);
        fetchEmployees();
      } else {
        alert(`⚠️ Failed: ${res.message}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  const themeColors = {
    background: isDarkMode ? '#0f172a' : '#f1f5f9',
    cardBg: isDarkMode ? '#1e293b' : 'white',
    textPrimary: isDarkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    accent: '#3b82f6',
    hoverBg: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)'
  };

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleToggleVerify = async (employee) => {
    const newVerifiedStatus = !employee.isVerified;

    try {
      const result = await AuthApi.toggleVerification(
        employee._id,
        newVerifiedStatus
      );

      if (result.success) {
        setEmployees(prevEmployees =>
          prevEmployees.map(emp =>
            emp._id === employee._id
              ? { ...emp, isVerified: newVerifiedStatus }
              : emp
          )
        );
        alert(`${employee.fullName} is now ${newVerifiedStatus ? 'verified' : 'unverified'}`);
      } else {
        alert(`Failed to update verification: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating verification:', error);
      alert('Error updating verification status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return themeColors.success;
      case 'inactive': return themeColors.error;
      case 'pending': return themeColors.warning;
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      default: return status || 'Unknown';
    }
  };

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (adminLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.background,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${themeColors.border}`,
            borderTop: `4px solid ${themeColors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: themeColors.textSecondary, fontSize: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin || !admin.role) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.background,
        color: themeColors.textPrimary
      }}>
        <div style={{
          backgroundColor: themeColors.cardBg,
          padding: '48px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: isDarkMode ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: themeColors.textSecondary }}>You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: themeColors.background
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
        backgroundColor: themeColors.background
      }}>
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '30px',
          paddingTop: '94px',
          transition: 'all 0.3s ease'
        }}>
          {/* Header Section */}
          <div style={{
            marginBottom: '32px',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <h1 style={{
              fontSize: "36px",
              fontWeight: "800",
              color: themeColors.textPrimary,
              marginBottom: "8px",
              letterSpacing: '-0.5px'
            }}>
              All Employees
            </h1>
            <p style={{
              color: themeColors.textSecondary,
              fontSize: '16px',
              fontWeight: '400'
            }}>
              Manage and view all employee records
            </p>
          </div>

          {/* Search and Filter Section */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.6s ease-out'
          }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px'
                }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    backgroundColor: themeColors.cardBg,
                    border: `2px solid ${themeColors.border}`,
                    borderRadius: '12px',
                    color: themeColors.textPrimary,
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = themeColors.accent}
                  onBlur={(e) => e.target.style.borderColor = themeColors.border}
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '14px 40px 14px 16px',
                backgroundColor: themeColors.cardBg,
                border: `2px solid ${themeColors.border}`,
                borderRadius: '12px',
                color: themeColors.textPrimary,
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '160px',
                boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
            animation: 'fadeIn 0.7s ease-out'
          }}>
            <div style={{
              backgroundColor: themeColors.cardBg,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`,
              boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.07)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', marginBottom: '4px' }}>Total Employees</p>
              <h3 style={{ color: themeColors.textPrimary, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                {employees.length}
              </h3>
            </div>

            <div style={{
              backgroundColor: themeColors.cardBg,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`,
              boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.07)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', marginBottom: '4px' }}>Active</p>
              <h3 style={{ color: themeColors.success, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                {employees.filter(emp => emp.status?.toLowerCase() === 'active').length}
              </h3>
            </div>

            <div style={{
              backgroundColor: themeColors.cardBg,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`,
              boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.07)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', marginBottom: '4px' }}>Pending</p>
              <h3 style={{ color: themeColors.warning, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                {employees.filter(emp => emp.status?.toLowerCase() === 'pending').length}
              </h3>
            </div>

            <div style={{
              backgroundColor: themeColors.cardBg,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`,
              boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.07)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', marginBottom: '4px' }}>Filtered Results</p>
              <h3 style={{ color: themeColors.accent, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                {filteredEmployees.length}
              </h3>
            </div>
          </div>

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              backgroundColor: themeColors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: `4px solid ${themeColors.border}`,
                  borderTop: `4px solid ${themeColors.accent}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: themeColors.textSecondary, fontSize: '16px' }}>Loading employees...</p>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: themeColors.cardBg,
              border: `2px solid ${themeColors.error}`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: 'fadeIn 0.4s ease-out'
            }}>
              <span style={{ fontSize: '32px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: themeColors.error, fontSize: '16px' }}>Error:</strong>
                <p style={{ color: themeColors.textSecondary, margin: '4px 0 0 0' }}>{error}</p>
              </div>
              <button
                onClick={fetchEmployees}
                style={{
                  padding: '10px 20px',
                  backgroundColor: themeColors.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredEmployees.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: themeColors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`,
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ color: themeColors.textPrimary, marginBottom: '8px', fontSize: '24px', fontWeight: '600' }}>
                No employees found
              </h3>
              <p style={{ color: themeColors.textSecondary, fontSize: '16px' }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'This organization has no registered employees yet.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredEmployees.length > 0 && (
            <div style={{
              backgroundColor: themeColors.cardBg,
              borderRadius: '16px',
              boxShadow: isDarkMode ? "0 10px 15px -3px rgba(0, 0, 0, 0.4)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              border: `1px solid ${themeColors.border}`,
              overflow: 'hidden',
              animation: 'fadeIn 0.8s ease-out'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    }}>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        Employee ID
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`
                      }}>
                        Full Name
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        Email
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        Phone
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`
                      }}>
                        Department
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`
                      }}>
                        Designation
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`
                      }}>
                        Role
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        Status
                      </th>
                      <th style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: `2px solid ${themeColors.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => (
                      <tr
                        key={emp._id}
                        onClick={() => handleRowClick(emp)}
                        style={{
                          backgroundColor: 'transparent',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          borderBottom: `1px solid ${themeColors.border}`,
                          animation: `fadeIn ${0.3 + index * 0.05}s ease-out`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = themeColors.hoverBg;
                          e.currentTarget.style.transform = 'scale(1.01)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.accent,
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {emp.employeeId || 'N/A'}
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.textPrimary,
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          {emp.fullName || 'N/A'}
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.textSecondary,
                          fontSize: '14px'
                        }}>
                          {emp.email || 'N/A'}
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.textSecondary,
                          fontSize: '14px'
                        }}>
                          {emp.phone || 'N/A'}
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.textPrimary,
                          fontSize: '14px'
                        }}>
                          {emp.department?.name || 'N/A'}
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.textPrimary,
                          fontSize: '14px'
                        }}>
                          {emp.designation || 'N/A'}
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          color: themeColors.textPrimary,
                          textTransform: 'capitalize',
                          fontSize: '14px'
                        }}>
                          {emp.role || 'N/A'}
                        </td>
                        <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: getStatusColor(emp.status) + '20',
                            color: getStatusColor(emp.status),
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {getStatusText(emp.status)}
                          </span>
                        </td>
                        <td style={{
                          padding: '20px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChatClick(emp._id, emp.fullName, emp.lastSeen);
                              }}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#2563eb';
                                e.target.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#3b82f6';
                                e.target.style.transform = 'translateY(0)';
                              }}
                            >
                              💬 Chat
                            </button>

                            <button
                              onClick={(e) => handleResetDevice(e, emp._id, emp.fullName)}
                              style={{
                                backgroundColor: '#f59e0b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#d97706';
                                e.target.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f59e0b';
                                e.target.style.transform = 'translateY(0)';
                              }}
                            >
                              🔄 Reset
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVerify(emp);
                              }}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: emp.isVerified ? themeColors.error : themeColors.success,
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: emp.isVerified 
                                  ? '0 2px 4px rgba(239, 68, 68, 0.3)'
                                  : '0 2px 4px rgba(16, 185, 129, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.opacity = '0.9';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.opacity = '1';
                              }}
                            >
                              {emp.isVerified ? '❌ Unverify' : '✅ Verify'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal remains the same but with updated styling */}
      {showModal && selectedEmployee && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: themeColors.cardBg,
              borderRadius: '20px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: isDarkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${themeColors.border}`,
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '28px',
              borderBottom: `2px solid ${themeColors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: isDarkMode 
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  color: themeColors.textPrimary,
                  fontSize: '28px',
                  fontWeight: '700',
                  letterSpacing: '-0.5px'
                }}>
                  Employee Details
                </h2>
                <p style={{
                  margin: '6px 0 0 0',
                  color: themeColors.textSecondary,
                  fontSize: '15px'
                }}>
                  Complete information for {selectedEmployee.fullName}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: themeColors.border,
                  border: 'none',
                  color: themeColors.textPrimary,
                  cursor: 'pointer',
                  fontSize: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.error;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = themeColors.border;
                  e.target.style.color = themeColors.textPrimary;
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '28px' }}>
              {/* Basic Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: themeColors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>ℹ️</span> Basic Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee ID</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.accent, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500', textTransform: 'capitalize' }}>{selectedEmployee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>
                      {selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marital Status</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500', textTransform: 'capitalize' }}>
                      {selectedEmployee.maritalStatus || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Blood Group</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.error, fontSize: '15px', fontWeight: '700' }}>{selectedEmployee.bloodGroup || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: themeColors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>💼</span> Work Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.department?.name} ({selectedEmployee.department?.code || 'N/A'})
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {selectedEmployee.role || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employment Type</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {selectedEmployee.employmentType?.replace('-', ' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Joining</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Status</strong>
                    <span style={{
                      backgroundColor: getStatusColor(selectedEmployee.status) + '20',
                      color: getStatusColor(selectedEmployee.status),
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'inline-block'
                    }}>
                      {getStatusText(selectedEmployee.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: themeColors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>📍</span> Address Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.address?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.address?.state || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.address?.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: themeColors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>💰</span> Salary Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basic Salary</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.salary?.currency} {selectedEmployee.salary?.basic?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HRA</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.salary?.currency} {selectedEmployee.salary?.hra?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transport</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.salary?.currency} {selectedEmployee.salary?.transport?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Allowances</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.salary?.currency} {selectedEmployee.salary?.allowances?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.error, fontSize: '15px', fontWeight: '600' }}>
                      {selectedEmployee.salary?.currency} {selectedEmployee.salary?.deductions?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${themeColors.success}`
                  }}>
                    <strong style={{ color: themeColors.success, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Salary</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.success, fontSize: '18px', fontWeight: '700' }}>
                      {selectedEmployee.salary?.currency} {selectedEmployee.salary?.netSalary?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: themeColors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🏦</span> Bank Details
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Number</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.bankDetails?.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bank Name</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.bankDetails?.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IFSC Code</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.bankDetails?.ifscCode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Leave Balance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    color: themeColors.textPrimary,
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🚨</span> Emergency Contact
                  </h3>
                  <div style={{
                    backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${themeColors.border}`
                  }}>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</strong>
                    <p style={{ margin: '6px 0 20px 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.emergencyContact?.name || 'N/A'}</p>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.emergencyContact?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    color: themeColors.textPrimary,
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📅</span> Leave Balance
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${themeColors.border}`
                  }}>
                    <div>
                      <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Casual</strong>
                      <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.leaveBalance?.casual || 0} days</p>
                    </div>
                    <div>
                      <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sick</strong>
                      <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.leaveBalance?.sick || 0} days</p>
                    </div>
                    <div>
                      <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earned</strong>
                      <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.leaveBalance?.earned || 0} days</p>
                    </div>
                    <div>
                      <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unpaid</strong>
                      <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '600' }}>{selectedEmployee.leaveBalance?.unpaid || 0} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: themeColors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>📋</span> Additional Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PF Number</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.pfNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UAN Number</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.uanNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PAN Number</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>{selectedEmployee.panNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Login</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>
                      {selectedEmployee.lastLogin ? new Date(selectedEmployee.lastLogin).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created Date</strong>
                    <p style={{ margin: '6px 0 0 0', color: themeColors.textPrimary, fontSize: '15px', fontWeight: '500' }}>
                      {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: themeColors.textSecondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Verified</strong>
                    <span style={{
                      backgroundColor: selectedEmployee.isVerified ? themeColors.success + '20' : themeColors.error + '20',
                      color: selectedEmployee.isVerified ? themeColors.success : themeColors.error,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      display: 'inline-block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {selectedEmployee.isVerified ? '✅ Verified' : '❌ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px 28px',
              borderTop: `2px solid ${themeColors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              background: isDarkMode 
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '12px 32px',
                  backgroundColor: themeColors.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 8px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = themeColors.accent;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployees;
