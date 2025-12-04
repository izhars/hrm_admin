import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

class ComboApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/combooff`);
  }

  // -------------------------
  // HR/Admin APIs
  // -------------------------

  // Fetch all combo offs (optional status filter)
  async getAllComboOffs(status = "") {
    const url = status ? `${this.endpoint}?status=${status}` : this.endpoint;
    return this.fetchWithErrorHandling(url);
  }

  // Approve or reject a combo off
  async reviewComboOff(comboOffId, action) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${comboOffId}/review`, {
      method: "PUT",
      body: JSON.stringify({ action }),
    });
  }

  // Get monthly summary
  async getMonthlyComboOffSummary(month, year) {
    
    try {
      const response = await this.fetchWithErrorHandling(
        `${this.endpoint}/summary/monthly?month=${month}&year=${year}`
      );
      
      return response;
    } catch (error) {
      console.error("Error fetching monthly combo off summary:", error);
      throw error;
    }
  }

  // Get a single combo off by ID (optional detail view)
  async getComboOffById(comboOffId) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${comboOffId}`);
  }
}

export default new ComboApi();
