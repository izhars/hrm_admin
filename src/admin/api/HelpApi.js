// src/api/HelpApi.js
import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

/**
 * @class HelpApi
 * @extends ApiBase
 * @description Handles all Help/Support topic-related HTTP requests
 */
class HelpApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/help-topics`);
  }

  // ==================== TOPICS ====================

  getAllTopics({ page, limit } = {}) {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const url = `${this.endpoint}${params.toString() ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling(url, { method: "GET" });
  }

  getTopicById(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, { method: "GET" });
  }

  addTopic(data) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateTopic(id, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  deleteTopic(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, { method: "DELETE" });
  }
}

// Singleton export
const helpApi = new HelpApi();
export default helpApi;
