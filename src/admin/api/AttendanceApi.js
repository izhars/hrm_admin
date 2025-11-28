// src/api/AttendanceApi.js
import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

class AttendanceApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/attendance`);
  }

  // ✅ Get attendance records (optionally by employeeId or filters)
  async getAttendanceRecords(employeeId, params = {}) {
    try {
      console.log("🟢 [getAttendanceRecords] Called with:");
      console.log("   Employee ID:", employeeId);
      console.log("   Params:", params);

      const query = new URLSearchParams(params).toString();
      const url = employeeId ? `${this.endpoint}/${employeeId}` : this.endpoint;
      const fullUrl = query ? `${url}?${query}` : url;

      console.log("   Final Request URL:", fullUrl);

      const response = await this.fetchWithErrorHandling(fullUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ [getAttendanceRecords] Response received:", response);
      return response;

    } catch (error) {
      console.error("❌ [getAttendanceRecords] Error:", error);
      throw error;
    }
  }


  // ✅ Mark attendance (check-in / check-out)
  async markAttendance(attendanceData) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
    });
  }

  // ✅ Get daily attendance records (defaults to today)
  async getTodayAttendance() {
    try {
      const url = `${this.endpoint}/today-all`;
      const result = await this.fetchWithErrorHandling(url, { method: "GET" });
      return result;
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      return { success: false, message: error.message };
    }
  }

  async getAttendanceByDate(date) {
    try {
      const formattedDate = date || this.getCurrentDate();
      const url = `${this.endpoint}/attendance-all?date=${formattedDate}`;
      const result = await this.fetchWithErrorHandling(url, { method: "GET" });
      return result;
    } catch (error) {
      console.error("❌ [getAttendanceByDate] Error fetching attendance:", error);
      return { success: false, message: error.message };
    }
  }

  // Add this method to your existing AttendanceApi class
  async getEmployeeAttendance(employeeId) {
    try {
      const url = `${this.endpoint}/employee/${employeeId}`;
      return await this.fetchWithErrorHandling(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("❌ Error fetching employee attendance:", error);
      return { success: false, message: error.message };
    }
  }


  // ✅ Optional: Fetch summarized attendance data (for dashboard)
  async getAttendanceSummary(date) {
    try {
      const formattedDate = date || new Date().toISOString().split("T")[0];
      const url = `${this.endpoint}/summary?date=${formattedDate}`;

      return await this.fetchWithErrorHandling(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to fetch attendance summary",
      };
    }
  }
}

export default new AttendanceApi();
