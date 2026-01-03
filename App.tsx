import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
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

import { YieldLedger } from './components/YieldLedger';
import { DispatchModal } from './components/admin/DispatchModal';

import { TechnicianUpgradePage } from './components/clientUpgradePage';
import { EnrollTechnicianPage } from './components/mobile/EnrollTechnicianPage';



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


const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
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

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
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
    setSelectedJobId(newJob.id);
    setIsCreateModalOpen(false);
  };

  const handleNavigate = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedJobId(null);
  };

  /* MOBILE TECH */
  if (activeTab === 'mobile-tech') {
    if (![UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user!.role)) {
      return <AccessDenied message="Only technicians can access the mobile app view." />;
    }
    return (
      <Layout activeTab={activeTab} onNavigate={handleNavigate}>
        <MobileTechApp onLogout={logout} />
      </Layout>
    );
  }

  /* ADMIN PROTECTION */
  if (['admin-dispatch', 'quality-control', 'strategic-tower', 'enroll-technician'].includes(activeTab)) {
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user!.role)) {
      return (
        <Layout activeTab={activeTab} onNavigate={handleNavigate}>
          <AccessDenied message="You need higher privileges to access this control center." />
        </Layout>
      );
    }
  }

  return (
    <>
      <Layout activeTab={activeTab} onNavigate={handleNavigate}>

        {activeTab === 'dashboard' && (
          <Dashboard
            onIntervene={() => setActiveTab('admin-dispatch')}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeTab === 'strategic-tower' && <SuperAdminDashboard />}

        {activeTab === 'jobs' && (
          <div className="flex h-[calc(100vh-8rem)] gap-6">
            <div className={`flex-1 ${selectedJobId ? 'lg:w-1/2' : 'w-full'}`}>
              <WorkOrderList
                selectedJobId={selectedJobId}
                onSelectJob={(job) => setSelectedJobId(job.id)}
              />
            </div>

            {selectedJobId && selectedJob && (
              <div className="w-full lg:w-[450px] animate-slide-in">
                <JobDetail
                  job={selectedJob}
                  onClose={() => setSelectedJobId(null)}
                  onUpdateJob={handleUpdateJob}
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

        {activeTab === 'enroll-technician' && <EnrollTechnicianPage />}
        {activeTab === 'technician-upgrades' && <TechnicianUpgradePage />}
        {activeTab === 'yield-ledger' && <YieldLedger />}

        

        {/* ====== BILLING ====== */}
        {activeTab === 'billing' && <BillingContainer />}
         
        {activeTab === 'billing-report' && (
          <BillingReport onBack={() => setActiveTab('billing')} />

        )}
        

      </Layout>

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
    <Main />
  </AuthProvider>
);

export default App;
