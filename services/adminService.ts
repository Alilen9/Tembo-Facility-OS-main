import apiClient from '../client/apiClient';
import { Job, User } from '../types';

export interface AdminDashboardStats {
  slaBreaches: number;
  activeTechs: number;
  liveOpsStatus: 'Optimal' | 'Warning' | 'Critical';
  safetyIndex: number;
}

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data;
  },

  // Dispatch Console: Get all active jobs
  getDispatchJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/admin/dispatch-jobs');
    return response.data;
  },

  // Get Technicians for assignment/monitoring
  getTechnicians: async (): Promise<(User & { status: string })[]> => {
    const response = await apiClient.get('/admin/technicians');
    return response.data;
  },

  // Assign Technician
  assignTechnician: async (jobId: string, technicianId: string) => {
    const response = await apiClient.put(`/admin/jobs/${jobId}/assign`, { technicianId });
    return response.data;
  },

  // Enroll a new technician
  enrollTechnician: async (data: any) => {
    const response = await apiClient.post('/admin/technicians', data);
    return response.data;
  },

  checkNationalId: async (id: string): Promise<boolean> => {
    // Simulate backend validation check
    await new Promise(resolve => setTimeout(resolve, 500));
    const EXISTING_IDS = ['12345678', '87654321'];
    return EXISTING_IDS.includes(id);
  },

  getMessages: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/messages');
    return response.data;
  },

  replyToMessage: async (id: string, message: string) => {
    const response = await apiClient.post(`/admin/messages/${id}/reply`, { message });
    return response.data;
  },

  resolveTicket: async (id: string) => {
    const response = await apiClient.put(`/admin/messages/${id}/resolve`);
    return response.data;
  },

  getUpgradeRequests: async (page = 1, limit = 10): Promise<{ requests: any[], total: number, page: number, totalPages: number }> => {
    const response = await apiClient.get(`/admin/upgrades?page=${page}&limit=${limit}`);
    return response.data;
  },

  getApartments: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/apartments');
    return response.data;
  },

  addApartment: async (data: any) => {
    const response = await apiClient.post('/admin/apartments', data);
    return response.data;
  }
};
  
