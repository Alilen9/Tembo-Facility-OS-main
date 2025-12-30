
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WorkOrderList } from './components/WorkOrderList';
import { JobDetail } from './components/JobDetail';
import { CreateRequestModal } from './components/CreateRequestModal';
import { AdminDispatchConsole } from './components/AdminDispatchConsole';
import { DispatchModal } from './components/DispatchModal';
import { MobileTechApp } from './components/mobile/MobileTechApp';
import { BillingView } from './components/BillingView';
import { QualityControlView } from './components/QualityControlView'; 
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { LoginScreen } from './components/LoginScreen';
import { AccessDenied } from './components/AccessDenied';
import { AuthProvider, useAuth } from './components/AuthContext';
// Added missing BillingStatus and HoldReason to imports
import { Job, JobPriority, JobStatus, UserRole, BillingStatus, HoldReason } from './types';
import { MOCK_JOBS } from './constants';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'admin-dispatch' | 'quality-control' | 'mobile-tech' | 'billing' | 'strategic-tower'>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dispatchJob, setDispatchJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  // Redirect Logic based on Role
  useEffect(() => {
    // Fix: Simplified logic to avoid redundant comparison warnings from TypeScript (user.role comparison when technician already excluded)
    if (user?.role === UserRole.TECHNICIAN) {
      setActiveTab('mobile-tech');
    } else if (user?.role === UserRole.SUPER_ADMIN) {
      setActiveTab('strategic-tower');
    } else if (activeTab === 'mobile-tech') {
      // If we are on the mobile tech tab but the user is not a technician, revert to dashboard
      setActiveTab('dashboard'); 
    }
  }, [user, activeTab]);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const handleAssignTech = (jobId: string, technicianId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      const updatedJob: Job = { 
        ...job, 
        technicianId, 
        status: job.status === JobStatus.PENDING ? JobStatus.SCHEDULED : job.status,
        timeline: [
          ...(job.timeline || []),
          { status: 'Technician Assigned', timestamp: new Date().toISOString(), isCompleted: true, note: 'Assigned via Command Console' }
        ]
      };
      handleUpdateJob(updatedJob);
    }
  };

  const handleTrackNewRequest = () => {
    // Fix: Added missing mandatory properties price, billingStatus, and holdReason to the new Job object to satisfy the Job interface
    const newJob: Job = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      customerId: user?.relatedCustomerId || 'c1',
      title: 'New Service Request',
      description: 'Reported issue via portal. Awaiting dispatch review.',
      status: JobStatus.PENDING,
      priority: JobPriority.MEDIUM,
      dateCreated: new Date().toISOString(),
      timeline: [{ status: 'Request Received', timestamp: new Date().toISOString(), isCompleted: true }],
      price: 0,
      billingStatus: BillingStatus.UNBILLED,
      holdReason: HoldReason.NONE
    };
    
    setJobs([newJob, ...jobs]);
    setActiveTab('jobs');
    setSelectedJobId(newJob.id);
  };

  const handleNavigate = (tab: any) => {
    setActiveTab(tab);
    setSelectedJobId(null);
  };

  // 1. Mobile Tech View (Exclusive)
  if (activeTab === 'mobile-tech') {
    if (user?.role !== UserRole.TECHNICIAN && user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN) {
      return <AccessDenied message="Only technicians can access the mobile app view." />;
    }
    return (
      <Layout activeTab={activeTab} onNavigate={handleNavigate}>
        <MobileTechApp onLogout={logout} />
      </Layout>
    );
  }

  // 2. Admin Dispatch Console & QC (Protected)
  if (activeTab === 'admin-dispatch' || activeTab === 'quality-control' || activeTab === 'strategic-tower') {
     if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN) {
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
          <Dashboard onIntervene={(id) => { setActiveTab('admin-dispatch'); }} onCreateClick={() => setIsCreateModalOpen(true)} />
        )}

        {activeTab === 'strategic-tower' && (
          <SuperAdminDashboard />
        )}
        
        {activeTab === 'jobs' && (
          <div className="flex h-[calc(100vh-8rem)] gap-6">
            <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedJobId ? 'lg:w-1/2' : 'w-full'}`}>
              <WorkOrderList 
                selectedJobId={selectedJobId}
                onSelectJob={(job) => setSelectedJobId(job.id)} 
              />
            </div>
            
            {selectedJobId && selectedJob && (
              <div className="w-full lg:w-[450px] flex-shrink-0 animate-slide-in">
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
        
        {activeTab === 'quality-control' && (
          <QualityControlView />
        )}
        
        {activeTab === 'billing' && (
          <BillingView />
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();
  return user ? <AuthenticatedApp /> : <LoginScreen />;
};

export default App;
