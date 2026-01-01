// /home/msft/web-projects/vite/Tembo-Facility-OS-main-1/services/alertService.ts

export enum AlertType {
  SLA_BREACH = 'SLA_BREACH',
  SAFETY_INCIDENT = 'SAFETY_INCIDENT',
  BILLING_RISK = 'BILLING_RISK',
  STALLED_JOB = 'STALLED_JOB'
}

export interface GlobalAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  priority: 'emergency' | 'critical' | 'warning';
  ownerId?: string;
  ownerName?: string;
  linkId?: string;
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const API_URL = '/api/alerts'; // Adjust if your API is on a different port/host

export const alertService = {
  getActiveAlerts: async (): Promise<GlobalAlert[]> => {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },

  claimAlert: async (alertId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${alertId}/claim`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to claim alert');
  },

  resolveAlert: async (alertId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${alertId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to resolve alert');
  }
};
