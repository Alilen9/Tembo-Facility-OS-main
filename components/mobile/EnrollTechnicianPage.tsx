
import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, UserCheck, Shield, MapPin, Wrench, ArrowRight, ArrowLeft, Camera, 
  Phone, AlertTriangle, Briefcase, Zap, ShieldCheck, FileCheck, ClipboardList, 
  RefreshCw, AlertCircle, Send, Mail, Upload, Clock, Star, History, Target, 
  Droplets, Hammer, SprayCan, Thermometer, Layers, List, Users, ShieldAlert, 
  FileText, Activity, Navigation, Box 
} from 'lucide-react';

const EXPERTISE_DOMAINS = [
  { id: 'plum', label: 'Plumber', def: 'Water systems, drainage, and industrial piping.', icon: <Droplets size={18} /> },
  { id: 'elec', label: 'Electrician', def: 'Grid maintenance, high-voltage wiring, and panels.', icon: <Zap size={18} /> },
  { id: 'fumi', label: 'Fumigator', def: 'Chemical application and pest management protocols.', icon: <SprayCan size={18} /> },
  { id: 'sec', label: 'Security', def: 'Alarms, access control, and alarm systems.', icon: <Shield size={18} /> },
  { id: 'oth', label: 'Other', def: 'Specialized trades not listed in standard domains.', icon: <Wrench size={18} /> }
];

const OPERATIONAL_ZONES = [
  { name: 'Zone A (CBD)', saturation: 88, status: 'HIGH' },
  { name: 'Zone B (Industrial)', saturation: 42, status: 'OPTIMAL' },
  { name: 'Zone C (Residential)', saturation: 15, status: 'LOW' },
  { name: 'North Logistics Hub', saturation: 64, status: 'STABLE' }
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => (CURRENT_YEAR - i).toString());

const EXISTING_IDS = ['12345678', '87654321'];
const EXISTING_PHONES = ['254712345678', '254700000000'];

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  nationalId: '',
  dob: '',
  gender: '',
  phone: '254',
  email: '',
  startMonth: '',
  startYear: '',
  skills: [] as string[],
  profilePhoto: '',
  certNumber: '',
  certUpload: false,
  certExpiry: '',
  primaryZone: '',
  adminAcknowledge: false,
  preFlight: { id: false, certs: false, liability: false }
};

export const EnrollTechnicianPage: React.FC = () => {
  const [step, setStep] = useState(0); // 0 is Pre-Flight
  const [isVerifying, setIsVerifying] = useState(false);
  const [duplicateIdError, setDuplicateIdError] = useState(false);
  const [duplicatePhoneError, setDuplicatePhoneError] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (formData.nationalId.length >= 8) {
      setIsVerifying(true);
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setDuplicateIdError(EXISTING_IDS.includes(formData.nationalId));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [formData.nationalId]);

  useEffect(() => {
    if (formData.phone.length >= 12) {
      setIsVerifying(true);
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setDuplicatePhoneError(EXISTING_PHONES.includes(formData.phone));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [formData.phone]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const finalizeOnboarding = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      setStep(10);
      setIsFinalizing(false);
    }, 2000);
  };

  const isStepValid = () => {
    switch(step) {
      case 0: return formData.preFlight.id && formData.preFlight.certs && formData.preFlight.liability;
      case 1: return formData.firstName && formData.lastName && formData.nationalId.length >= 8 && !duplicateIdError;
      case 2: return formData.phone.length >= 12 && !duplicatePhoneError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      case 3: return formData.startMonth && formData.startYear;
      case 4: return formData.skills.length > 0;
      case 5: return !!formData.profilePhoto;
      case 6: return formData.certUpload && formData.certNumber.length > 4 && formData.certExpiry;
      case 7: return !!formData.primaryZone;
      case 8: return formData.adminAcknowledge;
      default: return true;
    }
  };

  const integrity = (() => {
    let score = 0;
    if (formData.profilePhoto) score += 25;
    if (formData.certUpload) score += 25;
    if (formData.email.includes('@')) score += 25;
    if (formData.skills.length > 0) score += 25;
    return score;
  })();

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const simulatePhoto = () => {
    setFormData({...formData, profilePhoto: 'https://i.pravatar.cc/300?u=tech_enroll'});
  };

  const simulateUpload = () => {
    setFormData({...formData, certUpload: true});
  };

  const handleCheck = (key: keyof typeof formData.preFlight) => {
    setFormData(prev => ({
      ...prev,
      preFlight: { ...prev.preFlight, [key]: !prev.preFlight[key] }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Technician Enrollment</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Sovereign Authority Identity Onboarding & Certification.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Compliance Grade</p>
              <p className="text-lg font-black text-blue-600 leading-none">{integrity}%</p>
           </div>
           <div className="w-px h-10 bg-slate-200" />
           <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-700 shadow-sm shadow-blue-500/20" style={{ width: `${integrity}%` }} />
           </div>
        </div>
      </div>

      {/* Progress Stepper */}
      {step < 10 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-1 shadow-sm overflow-x-auto">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex-1 flex items-center min-w-[40px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === i ? 'bg-slate-900 text-white shadow-md' : step > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              {i < 8 && <div className={`flex-1 h-0.5 mx-2 ${step > i ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl min-h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 p-10">
          
          {/* STEP 0: PRE-FLIGHT (Now part of the page) */}
          {step === 0 && (
            <div className="space-y-8 animate-slide-in">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Stage 00: Initial Authorization</h3>
                <p className="text-sm text-slate-500">Before initializing the digital protocol, verify physical compliance status.</p>
              </div>
              <div className="space-y-4 max-w-2xl">
                <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.preFlight.id ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-slate-200'}`} onClick={() => handleCheck('id')}>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${formData.preFlight.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {formData.preFlight.id && <CheckCircle2 size={16} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700 leading-tight">I have verified the physical identity documents of the candidate.</span>
                </label>
                <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.preFlight.certs ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-slate-200'}`} onClick={() => handleCheck('certs')}>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${formData.preFlight.certs ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {formData.preFlight.certs && <CheckCircle2 size={16} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700 leading-tight">I possess digital copies of all mandatory skill certifications.</span>
                </label>
                <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.preFlight.liability ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-slate-200'}`} onClick={() => handleCheck('liability')}>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${formData.preFlight.liability ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {formData.preFlight.liability && <CheckCircle2 size={16} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700 leading-tight">I acknowledge that this authorization grants access to client assets.</span>
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8 animate-slide-in">
              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Traceability Key #1</h4>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Legal Identity</h3>
                </div>
                <Users size={80} className="text-white/10 absolute -right-4 -bottom-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">First Name</label>
                  <input type="text" placeholder="Sarah" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Last Name</label>
                  <input type="text" placeholder="Miller" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">National ID (KYC Verified)</label>
                  <input type="text" maxLength={8} placeholder="00000000" className={`w-full px-6 py-6 border-2 font-mono font-black text-3xl rounded-3xl transition-all ${duplicateIdError ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 bg-white'}`} value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value.replace(/\D/g, '')})} />
                  {duplicateIdError && <p className="text-xs text-red-600 font-black mt-2 uppercase tracking-tight">System Conflict: Identification already bound to an active record.</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-slide-in">
              <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Traceability Key #2</h4>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Mobile Communication</h3>
                </div>
                <Phone size={80} className="text-white/10 absolute -right-4 -bottom-4" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Mobile Auth Key (254...)</label>
                  <input type="tel" placeholder="254..." className={`w-full px-6 py-5 border-2 font-mono font-black text-2xl rounded-2xl transition-all ${duplicatePhoneError ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                  {duplicatePhoneError && <p className="text-xs text-red-600 font-bold mt-2 uppercase tracking-tight">Communication Node already allocated.</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Primary Email Node</label>
                  <input type="email" placeholder="sarah.m@tembocare.io" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-slide-in">
              <div className="bg-slate-900 text-white p-8 rounded-2xl flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Trade Authorization</h4>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Expertise Domains</h3>
                </div>
                <Layers size={80} className="text-white/10 absolute -right-4 -bottom-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPERTISE_DOMAINS.map(domain => (
                  <button key={domain.id} onClick={() => toggleSkill(domain.label)} className={`p-6 rounded-3xl border-2 text-left flex items-center gap-5 transition-all group ${formData.skills.includes(domain.label) ? 'border-blue-600 bg-blue-50/50 shadow-lg scale-[1.02]' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                    <div className={`p-4 rounded-2xl transition-all ${formData.skills.includes(domain.label) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>{domain.icon}</div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-slate-900 leading-tight">{domain.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{domain.def}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-slide-in flex flex-col items-center">
              <div className="bg-slate-900 text-white p-8 rounded-2xl w-full text-center">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Identity Binding</h4>
                <h3 className="text-3xl font-black uppercase tracking-tight">Portrait Calibration</h3>
              </div>
              <div className="w-72 h-72 rounded-[40px] border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 group relative shadow-inner">
                 {formData.profilePhoto ? (
                   <img src={formData.profilePhoto} className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <Camera size={40} />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting Capture</span>
                   </div>
                 )}
                 <button onClick={simulatePhoto} className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg"><Upload size={24} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Initialize Lens</span>
                 </button>
              </div>
              <p className="text-xs text-slate-400 font-medium text-center max-w-sm">Capture must be against a neutral background. Artificial intelligence will verify facial landmarks against submitted documents.</p>
            </div>
          )}

          {/* ... Other steps truncated for brevity but follow the same rich B2B aesthetic ... */}
          {/* Default view for other steps */}
          {(step === 3 || step === 6 || step === 7 || step === 8) && (
             <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Stage 0{step} Protocol</h3>
                <p className="text-slate-500">Processing complex identity and certification data for decentralized yield ledger integration.</p>
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center text-slate-300 italic">
                   Step Logic Loaded - Awaiting Input
                </div>
                <button onClick={handleNext} className="text-xs font-black text-blue-600 uppercase hover:underline">Simulate Step Completion</button>
             </div>
          )}

          {step === 10 && (
            <div className="h-full flex flex-col animate-slide-in items-center justify-center py-20">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-8"><CheckCircle2 size={48} className="text-white" /></div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 text-center">Enrollment Absolute</h2>
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-[40px] flex items-center gap-8 shadow-sm max-w-xl w-full">
                 <img src={formData.profilePhoto} className="w-32 h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white" />
                 <div className="space-y-2">
                    <span className="text-xs font-black text-slate-400 font-mono tracking-widest uppercase bg-white px-2 py-1 rounded border">ID: TMP-{formData.nationalId.slice(-4)}</span>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{formData.firstName} {formData.lastName}</h3>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-2"><Activity size={16} /> Operational Velocity: Online</p>
                 </div>
              </div>
              <div className="mt-12 flex gap-4">
                 <button onClick={() => { setFormData(INITIAL_FORM_STATE); setStep(0); }} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Enroll Next Specialist</button>
                 <button className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">Audit Record</button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {step < 10 && (
          <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center px-10">
             {step > 0 ? (
               <button onClick={handleBack} disabled={isFinalizing} className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-100 transition-all shadow-sm"><ArrowLeft size={16} /> Previous Stage</button>
             ) : (
               <div />
             )}
             <div className="flex gap-4">
               <button onClick={() => {}} className="px-6 py-4 rounded-2xl text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-slate-600 transition-colors">Discard Draft</button>
               <button 
                  onClick={step === 8 ? finalizeOnboarding : handleNext}
                  disabled={!isStepValid() || isFinalizing}
                  className={`px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${
                    !isStepValid() || isFinalizing ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }`}
               >
                  {isFinalizing ? <RefreshCw size={18} className="animate-spin" /> : step === 8 ? 'Finalize Synchronization' : 'Commit Stage & Continue'}
                  {!isFinalizing && <ArrowRight size={18} />}
               </button>
             </div>
          </div>
        )}
      </div>

    </div>
  );
};
