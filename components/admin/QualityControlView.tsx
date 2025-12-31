import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Job, JobPriority, JobStatus, Technician } from '../../types';

import { technicianService } from '../../services/technicianService';
import { CheckCircle2, Star, Calendar, MapPin, Camera, FileText, MessageSquare, AlertTriangle, ArrowRight, RefreshCw } from '../Icons';

// --- TYPES & HELPERS ---

const DEFECT_CATEGORIES = [
  { id: 'workmanship', label: 'Poor Workmanship', color: 'bg-red-100 text-red-700' },
  { id: 'evidence', label: 'Missing Evidence', color: 'bg-orange-100 text-orange-700' },
  { id: 'compliance', label: 'Compliance / Safety', color: 'bg-red-100 text-red-700' },
  { id: 'billing', label: 'Billing Discrepancy', color: 'bg-yellow-100 text-yellow-700' },
];

// --- COMPONENT ---

export const QualityControlView: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'risk' | 'random' | 'all'>('risk');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFlagging, setIsFlagging] = useState(false);
  
  const [allAuditJobs, setAllAuditJobs] = useState<Job[]>([]);
  const [auditQueue, setAuditQueue] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, techsData] = await Promise.all([
          technicianService.getJobsAwaitingAudit(),
          technicianService.getAllTechnicians()
        ]);
        setAllAuditJobs(jobsData);
        setTechnicians(techsData);
      } catch (error) {
        console.error("Failed to fetch QC data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Filter Queue
  useEffect(() => {
    let jobs = [...allAuditJobs];
    
    if (filterMode === 'risk') {
      // Risk = Low Rating OR Critical Priority
      jobs = jobs.filter(j => (j.userRating && j.userRating < 4) || j.priority === JobPriority.CRITICAL);
    } else if (filterMode === 'random') {
      // Random Sample (take every 2nd job)
      jobs = jobs.filter((_, i) => i % 2 === 0).slice(0, 5);
    }
    
    setAuditQueue(jobs);
    if (jobs.length > 0 && !selectedJobId) setSelectedJobId(jobs[0].id);
  }, [filterMode, allAuditJobs]);

  const selectedJob = auditQueue.find(j => j.id === selectedJobId) || auditQueue[0];
  
  // Helper to get tech details from state
  const techStats = React.useMemo(() => {
    const tech = technicians.find(t => t.id === selectedJob?.technicianId);
    return {
      name: tech?.name || 'Unknown Technician',
      avatarUrl: tech?.avatarUrl || 'https://i.pravatar.cc/150?u=tech',
      auditPassRate: tech?.auditPassRate || 95, // Default if not in backend yet
      jobsThisMonth: 12 // Placeholder or calculate from jobs list
    };
  }, [technicians, selectedJob]);

  // Helper to get customer details from job
  const customer = selectedJob ? {
    name: (selectedJob as any).customerName || 'Unknown Customer',
    address: selectedJob.location || 'No Address'
  } : null;

  // Handlers
  const handleVerify = async (status: 'Passed' | 'Failed' = 'Passed', notes?: string) => {
    if (!selectedJob) return;
    try {
      await technicianService.verifyAudit(selectedJob.id, status, notes);
      toast.success(`Audit ${status}`);
      
      const nextQueue = auditQueue.filter(j => j.id !== selectedJob?.id);
      setAuditQueue(nextQueue);
      if (nextQueue.length > 0) setSelectedJobId(nextQueue[0].id);
      else setSelectedJobId(null);
    } catch (error) {
      console.error("Failed to update audit status", error);
      toast.error("Failed to submit audit");
    }
  };

  const handleFlagDefect = (category: string) => {
    setIsFlagging(false);
    handleVerify('Failed', `Defect flagged: ${category}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!isLoading && !selectedJob) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Queue Cleared</h2>
        <p className="text-slate-500 mt-2">No jobs pending audit in this category.</p>
        <button 
          onClick={() => setFilterMode('all')}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          View All History
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-slate-50 overflow-hidden">
      
      {/* 1. LEFT RAIL: The Queue */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        <div className="p-4 border-b border-slate-100">
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Audit Queue ({allAuditJobs.length})</h2>
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setFilterMode('risk')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filterMode === 'risk' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                High Risk
              </button>
              <button 
                onClick={() => setFilterMode('random')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filterMode === 'random' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Random
              </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
           {auditQueue.map(job => (
             <div 
               key={job.id}
               onClick={() => setSelectedJobId(job.id)}
               className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                 selectedJob.id === job.id ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
               }`}
             >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono font-bold text-slate-500">#{job.id}</span>
                  {job.userRating && job.userRating < 4 && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> {job.userRating}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">{job.title}</h4>
                <p className="text-xs text-slate-500 mt-1 truncate">{(job as any).customerName}</p>
             </div>
           ))}
        </div>
      </div>

      {/* 2. MAIN STAGE: The Inspection */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
           <div>
             <h1 className="text-xl font-bold text-slate-900">Audit Job #{selectedJob.id}</h1>
             <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
               <Calendar size={12} /> Completed {new Date().toLocaleDateString()}
               <span className="text-slate-300">|</span>
               <MapPin size={12} /> {customer?.address}
             </p>
           </div>
           
           {/* Tech Heat Check */}
           <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <img src={techStats?.avatarUrl} className="w-10 h-10 rounded-full border border-slate-200" />
              <div>
                <p className="text-sm font-bold text-slate-800">{techStats?.name}</p>
                <div className="flex items-center gap-2 text-xs">
                   <span className={`font-bold ${techStats.auditPassRate > 90 ? 'text-emerald-600' : 'text-orange-600'}`}>
                     {techStats.auditPassRate}% Pass Rate
                   </span>
                   <span className="text-slate-400">• {techStats.jobsThisMonth} Jobs</span>
                </div>
              </div>
           </div>
        </div>

        {/* Scrollable Evidence Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
           
           {/* Section 1: Visual Evidence Comparator */}
           <section>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                   <Camera size={16} /> Visual Evidence
                 </h3>
                 <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                   Tap images to zoom
                 </span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 h-64">
                 {/* Before */}
                 <div className="relative group rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm">
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md z-10">BEFORE</span>
                    {selectedJob.proofImages?.before ? (
                      <img src={selectedJob.proofImages.before} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 italic">No Image</div>
                    )}
                 </div>
                 
                 {/* After */}
                 <div className="relative group rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm">
                    <span className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md z-10">AFTER</span>
                    {selectedJob.proofImages?.after ? (
                      <img src={selectedJob.proofImages.after} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-red-400 font-bold bg-red-50">MISSING EVIDENCE</div>
                    )}
                 </div>
              </div>
           </section>

           {/* Section 2: Scope vs Execution */}
           <section className="grid grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <FileText size={14} /> Scope of Work
                 </h3>
                 <p className="text-sm text-slate-800 leading-relaxed">{selectedJob.description}</p>
                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requiredSkills?.map(s => (
                        <span key={s} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">{s}</span>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <MessageSquare size={80} className="text-blue-500" />
                 </div>
                 <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <CheckCircle2 size={14} /> Technician Notes
                 </h3>
                 <p className="text-sm text-slate-800 leading-relaxed font-medium">
                   {selectedJob.workSummary || "No summary provided by technician."}
                 </p>
                 
                 {/* Materials Check */}
                 <div className="mt-4 pt-4 border-t border-blue-100/50">
                    <p className="text-xs font-bold text-slate-500 mb-2">Materials Used</p>
                    {selectedJob.materialsUsed?.length ? (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {selectedJob.materialsUsed.map(m => (
                          <li key={m.id}>• {m.quantity}x {m.name}</li>
                        ))}
                      </ul>
                    ) : <span className="text-xs text-slate-400 italic">None Recorded</span>}
                 </div>
              </div>
           </section>

        </div>

        {/* 3. ACTION BAR (Sticky Footer) */}
        <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
           <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
              
              <div className="text-xs text-slate-400 font-medium">
                 Audit Step 3 of 3: Verification
              </div>

              <div className="flex gap-4">
                 {/* Flag Defect Button */}
                 <div className="relative">
                   <button 
                     onClick={() => setIsFlagging(!isFlagging)}
                     className="px-6 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 hover:border-red-300 transition-all flex items-center gap-2"
                   >
                     <AlertTriangle size={18} />
                     Flag Issue
                   </button>
                   
                   {/* Popover Menu */}
                   {isFlagging && (
                     <div className="absolute bottom-full left-0 mb-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-in p-1">
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                          Select Defect Category
                        </div>
                        {DEFECT_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => handleFlagDefect(cat.label)}
                            className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 flex items-center justify-between group"
                          >
                            {cat.label}
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                          </button>
                        ))}
                        <button className="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2">
                           <RefreshCw size={14} /> Request Rework
                        </button>
                     </div>
                   )}
                 </div>

                 {/* Verify Button */}
                 <button 
                   onClick={() => handleVerify('Passed')}
                   className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95"
                 >
                   <CheckCircle2 size={18} />
                   Verify & Close
                 </button>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
