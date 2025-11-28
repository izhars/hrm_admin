// src/api/LeavesApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class LeavesApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/leaves`);
  }

  // Fetch all leaves (for employees)
  async getMyLeaves({ status, year } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (year) params.append('year', year);
    
    const url = `${this.endpoint}?${params.toString()}`;
    const res = await this.fetchWithErrorHandling(url, { method: 'GET' });
    return res.success
      ? { success: true, leaves: res.data?.leaves || [], count: res.data?.count || 0 }
      : { success: false, message: res.data?.message || "No leaves found", leaves: [] };
  }

  // Fetch leave by ID
  async getLeave(id) {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}`, { method: 'GET' });
    return res;
  }

  // Apply for a leave
  async applyLeave({ leaveType, startDate, endDate, reason, documents }) {
    const res = await this.fetchWithErrorHandling(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({ leaveType, startDate, endDate, reason, documents }),
    });
    return res;
  }

  // Get leave balance
  async getLeaveBalance() {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/balance`, { method: 'GET' });
    return res;
  }

  // Cancel leave - FIXED
  // async cancelLeave(id, cancellationReason = null) {
  //   const body = cancellationReason ? JSON.stringify({ cancellationReason }) : undefined;
  //   const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}/cancel`, {
  //     method: 'PUT',
  //     body,
  //   });
  //   return res;
  // }

  // Fetch pending leaves (for managers/HR)
  async getPendingLeaves({ department } = {}) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    
    const url = `${this.endpoint}/pending/all?${params.toString()}`;
    const res = await this.fetchWithErrorHandling(url, { method: 'GET' });
    return res.success
      ? { success: true, leaves: res.data?.leaves || [], count: res.data?.count || 0 }
      : { success: false, message: res.data?.message || "No pending leaves found", leaves: [] };
  }

  // NEW: Get all leaves for admin dashboard
  async getAllLeaves({ department, status, year } = {}) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (status) params.append('status', status);
    if (year) params.append('year', year);
    
    const url = `${this.endpoint}/all?${params.toString()}`;
    const res = await this.fetchWithErrorHandling(url, { method: 'GET' });
    return res.success
      ? { success: true, leaves: res.data?.leaves || [], count: res.data?.count || 0 }
      : { success: false, message: res.data?.message || "No leaves found", leaves: [] };
  }

  // Approve leave
  async approveLeave(id) {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}/approve`, {
      method: 'PUT',
    });
    return res;
  }

  // Reject leave - FIXED JSON.stringify typo
  async rejectLeave(id, rejectionReason) {
    const res = await this.fetchWithErrorHandling(`${this.endpoint}/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }), // Fixed typo: was JSON.stringifynitz
    });
    return res;
  }
}

export default new LeavesApi();
