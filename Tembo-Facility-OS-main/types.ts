
export enum JobStatus {
  PENDING = 'Pending',
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
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
  ADMIN = 'Ops Admin',
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
