import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

class BadgeApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/badges`);
  }

  // Create a new badge (supports FormData uploads)
  async createBadge(formData) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        body: formData,
        // Do not set Content-Type for FormData (browser adds boundary automatically)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating badge:", error);
      throw new Error("Failed to create badge");
    }
  }

  // Fetch all badges
  async getBadges() {
    try {
      const response = await fetch(this.endpoint);
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching badges:", error);
      throw new Error("Failed to fetch badges");
    }
  }

  // Delete a badge by ID
  async deleteBadge(badgeId) {
    try {
      const response = await fetch(`${this.endpoint}/${badgeId}`, {
        method: "DELETE",
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting badge:", error);
      throw new Error("Failed to delete badge");
    }
  }

  // Helper for consistent response handling
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "API error");
    return data;
  }
}

export default new BadgeApi();
