import React, { useState, useEffect } from 'react';
import { Job, JobStatus, JobPriority } from '../../types';
import { 
  LogOut, MapPin, Clock, Camera, CheckCircle2, 
  AlertTriangle, X, ChevronLeft, Star, RefreshCw
} from '../Icons';
import { toast } from 'react-hot-toast';
import { technicianService } from '@/services/technicianService';

type FlowState = 'LIST' | 'DETAILS' | 'CHECKING_IN' | 'BEFORE_PHOTOS' | 'WORK_EXECUTION' | 'AFTER_PHOTOS' | 'COMPLETION' | 'LOCKED';

interface MobileTechAppProps {
  onLogout: () => void;
}

// --- SHARED COMPONENTS ---

const Header: React.FC<{ 
  title: string; 
  leftAction?: { icon: React.ReactNode; onClick: () => void };
  rightAction?: React.ReactNode;
  // Added Image import here
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
const JobsListScreen: React.FC<{ jobs: Job[]; onSelect: (job: Job) => void; onLogout: () => void }> = ({ jobs, onSelect, onLogout }) => {
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

      <div className="flex-1 overflow-y-auto p-4 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => {
           const isUrgent = job.priority === JobPriority.CRITICAL || job.priority === JobPriority.HIGH;
           return (
             <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" onClick={() => {}}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {job.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-slate-400">#{job.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{(job as any).customerName || 'Customer'}</h3>
                <p className="text-sm text-slate-600 mb-4">{job.title}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    <span>{job.preferredTime || 'Anytime'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="truncate max-w-[120px]">{job.location || 'On Site'}</span>
                  </div>
                </div>
                
                <LargeButton label="Start Job" onClick={() => onSelect(job)} />
             </div>
           );
        })}
        {jobs.length === 0 && (
          <div className="text-center p-8 text-slate-500 col-span-full">No active jobs assigned.</div>
        )}
        </div>
        <div className="h-10"></div>
      </div>
    </div>
  );
};

// 2.2 Screen 2: Job Details (Pre-CheckIn)
const JobDetailsScreen: React.FC<{ job: Job; onCheckIn: () => void; onBack: () => void }> = ({ job, onCheckIn, onBack }) => {
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
const CheckInScreen: React.FC<{ onComplete: (coords: {lat: number, lng: number}) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<'locating' | 'verified' | 'error'>('locating');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStep('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStep('verified');
      },
      (error) => {
        console.error("Location error:", error);
        setStep('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-8 text-center">
      {step === 'locating' && (
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500 mb-6 flex items-center justify-center">
             <MapPin size={40} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Acquiring GPS Lock...</h2>
          <p className="text-slate-400">Verifying site location match.</p>
        </div>
      )}
      
      {step === 'verified' && (
        <div className="flex flex-col items-center animate-slide-in w-full">
           <div className="w-20 h-20 rounded-full bg-emerald-500 mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
             <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You are Checked In</h2>
          <p className="text-slate-400 mb-8">Timestamp: {new Date().toLocaleTimeString()}</p>
          <p className="text-slate-500 text-xs mb-8 font-mono">GPS: {coords?.lat.toFixed(5)}, {coords?.lng.toFixed(5)}</p>
          <LargeButton label="Proceed to Work" onClick={() => coords && onComplete(coords)} variant="primary" />
        </div>
      )}

      {step === 'error' && (
        <div className="flex flex-col items-center animate-slide-in w-full">
           <div className="w-20 h-20 rounded-full bg-red-500 mb-6 flex items-center justify-center">
             <AlertTriangle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Location Failed</h2>
          <p className="text-slate-400 mb-8">Unable to verify GPS location. Please ensure location services are enabled.</p>
          <LargeButton label="Retry" onClick={() => window.location.reload()} variant="secondary" />
          <button onClick={() => onComplete({lat: 0, lng: 0})} className="mt-6 text-slate-500 text-sm underline">Bypass (Emergency Only)</button>
        </div>
      )}
    </div>
  );
};

// 2.4 & 2.5 Screen 4/5: Photo Evidence (Reusable)
const PhotoEvidenceScreen: React.FC<{ type: 'Before' | 'After'; onNext: (file?: File) => Promise<void> | void }> = ({ type, onNext }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoSource, setPhotoSource] = useState<'camera' | 'gallery' | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isUploading, setIsUploading] = useState(false);
  
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoSource('gallery');
    }
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoSource(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Camera Stream Handling
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen) {
      (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error(err);
          toast.error("Unable to access camera");
          setIsCameraOpen(false);
        }
      })();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, facingMode]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoSource('camera');
            setIsCameraOpen(false);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleProceed = async () => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      await onNext(photoFile || undefined);
    } finally {
      setIsUploading(false);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <button 
          onClick={() => setIsCameraOpen(false)}
          className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full"
        >
          <X size={32} />
        </button>
        <button 
          onClick={toggleCamera}
          className="absolute top-6 left-6 text-white bg-black/50 p-2 rounded-full"
        >
          <RefreshCw size={32} />
        </button>
        <div className="absolute bottom-10 w-full flex justify-center">
           <button 
             onClick={capturePhoto}
             className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-lg active:scale-95 transition-transform"
           />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title={`${type} Photos`} />
      
      {/* Hidden Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef} 
        className="hidden" 
        onChange={handleFileSelect}
      />

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
         <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{type} work evidence required</h2>
            <p className="text-slate-500">Choose a method to upload photo.</p>
         </div>

         {photoPreview ? (
            <div className="relative w-64 h-64 rounded-2xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center overflow-hidden shadow-lg">
               <img src={photoPreview} className="w-full h-full object-cover" alt="Evidence" />
               <div className="absolute bottom-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                 <CheckCircle2 size={12} /> Photo Added ({photoSource})
               </div>
               <button 
                 onClick={clearPhoto}
                 className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
               >
                 <X size={16} />
               </button>
            </div>
         ) : (
           <div className="w-full max-w-xs space-y-4">
             <button 
               onClick={() => setIsCameraOpen(true)}
               className="w-full py-6 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center gap-2 group"
             >
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Camera size={24} />
               </div>
               <span className="font-bold text-slate-700">Take Photo</span>
             </button>
             <button 
               onClick={() => galleryInputRef.current?.click()}
               className="w-full py-6 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:bg-purple-50 hover:border-purple-300 transition-all flex flex-col items-center gap-2 group"
             >
               <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Camera size={24} />
               </div>
               <span className="font-bold text-slate-700">Upload from Gallery</span>
             </button>
           </div>
         )}
      </div>

      <div className="p-5 bg-white border-t border-slate-200">
        <LargeButton 
          label={isUploading ? "Uploading..." : (type === 'Before' ? "Start Work" : "Proceed to Completion")} 
          onClick={handleProceed} 
          disabled={!photoPreview || isUploading} 
          icon={isUploading ? <RefreshCw className="animate-spin" size={20} /> : undefined}
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
const CompletionScreen: React.FC<{ onSubmit: (notes: string, rating: number, feedback: string) => Promise<void> | void }> = ({ onSubmit }) => {
  const [techRating, setTechRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');

  const handleSubmitClick = async () => {
    if (isSubmitting) return;
    if (!notes.trim()) {
      toast.error("Please enter completion notes");
      return;
    }
    if (techRating === 0) {
      toast.error("Please rate the client interaction");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(notes, techRating, clientFeedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Job Completion" />
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
         <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Technician Notes <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Describe work performed, parts used..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
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
              value={clientFeedback}
              onChange={(e) => setClientFeedback(e.target.value)}
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
         <LargeButton 
           label={isSubmitting ? "Submitting..." : "Submit & Lock Job"} 
           onClick={handleSubmitClick} 
           variant="primary" 
           disabled={isSubmitting}
           icon={isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : undefined}
         />
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
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await technicianService.getMyJobs();
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };
    fetchJobs();
  }, [state]); // Reload when state changes (e.g. after completion)

  // Flow Handlers
  const handleSelectJob = (job: Job) => {
    setActiveJob(job);
    
    // Resume workflow based on job status and timeline
    if (job.status === JobStatus.IN_PROGRESS) {
      const lastEvent = job.timeline && job.timeline.length > 0 
        ? job.timeline[job.timeline.length - 1] 
        : null;

      if (lastEvent?.status === 'Work Started') {
        setState('WORK_EXECUTION');
      } else if (lastEvent?.status === 'Technician On Site') {
        setState('BEFORE_PHOTOS');
      } else {
        setState('CHECKING_IN');
      }
    } else if (job.status === JobStatus.COMPLETED) {
      setState('LOCKED');
    } else {
      setState('DETAILS');
    }
  };

  const handleBackToList = () => {
    setActiveJob(null);
    setState('LIST');
  };

  const handleCheckIn = () => setState('CHECKING_IN');
  
  const handleCheckInComplete = async (coords: {lat: number, lng: number}) => {
    if (activeJob) {
      try {
        await technicianService.updateJobProgress(activeJob.id, JobStatus.IN_PROGRESS, {
          status: 'Technician On Site',
          note: `Checked in via mobile app. GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
        });
        toast.success("Check-in confirmed");
        setState('BEFORE_PHOTOS');
      } catch (error) {
        console.error(error);
        toast.error("Failed to check in");
      }
    }
  };

  const handleBeforePhotosComplete = async (file?: File) => {
    if (activeJob) {
      try {
        if (file) {
          await technicianService.uploadEvidence(activeJob.id, file, 'BEFORE');
        }
        await technicianService.updateJobProgress(activeJob.id, JobStatus.IN_PROGRESS, {
          status: 'Work Started',
          note: 'Before photos uploaded'
        });
        setState('WORK_EXECUTION');
      } catch (error) {
        console.error("Failed to update job progress", error);
        toast.error("Failed to save progress");
      }
    }
  };

  const handleWorkComplete = () => setState('AFTER_PHOTOS');
  
  const handleAfterPhotosComplete = async (file?: File) => {
    if (activeJob) {
      try {
        if (file) {
          const response = await technicianService.uploadEvidence(activeJob.id, file, 'AFTER');
          console.log("After photo upload response:", response);
          toast.success("After photo uploaded");
        }
        setState('COMPLETION');
      } catch (error) {
        console.error("Failed to upload evidence", error);
        toast.error("Failed to upload photo");
      }
    }
  };
  
  const handleSubmit = async (notes: string, rating: number, feedback: string) => {
    if (activeJob) {
      await technicianService.updateJobProgress(activeJob.id, JobStatus.COMPLETED, {
        status: 'Job Completed',
        note: notes
      }, rating, feedback);
      toast.success('Job completed successfully');
      setState('LOCKED');
    }
  };

  const handleReturn = () => {
    setActiveJob(null);
    setState('LIST');
  };

  return (
    <div className="flex justify-center h-full w-full">
      {/* Responsive Frame */}
      <div className="w-full max-w-7xl bg-slate-50 h-full shadow-2xl overflow-hidden relative flex flex-col md:rounded-2xl md:border md:border-slate-200">
        
        {/* Render Screen Based on State */}
        {state === 'LIST' && <JobsListScreen jobs={jobs} onSelect={handleSelectJob} onLogout={onLogout} />}
        
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
