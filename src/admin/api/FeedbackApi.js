// src/api/FeedbackApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class FeedbackApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/feedbacks`);
  }

  // Get all feedbacks with optional filters
  async getAllFeedbacks(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add optional parameters
    if (params.category) queryParams.append('category', params.category);
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isAnonymous !== undefined) queryParams.append('isAnonymous', params.isAnonymous);

    const url = queryParams.toString() ? `${this.endpoint}?${queryParams.toString()}` : this.endpoint;
    
    return this.fetchWithErrorHandling(url, {
      method: "GET",
    });
  }

  // Submit new feedback
  async createFeedback(feedbackData) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
  }

  // Get feedback summary (for HR/Admin)
  async getFeedbackSummary() {
    return this.fetchWithErrorHandling(`${this.endpoint}/summary`, {
      method: "GET",
    });
  }

  // Get analytics data (for HR/Admin)
  async getFeedbackAnalytics(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);

    const url = queryParams.toString() 
      ? `${this.endpoint}/analytics?${queryParams.toString()}`
      : `${this.endpoint}/analytics`;

    return this.fetchWithErrorHandling(url, {
      method: "GET",
    });
  }

  // Export feedbacks (for HR/Admin)
  async exportFeedbacks(format = 'csv', params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (params.category) queryParams.append('category', params.category);
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);

    const url = `${this.endpoint}/export?${queryParams.toString()}`;

    return this.fetchWithErrorHandling(url, {
      method: "GET",
    });
  }

  // Respond to feedback (for HR/Admin)
  async respondToFeedback(feedbackId, responseMessage) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${feedbackId}/respond`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: responseMessage }),
    });
  }
}

export default new FeedbackApi();