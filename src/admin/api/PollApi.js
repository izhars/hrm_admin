import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

class PollApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/polls`);
  }

  // Create a new poll
  async create(data) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get all polls
  async getAll() {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "GET",
    });
  }

  // Get a single poll by ID
  async getById(pollId) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${pollId}`, {
      method: "GET",
    });
  }

  // Update a poll
  async update(pollId, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${pollId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Vote on a poll
  async vote(pollId, optionIndex) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${pollId}/vote`, {
      method: "POST",
      body: JSON.stringify({ optionIndex }),
    });
  }

  // Delete a poll (for admin)
  async delete(pollId) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${pollId}`, {
      method: "DELETE",
    });
  }

  // Close a poll
  async close(pollId) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${pollId}/close`, {
      method: "POST",
    });
  }
}

export default new PollApi();
