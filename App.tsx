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
import {
  Job,
  JobPriority,
  JobStatus,
  UserRole,
  BillingStatus,
  HoldReason,
} from './types';
import { MOCK_JOBS } from './constants';
import { WorkOrderList } from './components/mobile/WorkOrderList';
import { AdminDispatchConsole } from './components/admin/AdminDispatchConsole';
import { QualityControlView } from './components/admin/QualityControlView';

import { YieldLedger } from './components/YieldLedger';
import { DispatchModal } from './components/admin/DispatchModal';
import { EnrollTechnicianPage } from './components/admin/EnrollTechnicianPage';
import { TechnicianUpgradePage } from './components/ClientUpgradePage';
import AdminChatPage from './components/admin/AdminChatPage';
import OpsApartmentsPage from './components/admin/OpsApartmentsPage';



/* ✅ FIXED TAB TYPE */
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
  | 'ops-apartments';
  


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
    } else if (user?.role === UserRole.SUPER_ADMIN) {
      setActiveTab('strategic-tower');
    }
  }, [user]);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map(j => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleAssignTech = (jobId: string, technicianId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    handleUpdateJob({
      ...job,
      technicianId,
      status:
        job.status === JobStatus.PENDING
          ? JobStatus.SCHEDULED
          : job.status,
    });
  };

  const handleTrackNewRequest = (data: any) => {
    const newJob: Job = {
      id: `j${Math.floor(Math.random() * 9000)}`,
      customerId: user?.relatedCustomerId || 'c1',
      category: data.category || 'GENERAL',
      title: 'Service Request',
      description: data.description || '',
      status: JobStatus.PENDING,
      priority: JobPriority.MEDIUM,
      dateCreated: new Date().toISOString(),
      timeline: [],
      price: 0,
      billingStatus: BillingStatus.UNBILLED,
      holdReason: HoldReason.NONE,
      preferredTime: ''
    };

    setJobs([newJob, ...jobs]);
    setActiveTab('jobs');
  };

  const handleNavigate = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedJobId(null);
  };

  /* MOBILE TECH */
  if (activeTab === 'mobile-tech') {
    if (user?.role !== UserRole.TECHNICIAN) {
      return <AccessDenied message="Technicians only." />;
    }
    return (
      <Layout activeTab={activeTab} onNavigate={handleNavigate}>
        <MobileTechApp onLogout={logout} />
      </Layout>
    );
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
          <div className="flex gap-6">
            <WorkOrderList
              selectedJobId={selectedJobId}
              onSelectJob={job => setSelectedJobId(job.id)}
            />
            {selectedJob && (
              <JobDetail
                job={selectedJob}
                onClose={() => setSelectedJobId(null)}
                onUpdateJob={handleUpdateJob}
              />
            )}
          </div>
        )}

        {activeTab === 'admin-dispatch' && (
          <AdminDispatchConsole
            onDispatchClick={setDispatchJob}
            onAssignTech={handleAssignTech}
          />
        )}

        {activeTab === 'quality-control' && <QualityControlView />}

        {activeTab === 'enroll-technician' && <EnrollTechnicianPage />}
      
        {activeTab === 'admin-chat' && <AdminChatPage />}

        {activeTab === 'technician-upgrades' && <TechnicianUpgradePage />}

        {activeTab === 'yield-ledger' && <YieldLedger />}

        {activeTab === 'billing' && <BillingContainer />}

         {activeTab === 'ops-apartments' && <OpsApartmentsPage />}

        {activeTab === 'billing-report' && (
          <BillingReport onBack={() => setActiveTab('billing')} />
        )}
      </Layout>

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTrack={handleTrackNewRequest} onSubmit={function (data: { title: string; description: string; priority: JobPriority; category: string; location: string; preferredTime: string; }): Promise<string | null> {
          throw new Error('Function not implemented.');
        } }      />

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
