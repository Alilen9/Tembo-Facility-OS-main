import React, { useState, useEffect } from 'react';

import { Dashboard } from './components/Dashboard';

import { JobDetail } from './components/JobDetail';
import { CreateRequestModal } from './components/CreateRequestModal';


import { MobileTechApp } from './components/mobile/MobileTechApp';
import { BillingReport } from './components/client/BillingReport';

import { SuperAdminDashboard } from './components/SuperAdminDashboard';

import { LoginScreen } from './components/LoginScreen';
import { AccessDenied } from './components/AccessDenied';
import { AuthProvider, useAuth } from './components/AuthContext';
import { BillingContainer } from './components/client/BillingContainer';
import { Job, JobPriority, JobStatus, UserRole, BillingStatus, HoldReason } from './types';
import { MOCK_JOBS } from './constants';
import { WorkOrderList } from './components/mobile/WorkOrderList';
import { AdminDispatchConsole } from './components/admin/AdminDispatchConsole';
import { QualityControlView } from './components/admin/QualityControlView';
import toast, { Toaster } from 'react-hot-toast';
import { ClientRequests } from './components/client/ClientRequests';
import { clientService } from './services/clientService';
import { ResponsiveLayout } from './components/ResponsiveLayout';

import { YieldLedger } from './components/YieldLedger';
import { DispatchModal } from './components/admin/DispatchModal';
import { EnrollTechnicianPage } from './components/admin/EnrollTechnicianPage';
import { TechnicianUpgradePage } from './components/ClientUpgradePage';
import AdminChatPage from './components/admin/AdminChatPage';
import OpsApartmentsPage from './components/admin/OpsApartmentsPage';
import { TechniciansPage } from './components/admin/TechniciansPage';




type Tab =
  | 'dashboard'
  | 'jobs'
  | 'admin-dispatch'
  | 'quality-control'
  | 'mobile-tech'
  | 'billing'
  | 'billing-report'
  | 'strategic-tower'
  | 'enroll-technician'
  | 'technician-upgrades'
  | 'yield-ledger'
  | 'admin-chat'
  | 'ops-apartments'
  | 'technicians';
  
  


const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dispatchJob, setDispatchJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  useEffect(() => {
    if (user?.role === UserRole.TECHNICIAN) {
      setActiveTab('mobile-tech');
    } else if (user?.role === UserRole.SUPER_ADMIN && activeTab === 'dashboard') {
      setActiveTab('strategic-tower');
    }
  }, [user]);

   const selectedJobId = selectedJob?.id || null;

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    if (selectedJob?.id === updatedJob.id) setSelectedJob(updatedJob);
  };
  const handleCreateRequest = async (data: { title: string; description: string; priority: JobPriority; category: string; location: string; preferredTime: string }) => {
    try {
      const newJob = await clientService.createJob(data);
      setJobs([newJob, ...jobs]);
      return newJob.id;
    } catch (error) {
      console.error(error);
      toast.error('Failed to create request');
      return null;
    }
  };

  const handleAssignTech = (jobId: string, technicianId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedJob: Job = {
      ...job,
      technicianId,
      status: job.status === JobStatus.PENDING ? JobStatus.SCHEDULED : job.status,
      timeline: [
        ...(job.timeline || []),
        {
          status: 'Technician Assigned',
          timestamp: new Date().toISOString(),
          isCompleted: true,
          note: 'Assigned via Command Console',
        },
      ],
    };

    handleUpdateJob(updatedJob);
  };

  const handleTrackNewRequest = (data: any) => {
    let priority = JobPriority.MEDIUM;
    if (data.urgency === 'low') priority = JobPriority.LOW;
    if (data.urgency === 'high') priority = JobPriority.HIGH;
    if (data.urgency === 'critical') priority = JobPriority.CRITICAL;

    const newJob: Job = {
      id: `j${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: user?.relatedCustomerId || 'c1',
      category: data.category?.toUpperCase() || 'GENERAL',
      title: `${data.category?.toUpperCase() || 'GENERAL'} Service Request`,
      description: data.description || 'Reported issue via portal.',
      status: JobStatus.PENDING,
      priority,
      dateCreated: new Date().toISOString(),
      timeline: [{ status: 'Request Received', timestamp: new Date().toISOString(), isCompleted: true }],
      price: 0,
      billingStatus: BillingStatus.UNBILLED,
      holdReason: HoldReason.NONE,
      preferredTime: '',
      location: ''
    };

    setJobs([newJob, ...jobs]);
    setActiveTab('jobs');
    setSelectedJob(newJob);
    setIsCreateModalOpen(false);
  };

  const handleNavigate = (tab: Tab) => {
    if (user?.role === UserRole.TECHNICIAN && tab === 'dashboard') {
      setActiveTab('mobile-tech');
      return;
    }
    setActiveTab(tab);
    setSelectedJob(null);
  };

  /* MOBILE TECH */
  if (activeTab === 'mobile-tech') {
    if (![UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user!.role)) {
      return <AccessDenied message="Only technicians can access the mobile app view." />;
    }
    return (
      <ResponsiveLayout activeTab={activeTab} onNavigate={handleNavigate}>
        <MobileTechApp onLogout={logout} />
      </ResponsiveLayout>
    );
  }

  /* ADMIN PROTECTION */
  if (['admin-dispatch', 'quality-control', 'strategic-tower', 'enroll-technician'].includes(activeTab)) {
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user!.role)) {
      return (
        <ResponsiveLayout activeTab={activeTab} onNavigate={handleNavigate}>
          <AccessDenied message="You need higher privileges to access this control center." />
        </ResponsiveLayout>
      );
    }
  }

  return (
    <>
      <ResponsiveLayout activeTab={activeTab} onNavigate={handleNavigate}>

        {activeTab === 'dashboard' && (
          <Dashboard
            onIntervene={() => setActiveTab('admin-dispatch')}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeTab === 'strategic-tower' && <SuperAdminDashboard />}

        {activeTab === 'jobs' && (
          <div className="flex h-[calc(100vh-8rem)] gap-6">
            <div className={`flex-1 overflow-y-auto ${selectedJobId ? 'hidden lg:block' : 'w-full'}`}>
              <ClientRequests
                selectedJobId={selectedJobId}
                onSelectJob={(job) => setSelectedJob(job)}
              />
            </div>

            {selectedJobId && selectedJob && (
              <div className="w-full lg:w-[450px] lg:shrink-0 animate-slide-in h-full">
                <JobDetail
                  job={selectedJob}
                  onClose={() => setSelectedJob(null)}
                  onUpdateJob={handleUpdateJob}
                  onIntervene={(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) ? (job) => setDispatchJob(job) : undefined}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin-dispatch' && (
          <AdminDispatchConsole
            onDispatchClick={(job) => setDispatchJob(job)}
            onAssignTech={handleAssignTech}
          />
        )}

        {activeTab === 'quality-control' && <QualityControlView />}

        {activeTab === 'enroll-technician' && <EnrollTechnicianPage onNavigate={(tab) => handleNavigate(tab as Tab)} />}
         {activeTab === 'technicians' && <TechniciansPage />}
      
        {activeTab === 'admin-chat' && <AdminChatPage />}

        {activeTab === 'technician-upgrades' && <TechnicianUpgradePage />}
        {activeTab === 'yield-ledger' && <YieldLedger />}
        

        

        {/* ====== BILLING ====== */}
        {activeTab === 'billing' && <BillingContainer />}

         {activeTab === 'ops-apartments' && <OpsApartmentsPage />}

        {activeTab === 'billing-report' && (
          <BillingReport onBack={() => setActiveTab('billing')} />

        )}

      </ResponsiveLayout>

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRequest}
        onTrack={handleTrackNewRequest}
      />

      <DispatchModal
        job={dispatchJob}
        isOpen={!!dispatchJob}
        onClose={() => setDispatchJob(null)}
        onAssign={handleAssignTech}
      />
    </>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();
  return user ? <AuthenticatedApp /> : <LoginScreen />;
};

const App: React.FC = () => (
  <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#7A9AC7', // bg-gray-800
          color: '#F9FAFB', // text-gray-50
          border: '1px solid #374151', // border-gray-700
        },
      }} />
    <Main />
  </AuthProvider>
);

export default App;
