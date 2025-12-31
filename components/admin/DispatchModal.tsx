import React, { useState, useMemo, useEffect } from 'react';
import { Job, JobPriority, Technician } from '../../types';
import { adminService } from '../../services/adminService';
import { X, Search, CheckCircle2, AlertCircle, Clock, MapPin, UserCheck, Star, Shield, AlertTriangle, Navigation, Activity } from '../Icons';
import { toast } from 'react-hot-toast';

interface DispatchModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (jobId: string, technicianId: string) => void;
}

// Mock Helper for "Live" Telemetry (Distance, Workload)
const getLiveTelemetry = (techId: string | number) => {
  // Deterministic mock based on ID for consistent demo UI
  const idStr = String(techId);
  const seed = idStr.charCodeAt(0) + (idStr.length > 1 ? idStr.charCodeAt(1) : 0);
  const distance = (seed % 15) / 2 + 0.5; // 0.5 to 8.0 miles
  const currentLoad = seed % 5; // 0 to 4 jobs
  const maxLoad = 5;
  return {
    distance: distance.toFixed(1),
    currentLoad,
    maxLoad,
    isOverloaded: currentLoad >= maxLoad - 1
  };
};

export const DispatchModal: React.FC<DispatchModalProps> = ({ job, isOpen, onClose, onAssign }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchTechs = async () => {
        setLoading(true);
        try {
          const data = await adminService.getTechnicians();
          console.log("Fetched technicians:", data);
          // Polyfill missing UI data (skills, avatar) if backend doesn't provide them yet
          const enhancedData = data.map((t: any) => ({
            ...t,
            id: String(t.id),
            avatarUrl: t.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
            skills: t.skills || ['HVAC', 'Electrical', 'Plumbing', 'Security', 'General'].sort(() => 0.5 - Math.random()).slice(0, 3)
          }));
          setTechnicians(enhancedData);
        } catch (error) {
          console.error("Failed to load technicians", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTechs();
    }
  }, [isOpen]);

  // Smart Matching Logic
  const processedTechs = useMemo(() => {
    if (!job || technicians.length === 0) return [];
    
    return technicians.map(tech => {
      const telemetry = getLiveTelemetry(tech.id);
      
      // 1. Skill Match
      const required = job.requiredSkills || [];
      const matchedSkills = required.filter(req => tech.skills.includes(req));
      const missingSkills = required.filter(req => !tech.skills.includes(req));
      const skillMatchRatio = required.length > 0 ? matchedSkills.length / required.length : 1;
      
      // 2. Availability
      const isAvailable = tech.status === 'Available';
      const isOnJob = tech.status === 'On Job';
      
      // 3. Score Calculation (0-100)
      let score = 0;
      score += skillMatchRatio * 60; // Skills are 60% of score
      if (isAvailable) score += 30; // Availability is 30%
      if (isOnJob) score += 10; // Better than offline
      if (parseFloat(telemetry.distance) < 5) score += 10; // Proximity bonus
      
      // Cap at 100
      score = Math.min(Math.round(score), 100);

      return {
        ...tech,
        ...telemetry,
        matchedSkills,
        missingSkills,
        skillMatchRatio,
        matchScore: score,
        hasConflict: missingSkills.length > 0 || tech.status === 'Offline' || telemetry.isOverloaded
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by Best Match
    .filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [job, searchQuery, technicians]);

  if (!isOpen || !job) return null;

  const selectedTech = processedTechs.find(t => t.id === selectedTechId);

  const handleConfirm = async () => {
    if (selectedTechId && job) {
      setIsAssigning(true);
      try {
        await adminService.assignTechnician(String(job.id), selectedTechId);
        toast.success(`Technician assigned to Job #${job.id}`);
        onAssign(String(job.id), selectedTechId);
        onClose();
        setSelectedTechId(null);
        setSearchQuery('');
      } catch (error) {
        toast.error("Failed to assign technician");
      } finally {
        setIsAssigning(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Frame */}
      <div className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden ring-1 ring-white/10">
        
        {/* LEFT PANEL: Job Context & Requirements */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Dispatch Order
              <span className="text-xs font-mono text-slate-500 bg-white border px-1.5 py-0.5 rounded">#{job.id}</span>
            </h2>
            <div className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
               job.priority === JobPriority.CRITICAL ? 'bg-red-50 text-red-700 border-red-100' :
               job.priority === JobPriority.HIGH ? 'bg-orange-50 text-orange-700 border-orange-100' : 
               'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              {job.priority === JobPriority.CRITICAL && <AlertTriangle size={12} className="mr-1.5" />}
              {job.priority} Priority
            </div>
          </div>
          
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{job.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{job.description}</p>
            </div>

            {/* SLA Timer */}
            <div className={`p-4 rounded-xl border ${
              job.slaDeadline && new Date(job.slaDeadline) < new Date() 
                ? 'bg-red-50 border-red-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Clock size={14} /> SLA Target
              </div>
              <p className={`text-xl font-mono font-bold ${
                 job.slaDeadline && new Date(job.slaDeadline) < new Date() ? 'text-red-700' : 'text-slate-800'
              }`}>
                {job.slaDeadline ? new Date(job.slaDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No Deadline'}
              </p>
            </div>

             {/* Location Mock Map */}
             <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative h-32 group">
               <div className="absolute inset-0 flex items-center justify-center opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 to-transparent"></div>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <MapPin size={24} className="text-blue-600 mb-1 drop-shadow-md" />
                  <p className="text-xs font-bold text-slate-700 bg-white/90 px-2 py-1 rounded shadow-sm">{job.location || 'Site Location'}</p>
               </div>
             </div>

             {/* Requirements List */}
             <div>
               <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                 <Shield size={14} /> Required Skills
               </h4>
               <div className="space-y-2">
                 {job.requiredSkills?.map(skill => (
                   <div key={skill} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                     {skill}
                     <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                   </div>
                 )) || <span className="text-xs text-slate-400 italic">No specific skills listed</span>}
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT PANEL: Technician Selection */}
        <div className="flex-1 flex flex-col bg-slate-50">
          
          {/* Toolbar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shadow-sm z-10">
             <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter by name, skill, or ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
               <X size={24} />
             </button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loading && (
              <div className="text-center py-8 text-slate-400 animate-pulse">Loading technicians...</div>
            )}

            <div className="flex items-center justify-between px-2 mb-2">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recommended Personnel ({processedTechs.length})</h3>
               <span className="text-xs text-slate-400">Sorted by Match Score</span>
            </div>
            
            {processedTechs.map((tech) => {
              const isSelected = selectedTechId === tech.id;
              
              return (
                <div 
                  key={tech.id}
                  onClick={() => setSelectedTechId(tech.id)}
                  className={`group relative flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-600 bg-white shadow-lg ring-1 ring-blue-600 scale-[1.01] z-10' 
                      : 'border-white bg-white hover:border-blue-200 hover:shadow-md shadow-sm'
                  } ${tech.status === 'Offline' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                >
                  {/* Avatar & Status */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="relative">
                      <img src={tech.avatarUrl} alt={tech.name} className="w-14 h-14 rounded-full bg-slate-100 object-cover border border-slate-100" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center ${
                        tech.status === 'Available' ? 'bg-emerald-500' :
                        tech.status === 'On Job' ? 'bg-orange-500' : 'bg-slate-400'
                      }`}>
                      </div>
                    </div>
                    <div>
                       <h4 className={`text-base font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                         {tech.name}
                       </h4>
                       <div className={`text-xs font-medium mt-0.5 ${
                         tech.status === 'Available' ? 'text-emerald-600' :
                         tech.status === 'On Job' ? 'text-orange-600' : 'text-slate-500'
                       }`}>
                         {tech.status}
                       </div>
                    </div>
                  </div>

                  {/* Telemetry & Stats */}
                  <div className="flex-1 grid grid-cols-2 gap-4 mt-4 sm:mt-0 sm:px-6 w-full">
                     {/* Location */}
                     <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-slate-100 text-slate-500">
                          <Navigation size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{tech.distance} mi</p>
                          <p className="text-[10px] text-slate-400">from site</p>
                        </div>
                     </div>
                     {/* Workload */}
                     <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${tech.isOverloaded ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Activity size={14} />
                        </div>
                        <div className="flex-1 max-w-[100px]">
                           <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1">
                             <span>Load</span>
                             <span>{tech.currentLoad}/{tech.maxLoad}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${tech.isOverloaded ? 'bg-red-500' : 'bg-blue-500'}`} 
                               style={{width: `${(tech.currentLoad / tech.maxLoad) * 100}%`}}
                             />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Skills Match Visualization */}
                  <div className="min-w-[140px] mt-4 sm:mt-0">
                    <div className="flex flex-col gap-1.5">
                       {/* Only show skills relevant to job + errors */}
                       {tech.matchedSkills.map(skill => (
                         <div key={skill} className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                           <CheckCircle2 size={12} className="shrink-0" /> {skill}
                         </div>
                       ))}
                       {tech.missingSkills.map(skill => (
                         <div key={skill} className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                           <X size={12} className="shrink-0" /> Missing: {skill}
                         </div>
                       ))}
                       {tech.matchedSkills.length === 0 && tech.missingSkills.length === 0 && (
                         <span className="text-[10px] text-slate-400">General Match</span>
                       )}
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="absolute top-4 right-4 sm:static sm:ml-4">
                     <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border-2 ${
                       tech.matchScore > 80 ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
                       tech.matchScore > 50 ? 'border-orange-100 bg-orange-50 text-orange-700' :
                       'border-slate-100 bg-slate-50 text-slate-400'
                     }`}>
                        <span className="text-sm font-bold">{tech.matchScore}%</span>
                        <span className="text-[8px] font-bold uppercase">Match</span>
                     </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Footer & Action Area */}
          <div className="p-5 bg-white border-t border-slate-200 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <div className="flex items-center justify-between">
               
               {/* Selection Summary */}
               <div className="flex items-center gap-3">
                 {selectedTech ? (
                   <>
                     <img src={selectedTech.avatarUrl} className="w-10 h-10 rounded-full border border-slate-200" />
                     <div>
                       <p className="text-sm font-bold text-slate-900">Assigning {selectedTech.name}</p>
                       <p className="text-xs text-slate-500">ID: {selectedTech.id} • {selectedTech.matchScore}% Match</p>
                     </div>
                   </>
                 ) : (
                    <p className="text-sm text-slate-400 italic">Select a technician to proceed...</p>
                 )}
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3">
                 <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                   Cancel
                 </button>
                 
                 <button 
                   onClick={handleConfirm}
                   disabled={!selectedTechId || isAssigning}
                   className={`px-8 py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center gap-2 ${
                     !selectedTechId || isAssigning ? 'bg-slate-300 cursor-not-allowed' :
                     selectedTech?.hasConflict 
                       ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-200 animate-pulse' // Warning State
                       : 'bg-tembo-brand hover:bg-blue-700 hover:shadow-lg' // Normal State
                   }`}
                 >
                   {isAssigning ? (
                     <span>Assigning...</span>
                   ) : selectedTech?.hasConflict ? (
                     <>
                       <AlertTriangle size={18} />
                       Override & Assign
                     </>
                   ) : (
                     <>
                       <UserCheck size={18} />
                       Confirm Assignment
                     </>
                   )}
                 </button>
               </div>
             </div>
             
             {/* Conflict Warning Message */}
             {selectedTech?.hasConflict && (
               <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 animate-slide-in">
                 <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                 <div>
                   <p className="text-xs font-bold text-amber-800 uppercase">Assignment Risk Warning</p>
                   <p className="text-xs text-amber-700 mt-0.5">
                     This technician is either <strong>missing required skills</strong>, <strong>currently busy</strong>, or <strong>offline</strong>. 
                     Proceeding may cause SLA breaches.
                   </p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
