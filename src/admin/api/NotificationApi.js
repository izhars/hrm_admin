// src/api/NotificationApi.js
import { BASE_URL } from './config';
import ApiBase from './ApiBase';

class NotificationApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/notifications`);
  }

  async getMyNotifications({ page = 1, limit = 10, type, read } = {}) {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    if (type) params.append('type', type);
    if (read !== undefined && read !== '') params.append('read', read);
    
    return this.fetchWithErrorHandling(`${this.endpoint}/me?${params}`);
  }

  async markAsRead(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async markAllAsRead() {
    return this.fetchWithErrorHandling(`${this.endpoint}/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async deleteNotification(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async deleteMultiple(ids) {
    return this.fetchWithErrorHandling(`${this.endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
  }
}

export default new NotificationApi();
