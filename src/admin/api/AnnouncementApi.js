// src/api/AnnouncementApi.js
import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

class AnnouncementApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/announcements`);
  }

  // 🟩 Get all announcements
  async getAll() {
    return this.fetchWithErrorHandling(`${this.endpoint}`, { method: "GET" });
  }

  // 🟩 Get single announcement
  async getById(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, { method: "GET" });
  }

  // 🟩 Create new announcement
  async create(data) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 🟩 Update announcement
  async update(id, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 🟩 Delete announcement (soft delete)
  async delete(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
  }
}

export default new AnnouncementApi();
