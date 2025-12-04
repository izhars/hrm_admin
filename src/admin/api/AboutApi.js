// src/api/AboutApi.js
import ApiBase from "./ApiBase";
import { BASE_URL } from "./config";

class AboutApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/about`);
  }

  // Get all about page data
  async getAboutInfo() {
    return await this.fetchWithErrorHandling(`${this.endpoint}`, {
      method: 'GET',
    });
  }

  // Create about content (admin only)
  async createAboutContent(aboutData) {
    return await this.fetchWithErrorHandling(`${this.endpoint}/content`, {
      method: 'POST',
      body: JSON.stringify(aboutData),
    });
  }

  // Update about content (admin only)
  async updateAboutContent(aboutData) {
    return await this.fetchWithErrorHandling(`${this.endpoint}/content`, {
      method: 'PUT',
      body: JSON.stringify(aboutData),
    });
  }

  // Add team member with image (admin only)
  async addTeamMember(memberData, imageUri) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(memberData).forEach(key => {
      formData.append(key, memberData[key]);
    });
    
    // Add image if exists
    if (imageUri) {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: imageUri,
        name: `photo_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });
    }
    
    return await this.fetchWithErrorHandling(`${this.endpoint}/team`, {
      method: 'POST',
      body: formData,
    });
  }

  // Update team member (admin only)
  async updateTeamMember(id, memberData, imageUri = null) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(memberData).forEach(key => {
      formData.append(key, memberData[key]);
    });
    
    // Add image if exists
    if (imageUri) {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: imageUri,
        name: `photo_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });
    }
    
    return await this.fetchWithErrorHandling(`${this.endpoint}/team/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  // Delete team member (admin only)
  async deleteTeamMember(id) {
    return await this.fetchWithErrorHandling(`${this.endpoint}/team/${id}`, {
      method: 'DELETE',
    });
  }

  // Update timeline item (admin only)
  async updateTimelineItem(id, timelineData) {
    return await this.fetchWithErrorHandling(`${this.endpoint}/timeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(timelineData),
    });
  }

  // Update stat item (admin only)
  async updateStatItem(id, statData) {
    return await this.fetchWithErrorHandling(`${this.endpoint}/stats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statData),
    });
  }
}

export default new AboutApi();