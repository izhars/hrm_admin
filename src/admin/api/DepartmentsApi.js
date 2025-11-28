import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class DepartmentsApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/departments`);
  }

  // ✅ Fetch all departments (with optional filter)
  async getAll(isActive) {
    const url = isActive !== undefined ? `${this.endpoint}?isActive=${isActive}` : this.endpoint;
    const res = await this.fetchWithErrorHandling(url, { method: 'GET' });
    return res.success
      ? { success: true, departments: res.data?.departments || [], count: res.data?.count || 0 }
      : { success: false, message: res.data?.message || "No departments found", departments: [] };
  }

  // ✅ Fetch single department
  async getById(id) {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}`, { method: 'GET' });
    return res;
  }

  // ✅ Create department
  async create({ name, code, description, head }) {
    const res = await this.fetchWithErrorHandling(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({ name, code, description, head }),
    });
    return res;
  }

  // ✅ Update department
  async update(id, data) {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  }

  // ✅ Delete department
  async delete(id) {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}`, { method: 'DELETE' });
    return res;
  }

  // ✅ NEW METHOD: Fetch main list
  async fetchDepartments() {
    const res = await this.fetchWithErrorHandling(this.endpoint, { method: 'GET' });

    return res.success
      ? {
          success: true,
          count: res.data?.count || 0,
          departments: res.data?.departments || [],
        }
      : { success: false, message: res.data?.message || "Failed to fetch departments" };
  }

  // 🔥 ✅ NEW: Toggle Department Active/Inactive
  async toggleStatus(id) {
    const res = await this.fetchWithErrorHandling(
      `${this.endpoint}/${id}/toggle-status`,
      { method: 'PUT' }
    );
    return res;
  }
}

export default new DepartmentsApi();
