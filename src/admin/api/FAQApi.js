// src/api/FAQApi.js
import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

/**
 * @class FAQApi
 * @extends ApiBase
 * @description Handles all FAQ-related HTTP requests
 */
class FAQApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/faqs`);
  }

  // ==================== CATEGORIES ====================

  getAllCategories() {
    return this.fetchWithErrorHandling(`${this.endpoint}/category`, {
      method: "GET",
    });
  }

  getAllFaq(){
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "GET",
       });
  }

  addCategory(data) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateCategory(categoryId, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  deleteCategory(categoryId) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${categoryId}`, {
      method: "DELETE",
    });
  }

  addFaq(categoryId, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${categoryId}/faqs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateFaq(faqId, data) {
    return this.fetchWithErrorHandling(`${this.endpoint}/faq/${faqId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  deleteFaq(faqId) {
    return this.fetchWithErrorHandling(`${this.endpoint}/faq/${faqId}`, {
      method: "DELETE",
    });
  }

  reorderFaqs(categoryId, orderList) {
    return this.fetchWithErrorHandling(`${this.endpoint}/${categoryId}/faqs/reorder`, {
      method: "POST",
      body: JSON.stringify({ order: orderList }),
    });
  }

  searchFaqs({ q, category, tags, language, page, limit } = {}) {
    const searchParams = new URLSearchParams();
    if (q) searchParams.append("q", q);
    if (category) searchParams.append("category", category);
    if (tags) searchParams.append("tags", tags);
    if (language) searchParams.append("language", language);
    if (page) searchParams.append("page", page);
    if (limit) searchParams.append("limit", limit);

    const url = `${this.endpoint}/search${searchParams.toString() ? `?${searchParams}` : ""}`;

    return this.fetchWithErrorHandling(url, {
      method: "GET",
    });
  }
}

// Singleton export
const faqApi = new FAQApi();
export default faqApi;