import { BASE_URL } from "./config";
import ApiBase from "./ApiBase"; // assuming you have this base class

class AwardApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/awards`);
  }

  // Get all awards (HR+)
  async getAwards(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.fetchWithErrorHandling(`${this.endpoint}?${query}`);
  }

  // Get my awards (any logged-in user)
  async getMyAwards() {
    return this.fetchWithErrorHandling(`${this.endpoint}/me`);
  }

  // Create award
  async createAward(data) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update award
  async updateAward(id, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete award
  async deleteAward(id) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
  }
}

export default new AwardApi();