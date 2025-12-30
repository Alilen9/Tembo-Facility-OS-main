
import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Zap, Droplets, Thermometer, Hammer, Shield, SprayCan, AlertCircle, Camera, Upload, CheckCircle2, Clock } from './Icons';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrack?: () => void;
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

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ isOpen, onClose, onTrack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    urgency: 'low',
    availability: 'morning',
    files: [] as File[],
  });

  const handleNext = () => {
    if (step === 2 && (!formData.location || !formData.description)) return; 
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);
  
  const resetAndClose = () => {
    setStep(1);
    setFormData({ category: '', location: '', description: '', urgency: 'low', availability: 'morning', files: [] });
    onClose();
  };

  const handleTrackClick = () => {
    if (onTrack) onTrack();
    resetAndClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={resetAndClose}></div>

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
              {step === 2 && 'Service Details'}
              {step === 3 && 'Urgency & Availability'}
              {step === 4 && 'Add Photos/Video'}
              {step === 5 && 'Request Submitted'}
            </h2>
          </div>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600">
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
                    handleNext();
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
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                <div className="grid grid-cols-2 gap-3">
                  {['HQ - Floor 1', 'HQ - Floor 2', 'Warehouse A', 'North Branch', 'Parking Lot', 'Other'].map(loc => (
                    <button
                      key={loc}
                      onClick={() => setFormData({...formData, location: loc})}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                        formData.location === loc
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                  placeholder="Please describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
                {formData.description.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Please provide at least a few words.</p>
                )}
              </div>
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
            <div className="text-center py-8">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Upload Evidence</h3>
                <p className="text-sm text-slate-500 mt-1">Take a photo or upload a file</p>
                <button className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  Select Files
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">Supported: JPG, PNG, MP4 (Max 20MB)</p>
              
              {/* Skip option */}
              <button 
                onClick={handleNext}
                className="mt-8 text-sm text-slate-500 hover:text-slate-800 underline"
              >
                Skip this step
              </button>
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
                  <span className="font-bold text-slate-900">{formData.location}</span>
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

           {step < 5 && (
             <button
                onClick={handleNext}
                disabled={step === 2 && (!formData.location || !formData.description)}
                className={`flex items-center px-8 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all ${
                  step === 2 && (!formData.location || !formData.description)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-tembo-brand text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'
                }`}
             >
               {step === 4 ? 'Confirm & Submit' : 'Next'}
               {step !== 4 && <ArrowRight size={16} className="ml-2" />}
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
                 className="flex-1 bg--brand text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
