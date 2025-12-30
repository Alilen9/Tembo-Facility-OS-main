import apiClient from '../client/apiCient';
import { Job, JobPriority } from '../types';

export interface ClientStats {
  activeJobsCount: number;
  pendingActionsCount: number;
  totalSpend: number;
  recentJobs: Job[];
}

export interface PaginatedJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export const clientService = {
  getProfile: async () => {
    const response = await apiClient.get('/client/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; company?: string }) => {
    const response = await apiClient.put('/client/profile', data);
    return response.data;
  },

  getDashboardStats: async (): Promise<ClientStats> => {
    const response = await apiClient.get('/client/dashboard-stats');
    return response.data;
  },

  createJob: async (jobData: { title: string; description: string; priority: JobPriority; category: string; location: string; preferredTime: string }) => {
    const response = await apiClient.post('/client/jobs', jobData);
    return response.data;
  },

  getJobs: async (page = 1, limit = 10, search = ''): Promise<PaginatedJobsResponse> => {
    const response = await apiClient.get(`/client/jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return response.data;
  }
};