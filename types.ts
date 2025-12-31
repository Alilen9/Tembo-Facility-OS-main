
export enum JobStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum JobPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum UserRole {
  CLIENT = 'Client',
  TECHNICIAN = 'Technician',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin',
}

export enum BillingStatus {
  UNBILLED = 'Unbilled',
  PENDING = 'Pending',
  INVOICED = 'Invoiced',
  PAID = 'Paid',
}

export enum HoldReason {
  MISSING_EVIDENCE = 'Missing Evidence',
  PENDING_CLIENT_SIGN = 'Pending Client Signature',
  QC_AUDIT = 'Quality Audit Required',
  DISPUTE = 'Price Dispute',
  NONE = 'None',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  relatedCustomerId?: string;
  relatedTechnicianId?: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
  isCompleted: boolean;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Job {
  id: string;
  customerId: string;
  category?: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  dateCreated: string;
  scheduledDate?: string;
  technicianId?: string;
  estimatedDurationMinutes?: number;
  slaDeadline?: string;
  requiredSkills?: string[];
  requiredTools?: string[];
  tasks?: { id: string; label: string; isDone: boolean }[];
  price: number;
  billingStatus: BillingStatus;
  holdReason: HoldReason;
  daysOnHold?: number;
  
  timeline?: TimelineEvent[];
  workSummary?: string;
  materialsUsed?: Material[];
  proofImages?: {
    before?: string;
    after?: string;
  };
  complianceDocs?: {
    name: string;
    url: string;
    type: 'pdf' | 'img';
    issuedDate?: string;
  }[];
  
  userRating?: number;
  userFeedback?: string;
  techRating?: number;
  techFeedback?: string;
  
  aiAnalysis?: {
    summary: string;
    suggestedPriority: JobPriority;
    toolList: string[];
    estimatedHours: number;
  };

  auditStatus?: 'Pending' | 'Passed' | 'Failed';
  auditDate?: string;
  auditDefects?: string[];
  auditNotes?: string;
}

export interface Technician {
  id: string;
  name: string;
  skills: string[];
  status: 'Available' | 'On Job' | 'Offline';
  avatarUrl: string;
  phone?: string;
  auditPassRate?: number;
  recentDefects?: number;
}

export interface KPI {
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
  restrictedTo?: UserRole[];
}

export interface TargetChangeLog {
  id: string;
  serviceType: string;
  previousValue: number;
  newValue: number;
  changedBy: string;
  timestamp: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface ServiceTarget {
  serviceType: string;
  daily: number;
  weekly: number;
  monthly: number;
  historicalDailyAvg: number;
  allTimePeak?: number;
}

// Added missing interfaces used in constants.ts
export interface Invoice {
  id: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  dateIssued: string;
  dueDate: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  sla: string;
  isPopular?: boolean;
  features: { name: string; included: boolean }[];
}

export interface Contract {
  id: string;
  planId: string;
  status: 'Active' | 'Expired';
  startDate: string;
  renewalDate: string;
}

export type TimeRange = 'today' | 'yesterday' | 'this_week' | 'last_7_days' | 'this_month' | 'custom';

export const INITIAL_SERVICE_TARGETS: ServiceTarget[] = [
  { serviceType: 'Cleaning', daily: 45000, weekly: 250000, monthly: 1000000, historicalDailyAvg: 42000, allTimePeak: 68000 },
  { serviceType: 'Pest Control', daily: 30000, weekly: 180000, monthly: 750000, historicalDailyAvg: 28000, allTimePeak: 45000 },
  { serviceType: 'Handyman', daily: 60000, weekly: 350000, monthly: 1400000, historicalDailyAvg: 55000, allTimePeak: 92000 },
  { serviceType: 'Appliance Repair', daily: 40000, weekly: 220000, monthly: 900000, historicalDailyAvg: 38000, allTimePeak: 55000 },
  { serviceType: 'Construction', daily: 150000, weekly: 800000, monthly: 3500000, historicalDailyAvg: 120000, allTimePeak: 240000 },
  { serviceType: 'Moving Services', daily: 50000, weekly: 300000, monthly: 1200000, historicalDailyAvg: 48000, allTimePeak: 750000 },
];
