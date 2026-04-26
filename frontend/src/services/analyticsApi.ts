import axios from 'axios';
import type { RapportAnalytics, AnalyticsFilters } from '../types/analytics-new';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const analyticsApi = {
  /**
   * Get full analytics/rapport data for a company
   */
  getRapport: async (filters?: AnalyticsFilters): Promise<RapportAnalytics> => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.jobId) params.append('jobId', String(filters.jobId));
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const query = params.toString() ? `?${params.toString()}` : '';

      const response = await axios.get<{ success: boolean; data: RapportAnalytics }>(
        `${API_BASE_URL}/analytics/rapport${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.data?.generatedAt || 'Failed to fetch analytics');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching rapport analytics:', error);
      throw error;
    }
  },

  /**
   * Get KPIs only (lighter request)
   */
  getKPIs: async (filters?: AnalyticsFilters) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.jobId) params.append('jobId', String(filters.jobId));

      const query = params.toString() ? `?${params.toString()}` : '';

      const response = await axios.get(
        `${API_BASE_URL}/analytics/kpis${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  },

  /**
   * Export analytics as CSV or PDF
   */
  exportRapport: async (format: 'csv' | 'pdf', filters?: AnalyticsFilters) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      params.append('format', format);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.jobId) params.append('jobId', String(filters.jobId));

      const response = await axios.get(
        `${API_BASE_URL}/analytics/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error exporting rapport:', error);
      throw error;
    }
  },
};
