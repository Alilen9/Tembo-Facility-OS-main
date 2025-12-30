
import { Customer, Job, JobPriority, JobStatus, Technician, KPI, Invoice, Contract, PricingPlan, BillingStatus, HoldReason } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Acme Corp HQ', address: '123 Enterprise Blvd, Tech City', phone: '555-0101', email: 'facilities@acme.com' },
  { id: 'c2', name: 'Global Logistics Inc.', address: '456 Warehouse Way, Logistics Hub', phone: '555-0102', email: 'ops@globallogistics.com' },
  { id: 'c3', name: 'Retail Properties Group', address: '789 Mall Strip, Commerce Town', phone: '555-0103', email: 'maintenance@rpgroup.com' },
];

export const MOCK_TECHNICIANS: Technician[] = [
  { id: 't1', name: 'John Doe', skills: ['HVAC', 'Electrical'], status: 'Available', avatarUrl: 'https://i.pravatar.cc/150?u=t1', phone: '555-0199' },
  { id: 't2', name: 'Jane Smith', skills: ['Plumbing', 'Gas'], status: 'On Job', avatarUrl: 'https://i.pravatar.cc/150?u=t2', phone: '555-0198' },
  { id: 't3', name: 'Mike Johnson', skills: ['Electrical', 'Security Systems'], status: 'Available', avatarUrl: 'https://i.pravatar.cc/150?u=t3', phone: '555-0197' },
  { id: 't4', name: 'Sarah Williams', skills: ['HVAC', 'Refrigeration'], status: 'Offline', avatarUrl: 'https://i.pravatar.cc/150?u=t4', phone: '555-0196' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j101',
    customerId: 'c1',
    category: 'HVAC',
    title: 'HVAC Unit 4 Malfunction',
    description: 'The main HVAC unit on the 4th floor is making a loud grinding noise and not cooling effectively.',
    status: JobStatus.IN_PROGRESS,
    priority: JobPriority.HIGH,
    dateCreated: '2023-10-25T08:30:00Z',
    slaDeadline: '2023-10-25T16:30:00Z',
    technicianId: 't1',
    price: 12500,
    billingStatus: BillingStatus.UNBILLED,
    holdReason: HoldReason.NONE,
    requiredSkills: ['HVAC'],
    requiredTools: ['Refrigerant Gauges', 'Multimeter', 'Socket Set (Imperial)', 'Ladder (10ft)'],
    tasks: [
      { id: 't1', label: 'Check refrigerant levels', isDone: false },
      { id: 't2', label: 'Inspect compressor for noise', isDone: false },
      { id: 't3', label: 'Clean condenser coils', isDone: false },
      { id: 't4', label: 'Test thermostat cycle', isDone: false }
    ],
    timeline: [
      { status: 'Request Received', timestamp: '2023-10-25T08:30:00Z', isCompleted: true },
      { status: 'Technician Assigned', timestamp: '2023-10-25T09:00:00Z', isCompleted: true, note: 'John Doe assigned.' },
      { status: 'En Route', timestamp: '2023-10-25T09:30:00Z', isCompleted: true, note: 'ETA 15 mins' },
      { status: 'Work In Progress', timestamp: '2023-10-25T09:45:00Z', isCompleted: true, note: 'Diagnosing compressor issue.' },
      { status: 'Completion', timestamp: '', isCompleted: false },
    ]
  },
  {
    id: 'j102',
    customerId: 'c2',
    category: 'General',
    title: 'Loading Dock Door Repair',
    description: 'Bay 3 roll-up door is stuck halfway. Needs urgent repair as it is blocking shipments.',
    status: JobStatus.SCHEDULED,
    priority: JobPriority.CRITICAL,
    dateCreated: '2023-10-25T09:15:00Z',
    slaDeadline: '2023-10-25T13:15:00Z',
    technicianId: 't2',
    price: 8500,
    billingStatus: BillingStatus.UNBILLED,
    holdReason: HoldReason.NONE,
    requiredSkills: ['General', 'Electrical'],
    requiredTools: ['Pry Bar', 'Impact Driver', 'Chain Lube', 'Safety Cones'],
    tasks: [
      { id: 't1', label: 'Secure area with cones', isDone: false },
      { id: 't2', label: 'Inspect track alignment', isDone: false },
      { id: 't3', label: 'Test motor functionality', isDone: false },
      { id: 't4', label: 'Lubricate rollers', isDone: false }
    ],
    timeline: [
      { status: 'Request Received', timestamp: '2023-10-25T09:15:00Z', isCompleted: true },
      { status: 'Technician Assigned', timestamp: '2023-10-25T09:30:00Z', isCompleted: true },
      { status: 'Scheduled', timestamp: '2023-10-25T14:00:00Z', isCompleted: false, note: 'Waiting for specialized parts.' },
    ]
  },
  {
    id: 'j103',
    customerId: 'c3',
    category: 'Security',
    title: 'Routine Fire Alarm Inspection',
    description: 'Quarterly inspection of fire alarm systems in the North Wing retail spaces.',
    status: JobStatus.PENDING,
    priority: JobPriority.LOW,
    dateCreated: '2023-10-24T10:00:00Z',
    slaDeadline: '2023-10-27T10:00:00Z',
    price: 4500,
    billingStatus: BillingStatus.UNBILLED,
    holdReason: HoldReason.NONE,
    requiredSkills: ['Security Systems', 'Electrical'],
    requiredTools: ['Smoke Tester', 'Ladder', 'Log Book'],
    tasks: [],
    timeline: [
       { status: 'Request Received', timestamp: '2023-10-24T10:00:00Z', isCompleted: true },
       { status: 'Awaiting Assignment', timestamp: '', isCompleted: false },
    ]
  },
  {
    id: 'j104',
    customerId: 'c1',
    category: 'Plumbing',
    title: 'Leaking Sink in Breakroom',
    description: 'Kitchen sink in the 2nd floor breakroom is dripping constantly. Staff reported water pooling on the floor.',
    status: JobStatus.COMPLETED,
    priority: JobPriority.MEDIUM,
    dateCreated: '2023-10-20T11:45:00Z',
    technicianId: 't1',
    price: 6200,
    billingStatus: BillingStatus.INVOICED,
    holdReason: HoldReason.NONE,
    requiredSkills: ['Plumbing'],
    requiredTools: ['Wrench', 'Plumbers Putty'],
    tasks: [{id: '1', label: 'Fix sink', isDone: true}],
    proofImages: {
      before: 'https://images.unsplash.com/photo-1585129777179-72f5d47d4982?auto=format&fit=crop&q=80&w=400',
      after: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    },
    workSummary: 'Diagnosed active leak at the P-trap junction. Disassembled the drain pipe assembly and identified worn compression washers. Replaced P-trap and washers with new 1.5" PVC kit. Resealed threads with teflon tape. Tested system with 5 minutes of continuous hot water flow - no leaks detected. Dried area.',
    materialsUsed: [
      { id: 'm1', name: 'PVC P-Trap Kit 1.5"', quantity: 1, unit: 'kit' },
      { id: 'm2', name: 'Compression Washers', quantity: 2, unit: 'pc' },
      { id: 'm3', name: 'Teflon Tape', quantity: 1, unit: 'roll' }
    ],
    complianceDocs: [
      { name: 'Water Safety Check.pdf', url: '#', type: 'pdf', issuedDate: '2023-10-20' },
      { name: 'Work Authorization.jpg', url: '#', type: 'img', issuedDate: '2023-10-20' }
    ],
    userRating: 4,
    timeline: [
      { status: 'Request Received', timestamp: '2023-10-20T11:45:00Z', isCompleted: true },
      { status: 'Completed', timestamp: '2023-10-20T14:30:00Z', isCompleted: true },
    ]
  },
  {
    id: 'j105',
    customerId: 'c2',
    category: 'Electrical',
    title: 'Exterior Lighting Repair',
    description: 'Parking lot floodlight is flickering.',
    status: JobStatus.COMPLETED,
    priority: JobPriority.MEDIUM,
    dateCreated: '2023-10-24T12:00:00Z',
    technicianId: 't3',
    price: 3800,
    billingStatus: BillingStatus.PENDING,
    holdReason: HoldReason.MISSING_EVIDENCE,
    daysOnHold: 2,
    timeline: [
      { status: 'Request Received', timestamp: '2023-10-24T12:00:00Z', isCompleted: true },
      { status: 'Completed', timestamp: '2023-10-24T15:00:00Z', isCompleted: true },
    ]
  },
  {
    id: 'j106',
    customerId: 'c3',
    category: 'HVAC',
    title: 'Filter Replacement',
    description: 'Monthly routine HVAC filter swap.',
    status: JobStatus.COMPLETED,
    priority: JobPriority.LOW,
    dateCreated: '2023-10-23T08:00:00Z',
    technicianId: 't4',
    price: 1500,
    billingStatus: BillingStatus.PENDING,
    holdReason: HoldReason.PENDING_CLIENT_SIGN,
    daysOnHold: 4,
    timeline: [
      { status: 'Request Received', timestamp: '2023-10-23T08:00:00Z', isCompleted: true },
      { status: 'Completed', timestamp: '2023-10-23T10:00:00Z', isCompleted: true },
    ]
  }
];

export const MOCK_KPIS: KPI[] = [
  { label: 'Revenue (MTD)', value: 'KES 12.4M', trend: 12, trendLabel: 'vs last month' },
  { label: 'Active Jobs', value: '42', trend: 5, trendLabel: 'vs yesterday' },
  { label: 'Avg Response Time', value: '45m', trend: -8, trendLabel: 'improvement' },
  { label: 'Tech Utilization', value: '87%', trend: 2, trendLabel: 'vs last week' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2023-006', amount: 8200, status: 'Unpaid', dateIssued: '2023-10-26', dueDate: '2023-11-26', description: 'Auto-generated from Job #j104 (Breakroom Plumbing)' },
  { id: 'INV-2023-005', amount: 45000, status: 'Unpaid', dateIssued: '2023-10-25', dueDate: '2023-11-25', description: 'Monthly Professional Care - October' },
  { id: 'INV-2023-004', amount: 18500, status: 'Overdue', dateIssued: '2023-09-25', dueDate: '2023-10-25', description: 'Emergency HVAC Repair (Parts Only) - Job #j098' },
  { id: 'INV-2023-003', amount: 45000, status: 'Paid', dateIssued: '2023-09-25', dueDate: '2023-10-25', description: 'Monthly Professional Care - September' },
  { id: 'INV-2023-002', amount: 45000, status: 'Paid', dateIssued: '2023-08-25', dueDate: '2023-09-25', description: 'Monthly Professional Care - August' },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Care',
    price: 15000,
    billingCycle: 'Month / Location',
    description: 'Essential maintenance for small offices and budgets.',
    sla: '48h Response (No Guarantee)',
    features: [
      { name: 'Client Dashboard Access', included: true },
      { name: 'Recurring Service Schedule', included: true },
      { name: 'Manual Dispatch', included: true },
      { name: 'In-App Chat Support', included: false },
      { name: 'SLA Breach Alerts', included: false },
      { name: 'Emergency Priority', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Professional Care',
    price: 45000,
    billingCycle: 'Month / Location',
    description: 'Complete accountability and operational peace of mind.',
    sla: 'Same/Next Day Response',
    isPopular: true,
    features: [
      { name: 'Full Dashboard & Ticketing', included: true },
      { name: 'In-App Chat Support', included: true },
      { name: 'SLA Tracking & Compliance', included: true },
      { name: 'Automated Invoicing', included: true },
      { name: 'Quality Audits', included: true },
      { name: 'Emergency Priority', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium Care',
    price: 120000,
    billingCycle: 'Month / Portfolio',
    description: 'Maximum control, speed, and priority for corporate needs.',
    sla: '2-4h Emergency Response',
    features: [
      { name: 'Everything in Professional', included: true },
      { name: '2-4h Emergency Priority', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Senior Technician Access', included: true },
      { name: 'Custom SLA Terms', included: true },
      { name: 'Preventive Logic', included: true },
    ]
  }
];

export const MOCK_CONTRACT: Contract = {
  id: 'CTR-2023-A',
  planId: 'pro',
  status: 'Active',
  startDate: '2023-01-01',
  renewalDate: '2024-01-01',
};
