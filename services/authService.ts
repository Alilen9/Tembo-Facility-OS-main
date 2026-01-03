import apiClient from '../client/apiClient';
import { UserRole } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: UserRole, company: string) => {
    const response = await apiClient.post('/auth/register', { 
      name, email, password, role, company 
    });
    return response.data;
  }
};