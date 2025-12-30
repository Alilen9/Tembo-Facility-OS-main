import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield, Zap, X, ChevronRight, UserCheck, MessageSquare, Activity, CreditCard } from './Icons';
import { JobPriority } from '../types';

export enum AlertType {
  SLA_BREACH = 'SLA_BREACH',
  SAFETY_INCIDENT = 'SAFETY_INCIDENT',
  BILLING_RISK = 'BILLING_RISK',
  STALLED_JOB = 'STALLED_JOB'
}

export interface GlobalAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  priority: 'emergency' | 'critical' | 'warning';
  ownerId?: string;
  ownerName?: string;
  linkId?: string;
}

const MOCK_ALERTS: GlobalAlert[] = [
  {
    id: 'a1',
    type: AlertType.SAFETY_INCIDENT,
    title: 'Technician Incident: Site Lockout',
    description: 'Tech J. Doe reported aggressive client behavior at Acme Corp HQ.',
    timestamp: new Date().toISOString(),
    priority: 'emergency',
    linkId: 'j101'
  },
  {
    id: 'a2',
    type: AlertType.SLA_BREACH,
    title: 'SLA Breach: Loading Dock Door',
    description: 'Critical repair #j102 is 45 minutes past promised arrival time.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    priority: 'critical',
    linkId: 'j102'
  },
  {
    id: 'a3',
    type: AlertType.BILLING_RISK,
    title: 'High-Value Revenue Risk',
    description: 'Invoice #INV-2023-004 (KES 185k) is now 24h past due.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    priority: 'warning',
    linkId: 'INV-2023-004'
  }
];

interface AlertSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertAction: (alert: GlobalAlert) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ isOpen, onClose, onAlertAction }) => {
  const [alerts, setAlerts] = useState<GlobalAlert[]>(MOCK_ALERTS);
  const [claimedByMe, setClaimedByMe] = useState<Set<string>>(new Set());

  const handleClaim = (alertId: string) => {
    const next = new Set(claimedByMe);
    next.add(alertId);
    setClaimedByMe(next);
  };

  const getAlertStyles = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20';
      case 'critical': return 'border-orange-500 bg-orange-50/50';
      case 'warning': return 'border-slate-300 bg-white';
      default: return 'border-slate-200 bg-white';
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.SAFETY_INCIDENT: return <Shield className="text-red-600" size={18} />;
      case AlertType.SLA_BREACH: return <Clock className="text-orange-600" size={18} />;
      case AlertType.BILLING_RISK: return <CreditCard className="text-purple-600" size={18} />;
      case AlertType.STALLED_JOB: return <Zap className="text-amber-500" size={18} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col pointer-events-auto animate-slide-in">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
           <div>
             <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               Situation Center
               <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{alerts.length}</span>
             </h2>
             <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Active Escalations</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {alerts.map((alert) => {
            const isClaimed = claimedByMe.has(alert.id);
            const isEmergency = alert.priority === 'emergency';

            return (
              <div 
                key={alert.id} 
                className={`relative rounded-xl border-l-4 p-4 transition-all hover:shadow-md ${getAlertStyles(alert.priority)}`}
              >
                {isEmergency && !isClaimed && (
                  <div className="absolute top-0 right-0 w-2 h-2 mt-2 mr-2 bg-red-600 rounded-full animate-ping" />
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate pr-4">{alert.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {alert.description}
                    </p>

                    <div className="flex items-center gap-2">
                      {isClaimed ? (
                        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-emerald-200">
                          <UserCheck size={14} /> Claimed by You
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleClaim(alert.id)}
                          className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-colors"
                        >
                          Claim Responsibility
                        </button>
                      )}
                      
                      <button 
                        onClick={() => onAlertAction(alert)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-slate-50 transition-colors"
                      >
                        Investigate <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
           <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-2">
             <Activity size={14} />
             View Incident Log History
           </button>
        </div>
      </div>
    </div>
  );
};

export const GlobalTriageBar: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  return (
    <div 
      onClick={onOpen}
      className="h-8 bg-slate-900 text-white flex items-center justify-center gap-8 px-6 cursor-pointer hover:bg-slate-800 transition-colors z-[60] relative border-b border-white/10 shadow-lg"
    >
       <div className="flex items-center gap-2 animate-pulse">
         <Shield className="text-red-500" size={14} />
         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">1 Emergency Active</span>
       </div>
       <div className="w-px h-3 bg-slate-700" />
       <div className="flex items-center gap-2">
         <Clock className="text-orange-400" size={14} />
         <span className="text-[10px] font-bold uppercase tracking-widest leading-none">3 SLA Breaches</span>
       </div>
       <div className="w-px h-3 bg-slate-700" />
       <div className="flex items-center gap-2">
         <CreditCard className="text-purple-400" size={14} />
         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">2 Billing Risks</span>
       </div>
    </div>
  );
};
