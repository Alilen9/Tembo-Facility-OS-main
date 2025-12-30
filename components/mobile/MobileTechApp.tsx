import React, { useState, useEffect } from 'react';
import { Job, JobStatus, JobPriority } from '../../types';
import { MOCK_JOBS, MOCK_CUSTOMERS } from '../../constants';
import { 
  LogOut, MapPin, Clock, ArrowRight, Camera, CheckCircle2, 
  AlertTriangle, Navigation, Phone, Wrench, Shield, AlertCircle, X, ChevronLeft, Star 
} from '../Icons';

type FlowState = 'LIST' | 'DETAILS' | 'CHECKING_IN' | 'BEFORE_PHOTOS' | 'WORK_EXECUTION' | 'AFTER_PHOTOS' | 'COMPLETION' | 'LOCKED';

interface MobileTechAppProps {
  onLogout: () => void;
}

// --- SHARED COMPONENTS ---

const Header: React.FC<{ 
  title: string; 
  leftAction?: { icon: React.ReactNode; onClick: () => void };
  rightAction?: React.ReactNode;
}> = ({ title, leftAction, rightAction }) => (
  <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-50">
    <div className="flex items-center gap-3">
      {leftAction && (
        <button onClick={leftAction.onClick} className="text-slate-300 hover:text-white p-1 -ml-2">
          {leftAction.icon}
        </button>
      )}
      <h1 className="text-lg font-bold tracking-tight">{title}</h1>
    </div>
    {rightAction}
  </div>
);

const LargeButton: React.FC<{ 
  label: string; 
  onClick: () => void; 
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ label, onClick, variant = 'primary', icon, disabled }) => {
  const baseClass = "w-full py-4 rounded-xl text-lg font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400",
    secondary: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant]}`}>
      {icon}
      {label}
    </button>
  );
};

// --- SCREENS ---

// 2.1 Screen 1: Today’s Jobs
const JobsListScreen: React.FC<{ onSelect: (job: Job) => void; onLogout: () => void }> = ({ onSelect, onLogout }) => {
  // Filter for demo: Show pending/scheduled jobs for "Today"
  const myJobs = MOCK_JOBS.filter(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELLED);

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-slate-900 px-6 pt-10 pb-6 rounded-b-3xl shadow-lg z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="text-white">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Technician Portal</p>
            <h1 className="text-2xl font-bold">Today's Route</h1>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
        </div>
        <p className="text-slate-300 text-sm">{new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 -mt-4">
        {myJobs.map(job => {
           const customer = MOCK_CUSTOMERS.find(c => c.id === job.customerId);
           const isUrgent = job.priority === JobPriority.CRITICAL || job.priority === JobPriority.HIGH;
           return (
             <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" onClick={() => {}}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {job.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-slate-400">#{job.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{customer?.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{job.title}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    <span>09:00 - 11:00</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="truncate max-w-[120px]">{customer?.address.split(',')[0]}</span>
                  </div>
                </div>
                
                <LargeButton label="Start Job" onClick={() => onSelect(job)} />
             </div>
           );
        })}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

// 2.2 Screen 2: Job Details (Pre-CheckIn)
const JobDetailsScreen: React.FC<{ job: Job; onCheckIn: () => void; onBack: () => void }> = ({ job, onCheckIn, onBack }) => {
  const customer = MOCK_CUSTOMERS.find(c => c.id === job.customerId);
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header 
        title={`Job #${job.id}`} 
        leftAction={{ icon: <ChevronLeft size={24} />, onClick: onBack }} 
      />
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Scope */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Scope of Work</h3>
          <p className="text-slate-900 font-medium leading-relaxed">{job.description}</p>
        </section>

        {/* Tools Checklist */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Required Tools</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {job.requiredTools?.map((tool, idx) => (
              <div key={idx} className="p-4 border-b border-slate-100 last:border-0 flex items-center gap-3">
                 <div className="w-5 h-5 rounded border-2 border-slate-300"></div>
                 <span className="text-slate-700 font-medium">{tool}</span>
              </div>
            )) || <div className="p-4 text-slate-400 italic">No specific tools listed.</div>}
          </div>
        </section>

         {/* SLA Warning */}
        <section className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
           <Clock className="text-orange-600 mt-0.5" size={20} />
           <div>
             <h4 className="text-sm font-bold text-orange-800">SLA Deadline: {job.slaDeadline ? new Date(job.slaDeadline).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'None'}</h4>
             <p className="text-xs text-orange-700 mt-1">Ensure check-in before deadline to avoid penalties.</p>
           </div>
        </section>
      </div>

      <div className="p-5 bg-white border-t border-slate-200 sticky bottom-0 z-20">
        <LargeButton label="Check In" onClick={onCheckIn} icon={<MapPin size={20} />} />
      </div>
    </div>
  );
};

// 2.3 Screen 3: Check-In Flow (Simulated)
const CheckInScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<'locating' | 'verified'>('locating');

  useEffect(() => {
    const timer = setTimeout(() => setStep('verified'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-8 text-center">
      {step === 'locating' ? (
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500 mb-6 flex items-center justify-center">
             <MapPin size={40} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifying Location...</h2>
          <p className="text-slate-400">Please stand still for GPS lock.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-slide-in w-full">
           <div className="w-20 h-20 rounded-full bg-emerald-500 mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
             <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You are Checked In</h2>
          <p className="text-slate-400 mb-8">Timestamp: {new Date().toLocaleTimeString()}</p>
          <LargeButton label="Proceed to Work" onClick={onComplete} variant="primary" />
        </div>
      )}
    </div>
  );
};

// 2.4 & 2.5 Screen 4/5: Photo Evidence (Reusable)
const PhotoEvidenceScreen: React.FC<{ type: 'Before' | 'After'; onNext: () => void }> = ({ type, onNext }) => {
  const [hasPhoto, setHasPhoto] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title={`${type} Photos`} />
      
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
         <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{type} work evidence required</h2>
            <p className="text-slate-500">You must upload a clear photo to proceed.</p>
         </div>

         <button 
           onClick={() => setHasPhoto(true)}
           className={`w-64 h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
             hasPhoto ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:bg-slate-50'
           }`}
         >
           {hasPhoto ? (
             <>
               <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-2xl" />
               <div className="absolute bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Photo Added</div>
             </>
           ) : (
             <>
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                 <Camera size={32} />
               </div>
               <span className="text-slate-600 font-bold">Tap to Capture</span>
             </>
           )}
         </button>
      </div>

      <div className="p-5 bg-white border-t border-slate-200">
        <LargeButton 
          label={type === 'Before' ? "Start Work" : "Proceed to Completion"} 
          onClick={onNext} 
          disabled={!hasPhoto} 
        />
      </div>
    </div>
  );
};

// Work Execution Dashboard (Between Before & After)
const WorkExecutionScreen: React.FC<{ job: Job; onComplete: () => void }> = ({ job, onComplete }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Work In Progress" rightAction={<div className="bg-emerald-500 w-3 h-3 rounded-full animate-pulse"></div>} />
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
         {/* Info Cards */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-2">Scope Reference</h3>
           <p className="text-sm text-slate-600">{job.description}</p>
         </div>

         {/* Tasks */}
         <div>
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Tasks</h3>
           <div className="space-y-2">
             {job.tasks?.map((task) => (
               <label key={task.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm active:bg-blue-50">
                 <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                 <span className="text-slate-900 font-medium">{task.label}</span>
               </label>
             )) || <div className="text-slate-400 italic px-2">No specific tasks defined.</div>}
           </div>
         </div>
      </div>

      <div className="p-5 bg-white border-t border-slate-200 sticky bottom-0 z-20">
         <LargeButton label="Finish Job" onClick={onComplete} variant="primary" icon={<CheckCircle2 size={20} />} />
      </div>
    </div>
  );
};

// 2.5 Screen 6: Completion
const CompletionScreen: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const [techRating, setTechRating] = useState(0);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Job Completion" />
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
         <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Technician Notes <span className="text-red-500">*</span></label>
            <textarea className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe work performed, parts used..."></textarea>
         </div>

         {/* Rate Client Interaction */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Rate Client Interaction</h3>
            <p className="text-xs text-slate-500 mb-4">How was your experience with the client onsite?</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setTechRating(star)}
                  className="p-1"
                >
                  <Star 
                    size={32} 
                    className={`${techRating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                  />
                </button>
              ))}
            </div>
            <textarea 
              className="w-full h-20 p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500" 
              placeholder="Comments on client behavior (optional)..."
            ></textarea>
         </div>

         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Client Signature (Optional)</h3>
            <div className="h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
               Sign Here
            </div>
         </div>
      </div>

      <div className="p-5 bg-white border-t border-slate-200 sticky bottom-0 z-20">
         <LargeButton label="Submit & Lock Job" onClick={onSubmit} variant="primary" />
      </div>
    </div>
  );
};

// Locked State
const LockedScreen: React.FC<{ onReturn: () => void }> = ({ onReturn }) => (
  <div className="flex flex-col h-full bg-slate-900 items-center justify-center text-center p-8 text-white">
    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
       <CheckCircle2 size={40} />
    </div>
    <h1 className="text-2xl font-bold mb-2">Job Submitted</h1>
    <p className="text-slate-400 mb-8">This record is now locked for quality assurance review.</p>
    <LargeButton label="Return to Route" onClick={onReturn} variant="secondary" />
  </div>
);

// Incident Modal
const IncidentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="absolute inset-0 z-[60] bg-white flex flex-col animate-slide-in">
    <div className="bg-red-600 text-white px-5 py-4 flex justify-between items-center">
      <h2 className="font-bold text-lg flex items-center gap-2"><AlertTriangle size={20}/> Report Incident</h2>
      <button onClick={onClose}><X size={24} /></button>
    </div>
    <div className="p-5 space-y-4 flex-1">
       <p className="text-slate-600 mb-4">Select the issue type to notify dispatch immediately.</p>
       {[
         'Access Denied / Site Locked', 
         'Client Not Available', 
         'Scope Mismatch / Extra Work', 
         'Equipment / Safety Issue',
         'Parts Missing'
       ].map(issue => (
         <button key={issue} className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors shadow-sm">
           {issue}
         </button>
       ))}
    </div>
  </div>
);

// --- MAIN APP CONTAINER ---

export const MobileTechApp: React.FC<MobileTechAppProps> = ({ onLogout }) => {
  const [state, setState] = useState<FlowState>('LIST');
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [showIncident, setShowIncident] = useState(false);

  // Flow Handlers
  const handleSelectJob = (job: Job) => {
    setActiveJob(job);
    setState('DETAILS');
  };

  const handleBackToList = () => {
    setActiveJob(null);
    setState('LIST');
  };

  const handleCheckIn = () => setState('CHECKING_IN');
  const handleCheckInComplete = () => setState('BEFORE_PHOTOS');
  const handleBeforePhotosComplete = () => setState('WORK_EXECUTION');
  const handleWorkComplete = () => setState('AFTER_PHOTOS');
  const handleAfterPhotosComplete = () => setState('COMPLETION');
  const handleSubmit = () => setState('LOCKED');
  const handleReturn = () => {
    setActiveJob(null);
    setState('LIST');
  };

  return (
    <div className="flex justify-center bg-slate-800 min-h-screen">
      {/* Mobile Frame */}
      <div className="w-full max-w-[400px] bg-slate-50 h-screen shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Render Screen Based on State */}
        {state === 'LIST' && <JobsListScreen onSelect={handleSelectJob} onLogout={onLogout} />}
        
        {state === 'DETAILS' && activeJob && (
          <JobDetailsScreen job={activeJob} onCheckIn={handleCheckIn} onBack={handleBackToList} />
        )}

        {state === 'CHECKING_IN' && <CheckInScreen onComplete={handleCheckInComplete} />}
        
        {state === 'BEFORE_PHOTOS' && <PhotoEvidenceScreen type="Before" onNext={handleBeforePhotosComplete} />}
        
        {state === 'WORK_EXECUTION' && activeJob && <WorkExecutionScreen job={activeJob} onComplete={handleWorkComplete} />}
        
        {state === 'AFTER_PHOTOS' && <PhotoEvidenceScreen type="After" onNext={handleAfterPhotosComplete} />}
        
        {state === 'COMPLETION' && <CompletionScreen onSubmit={handleSubmit} />}
        
        {state === 'LOCKED' && <LockedScreen onReturn={handleReturn} />}

        {/* Global Incident FAB (Visible in active workflow states) */}
        {state !== 'LIST' && state !== 'LOCKED' && state !== 'CHECKING_IN' && !showIncident && (
          <button 
            onClick={() => setShowIncident(true)}
            className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center z-40 active:scale-90 transition-transform"
          >
            <AlertTriangle size={24} />
          </button>
        )}

        {/* Incident Modal Overlay */}
        {showIncident && <IncidentModal onClose={() => setShowIncident(false)} />}

      </div>
    </div>
  );
};
