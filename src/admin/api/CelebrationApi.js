// src/api/CelebrationApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class CelebrationApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/celebrations`);
  }

  async getAllUpcoming() {
    const url = `${this.endpoint}/all-upcoming`;
    return this.fetchWithErrorHandling(url, { method: 'GET' });
  }

  async getAllToday() {
    const url = `${this.endpoint}/all-today`;
    return this.fetchWithErrorHandling(url, { method: 'GET' });
  }
}

// Export a single instance (this is what 99% of apps do)
export default new CelebrationApi();