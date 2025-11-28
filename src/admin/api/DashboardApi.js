// src/api/DashboardApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class DashboardApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/dashboard`);
  }

  async getDashboardStats() {
    return this.fetchWithErrorHandling(`${this.endpoint}/stats`);
  }

  async getAttendanceOverview(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.fetchWithErrorHandling(`${this.endpoint}/attendance-overview?${query}`);
  }

  async getLeaveOverview(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.fetchWithErrorHandling(`${this.endpoint}/leave-overview?${query}`);
  }

  async getEmployeeGrowth(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.fetchWithErrorHandling(`${this.endpoint}/employee-growth?${query}`);
  }
}

export default new DashboardApi();