import React, { Component } from "react";
import Select from "react-select";
import { DepartmentsApi, AuthApi } from "../api";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import "../pages/hr-create-employee.css";

class HRCreateEmployee extends Component {
  state = {
    departments: [],
    managers: [],
    form: {
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
    },
    loading: false,
    managersLoading: false,
    error: null,
    success: null,
    sidebarCollapsed: false,
    isDarkMode: false,
    admin: null,
    adminLoading: false
  };

  async componentDidMount() {
    this.setState({ loading: true, managersLoading: true });
    try {

      const [departmentsRes, managersRes] = await Promise.allSettled([
        DepartmentsApi.fetchDepartments(),
        AuthApi.getManagers()
      ]);

      console.log("[componentDidMount] ➤ Departments response:", departmentsRes);

      // Handle departments result
      const departments = departmentsRes.status === 'fulfilled' && departmentsRes.value.success
        ? departmentsRes.value.departments
        : [];

      // FIX: Handle managers result - the API returns { success: true, data: [...] }
      let managers = [];
      if (managersRes.status === 'fulfilled' && managersRes.value.success) {
        // Extract the data array from the response
        managers = Array.isArray(managersRes.value.data) ? managersRes.value.data : [];
      }

      this.setState({
        departments,
        managers,
        loading: false,
        managersLoading: false,
        error: departments.length === 0 && managers.length === 0 ? "Failed to load required data" : null
      });

      console.log("[componentDidMount] ✅ Data fetch completed successfully");
    } catch (error) {
      console.error("[componentDidMount] ❌ Error loading data:", error);
      this.setState({
        error: "Failed to load data: " + error.message,
        loading: false,
        managersLoading: false
      });
    }
  }

  handleMenuToggle = () => {
    this.setState(prevState => ({ sidebarCollapsed: !prevState.sidebarCollapsed }));
  };

  handleThemeToggle = () => {
    this.setState(prevState => ({ isDarkMode: !prevState.isDarkMode }));
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const keys = name.split(".");
      this.setState((prevState) => {
        let obj = { ...prevState.form };
        let temp = obj;
        for (let i = 0; i < keys.length - 1; i++) temp = temp[keys[i]];
        temp[keys[keys.length - 1]] = value;
        return { form: obj };
      });
    } else {
      this.setState((prevState) => ({ form: { ...prevState.form, [name]: value } }));
    }
  };

  handleRoleChange = (e) => {
    const role = e.target.value;
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        role: role,
        reportingManager: role === "manager" ? "" : "NA",
        weekendType: role === "employee" ? "sunday" : "" // Add this line
      }
    }));
  };

  handleDepartmentChange = (selected) => {
    this.setState((prevState) => ({
      form: { ...prevState.form, department: selected ? selected.label : "" }
    }));
  };

  handleReportingManagerChange = (selected) => {
    console.log("[handleReportingManagerChange] ➤ Selected:", selected);
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        reportingManager: selected ? selected.value : "NA"
      }
    }), () => {
      console.log("[handleReportingManagerChange] ➤ Updated reportingManager:", this.state.form.reportingManager);
    });
  };

  handleMaritalStatusChange = (e) => {
    const value = e.target.value;
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        maritalStatus: value,
        marriageAnniversary: value === "married" ? prevState.form.marriageAnniversary : "",
        spouseDetails: value === "married" ? prevState.form.spouseDetails : { name: "", email: "", phone: "" }
      }
    }));
  };

  handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "profilePicture") {
      this.setState((prevState) => ({
        form: { ...prevState.form, profilePicture: files && files.length > 0 ? files[0] : null }
      }));
    } else if (name === "documents") {
      this.setState((prevState) => ({
        form: { ...prevState.form, documents: files && files.length > 0 ? Array.from(files) : [] }
      }));
    }
  };

  buildFormData = () => {
    const formData = new FormData();
    const { form } = this.state;
    const appendData = (obj, prefix = "") => {
      for (let key in obj) {
        const value = obj[key];
        if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;
        if (typeof value === "object" && !(value instanceof File) && !Array.isArray(value)) {
          appendData(value, prefix + key + ".");
        } else if (Array.isArray(value)) {
          value.forEach((file, idx) => {
            if (file instanceof File) formData.append(`${prefix}${key}[${idx}]`, file);
          });
        } else if (value instanceof File) {
          formData.append(prefix + key, value);
        } else {
          formData.append(prefix + key, value.toString());
        }
      }
    };
    appendData(form);
    return formData;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: null, success: null });
    try {
      const { employeeId, email, password, firstName, lastName, department, role } = this.state.form;
      if (!employeeId || !email || !password || !firstName || !lastName || !department || !role) {
        throw new Error("Please fill in all required fields");
      }

      const hasFiles = this.state.form.profilePicture || this.state.form.documents.length > 0;
      let response;

      const formDataToSubmit = {
        ...this.state.form,
        reportingManager: this.state.form.reportingManager || "NA"
      };

      if (hasFiles) {
        const formData = this.buildFormData();
        if (!this.state.form.reportingManager) {
          formData.set('reportingManager', 'NA');
        }
        response = await AuthApi.registerEmployee(formData);
      } else {
        const { profilePicture, documents, ...jsonData } = formDataToSubmit;
        response = await AuthApi.registerEmployee(jsonData);
      }

      if (response.success) {
        this.setState({ success: response.message, loading: false });
        setTimeout(() => this.resetForm(), 2000);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      this.setState({ error: error.message || "An unexpected error occurred", loading: false });
    }
  };

  resetForm = () => {
    this.setState({
      form: {
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
        weekendType: "sunday", // Add this line
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
      },
      success: null,
      error: null
    });
  };

  selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 10,
      borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
      paddingLeft: 4,
      minHeight: 46,
      ":hover": { borderColor: "#3b82f6" }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 12px 28px rgba(0,0,0,0.12)"
    }),
    option: (base, state) => ({
      ...base,
      padding: "10px 12px",
      backgroundColor: state.isSelected ? "#e0ecff" : state.isFocused ? "#f3f4f6" : "white",
      color: "#111827",
      cursor: "pointer"
    }),
    placeholder: (base) => ({ ...base, color: "#9ca3af" }),
    singleValue: (base) => ({ ...base, color: "#111827" }),
    valueContainer: (base) => ({ ...base, padding: "2px 4px" }),
    dropdownIndicator: (base) => ({ ...base, color: "#6b7280", ":hover": { color: "#111827" } }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e5e7eb" })
  };

  render() {
    const {
      departments,
      managers,
      form,
      loading,
      managersLoading,
      error,
      success,
      sidebarCollapsed,
      isDarkMode,
      admin,
      adminLoading
    } = this.state;

    const sidebarWidth = sidebarCollapsed ? '80px' : '280px';

    const themeColors = {
      background: isDarkMode ? '#0f172a' : '#f8f9fa',
      cardBg: isDarkMode ? '#1e293b' : 'white',
      textPrimary: isDarkMode ? '#e2e8f0' : '#1e293b',
      textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
      border: isDarkMode ? '#334155' : '#e2e8f0'
    };

    // FIX: Prepare manager options - ensure managers is always an array
    const managerOptions = [
      { value: "NA", label: "No Reporting Manager" },
      ...(Array.isArray(managers) && managers.length > 0
        ? managers.map(manager => ({
          value: manager.employeeId,
          label: `${manager.fullName || `${manager.firstName} ${manager.lastName}`} (${manager.employeeId})${manager.designation ? ` - ${manager.designation}` : ''}`
        }))
        : [])
    ];

    console.log("[render] ➤ Manager Options:", managerOptions);
    console.log("[render] ➤ Current reportingManager value:", form.reportingManager);

    // FIX: Find the selected manager option with fallback
    const selectedManagerOption = managerOptions.find(option => option.value === form.reportingManager) || null;

    console.log("[render] ➤ Selected Manager Option:", selectedManagerOption);

    if (adminLoading) {
      return (
        <div style={{
          padding: "50px",
          textAlign: "center",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.background,
          color: themeColors.textPrimary
        }}>
          Loading...
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: themeColors.background
        }}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={this.handleMenuToggle}
          isDarkMode={isDarkMode}
        />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginLeft: sidebarWidth,
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: themeColors.background
          }}
        >
          <Navbar
            onMenuClick={this.handleMenuToggle}
            isCollapsed={sidebarCollapsed}
            isDarkMode={isDarkMode}
            onThemeToggle={this.handleThemeToggle}
            admin={admin}
          />

          <main
            style={{
              flex: 1,
              overflow: 'auto',
              paddingTop: '94px',
              backgroundColor: themeColors.background
            }}
          >
            <div className="hr-page" style={{ margin: 0, padding: '30px' }}>
              <div className="hr-card" style={{
                backgroundColor: themeColors.cardBg,
                border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
                color: themeColors.textPrimary
              }}>
                <div className="hr-card-header">
                  <h2 style={{ color: themeColors.textPrimary }}>Create Employee</h2>
                  <p className="hr-subtitle" style={{ color: themeColors.textSecondary }}>
                    Add a new team member and capture essential details
                  </p>
                </div>

                {error && <div className="hr-alert hr-alert-error">{error}</div>}
                {success && <div className="hr-alert hr-alert-success">{success}</div>}

                <form onSubmit={this.handleSubmit} encType="multipart/form-data" className="hr-form">
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={this.handleChange}
                        placeholder="E.g. SCAIPLE001"
                        required
                      />
                    </div>
                    <div className="hr-field">
                      <label>Role</label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={this.handleRoleChange}
                        required
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  </div>

                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Designation</label>
                      <input
                        type="text"
                        name="designation"
                        value={form.designation}
                        onChange={this.handleChange}
                        placeholder="E.g. Software Engineer"
                        required
                      />
                    </div>
                    <div className="hr-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={this.handleChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>

                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={this.handleChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div className="hr-field">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={this.handleChange}
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={this.handleChange}
                        placeholder="Set a temporary password"
                        required
                      />
                    </div>
                    <div className="hr-field">
                      <label>Date of Joining</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={form.dateOfJoining}
                        onChange={this.handleChange}
                      />
                    </div>
                  </div>
                  {/* Reporting Manager - Show only for employees */}
                  {form.role === "employee" && (
                    <div className="hr-grid-1">
                      <div className="hr-field">
                        <label>Reporting Manager</label>
                        {managersLoading ? (
                          <div style={{ padding: '10px', color: themeColors.textSecondary }}>
                            Loading managers...
                          </div>
                        ) : (
                          <>
                            <Select
                              options={managerOptions}
                              onChange={this.handleReportingManagerChange}
                              placeholder={managers.length === 0 ? "No managers available" : "Select reporting manager"}
                              value={selectedManagerOption}
                              styles={this.selectStyles}
                              isDisabled={managers.length === 0}
                              isClearable={false}
                            />
                            {managers.length === 0 && (
                              <small style={{ color: themeColors.textSecondary, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                No managers found. Will be set to "NA"
                              </small>
                            )}
                            {managers.length > 0 && (
                              <small style={{ color: themeColors.textSecondary, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                {managers.length} manager(s) available
                              </small>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Department</label>
                      <Select
                        options={departments.map((d) => ({ value: d.name, label: d.name }))}
                        onChange={this.handleDepartmentChange}
                        placeholder="Select department"
                        value={
                          departments.find((d) => d.name === form.department)
                            ? { value: form.department, label: form.department }
                            : null
                        }
                        styles={this.selectStyles}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Employment Type</label>
                      <select
                        name="employmentType"
                        value={form.employmentType}
                        onChange={this.handleChange}
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                      </select>
                    </div>
                  </div>

                  {/* ADD THIS NEW SECTION - Weekend Type for Employees Only */}
                  {form.role === "employee" && (
                    <div className="hr-grid-1">
                      <div className="hr-field">
                        <label>Weekend Type</label>
                        <select
                          name="weekendType"
                          value={form.weekendType}
                          onChange={this.handleChange}
                          required
                        >
                          <option value="sunday">Sunday Only</option>
                          <option value="saturday_sunday">Saturday & Sunday</option>
                        </select>
                        <small style={{
                          color: themeColors.textSecondary,
                          fontSize: '12px',
                          marginTop: '5px',
                          display: 'block'
                        }}>
                          Select the weekly off days for this employee
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Rest of the form sections remain the same */}
                  <div className="hr-section">
                    <h3>Personal Information</h3>
                    <div className="hr-grid-3">
                      <div className="hr-field">
                        <label>Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={form.phone}
                          onChange={this.handleChange}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={this.handleChange}
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
                          onChange={this.handleChange}
                        />
                      </div>
                    </div>

                    <div className="hr-grid-3">
                      <div className="hr-field">
                        <label>Marital Status</label>
                        <select
                          name="maritalStatus"
                          value={form.maritalStatus}
                          onChange={this.handleMaritalStatusChange}
                        >
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {form.maritalStatus === "married" && (
                        <>
                          <div className="hr-field">
                            <label>Marriage Anniversary</label>
                            <input
                              type="date"
                              name="marriageAnniversary"
                              value={form.marriageAnniversary}
                              onChange={this.handleChange}
                            />
                          </div>
                          <div className="hr-field">
                            <label>Spouse Name</label>
                            <input
                              type="text"
                              name="spouseDetails.name"
                              value={form.spouseDetails.name}
                              onChange={this.handleChange}
                              placeholder="Spouse name"
                            />
                          </div>
                          <div className="hr-field">
                            <label>Spouse Email</label>
                            <input
                              type="email"
                              name="spouseDetails.email"
                              value={form.spouseDetails.email}
                              onChange={this.handleChange}
                              placeholder="spouse@email"
                            />
                          </div>
                          <div className="hr-field">
                            <label>Spouse Phone</label>
                            <input
                              type="text"
                              name="spouseDetails.phone"
                              value={form.spouseDetails.phone}
                              onChange={this.handleChange}
                              placeholder="Spouse phone"
                            />
                          </div>
                        </>
                      )}
                      <div className="hr-field">
                        <label>Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={form.bloodGroup}
                          onChange={this.handleChange}
                        >
                          <option value="">Select Blood Group</option>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="hr-section">
                    <h3>Salary Information</h3>
                    <div className="hr-grid-5">
                      <div className="hr-field">
                        <label>Basic</label>
                        <input
                          type="number"
                          name="salary.basic"
                          value={form.salary.basic}
                          onChange={this.handleChange}
                          placeholder="Basic"
                        />
                      </div>
                      <div className="hr-field">
                        <label>HRA</label>
                        <input
                          type="number"
                          name="salary.hra"
                          value={form.salary.hra}
                          onChange={this.handleChange}
                          placeholder="HRA"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Transport</label>
                        <input
                          type="number"
                          name="salary.transport"
                          value={form.salary.transport}
                          onChange={this.handleChange}
                          placeholder="Transport"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Allowances</label>
                        <input
                          type="number"
                          name="salary.allowances"
                          value={form.salary.allowances}
                          onChange={this.handleChange}
                          placeholder="Allowances"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Deductions</label>
                        <input
                          type="number"
                          name="salary.deductions"
                          value={form.salary.deductions}
                          onChange={this.handleChange}
                          placeholder="Deductions"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hr-section">
                    <h3>Address</h3>
                    <div className="hr-grid-4">
                      <div className="hr-field">
                        <label>Line 1</label>
                        <input
                          type="text"
                          name="address.line1"
                          value={form.address.line1}
                          onChange={this.handleChange}
                          placeholder="Address line 1"
                        />
                      </div>
                      <div className="hr-field">
                        <label>City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={form.address.city}
                          onChange={this.handleChange}
                          placeholder="City"
                        />
                      </div>
                      <div className="hr-field">
                        <label>State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={form.address.state}
                          onChange={this.handleChange}
                          placeholder="State"
                        />
                      </div>
                      <div className="hr-field">
                        <label>ZIP</label>
                        <input
                          type="text"
                          name="address.zip"
                          value={form.address.zip}
                          onChange={this.handleChange}
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hr-section">
                    <h3>Emergency Contact</h3>
                    <div className="hr-grid-3">
                      <div className="hr-field">
                        <label>Name</label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          value={form.emergencyContact.name}
                          onChange={this.handleChange}
                          placeholder="Contact name"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Relation</label>
                        <input
                          type="text"
                          name="emergencyContact.relation"
                          value={form.emergencyContact.relation}
                          onChange={this.handleChange}
                          placeholder="Relation"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Phone</label>
                        <input
                          type="text"
                          name="emergencyContact.phone"
                          value={form.emergencyContact.phone}
                          onChange={this.handleChange}
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hr-section">
                    <h3>Bank Details</h3>
                    <div className="hr-grid-3">
                      <div className="hr-field">
                        <label>Bank Name</label>
                        <input
                          type="text"
                          name="bankDetails.bankName"
                          value={form.bankDetails.bankName}
                          onChange={this.handleChange}
                          placeholder="Bank name"
                        />
                      </div>
                      <div className="hr-field">
                        <label>Account Number</label>
                        <input
                          type="text"
                          name="bankDetails.accountNumber"
                          value={form.bankDetails.accountNumber}
                          onChange={this.handleChange}
                          placeholder="Account number"
                        />
                      </div>
                      <div className="hr-field">
                        <label>IFSC Code</label>
                        <input
                          type="text"
                          name="bankDetails.ifscCode"
                          value={form.bankDetails.ifscCode}
                          onChange={this.handleChange}
                          placeholder="IFSC"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hr-section">
                    <h3>Government IDs</h3>
                    <div className="hr-grid-3">
                      <div className="hr-field">
                        <label>PAN</label>
                        <input
                          type="text"
                          name="panNumber"
                          value={form.panNumber}
                          onChange={this.handleChange}
                          placeholder="PAN"
                        />
                      </div>
                      <div className="hr-field">
                        <label>PF</label>
                        <input
                          type="text"
                          name="pfNumber"
                          value={form.pfNumber}
                          onChange={this.handleChange}
                          placeholder="PF"
                        />
                      </div>
                      <div className="hr-field">
                        <label>UAN</label>
                        <input
                          type="text"
                          name="uanNumber"
                          value={form.uanNumber}
                          onChange={this.handleChange}
                          placeholder="UAN"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hr-section">
                    <h3>Attachments</h3>
                    <div className="hr-grid-2">
                      <div className="hr-field">
                        <label>Profile Picture</label>
                        <input
                          type="file"
                          name="profilePicture"
                          onChange={this.handleFileChange}
                          accept="image/*"
                        />
                        {form.profilePicture && (
                          <p className="hr-file-note">Selected: {form.profilePicture.name}</p>
                        )}
                      </div>
                      <div className="hr-field">
                        <label>Documents</label>
                        <input
                          type="file"
                          name="documents"
                          onChange={this.handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          multiple
                        />
                        {form.documents.length > 0 && (
                          <p className="hr-file-note">
                            Selected {form.documents.length} file(s): {Array.from(form.documents).map((f) => f.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hr-sticky-actions">
                    <button type="submit" className="hr-btn" disabled={loading}>
                      {loading ? "Creating Employee..." : "Create Employee"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default HRCreateEmployee;