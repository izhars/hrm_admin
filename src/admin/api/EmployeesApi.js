// src/api/EmployeesApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class EmployeesApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/employees`);
  }

  async getAllEmployees() {
    try {
      const result = await this.fetchWithErrorHandling(this.endpoint);
      return { success: result.success, employees: result.data?.employees || [], ...result.data };
    } catch (error) {
      return { success: false, message: error.message, employees: [] };
    }
  }

  // ✅ FIXED: Get last seen information for an employee
  async getLastSeen(employeeId) {
    if (!employeeId) return { success: false, message: "Employee ID is required" };

    try {
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/${employeeId}/last-seen`);
      return result;
    } catch (error) {
      console.error('Error fetching last seen:', error);
      return { success: false, message: error.message };
    }
  }

  async getEmployeeById(id) {
    if (!id) return { success: false, message: "Employee ID is required" };
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`);
  }

  async createEmployee(employeeData) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(employeeData)
    });
  }

  async updateEmployee(id, employeeData) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData)
    });
  }

  async deleteEmployee(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "DELETE"
    });
  }
}

export default new EmployeesApi();