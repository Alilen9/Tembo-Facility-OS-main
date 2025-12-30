
import React, { useState } from 'react';
import { MOCK_INVOICES, MOCK_CONTRACT, PRICING_PLANS } from '../constants';
import { DownloadCloud, CheckCircle2, AlertCircle, FileText, ArrowRight, Zap, Shield, CreditCard, Star, X, Clock, Activity, AlertTriangle, Send } from './Icons';

interface BillingViewProps {}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClass = 'bg-slate-100 text-slate-600';
  if (status === 'Paid' || status === 'Active') colorClass = 'bg-emerald-100 text-emerald-700';
  if (status === 'Unpaid') colorClass = 'bg-orange-100 text-orange-700';
  if (status === 'Overdue' || status === 'Expired') colorClass = 'bg-red-100 text-red-700';

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${colorClass}`}>
      {status}
    </span>
  );
};

export const BillingView: React.FC<BillingViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices'>('contracts');

  const totalOwed = MOCK_INVOICES.reduce((sum, inv) => inv.status !== 'Paid' ? sum + inv.amount : sum, 0);
  const overdueExposure = MOCK_INVOICES.reduce((sum, inv) => inv.status === 'Overdue' ? sum + inv.amount : sum, 0);
  const collectionRate = 84; // Mock percentage

  const handlePay = (id: string) => {
    alert(`Starting payment flow for Invoice #${id}`);
  };

  const handleDownload = (id: string) => {
    alert(`Downloading PDF for #${id}`);
  };

  const handleNudge = (id: string) => {
    alert(`Revenue nudge sent to client for Invoice #${id}.`);
  };

  return (
    <div className="animate-slide-in space-y-6">
      
      {/* Revenue Control Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Control Tower</h2>
           <p className="text-sm text-slate-500">Monitoring cash flow and automated contract billing.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
              <Activity size={14} /> Billing Report
           </button>
        </div>
      </div>

      {/* REVENUE HEALTH HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding (MTD)</span>
               <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard size={16} />
               </div>
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold text-slate-900">KES {totalOwed.toLocaleString()}</span>
               <span className="text-xs font-bold text-emerald-600">+12% vs LY</span>
            </div>
         </div>

         <div className={`p-5 rounded-xl border shadow-sm transition-colors ${overdueExposure > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-2">
               <span className={`text-[10px] font-bold uppercase tracking-widest ${overdueExposure > 0 ? 'text-red-600' : 'text-slate-400'}`}>Overdue Exposure</span>
               <div className={`p-1.5 rounded-lg ${overdueExposure > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                  <AlertTriangle size={16} />
               </div>
            </div>
            <div className="flex items-baseline gap-2">
               <span className={`text-2xl font-bold ${overdueExposure > 0 ? 'text-red-700' : 'text-slate-900'}`}>KES {overdueExposure.toLocaleString()}</span>
               <span className="text-xs font-medium text-slate-500">{MOCK_INVOICES.filter(i => i.status === 'Overdue').length} invoices</span>
            </div>
         </div>

         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Gen Accuracy</span>
               <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={16} />
               </div>
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold text-slate-900">{collectionRate}%</span>
               <div className="flex-1 ml-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collectionRate}%` }} />
               </div>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('contracts')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'contracts' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Contract Schedules
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'invoices' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard size={16} /> Invoice Ledger
        </button>
      </div>

      {/* CONTENT: CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {PRICING_PLANS.map((plan) => {
                const isCurrent = MOCK_CONTRACT.planId === plan.id;
                
                return (
                  <div 
                    key={plan.id}
                    className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
                      isCurrent 
                        ? 'border-blue-500 ring-4 ring-blue-500 ring-opacity-10 z-10' 
                        : 'border-slate-200'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                        ACTIVE PLAN
                      </div>
                    )}

                    <div className="p-6">
                       <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                       <div className="mt-4 flex items-baseline gap-1">
                         <span className="text-2xl font-bold text-slate-900">KES {plan.price.toLocaleString()}</span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">/ {plan.billingCycle.split(' / ')[0]}</span>
                       </div>

                       {/* Cycle Progress */}
                       {isCurrent && (
                         <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                               <span>Billing Cycle</span>
                               <span>Next: Nov 25</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600 w-2/3 transition-all" />
                            </div>
                         </div>
                       )}

                       <div className="mt-6 space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Commitment</p>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                             <Clock size={16} className="text-blue-500" /> {plan.sla}
                          </div>
                       </div>
                    </div>

                    <div className="p-5 bg-slate-50 border-t border-slate-100">
                       <button 
                         disabled={isCurrent}
                         className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                           isCurrent 
                             ? 'bg-white border border-slate-200 text-slate-400 cursor-default' 
                             : 'bg-slate-900 text-white hover:bg-slate-800'
                         }`}
                       >
                         {isCurrent ? 'Current Schedule' : 'Request Upgrade'}
                       </button>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* CONTENT: INVOICES (High Density Ledger) */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
               <tr>
                 <th className="px-6 py-4 border-b border-slate-200">Invoice Source</th>
                 <th className="px-6 py-4 border-b border-slate-200">Cycle / Date</th>
                 <th className="px-6 py-4 border-b border-slate-200">Amount</th>
                 <th className="px-6 py-4 border-b border-slate-200">Revenue Risk</th>
                 <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {MOCK_INVOICES.map((inv) => {
                 const isAuto = inv.description.includes('Auto-generated');
                 const isRisk = inv.status === 'Overdue';

                 return (
                   <tr key={inv.id} className={`group hover:bg-slate-50 transition-colors ${isRisk ? 'bg-red-50/20' : ''}`}>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isAuto ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                             {isAuto ? <Zap size={16} /> : <FileText size={16} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{inv.id}</div>
                            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[220px]">{inv.description}</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="text-slate-600 font-medium">{new Date(inv.dateIssued).toLocaleDateString()}</div>
                       <div className="text-[10px] text-slate-400">Net 30 Terms</div>
                     </td>
                     <td className="px-6 py-4 font-mono font-bold text-slate-900">
                       KES {inv.amount.toLocaleString()}
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <StatusBadge status={inv.status} />
                          {isRisk && (
                            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" title="High Risk" />
                          )}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button 
                            onClick={() => handleDownload(inv.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <DownloadCloud size={18} />
                          </button>
                          
                          {inv.status !== 'Paid' && (
                             <>
                                <button 
                                  onClick={() => handleNudge(inv.id)}
                                  className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Send Revenue Nudge"
                                >
                                  <Send size={18} />
                                </button>
                                <button 
                                  onClick={() => handlePay(inv.id)}
                                  className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 shadow-sm"
                                >
                                  Collect
                                </button>
                             </>
                          )}
                        </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
           
           {/* Ledger Footer */}
           <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">End of current audit period</span>
              <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                 Export Ledger to CSV <ArrowRight size={14} />
              </button>
           </div>
        </div>
      )}

      {/* FOOTER ACTION: UPGRADE CONTEXT */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
         <div className="absolute -right-10 -bottom-10 p-20 opacity-10">
            <Shield size={160} />
         </div>
         <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">Operational Scalability Notice</h3>
            <p className="text-sm text-slate-400">Your site <span className="text-white font-bold">Acme Corp HQ</span> is maintaining 98% SLA compliance. You qualify for Premium Portfolio rates.</p>
         </div>
         <button className="relative z-10 bg-white text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/5 whitespace-nowrap">
            Explore Portfolio Plan
         </button>
      </div>

    </div>
  );
};
