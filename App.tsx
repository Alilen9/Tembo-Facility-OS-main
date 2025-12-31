import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientRequests } from './components/client/ClientRequests';
import { JobDetail } from './components/JobDetail';
import { CreateRequestModal } from './components/CreateRequestModal';
import { AdminDispatchConsole } from './components/admin/AdminDispatchConsole';
import { DispatchModal } from './components/admin/DispatchModal';
import { MobileTechApp } from './components/mobile/MobileTechApp';
import { BillingView } from './components/BillingView';
import { QualityControlView } from './components/QualityControlView'; 
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { LoginScreen } from './components/LoginScreen';
import { AccessDenied } from './components/AccessDenied';
import { AuthProvider, useAuth } from './components/AuthContext';
// Added missing BillingStatus and HoldReason to imports
import { MOCK_JOBS } from './constants';
import { Toaster, toast } from 'react-hot-toast';
import { clientService } from './services/clientService';
import { Job, JobPriority, JobStatus, UserRole } from './types';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'admin-dispatch' | 'quality-control' | 'mobile-tech' | 'billing' | 'strategic-tower'>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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

  const selectedJobId = selectedJob?.id || null;

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    if (selectedJob?.id === updatedJob.id) setSelectedJob(updatedJob);
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

  const handleTrackCreatedRequest = (jobId: string) => {
    setActiveTab('jobs');
    const job = jobs.find(j => j.id === jobId);
    if (job) setSelectedJob(job);
    setIsCreateModalOpen(false);
  };

  const handleNavigate = (tab: any) => {
    setActiveTab(tab);
    setSelectedJob(null);
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
              <ClientRequests 
                selectedJobId={selectedJobId}
                onSelectJob={(job) => setSelectedJob(job)} 
              />
            </div>
            
            {selectedJobId && selectedJob && (
              <div className="w-full lg:w-[450px] flex-shrink-0 animate-slide-in">
                <JobDetail 
                  job={selectedJob} 
                  onClose={() => setSelectedJob(null)} 
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
        onSubmit={handleCreateRequest}
        onTrack={handleTrackCreatedRequest}
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

const App: React.FC = () => {
  return (
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
};

export default App;
