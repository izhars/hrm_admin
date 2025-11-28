// src/api/HolidayApi.js
import ApiBase from './ApiBase';
import { BASE_URL } from './config';

class HolidayApi extends ApiBase {
  constructor() {
    super(`${BASE_URL}/holidays`);
  }

  // Get all holidays with filtering and pagination
  async getHolidays(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.type) params.append('type', filters.type);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const queryString = params.toString();
      const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      const result = await this.fetchWithErrorHandling(url);
      return {
        success: result.success,
        holidays: result.data?.data || [],
        pagination: result.data?.pagination || {},
        filters: result.data?.filters || {},
        ...result.data
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message, 
        holidays: [] 
      };
    }
  }

  // Get holidays for a specific year
  async getHolidaysByYear(year, queryParams = {}) {
    try {
      if (!year) {
        return { success: false, message: "Year is required" };
      }
      
      const params = new URLSearchParams();
      if (queryParams.type) params.append('type', queryParams.type);
      if (queryParams.month) params.append('month', queryParams.month);
      
      const queryString = params.toString();
      const url = queryString 
        ? `${this.endpoint}/year/${year}?${queryString}` 
        : `${this.endpoint}/year/${year}`;
      
      const result = await this.fetchWithErrorHandling(url);
      return {
        success: result.success,
        year: result.data?.year,
        count: result.data?.count || 0,
        holidays: result.data?.data || [],
        ...result.data
      };
    } catch (error) {
      return { success: false, message: error.message, holidays: [] };
    }
  }

  // Get upcoming holidays (next 30 days)
  async getUpcomingHolidays() {
    try {
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/upcoming`);
      return {
        success: result.success,
        period: result.data?.period,
        count: result.data?.count || 0,
        holidays: result.data?.data || [],
        ...result.data
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message, 
        holidays: [] 
      };
    }
  }

  // Get holidays by type
  async getHolidaysByType(type) {
    try {
      if (!type) {
        return { success: false, message: "Type is required" };
      }
      
      const result = await this.fetchWithErrorHandling(`${this.endpoint}/type/${type}`);
      return {
        success: result.success,
        type: result.data?.type,
        count: result.data?.count || 0,
        holidays: result.data?.data || [],
        ...result.data
      };
    } catch (error) {
      return { success: false, message: error.message, holidays: [] };
    }
  }

  // Get single holiday by ID
  async getHolidayById(id) {
    if (!id) {
      return { success: false, message: "Holiday ID is required" };
    }
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`);
  }

  // Create single or multiple holidays (HR access)
  async createHoliday(holidayData) {
    return this.fetchWithErrorHandling(this.endpoint, {
      method: "POST",
      body: JSON.stringify(holidayData)
    });
  }

  // Update holiday (HR access)
  async updateHoliday(id, holidayData) {
    if (!id) {
      return { success: false, message: "Holiday ID is required" };
    }
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(holidayData)
    });
  }

  // Delete holiday (soft delete - HR access)
  async deleteHoliday(id) {
    if (!id) {
      return { success: false, message: "Holiday ID is required" };
    }
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}`, {
      method: "DELETE"
    });
  }

  // Bulk import holidays (Superadmin access only)
  async bulkImportHolidays(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.fetchWithErrorHandling(`${this.endpoint}/bulk-import`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData - let browser set it with boundary
      }
    });
  }

  // Export holidays (Superadmin access only)
  async exportHolidays(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.format) queryParams.append('format', params.format);
      if (params.year) queryParams.append('year', params.year);
      
      const url = queryParams.toString() 
        ? `${this.endpoint}/export?${queryParams.toString()}` 
        : `${this.endpoint}/export`;
      
      // For file downloads, you might need to handle response differently
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`, // Assuming token handling in ApiBase
        }
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObj;
      link.download = `holidays_export_${params.year || 'all'}.${params.format || 'csv'}`;
      link.click();
      window.URL.revokeObjectURL(urlObj);
      
      return { success: true, message: 'Export initiated' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get holiday statistics (Superadmin access)
  async getHolidayStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      
      const url = params.toString() 
        ? `${this.endpoint}/stats?${params.toString()}` 
        : `${this.endpoint}/stats`;
      
      const result = await this.fetchWithErrorHandling(url);
      return {
        success: result.success,
        stats: result.data?.stats || {},
        dateDistribution: result.data?.dateDistribution || [],
        ...result.data
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Permanent delete holiday (Superadmin access only)
  async permanentDeleteHoliday(id) {
    if (!id) {
      return { success: false, message: "Holiday ID is required" };
    }
    return this.fetchWithErrorHandling(`${this.endpoint}/${id}/permanent`, {
      method: "DELETE"
    });
  }

  // Get dashboard holidays (similar to employees dashboard endpoint)
  async getDashboardHolidays() {
    try {
      const result = await this.fetchWithErrorHandling(`${BASE_URL}/dashboard/holidays`);
      return { 
        success: result.success, 
        holidays: result.data?.holidays || [], 
        ...result.data 
      };
    } catch (error) {
      return { success: false, message: error.message, holidays: [] };
    }
  }
}

export default new HolidayApi();