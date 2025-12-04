// src/api/common/ApiBase.js
class ApiBase {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.defaultHeaders = { "Content-Type": "application/json" };
  }

  getAuthToken() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found. Please log in again.");
    if (!token.includes(".")) {
      this.clearAuth();
      throw new Error("Invalid token format. Please log in again.");
    }
    return token;
  }

  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async fetchWithErrorHandling(url, options = {}) {
    try {
      // 🔹 Skip token for login, register, forgot-password, reset-password
      const isAuthFreeRoute =
        url.includes("/login") ||
        url.includes("/register") ||
        url.includes("/forgot-password") ||
        url.includes("/reset-password");

      let headers = { ...this.defaultHeaders };
      let token = null;

      if (!isAuthFreeRoute) {
        try {
          token = this.getAuthToken();
        } catch (err) {
          throw err;
        }
      }

      // 🔹 Handle FormData
      if (options.body instanceof FormData) headers = {};

      headers = {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        if (response.status === 401) {
          this.clearAuth();
          throw new Error("Session expired. Please log in again.");
        }
        if (response.status === 403) throw new Error(errorData.message || "Access denied.");
        if (response.status === 400 && errorData.errors)
          throw new Error(JSON.stringify(errorData.errors));

        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json"))
        return { success: true, data: null };

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch"))
        throw new Error("Network error. Check connection.");
      if (error.name === "AbortError") throw new Error("Request was cancelled.");
      throw error;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token && token.includes(".");
  }

  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  }
}

export default ApiBase;