// src/api/AuthApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class AuthApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/auth`);
  }

  async login(credentials) {
    try {
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (result.success && result.data?.token && result.data?.user) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      return result.success
        ? { success: true, ...result.data }
        : { success: false, message: result.data?.message || "Login failed" };
    } catch (error) {
      return { success: false, message: error.message || "Login failed" };
    }
  }

  async registerEmployee(employeeData) {
    try {
      const isFormData = employeeData instanceof FormData;
      const options = {
        method: "POST",
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
        body: isFormData ? employeeData : JSON.stringify({ ...employeeData, role: employeeData.role || "employee" }),
      };
      if (!isFormData) options.headers['Content-Type'] = 'application/json';

      const result = await this.fetchWithErrorHandling(`${this.endpoint}/register`, options);
      return result.success ? { success: true, ...result.data } : { success: false, message: result.data?.message };
    } catch (error) {
      let message = error.message;
      if (message.startsWith('{')) {
        try { message = Object.values(JSON.parse(message)).join(', '); } catch { }
      }
      return { success: false, message };
    }
  }

  async getManagers() {
    try {
      console.log("[getManagers] ➤ Fetching managers...");

      const url = `${this.endpoint}/manager`;
      const result = await this.fetchWithErrorHandling(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[getManagers] result:", result);

      if (result.success) {
        console.log("[getManagers] ✅ Managers fetched successfully");
        return { success: true, data: result.data?.data || result.data };
      } else {
        console.warn("[getManagers] ⚠️ Failed to fetch managers:", result.data?.message);
        return { success: false, message: result.data?.message };
      }
    } catch (error) {
      console.error("[getManagers] ❌ Error:", error);
      return { success: false, message: error.message || "Failed to fetch managers" };
    }
  }

  // api/index.js or wherever your API class is
  async toggleVerification(userId, isVerified) {
    const url = `${BASE_URL}/auth/verify/${userId}`;
    const payload = { isVerified };

    try {
      console.log("Toggling verification:");
      console.log("URL:", url);
      console.log("Payload:", payload);

      const result = await this.fetchWithErrorHandling(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log("Server response:", result);
      return result;
    } catch (error) {
      console.error("Error toggling verification:", error);
      return { success: false, message: error.message };
    }
  }


  async registerHR(hrData) {
    try {
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.getAuthToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...hrData, role: "hr" }),
      });
      return result.success ? { success: true, ...result.data } : { success: false, message: result.data?.message };
    } catch (error) {
      return { success: false, message: error.message || "Failed to create HR account" };
    }
  }

  async getMe() {
    try {
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/me`, { method: "GET" });
      if (result.success && result.data?.user) localStorage.setItem("user", JSON.stringify(result.data.user));
      return { success: result.success, ...result.data };
    } catch (error) {
      if (error.message.includes("Session expired")) this.clearAuth();
      return { success: false, message: error.message || "Failed to fetch profile" };
    }
  }

  async logout() {
    try {
      await this.fetchWithErrorHandling(`${this.endpoint}/logout`, { method: "POST" });
    } catch (error) {
      console.warn("Logout error:", error.message);
    } finally {
      this.clearAuth();
      return { success: true, message: "Logged out successfully" };
    }
  }

  async resetDevice(employeeId) {
    try {
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/reset-device/${employeeId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      return result.success
        ? { success: true, message: result.data?.message || "Device reset successfully" }
        : { success: false, message: result.data?.message || "Failed to reset device" };
    } catch (error) {
      return { success: false, message: error.message || "Error resetting device" };
    }
  }
}


export default new AuthApi();