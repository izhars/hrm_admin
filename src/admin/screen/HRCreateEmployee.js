import React, { useState, useEffect, useCallback, useMemo, useContext} from "react";
import Select from "react-select";
import DepartmentsApi from "../api/DepartmentsApi";
import AuthApi from "../api/AuthApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import "../pages/hr-create-employee.css";
import { useTheme } from "../context/ThemeContext";
import { AdminContext } from '../context/AdminContext';

const HRCreateEmployee = () => {
  // State hooks
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};
  const [form, setForm] = useState({
    employeeId: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "employee",
    department: "",
    designation: "",
    dateOfJoining: "",
    employmentType: "full-time",
    reportingManager: "NA",
    weekendType: "sunday",
    salary: { basic: "", hra: "", transport: "", allowances: "", deductions: "" },
    phone: "",
    gender: "male",
    dateOfBirth: "",
    maritalStatus: "single",
    marriageAnniversary: "",
    spouseDetails: { name: "", email: "", phone: "" },
    address: { line1: "", city: "", state: "", zip: "" },
    emergencyContact: { name: "", relation: "", phone: "" },
    bankDetails: { bankName: "", accountNumber: "", ifscCode: "" },
    panNumber: "",
    pfNumber: "",
    uanNumber: "",
    bloodGroup: "",
    profilePicture: null,
    documents: []
  });
  const [loading, setLoading] = useState(true);
  const [managersLoading, setManagersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dark mode ready React-Select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 10,
      borderColor: state.isFocused ? "var(--ring)" : "var(--border)",
      boxShadow: state.isFocused
        ? "0 0 0 3px color-mix(in srgb, var(--ring) 15%, transparent 85%)"
        : "none",
      paddingLeft: 4,
      minHeight: 46,
      backgroundColor: "var(--card)",
      color: "var(--text)",
      "&:hover": { borderColor: "var(--ring)" }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      marginTop: "4px"
    }),
    option: (base, state) => ({
      ...base,
      padding: "12px 16px",
      backgroundColor: state.isSelected
        ? "color-mix(in srgb, var(--ring) 10%, var(--card) 90%)"
        : state.isFocused
          ? "color-mix(in srgb, var(--ring) 5%, var(--card) 95%)"
          : "var(--card)",
      color: "var(--text)",
      cursor: "pointer",
      fontSize: "14px",
      "&:hover": {
        backgroundColor: "color-mix(in srgb, var(--ring) 5%, var(--card) 95%)"
      }
    }),
    placeholder: (base) => ({ ...base, color: "var(--muted)" }),
    singleValue: (base) => ({ ...base, color: "var(--text)" }),
    valueContainer: (base) => ({ ...base, padding: "2px 8px", color: "var(--text)" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--muted)",
      "&:hover": { color: "var(--text)" }
    }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "var(--border)" }),
    input: (base) => ({
      ...base,
      color: "var(--text)",
      "&::placeholder": { color: "var(--muted)" }
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      "::-webkit-scrollbar": { width: "6px" },
      "::-webkit-scrollbar-track": { background: "var(--card)" },
      "::-webkit-scrollbar-thumb": {
        background: "var(--border)",
        borderRadius: "3px"
      }
    })
  };

  // Load theme and fetch data on mount
  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      setManagersLoading(true);
      try {
        const [departmentsRes, managersRes] = await Promise.allSettled([
          DepartmentsApi.fetchDepartments(),
          AuthApi.getManagers()
        ]);

        const depts =
          departmentsRes.status === "fulfilled" && departmentsRes.value?.success
            ? departmentsRes.value.departments || []
            : [];

        let mgrs = [];
        if (managersRes.status === "fulfilled" && managersRes.value?.success) {
          mgrs = Array.isArray(managersRes.value.data) ? managersRes.value.data : [];
        }

        setDepartments(depts);
        setManagers(mgrs);
        setError(depts.length === 0 && mgrs.length === 0 ? "Failed to load required data" : null);
      } catch (e) {
        setError("Failed to load data: " + e.message);
      } finally {
        setLoading(false);
        setManagersLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleMenuToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const keys = name.split(".");
      setForm(prev => {
        const copy = { ...prev };
        let temp = copy;
        for (let i = 0; i < keys.length - 1; i++) {
          temp[keys[i]] = { ...temp[keys[i]] };
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] = value;
        return copy;
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleRoleChange = useCallback((e) => {
    const role = e.target.value;
    setForm(prev => ({
      ...prev,
      role,
      reportingManager: role === "manager" ? "NA" : prev.reportingManager,
      weekendType: role === "employee" ? "sunday" : prev.weekendType
    }));
  }, []);

  const handleDepartmentChange = useCallback((selected) => {
    setForm(prev => ({ ...prev, department: selected ? selected.label : "" }));
  }, []);

  const handleReportingManagerChange = useCallback((selected) => {
    setForm(prev => ({ ...prev, reportingManager: selected ? selected.value : "NA" }));
  }, []);

  const handleMaritalStatusChange = useCallback((e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      maritalStatus: value,
      marriageAnniversary: value === "married" ? prev.marriageAnniversary : "",
      spouseDetails: value === "married"
        ? prev.spouseDetails
        : { name: "", email: "", phone: "" }
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    if (name === "profilePicture") {
      setForm(prev => ({
        ...prev,
        profilePicture: files[0] ? files[0] : null
      }));
    } else if (name === "documents") {
      setForm(prev => ({
        ...prev,
        documents: files ? Array.from(files) : []
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = {
      employeeId: "Employee ID",
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      department: "Department",
      designation: "Designation",
      role: "Role"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form[field]?.toString().trim()) {
        return `${label} is required`;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address";
    }

    const empIdRegex = /^[A-Z]{3,8}\d{3,4}$/;
    if (!empIdRegex.test(form.employeeId)) {
      return "Employee ID must be alphanumeric e.g., SCAIPLE001";
    }

    return null;
  }, [form]);

  const buildFormData = useCallback(() => {
    const formData = new FormData();
    const appendData = (obj, prefix = "") => {
      for (let key in obj) {
        const value = obj[key];
        if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) continue;

        if (typeof value === "object" && !(value instanceof File) && !Array.isArray(value)) {
          appendData(value, prefix ? `${prefix}.${key}` : key);
        } else if (Array.isArray(value)) {
          value.forEach((file, idx) => {
            if (file instanceof File) {
              formData.append(`${prefix}${key}${idx}`, file);
            }
          });
        } else if (value instanceof File) {
          formData.append(prefix || key, value);
        } else {
          formData.append(prefix || key, value.toString());
        }
      }
    };
    appendData(form);
    return formData;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const hasFiles = form.profilePicture || form.documents.length > 0;
      let response;

      const formDataToSubmit = {
        ...form,
        reportingManager: form.reportingManager || "NA"
      };

      if (hasFiles) {
        const formData = buildFormData();
        if (!form.reportingManager) {
          formData.set('reportingManager', 'NA');
        }
        response = await AuthApi.registerEmployee(formData);
      } else {
        const { profilePicture, documents, ...jsonData } = formDataToSubmit;
        response = await AuthApi.registerEmployee(jsonData);
      }

      if (response.success) {
        setSuccess("Employee created successfully! 🎉");
        setTimeout(() => resetForm(), 3000);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [form, validateForm, buildFormData]);

  const resetForm = useCallback(() => {
    setForm({
      employeeId: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "employee",
      department: "",
      designation: "",
      dateOfJoining: "",
      employmentType: "full-time",
      reportingManager: "NA",
      weekendType: "sunday",
      salary: { basic: "", hra: "", transport: "", allowances: "", deductions: "" },
      phone: "",
      gender: "male",
      dateOfBirth: "",
      maritalStatus: "single",
      marriageAnniversary: "",
      spouseDetails: { name: "", email: "", phone: "" },
      address: { line1: "", city: "", state: "", zip: "" },
      emergencyContact: { name: "", relation: "", phone: "" },
      bankDetails: { bankName: "", accountNumber: "", ifscCode: "" },
      panNumber: "",
      pfNumber: "",
      uanNumber: "",
      bloodGroup: "",
      profilePicture: null,
      documents: []
    });
    setError(null);
    setSuccess(null);
  }, []);

  // Memoized computed values
  const managerOptions = useMemo(() => [
    { value: "NA", label: "No Reporting Manager" },
    ...(Array.isArray(managers) && managers.length > 0
      ? managers.map(manager => ({
        value: manager.employeeId,
        label: `${manager.fullName || `${manager.firstName || ''} ${manager.lastName || ''}`.trim()} (${manager.employeeId})${manager.designation ? ` - ${manager.designation}` : ''}`
      }))
      : [])
  ], [managers]);

  const selectedManagerOption = useMemo(() =>
    managerOptions.find(option => option.value === form.reportingManager) || null
    , [managerOptions, form.reportingManager]);

  const totalCTC = useMemo(() => {
    const sum = [
      parseFloat(form.salary.basic) || 0,
      parseFloat(form.salary.hra) || 0,
      parseFloat(form.salary.transport) || 0,
      parseFloat(form.salary.allowances) || 0
    ].reduce((sum, val) => sum + val, 0) - (parseFloat(form.salary.deductions) || 0);
    return sum.toLocaleString('en-IN');
  }, [form.salary]);

  // Loading state
  if (loading && !managersLoading) {
    return (
      <div className="loading-container" data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading employee creation form...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      data-theme={isDarkMode ? 'dark' : 'light'}
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)'
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
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'var(--bg)'
        }}
      >
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin} />

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            paddingTop: '94px',
            backgroundColor: 'var(--bg)'
          }}
        >
          <div className="hr-page">
            <div className="hr-card">
              <div className="hr-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="hr-icon">👤</div>
                  <div>
                    <h2>Create New Employee</h2>
                    <p className="hr-subtitle">
                      Add a new team member with complete profile details
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="hr-alert hr-alert-error">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="hr-alert hr-alert-success">
                  <span className="alert-icon">✅</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} encType="multipart/form-data" className="hr-form">
                {/* Basic Information */}
                <div className="hr-section">
                  <h3>Basic Information</h3>
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Employee ID <span className="required">*</span></label>
                      <input
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        placeholder="E.g. SCAIPLE001"
                        required
                        disabled={loading}
                      />
                      <small className="field-help">Unique ID e.g., COMPANY001</small>
                    </div>
                    <div className="hr-field">
                      <label>Role <span className="required">*</span></label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleRoleChange}
                        required
                        disabled={loading}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Designation <span className="required">*</span></label>
                      <input
                        type="text"
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        placeholder="E.g. Software Engineer"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="name@company.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Password <span className="required">*</span></label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Set temporary password"
                        required
                        disabled={loading}
                      />
                      <small className="field-help">Employee will reset on first login</small>
                    </div>
                    <div className="hr-field">
                      <label>Date of Joining</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={form.dateOfJoining}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Department & Employment Type */}
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Department <span className="required">*</span></label>
                      <Select
                        className="hr-select-container"
                        options={departments.map(d => ({ value: d.name, label: d.name }))}
                        onChange={handleDepartmentChange}
                        placeholder={departments.length === 0 ? "No departments available" : "Select department"}
                        value={departments.find(d => d.name === form.department) ? { value: form.department, label: form.department } : null}
                        styles={selectStyles}
                        isDisabled={departments.length === 0 || loading}
                        isClearable={departments.length > 0}
                      />
                      {departments.length === 0 && (
                        <small className="field-help text-muted">No departments found. Create one first.</small>
                      )}
                    </div>
                    <div className="hr-field">
                      <label>Employment Type</label>
                      <select
                        name="employmentType"
                        value={form.employmentType}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                      </select>
                    </div>
                  </div>

                  {/* Reporting Manager - Only for Employees */}
                  {form.role === "employee" && (
                    <div className="hr-grid-1">
                      <div className="hr-field">
                        <label>Reporting Manager</label>
                        {managersLoading ? (
                          <div className="select-placeholder">
                            <div className="spinner-small"></div>
                            Loading managers...
                          </div>
                        ) : (
                          <Select
                            className="hr-select-container"
                            options={managerOptions}
                            onChange={handleReportingManagerChange}
                            placeholder={managers.length === 0 ? "No managers available" : "Select reporting manager"}
                            value={selectedManagerOption}
                            styles={selectStyles}
                            isDisabled={managers.length === 0 || loading}
                            isClearable={managers.length > 0}
                          />
                        )}
                        {managers.length === 0 ? (
                          <small className="field-help text-muted">No managers found. Will be set to NA</small>
                        ) : (
                          <small className="field-help">{managers.length} managers available</small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Weekend Type - Only for Employees */}
                  {form.role === "employee" && (
                    <div className="hr-grid-1">
                      <div className="hr-field">
                        <label>Weekend Type</label>
                        <select
                          name="weekendType"
                          value={form.weekendType}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="sunday">Sunday Only</option>
                          <option value="saturday-sunday">Saturday Sunday</option>
                        </select>
                        <small className="field-help">Select weekly off days for this employee</small>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="hr-section">
                  <h3>Personal Information</h3>
                  <div className="hr-grid-3">
                    <div className="hr-field">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="hr-field">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="hr-grid-3">
                    <div className="hr-field">
                      <label>Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={form.maritalStatus}
                        onChange={handleMaritalStatusChange}
                        disabled={loading}
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {form.maritalStatus === "married" && (
                      <div className="hr-field">
                        <label>Marriage Anniversary</label>
                        <input
                          type="date"
                          name="marriageAnniversary"
                          value={form.marriageAnniversary}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    )}
                    <div className="hr-field">
                      <label>Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={form.bloodGroup}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {form.maritalStatus === "married" && (
                    <div className="hr-grid-3">
                      <div className="hr-field">
                        <label>Spouse Name</label>
                        <input
                          type="text"
                          name="spouseDetails.name"
                          value={form.spouseDetails.name}
                          onChange={handleChange}
                          placeholder="Spouse full name"
                          disabled={loading}
                        />
                      </div>
                      <div className="hr-field">
                        <label>Spouse Email</label>
                        <input
                          type="email"
                          name="spouseDetails.email"
                          value={form.spouseDetails.email}
                          onChange={handleChange}
                          placeholder="spouse@company.com"
                          disabled={loading}
                        />
                      </div>
                      <div className="hr-field">
                        <label>Spouse Phone</label>
                        <input
                          type="tel"
                          name="spouseDetails.phone"
                          value={form.spouseDetails.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Salary Information */}
                <div className="hr-section">
                  <h3>Salary Information</h3>
                  <div className="hr-grid-5">
                    <div className="hr-field">
                      <label>Basic</label>
                      <input
                        type="number"
                        name="salary.basic"
                        value={form.salary.basic}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>HRA</label>
                      <input
                        type="number"
                        name="salary.hra"
                        value={form.salary.hra}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Transport</label>
                      <input
                        type="number"
                        name="salary.transport"
                        value={form.salary.transport}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Allowances</label>
                      <input
                        type="number"
                        name="salary.allowances"
                        value={form.salary.allowances}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Deductions</label>
                      <input
                        type="number"
                        name="salary.deductions"
                        value={form.salary.deductions}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="salary-total" style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "color-mix(in srgb, var(--card) 95%, var(--ring) 5%)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    Total CTC: ₹{totalCTC}
                  </div>
                </div>

                {/* Address */}
                <div className="hr-section">
                  <h3>Address</h3>
                  <div className="hr-grid-4">
                    <div className="hr-field">
                      <label>Address Line 1</label>
                      <input
                        type="text"
                        name="address.line1"
                        value={form.address.line1}
                        onChange={handleChange}
                        placeholder="Street address"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={form.address.city}
                        onChange={handleChange}
                        placeholder="City"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={form.address.state}
                        onChange={handleChange}
                        placeholder="State"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>ZIP Code</label>
                      <input
                        type="text"
                        name="address.zip"
                        value={form.address.zip}
                        onChange={handleChange}
                        placeholder="123456"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="hr-section">
                  <h3>Emergency Contact</h3>
                  <div className="hr-grid-3">
                    <div className="hr-field">
                      <label>Name</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={form.emergencyContact.name}
                        onChange={handleChange}
                        placeholder="Emergency contact name"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Relation</label>
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={form.emergencyContact.relation}
                        onChange={handleChange}
                        placeholder="e.g., Spouse, Parent"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Phone <span className="required">*</span></label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={form.emergencyContact.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="hr-section">
                  <h3>Bank Details</h3>
                  <div className="hr-grid-3">
                    <div className="hr-field">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={form.bankDetails.bankName}
                        onChange={handleChange}
                        placeholder="Bank name"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Account Number</label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={form.bankDetails.accountNumber}
                        onChange={handleChange}
                        placeholder="Account number"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        name="bankDetails.ifscCode"
                        value={form.bankDetails.ifscCode}
                        onChange={handleChange}
                        placeholder="IFSC code"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Government IDs */}
                <div className="hr-section">
                  <h3>Government IDs</h3>
                  <div className="hr-grid-3">
                    <div className="hr-field">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={form.panNumber}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                        maxLength="10"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>PF Number</label>
                      <input
                        type="text"
                        name="pfNumber"
                        value={form.pfNumber}
                        onChange={handleChange}
                        placeholder="PF number"
                        disabled={loading}
                      />
                    </div>
                    <div className="hr-field">
                      <label>UAN Number</label>
                      <input
                        type="text"
                        name="uanNumber"
                        value={form.uanNumber}
                        onChange={handleChange}
                        placeholder="UAN number"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="hr-section">
                  <h3>Attachments</h3>
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Profile Picture</label>
                      <input
                        type="file"
                        name="profilePicture"
                        onChange={handleFileChange}
                        accept="image/*"
                        disabled={loading}
                      />
                      {form.profilePicture && (
                        <p className="hr-file-note">
                          {form.profilePicture.name} ({(form.profilePicture.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                      <small className="field-help">JPG, PNG Max 2MB</small>
                    </div>
                    <div className="hr-field">
                      <label>Documents</label>
                      <input
                        type="file"
                        name="documents"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        multiple
                        disabled={loading}
                      />
                      {form.documents.length > 0 && (
                        <p className="hr-file-note">{form.documents.length} files selected</p>
                      )}
                      <small className="field-help">PDF, DOC, Images Max 5MB each</small>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="hr-sticky-actions">
                  <button
                    type="button"
                    className="hr-btn hr-btn-secondary"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset Form
                  </button>
                  <button type="submit" className="hr-btn" disabled={loading}>
                    {loading ? (
                      <div className="spinner-small"></div>
                    ) : null}
                    Creating Employee...
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRCreateEmployee;
