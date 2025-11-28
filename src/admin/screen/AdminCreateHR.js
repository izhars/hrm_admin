import React, { Component } from "react";
import Select from "react-select";
import { DepartmentsApi, AuthApi } from "../api";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import "../pages/admin-create-hr.css";

class AdminCreateHR extends Component {
  state = {
    departments: [],
    form: {
      employeeId: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "hr",
      department: "",
      designation: "",
      dateOfJoining: "",
      employmentType: "full-time",
      reportingManager: "NA",          // ✅ added
      weekendType: "sunday",           // ✅ added
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
    error: null,
    success: null,
    sidebarCollapsed: false,
    isDarkMode: false,
    admin: null,
    adminLoading: false
  };

  async componentDidMount() {
    this.setState({ loading: true });
    try {
      const departmentsRes = await DepartmentsApi.fetchDepartments();
      const departments = departmentsRes.success ? departmentsRes.departments : [];
      this.setState({
        departments,
        loading: false,
        error: departments.length === 0 ? "Failed to load departments" : null
      });
    } catch (error) {
      console.error("[AdminCreateHR] Error loading departments:", error);
      this.setState({
        error: "Failed to load departments: " + error.message,
        loading: false
      });
    }
  }

  handleMenuToggle = () => {
    this.setState(prev => ({ sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  handleThemeToggle = () => {
    this.setState(prev => ({ isDarkMode: !prev.isDarkMode }));
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const keys = name.split(".");
      this.setState(prevState => {
        const form = { ...prevState.form };
        let temp = form;
        for (let i = 0; i < keys.length - 1; i++) temp = temp[keys[i]];
        temp[keys[keys.length - 1]] = value;
        return { form };
      });
    } else {
      this.setState(prevState => ({
        form: { ...prevState.form, [name]: value }
      }));
    }
  };

  handleDepartmentChange = (selected) => {
    this.setState(prevState => ({
      form: { ...prevState.form, department: selected ? selected.label : "" }
    }));
  };

  handleMaritalStatusChange = (e) => {
    const value = e.target.value;
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        maritalStatus: value,
        marriageAnniversary: value === "married" ? prevState.form.marriageAnniversary : "",
        spouseDetails:
          value === "married"
            ? prevState.form.spouseDetails
            : { name: "", email: "", phone: "" }
      }
    }));
  };

  handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "profilePicture") {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          profilePicture: files && files.length > 0 ? files[0] : null
        }
      }));
    } else if (name === "documents") {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          documents: files && files.length > 0 ? Array.from(files) : []
        }
      }));
    }
  };

  buildFormData = () => {
    const formData = new FormData();
    const { form } = this.state;

    const appendData = (obj, prefix = "") => {
      for (let key in obj) {
        const value = obj[key];
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        )
          continue;

        if (typeof value === "object" && !(value instanceof File) && !Array.isArray(value)) {
          appendData(value, prefix + key + ".");
        } else if (Array.isArray(value)) {
          value.forEach((file, idx) => {
            if (file instanceof File) {
              formData.append(`${prefix}${key}[${idx}]`, file);
            }
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
      const {
        employeeId,
        email,
        password,
        firstName,
        lastName,
        department
      } = this.state.form;

      if (!employeeId || !email || !password || !firstName || !lastName || !department) {
        throw new Error("Please fill in all required fields");
      }

      const hasFiles =
        this.state.form.profilePicture || this.state.form.documents.length > 0;

      let response;
      const payload = {
        ...this.state.form,
        role: "hr",
        reportingManager: this.state.form.reportingManager || "NA",
        weekendType: this.state.form.weekendType || "sunday"
      };

      if (hasFiles) {
        const formData = this.buildFormData();
        if (!formData.get("reportingManager")) {
          formData.set("reportingManager", "NA");
        }
        if (!formData.get("weekendType")) {
          formData.set("weekendType", "sunday");
        }
        response = await AuthApi.registerHR(formData);
      } else {
        const { profilePicture, documents, ...jsonData } = payload;
        response = await AuthApi.registerHR(jsonData);
      }

      if (response.success) {
        this.setState({
          success: response.message || "HR account created successfully",
          loading: false
        });
        setTimeout(() => this.resetForm(), 2000);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      this.setState({
        error: error.message || "An unexpected error occurred",
        loading: false
      });
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
        role: "hr",
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
      backgroundColor: state.isSelected
        ? "#e0ecff"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: "#111827",
      cursor: "pointer"
    }),
    placeholder: (base) => ({ ...base, color: "#9ca3af" }),
    singleValue: (base) => ({ ...base, color: "#111827" }),
    valueContainer: (base) => ({ ...base, padding: "2px 4px" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      ":hover": { color: "#111827" }
    }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e5e7eb" })
  };

  render() {
    const {
      departments,
      form,
      loading,
      error,
      success,
      sidebarCollapsed,
      isDarkMode,
      admin,
      adminLoading
    } = this.state;

    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    const themeColors = {
      background: isDarkMode ? "#0f172a" : "#f8f9fa",
      cardBg: isDarkMode ? "#1e293b" : "white",
      textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
      textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
      border: isDarkMode ? "#334155" : "#e2e8f0"
    };

    if (adminLoading) {
      return (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: themeColors.background,
            color: themeColors.textPrimary
          }}
        >
          Loading...
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
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
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginLeft: sidebarWidth,
            transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
              overflow: "auto",
              paddingTop: "94px",
              backgroundColor: themeColors.background
            }}
          >
            <div className="hr-page" style={{ margin: 0, padding: "30px" }}>
              <div
                className="hr-card"
                style={{
                  backgroundColor: themeColors.cardBg,
                  border: isDarkMode ? `1px solid ${themeColors.border}` : "none",
                  color: themeColors.textPrimary
                }}
              >
                <div className="hr-card-header">
                  <h2 style={{ color: themeColors.textPrimary }}>Create HR Account</h2>
                  <p
                    className="hr-subtitle"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Add a new HR member to your organization
                  </p>
                </div>

                {error && <div className="hr-alert hr-alert-error">{error}</div>}
                {success && (
                  <div className="hr-alert hr-alert-success">{success}</div>
                )}

                <form
                  onSubmit={this.handleSubmit}
                  encType="multipart/form-data"
                  className="hr-form"
                >
                  {/* Basic Information */}
                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={this.handleChange}
                        placeholder="E.g. HR001"
                        required
                      />
                    </div>
                    <div className="hr-field">
                      <label>Designation</label>
                      <input
                        type="text"
                        name="designation"
                        value={form.designation}
                        onChange={this.handleChange}
                        placeholder="E.g. HR Manager"
                        required
                      />
                    </div>
                  </div>

                  <div className="hr-grid-2">
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
                  </div>

                  <div className="hr-grid-2">
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
                  </div>

                  <div className="hr-grid-2">
                    <div className="hr-field">
                      <label>Date of Joining</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={form.dateOfJoining}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div className="hr-field">
                      <label>Department</label>
                      <Select
                        options={departments.map((d) => ({
                          value: d.name,
                          label: d.name
                        }))}
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
                  </div>

                  <div className="hr-grid-2">
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
                      </select>
                    </div>

                    {/* Reporting Manager for HR (optional, text-based) */}
                    <div className="hr-field">
                      <label>Reporting Manager (optional)</label>
                      <input
                        type="text"
                        name="reportingManager"
                        value={form.reportingManager === "NA" ? "" : form.reportingManager}
                        onChange={this.handleChange}
                        placeholder="Manager Employee ID or ObjectId (optional)"
                      />
                      <small
                        style={{
                          color: themeColors.textSecondary,
                          fontSize: "12px",
                          marginTop: "5px",
                          display: "block"
                        }}
                      >
                        Leave empty if HR should not report to anyone (will be stored as
                        NA / null in backend)
                      </small>
                    </div>
                  </div>

                  {/* Weekend Type */}
                  <div className="hr-grid-1">
                    <div className="hr-field">
                      <label>Weekend Type</label>
                      <select
                        name="weekendType"
                        value={form.weekendType}
                        onChange={this.handleChange}
                      >
                        <option value="sunday">Sunday Only</option>
                        <option value="saturday_sunday">Saturday & Sunday</option>
                      </select>
                      <small
                        style={{
                          color: themeColors.textSecondary,
                          fontSize: "12px",
                          marginTop: "5px",
                          display: "block"
                        }}
                      >
                        Select the weekly off days for this HR
                      </small>
                    </div>
                  </div>

                  {/* Personal Information */}
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
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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

                  {/* Address */}
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

                  {/* Government IDs */}
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

                  {/* Attachments */}
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
                          <p className="hr-file-note">
                            Selected: {form.profilePicture.name}
                          </p>
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
                            Selected {form.documents.length} file(s):{" "}
                            {Array.from(form.documents)
                              .map((f) => f.name)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hr-sticky-actions">
                    <button type="submit" className="hr-btn" disabled={loading}>
                      {loading ? "Creating HR Account..." : "Create HR Account"}
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

export default AdminCreateHR;
