import apiClient from '../client/apiClient';
import { Job, JobStatus, Technician } from '../types';

export const technicianService = {
  getMyJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/technician/jobs');
    return response.data;
  },

  getAvailableJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/technician/available-jobs');
    return response.data;
  },

  claimJob: async (jobId: string) => {
    const response = await apiClient.put(`/technician/jobs/${jobId}/claim`);
    return response.data;
  },

  updateJobProgress: async (
    jobId: string, 
    status: JobStatus, 
    timelineEvent: { status: string; note?: string; isCompleted?: boolean }
  ) => {
    const response = await apiClient.put(`/technician/jobs/${jobId}/update`, {
      status,
      timelineEvent: {
        ...timelineEvent,
        isCompleted: true
      }
    });
    return response.data;
  }
  , // Add this to your technicianService object
  uploadEvidence: async (jobId: number | string, file: File, type: 'BEFORE' | 'AFTER') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    // Replace 'axios' with your HTTP client if different
    const response = await apiClient.post(`/technician/jobs/${jobId}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getJobsAwaitingAudit: async (): Promise<Job[]> => {
    const response = await apiClient.get('/admin/audit-queue');
    return response.data;
  },

  getAllTechnicians: async (): Promise<Technician[]> => {
    const response = await apiClient.get('/admin/technicians');
    return response.data;
  },

  verifyAudit: async (jobId: string, status: 'Passed' | 'Failed', notes?: string) => {
    const response = await apiClient.put(`/admin/jobs/${jobId}/audit`, { status, notes });
    return response.data;
  },

  getAllJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/admin/jobs');
    return response.data;
  }
  
};
