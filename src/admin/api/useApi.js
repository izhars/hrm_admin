// // src/api/useApi.js
// const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// // Centralized API URL groups
// const ENDPOINTS = {
//   auth: `${BASE_URL}/auth`,
//   employees: `${BASE_URL}/employees`,
//   dashboard: `${BASE_URL}/dashboard`,
//   attendance: `${BASE_URL}/attendance`,
//   leaves: `${BASE_URL}/leaves`,
//   payroll: `${BASE_URL}/payroll`,
//   departments: `${BASE_URL}/departments`,
//   announcements: `${BASE_URL}/announcements`,
//   assets: `${BASE_URL}/assets`,
// };

// class ApiService {
//   constructor() {
//     this.defaultHeaders = { "Content-Type": "application/json" };
//   }

//   getAuthToken() {
//     const token = localStorage.getItem("token");
//     if (!token) throw new Error("Authentication token not found. Please log in again.");
//     if (!token.includes(".")) {
//       this.clearAuth();
//       throw new Error("Invalid token format. Please log in again.");
//     }
//     return token;
//   }

//   clearAuth() {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//   }

//   async fetchWithErrorHandling(url, options = {}) {
//     try {
//       const token = options.headers?.Authorization ? null : this.getAuthToken();
//       let headers = { ...this.defaultHeaders };

//       if (options.body instanceof FormData) headers = {}; // Let browser handle multipart/form-data

//       headers = {
//         ...headers,
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers,
//       };

//       const response = await fetch(url, { ...options, headers });

//       if (!response.ok) {
//         let errorData;
//         try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }

//         if (response.status === 401) {
//           this.clearAuth();
//           throw new Error("Session expired. Please log in again.");
//         }
//         if (response.status === 403) throw new Error(errorData.message || "Access denied.");
//         if (response.status === 400 && errorData.errors) throw new Error(JSON.stringify(errorData.errors));

//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }

//       const contentType = response.headers.get("content-type");
//       if (!contentType?.includes("application/json")) return { success: true, data: null };

//       const data = await response.json();
//       return { success: true, data };
//     } catch (error) {
//       if (error.name === "TypeError" && error.message.includes("fetch")) throw new Error("Network error. Check connection.");
//       if (error.name === "AbortError") throw new Error("Request was cancelled.");
//       throw error;
//     }
//   }

//   // ===== AUTH =====
//   async login(credentials) {
//     try {
//       const result = await this.fetchWithErrorHandling(`${ENDPOINTS.auth}/login`, {
//         method: "POST",
//         body: JSON.stringify(credentials),
//       });

//       if (result.success && result.data?.token && result.data?.user) {
//         localStorage.setItem("token", result.data.token);
//         localStorage.setItem("user", JSON.stringify(result.data.user));
//       }

//       return result.success
//         ? { success: true, ...result.data }
//         : { success: false, message: result.data?.message || "Login failed" };
//     } catch (error) {
//       return { success: false, message: error.message || "Login failed" };
//     }
//   }

//   async registerEmployee(employeeData) {
//     try {
//       const token = this.getAuthToken();
//       const isFormData = employeeData instanceof FormData;

//       const options = {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: isFormData ? employeeData : JSON.stringify({ ...employeeData, role: employeeData.role || "employee" }),
//       };
//       if (!isFormData) options.headers['Content-Type'] = 'application/json';

//       const result = await this.fetchWithErrorHandling(`${ENDPOINTS.auth}/register`, options);
//       return result.success ? { success: true, ...result.data } : { success: false, message: result.data?.message };
//     } catch (error) {
//       let message = error.message;
//       if (message.startsWith('{')) {
//         try { message = Object.values(JSON.parse(message)).join(', '); } catch {}
//       }
//       return { success: false, message };
//     }
//   }

//   async registerHR(hrData) {
//     try {
//       const token = this.getAuthToken();
//       const result = await this.fetchWithErrorHandling(`${ENDPOINTS.auth}/register`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({ ...hrData, role: "hr" }),
//       });
//       return result.success ? { success: true, ...result.data } : { success: false, message: result.data?.message };
//     } catch (error) {
//       return { success: false, message: error.message || "Failed to create HR account" };
//     }
//   }

//   async getMe() {
//     try {
//       const result = await this.fetchWithErrorHandling(`${ENDPOINTS.auth}/me`, { method: "GET" });
//       if (result.success && result.data?.user) localStorage.setItem("user", JSON.stringify(result.data.user));
//       return { success: result.success, ...result.data };
//     } catch (error) {
//       if (error.message.includes("Session expired")) this.clearAuth();
//       return { success: false, message: error.message || "Failed to fetch profile" };
//     }
//   }

//   async logout() {
//     try {
//       await this.fetchWithErrorHandling(`${ENDPOINTS.auth}/logout`, { method: "POST" });
//     } catch (error) {
//       console.warn("Logout error:", error.message);
//     } finally {
//       this.clearAuth();
//       return { success: true, message: "Logged out successfully" };
//     }
//   }

//   isAuthenticated() {
//     const token = localStorage.getItem("token");
//     return !!token && token.includes(".");
//   }

//   getCurrentUser() {
//     try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
//   }

//   // ===== DASHBOARD =====
//   getDashboardStats() { return this.fetchWithErrorHandling(`${ENDPOINTS.dashboard}/stats`); }
//   getAttendanceOverview(params = {}) {
//     const query = new URLSearchParams(params).toString();
//     return this.fetchWithErrorHandling(`${ENDPOINTS.dashboard}/attendance-overview?${query}`);
//   }
//   getLeaveOverview(params = {}) {
//     const query = new URLSearchParams(params).toString();
//     return this.fetchWithErrorHandling(`${ENDPOINTS.dashboard}/leave-overview?${query}`);
//   }
//   getEmployeeGrowth(params = {}) {
//     const query = new URLSearchParams(params).toString();
//     return this.fetchWithErrorHandling(`${ENDPOINTS.dashboard}/employee-growth?${query}`);
//   }

//   // ===== EMPLOYEES =====
//   async getAllEmployees() {
//     try {
//       const result = await this.fetchWithErrorHandling(`${ENDPOINTS.dashboard}/all-employee`);
//       return { success: result.success, employees: result.data?.employees || [], ...result.data };
//     } catch (error) { return { success: false, message: error.message, employees: [] }; }
//   }

//   async getEmployeeById(id) {
//     if (!id) return { success: false, message: "Employee ID is required" };
//     return this.fetchWithErrorHandling(`${ENDPOINTS.dashboard}/all-employee/${id}`);
//   }

//   // ===== DEPARTMENTS =====
//   async getAllDepartments() {
//     try {
//       const token = this.getAuthToken();
//       const result = await this.fetchWithErrorHandling(`${ENDPOINTS.departments}`, {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       });
//       return result.success
//         ? { success: true, departments: result.data?.departments || [], count: result.data?.count || 0 }
//         : { success: false, message: result.data?.message || "No departments found", departments: [] };
//     } catch (error) {
//       return { success: false, message: error.message, departments: [] };
//     }
//   }

//   // ===== ATTENDANCE =====
//   async getAttendanceRecords(employeeId, params = {}) {
//     const query = new URLSearchParams(params).toString();
//     return this.fetchWithErrorHandling(`${ENDPOINTS.attendance}${employeeId ? `/${employeeId}` : ''}?${query}`);
//   }

//   // ===== LEAVES =====
//   async getLeaveRequests(status = 'pending') {
//     return this.fetchWithErrorHandling(`${ENDPOINTS.leaves}?status=${status}`);
//   }
//   async createLeaveRequest(leaveData) {
//     return this.fetchWithErrorHandling(`${ENDPOINTS.leaves}`, { method: "POST", body: JSON.stringify(leaveData) });
//   }

//   // Get all departments
//   async getAll(isActive) {
//     const url = isActive !== undefined ? `${this.endpoint}?isActive=${isActive}` : this.endpoint;
//     const res = await this.fetchWithErrorHandling(url, { method: 'GET' });
//     return res.data;
//   }

//   // Get single department
//   async getById(id) {
//     const url = `${this.endpoint}/${id}`;
//     const res = await this.fetchWithErrorHandling(url, { method: 'GET' });
//     return res.data;
//   }

//   // Create a new department
//   async create({ name, code, description, head }) {
//     const res = await this.fetchWithErrorHandling(this.endpoint, {
//       method: 'POST',
//       body: JSON.stringify({ name, code, description, head }),
//     });
//     return res.data;
//   }

//   // Update a department
//   async update(id, data) {
//     const url = `${this.endpoint}/${id}`;
//     const res = await this.fetchWithErrorHandling(url, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//     return res.data;
//   }

//   // Delete a department
//   async delete(id) {
//     const url = `${this.endpoint}/${id}`;
//     const res = await this.fetchWithErrorHandling(url, { method: 'DELETE' });
//     return res.data;
//   }
// }

// // Export singleton instance
// const apiService = new ApiService();
// export default apiService;
