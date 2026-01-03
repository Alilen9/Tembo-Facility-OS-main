
import React, { useState, useMemo, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, ArrowRight, ArrowLeft, Zap, Droplets, Thermometer, Hammer, Shield, SprayCan, AlertCircle, Camera, Upload, CheckCircle2, Clock, Search, Plus, MapPin, Briefcase, Trash2, ShieldCheck } from './Icons';
import { JobPriority } from '@/types';
import { clientService } from '@/services/clientService';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrack?: (data: any) => void;
  onSubmit: (data: { title: string; description: string; priority: JobPriority; category: string; location: string; preferredTime: string }) => Promise<string | null>;

}

const CATEGORIES = [
  { id: 'hvac', label: 'HVAC', icon: <Thermometer size={28} />, desc: 'Heating, AC, Ventilation' },
  { id: 'plumbing', label: 'Plumbing', icon: <Droplets size={28} />, desc: 'Leaks, Drains, Water' },
  { id: 'electrical', label: 'Electrical', icon: <Zap size={28} />, desc: 'Power, Lights, Wiring' },
  { id: 'general', label: 'General', icon: <Hammer size={28} />, desc: 'Doors, Paint, Furniture' },
  { id: 'security', label: 'Security', icon: <Shield size={28} />, desc: 'Alarms, Access Control' },
  { id: 'cleaning', label: 'Cleaning', icon: <SprayCan size={28} />, desc: 'Spills, Waste, Sanitization' },
];

const URGENCIES = [
  { id: 'low', label: 'Low', color: 'bg-slate-100 border-slate-200', text: 'slate-600', sla: 'Response within 48h' },
  { id: 'medium', label: 'Medium', color: 'bg-blue-50 border-blue-200', text: 'blue-700', sla: 'Response within 24h' },
  { id: 'high', label: 'High', color: 'bg-orange-50 border-orange-200', text: 'orange-700', sla: 'Response within 8h' },
  { id: 'critical', label: 'Critical', color: 'bg-red-50 border-red-200', text: 'red-700', sla: 'Emergency (4h Response)' },
];

const TIME_SLOTS = [
  { id: 'morning', label: '08:00 AM - 10:00 AM', period: 'Morning' },
  { id: 'midday', label: '10:00 AM - 12:00 PM', period: 'Midday' },
  { id: 'afternoon', label: '02:00 PM - 04:00 PM', period: 'Afternoon' },
  { id: 'evening', label: '04:00 PM - 06:00 PM', period: 'Evening' },
];

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ isOpen, onClose, onTrack, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState('');
  const [isAddingBuilding, setIsAddingBuilding] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    urgency: 'low',
    availability: 'morning',
    files: [] as { file: File, preview: string }[],
  });

  useEffect(() => {
    if (step === 2 && !isAddingBuilding) {
      const fetchBuildings = async () => {
        setIsLoadingBuildings(true);
        try {
          const data = await clientService.searchApartments(buildingSearch);
          setBuildings(data.map((apt: any) => apt.name));
        } catch (error) {
          console.error("Failed to fetch buildings", error);
        } finally {
          setIsLoadingBuildings(false);
        }
      };
      const timer = setTimeout(fetchBuildings, 300);
      return () => clearTimeout(timer);
    }
  }, [buildingSearch, step, isAddingBuilding]);

  const handleNext = async () => {
    if (step === 1 && !formData.category) {
      toast.error('Please select a category to continue');
      return;
    }
    if (step === 2 && (!formData.location || !formData.description)) {
      toast.error('Please provide both location and description');
      return;
    } 
    
    if (step === 4) {
      setIsSubmitting(true);
      try {
        let priority = JobPriority.MEDIUM;
        if (formData.urgency === 'low') priority = JobPriority.LOW;
        if (formData.urgency === 'high') priority = JobPriority.HIGH;
        if (formData.urgency === 'critical') priority = JobPriority.CRITICAL;

        const timeSlot = TIME_SLOTS.find(t => t.id === formData.availability);
        const preferredTime = timeSlot ? timeSlot.label : 'Anytime';

        const submitData = {
          title: `${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} Request`,
          description: formData.description,
          priority,
          category: formData.category.toUpperCase(),
          location: formData.location,
          preferredTime
        };

        const jobId = await onSubmit(submitData);
        if (jobId) setStep(step + 1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 2 && isAddingBuilding) {
      setIsAddingBuilding(false);
      return;
    }
    setStep(step - 1);
  };
  
  const resetAndClose = () => {
    // Revoke any created object URLs to prevent memory leaks
    formData.files.forEach(f => URL.revokeObjectURL(f.preview));
    
    setStep(1);
    setIsAddingBuilding(false);
    setBuildingSearch('');
    setNewBuildingName('');
    setFormData({ category: '', location: '', description: '', urgency: 'low', availability: 'morning', files: [] });
    onClose();
  };

  const handleCloseAttempt = () => {
    if (step === 5) {
      resetAndClose();
      return;
    }

    const isDirty = step > 1 || formData.category || formData.description || formData.location;
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to discard this request?')) {
      return;
    }
    
    resetAndClose();
  };

  const handleTrackClick = () => {
    if (onTrack) {
      // Pass the actual form data back to the parent
      onTrack(formData);
    }
    // Note: We don't reset immediately here because the parent needs to handle navigation,
    // but the reset will happen via resetAndClose in handleTrackNewRequest in App.tsx
    setStep(1);
    setIsAddingBuilding(false);
    setFormData({ category: '', location: '', description: '', urgency: 'low', availability: 'morning', files: [] });
    onClose();
  };

  const handleAddNewBuilding = () => {
    if (newBuildingName.trim()) {
      const updated = [...buildings, newBuildingName.trim()];
      setBuildings(updated);
      setFormData({ ...formData, location: newBuildingName.trim() });
      setIsAddingBuilding(false);
      setNewBuildingName('');
      setBuildingSearch('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles) as File[];
      const validFiles = filesArray.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      const newFiles = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => {
      const newFiles = [...prev.files];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return { ...prev, files: newFiles };
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseAttempt}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-tembo-brand text-white text-xs font-bold">
              {step < 5 ? step : <CheckCircle2 size={14}/>}
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {step === 1 && 'Select Category'}
              {step === 2 && (isAddingBuilding ? 'Add New Building' : 'Service Details')}
              {step === 3 && 'Urgency & Availability'}
              {step === 4 && 'Add Photos/Video'}
              {step === 5 && 'Request Submitted'}
            </h2>
          </div>
          <button onClick={handleCloseAttempt} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 w-full">
          <div 
            className="h-full bg-tembo-brand transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFormData({ ...formData, category: cat.id });
                    setStep(2);
                  }}
                  className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                    formData.category === cat.id 
                      ? 'border-tembo-brand bg-blue-50/50' 
                      : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`mb-3 ${formData.category === cat.id ? 'text-tembo-brand' : 'text-slate-500'}`}>
                    {cat.icon}
                  </div>
                  <span className="font-semibold text-slate-900">{cat.label}</span>
                  <span className="text-xs text-slate-500 mt-1">{cat.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              {!isAddingBuilding ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-700">Select Building or Apartment</label>
                      <button 
                        onClick={() => setIsAddingBuilding(true)}
                        className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        <Plus size={12} /> Add New
                      </button>
                    </div>
                    
                    <div className="relative mb-3">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search buildings..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                        value={buildingSearch}
                        onChange={(e) => setBuildingSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {buildings.map(loc => (
                        <button
                          key={loc}
                          onClick={() => setFormData({ ...formData, location: loc })}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                            formData.location === loc
                              ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                              : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${formData.location === loc ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <Briefcase size={14} />
                            </div>
                            <span className={`text-sm font-bold ${formData.location === loc ? 'text-blue-900' : 'text-slate-700'}`}>{loc}</span>
                          </div>
                          {formData.location === loc && <CheckCircle2 size={18} className="text-blue-600" />}
                        </button>
                      ))}
                      {!isLoadingBuildings && buildings.length === 0 && (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <p className="text-sm text-slate-500 font-medium">No buildings match your search.</p>
                          <button 
                            onClick={() => setIsAddingBuilding(true)}
                            className="mt-2 text-blue-600 text-xs font-bold hover:underline"
                          >
                            Add "{buildingSearch}" as new building?
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Issue Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                      placeholder="Please describe the issue in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-in">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                    <MapPin size={20} className="text-blue-600 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">Add New Facility Node</h4>
                      <p className="text-xs text-blue-700 leading-relaxed mt-1">
                        Register a new location under your facility management scope. This building will be available for future requests.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Building / Apartment Name</label>
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="e.g. Riverside Apartments Block B" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        value={newBuildingName}
                        onChange={(e) => setNewBuildingName(e.target.value)}
                      />
                    </div>
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 font-medium italic">
                      Note: Dispatch will verify the new building location upon arrival.
                    </div>

                    <button 
                      onClick={handleAddNewBuilding}
                      disabled={!newBuildingName.trim()}
                      className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        !newBuildingName.trim() ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                      }`}
                    >
                      Confirm Building <CheckCircle2 size={14} />
                    </button>
                    
                    <button 
                      onClick={() => setIsAddingBuilding(false)}
                      className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                    >
                      Cancel and return
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: URGENCY & AVAILABILITY */}
          {step === 3 && (
            <div className="space-y-8">
              <section>
                <label className="block text-sm font-bold text-slate-700 mb-4">
                  1. Urgency Level
                </label>
                <div className="space-y-3">
                  {URGENCIES.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setFormData({...formData, urgency: lvl.id})}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        formData.urgency === lvl.id
                          ? `${lvl.color} border-current shadow-sm`
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <span className={`block font-bold ${lvl.text}`}>{lvl.label}</span>
                        <span className="text-xs text-slate-500 font-medium">{lvl.sla}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                         formData.urgency === lvl.id ? `border-${lvl.text.split('-')[0]}-600` : 'border-slate-300'
                      }`}>
                        {formData.urgency === lvl.id && <div className={`w-2.5 h-2.5 rounded-full bg-${lvl.text.split('-')[0]}-600`} />}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-slate-700">
                    2. Preferred Service Window
                  </label>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Client Choice</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setFormData({...formData, availability: slot.id})}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                        formData.availability === slot.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${formData.availability === slot.id ? 'text-blue-600' : 'text-slate-400'}`}>
                        {slot.period}
                      </span>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={formData.availability === slot.id ? 'text-blue-600' : 'text-slate-400'} />
                        <span className={`text-sm font-bold ${formData.availability === slot.id ? 'text-blue-900' : 'text-slate-700'}`}>
                          {slot.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-400 italic flex items-center gap-2">
                  <AlertCircle size={12} /> Dispatch will prioritize matching your selected window based on technician availability.
                </p>
              </section>
            </div>
          )}

          {/* STEP 4: MEDIA */}
          {step === 4 && (
            <div className="space-y-6 animate-slide-in">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange}
              />
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Upload Visual Evidence</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">Providing photos helps our technicians prepare for the job.</p>
              </div>

              {formData.files.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.files.map((fileData, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                      <img src={fileData.preview} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={triggerFileInput}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Plus size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-slate-300 rounded-[32px] p-12 hover:bg-slate-50 transition-all cursor-pointer group flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Camera size={40} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Capture or Upload</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs">Tap to open camera or browse files to attach evidence of the issue.</p>
                  
                  <div className="mt-8 flex gap-3">
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Camera size={14} /> Use Camera
                    </button>
                    <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50">
                      <Upload size={14} /> Choose File
                    </button>
                  </div>
                </div>
              )}
              
              <div className="text-center pt-6">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck size={12} className="text-emerald-500" /> Secure encrypted upload protocol active
                </p>
                {formData.files.length === 0 && (
                   <button 
                   onClick={handleNext}
                   className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline font-medium"
                 >
                   Skip this step for now
                 </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-slide-in">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Request Submitted!</h3>
              <p className="text-slate-600 mt-2">Your ticket <span className="font-mono font-bold">#1025</span> has been created.</p>
              
              <div className="bg-slate-50 rounded-lg p-5 mt-6 text-left border border-slate-200 max-w-sm mx-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Service</span>
                  <span className="font-bold capitalize text-slate-900">{formData.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">{formData.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Urgency</span>
                  <span className="font-bold text-blue-600 capitalize">
                    {formData.urgency}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Scheduled Window</span>
                  <div className="text-right">
                    <span className="block font-bold text-slate-900">
                      {TIME_SLOTS.find(t => t.id === formData.availability)?.label}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {TIME_SLOTS.find(t => t.id === formData.availability)?.period}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
           {step > 1 && step < 5 ? (
            <button 
              onClick={handleBack}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2"
            >
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
           ) : (
             <div className="w-20"></div> 
           )}

           {step < 5 && !isAddingBuilding && (
             <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center px-8 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all ${
                  isSubmitting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-tembo-brand text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'
                }`}
             >
               {isSubmitting ? 'Submitting...' : (step === 4 ? (formData.files.length > 0 ? 'Submit with Photos' : 'Confirm & Submit') : 'Next')}
               {!isSubmitting && step !== 4 && <ArrowRight size={16} className="ml-2" />}
             </button>
           )}

           {step === 5 && (
             <div className="flex w-full gap-3">
               <button
                 onClick={resetAndClose}
                 className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors"
               >
                 Return to Dashboard
               </button>
               <button
                 onClick={handleTrackClick}
                 className="flex-1 bg-tembo-brand text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
               >
                 Track Request
               </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
