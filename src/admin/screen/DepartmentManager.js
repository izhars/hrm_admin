// src/components/Departments/DepartmentManager.js
import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { DepartmentsApi } from '../api';
import "../pages/Department.css";
import { useTheme } from '../context/ThemeContext'; // Import theme context


const DepartmentManager = () => {


  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Get theme from context instead of local state
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};


  // Department states
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: ''
  });


  // Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
  };


  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";


  // Fetch all departments
  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await DepartmentsApi.getAll(true);
      setDepartments(response.departments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };


  // Fetch employees for department head assignment
  const fetchEmployees = async () => {
    try {
      // You'll need to implement this API endpoint
      // const response = await EmployeesApi.getAll();
      // setEmployees(response.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };


  // Create new department
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');


    console.log('📤 Sending data:', formData);


    try {
      const response = await DepartmentsApi.create(formData);
      console.log('✅ Response:', response);


      // Access nested department data
      if (response && response.data && response.data.department) {
        setDepartments([...departments, response.data.department]);
        resetForm();
        setShowForm(false);
      } else {
        setError('Invalid response from server');
        console.error('Unexpected response structure:', response);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };


  // Update department
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDepartment) return;


    setLoading(true);
    setError('');


    try {
      const response = await DepartmentsApi.update(editingDepartment._id, formData);
      setDepartments(departments.map(dept =>
        dept._id === editingDepartment._id ? response.data.department : dept
      ));
      resetForm();
      setEditingDepartment(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };


  // Delete department
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;


    setLoading(true);
    setError('');


    try {
      await DepartmentsApi.delete(id);
      // Use filter to remove the department with matching id
      setDepartments(departments.filter(dept => dept._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };


  // Toggle department active/inactive status
  const handleToggleStatus = async (deptId) => {
    setLoading(true);
    setError('');
    try {
      const response = await DepartmentsApi.toggleStatus(deptId);
      // Update department in-place
      if (response && response.data && response.data.department) {
        setDepartments(departments =>
          departments.map(dept =>
            dept._id === deptId ? response.data.department : dept
          )
        );
      } else {
        setError('Failed to toggle status');
      }
    } catch (err) {
      setError(err.message || 'Failed to change department status');
    } finally {
      setLoading(false);
    }
  };


  // Edit department
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      head: department.head?._id || ''
    });
    setShowForm(true);
  };


  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      head: ''
    });
    setEditingDepartment(null);
  };


  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Load data on component mount
  useEffect(() => {
    if (admin) {
      fetchDepartments();
      fetchEmployees();
    }
  }, [admin]);


  // Loading / Unauthorized states
  if (adminLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }


  if (!admin) {
    return (
      <div className="unauthorized-container">
        <div>You are not authorized to access this page.</div>
      </div>
    );
  }


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


          {/* Header */}
          <div className="header" style={{ marginBottom: "32px" }}>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "8px",
                color: themeColors.textPrimary
              }}>
                Department Management
              </h1>
              <p style={{
                color: themeColors.textSecondary,
                fontSize: "16px"
              }}>
                Manage and organize your company departments
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              disabled={loading}
              style={{
                background: themeColors.accent,
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              + Add Department
            </button>
          </div>


          {/* Error Alert */}
          {error && (
            <div
              className="alert alert-danger"
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              {error}
            </div>
          )}


          {/* Department Form Modal */}
          {showForm && (
            <div className="modal-overlay" style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
              <div className="modal" style={{
                background: themeColors.cardBg,
                borderRadius: "12px",
                padding: "0",
                width: "90%",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflow: "auto",
                border: `1px solid ${themeColors.border}`,
              }}>
                <div className="modal-header" style={{
                  padding: "24px",
                  borderBottom: `1px solid ${themeColors.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <h3 style={{ margin: 0, color: themeColors.textPrimary }}>
                    {editingDepartment ? 'Edit Department' : 'Add Department'}
                  </h3>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                      color: themeColors.textSecondary,
                    }}
                  >
                    &times;
                  </button>
                </div>


                <form onSubmit={editingDepartment ? handleUpdate : handleCreate} style={{ padding: "24px" }}>
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: themeColors.textPrimary
                    }}>
                      Department Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter department name"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "6px",
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: "14px"
                      }}
                    />
                  </div>


                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: themeColors.textPrimary
                    }}>
                      Department Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter department code"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "6px",
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: "14px"
                      }}
                    />
                  </div>


                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: themeColors.textPrimary
                    }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter department description"
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "6px",
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: "14px",
                        resize: "vertical",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>


                  <div className="form-group" style={{ marginBottom: "24px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: themeColors.textPrimary
                    }}>
                      Department Head
                    </label>
                    <select
                      name="head"
                      value={formData.head}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "6px",
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: "14px"
                      }}
                    >
                      <option value="">Select Department Head</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="form-actions" style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end"
                  }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      style={{
                        padding: "12px 24px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "6px",
                        background: "transparent",
                        color: themeColors.textPrimary,
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{
                        padding: "12px 24px",
                        border: "none",
                        borderRadius: "6px",
                        background: themeColors.accent,
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {/* Departments List */}
          <div className="departments-list">
            {loading && !showForm && (
              <div className="loading" style={{
                textAlign: "center",
                padding: "40px",
                color: themeColors.textSecondary
              }}>
                Loading departments...
              </div>
            )}


            {!loading && departments.length === 0 && (
              <div className="empty-state" style={{
                textAlign: "center",
                padding: "60px 20px",
                color: themeColors.textSecondary,
                background: themeColors.cardBg,
                borderRadius: "12px",
                border: `1px solid ${themeColors.border}`
              }}>
                <h3 style={{ marginBottom: "12px", color: themeColors.textPrimary }}>
                  No Departments Found
                </h3>
                <p style={{ marginBottom: "20px" }}>
                  Get started by creating your first department.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                  style={{
                    background: themeColors.accent,
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Create Department
                </button>
              </div>
            )}


            {departments.length > 0 && (
              <div className="table-responsive" style={{
                background: themeColors.cardBg,
                borderRadius: "12px",
                border: `1px solid ${themeColors.border}`,
                overflow: "hidden"
              }}>
                <table className="table" style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  color: themeColors.textPrimary
                }}>
                  <thead style={{
                    background: isDarkMode ? "#334155" : "#f1f5f9",
                    borderBottom: `1px solid ${themeColors.border}`
                  }}>
                    <tr>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Name</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Code</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Description</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Employees</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Status</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((department) => (
                      <tr
                        key={department._id}
                        style={{ borderBottom: `1px solid ${themeColors.border}` }}
                      >
                        <td style={{ padding: "16px", fontWeight: "600" }}>
                          {department.name}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <code style={{
                            background: isDarkMode ? "#334155" : "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: themeColors.accent
                          }}>
                            {department.code}
                          </code>
                        </td>
                        <td style={{ padding: "16px", color: themeColors.textSecondary }}>
                          {department.description || '—'}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            background: themeColors.accent,
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            {department.employeeCount || 0}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <button
                            className={`status-toggle ${department.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleStatus(department._id)}
                            disabled={loading}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: department.isActive
                                ? (isDarkMode ? "#065f46" : "#dcfce7")
                                : (isDarkMode ? "#991b1b" : "#fee2e2"),
                              color: department.isActive
                                ? (isDarkMode ? "#34d399" : "#166534")
                                : (isDarkMode ? "#fca5a5" : "#dc2626"),
                              border: "none",
                              cursor: "pointer",
                              minWidth: 90,
                              transition: "all 0.2s"
                            }}
                            title={`Mark as ${department.isActive ? "Inactive" : "Active"}`}
                          >
                            {department.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div className="action-buttons" style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleEdit(department)}
                              disabled={loading}
                              style={{
                                padding: "8px 16px",
                                border: `1px solid ${themeColors.border}`,
                                borderRadius: "6px",
                                background: "transparent",
                                color: themeColors.textPrimary,
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(department._id)}
                              disabled={loading}
                              style={{
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "6px",
                                background: "#dc2626",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>


      <style jsx>{`
        .loading-container,
        .unauthorized-container {
          padding: 50px;
          text-align: center;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-spinner {
          font-size: 18px;
          color: #64748b;
        }

        .btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .status-toggle {
          transition: all 0.2s;
        }
        .status-toggle:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};


export default DepartmentManager;
