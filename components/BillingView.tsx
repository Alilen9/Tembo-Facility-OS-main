import React, { useState } from 'react';
import { MOCK_INVOICES, MOCK_CONTRACT, PRICING_PLANS } from '../constants';
import { DownloadCloud, Activity, Clock, Shield, CreditCard } from './Icons';

interface BillingViewProps {
  onOpenReport: () => void;
  onRequestUpgrade: (planId: string) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Expired: 'bg-red-100 text-red-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Paid: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

export const BillingView: React.FC<BillingViewProps> = ({ onOpenReport, onRequestUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices'>('contracts');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const selectedInvoice = MOCK_INVOICES.find(inv => inv.id === selectedInvoiceId);
  const selectedPlan = PRICING_PLANS.find(p => p.id === selectedPlanId);

  // ================= INVOICE DETAILS =================
  if (selectedInvoice) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
        <button
          onClick={() => setSelectedInvoiceId(null)}
          className="text-sm text-slate-500 font-bold"
        >
          ← Back to Invoice Ledger
        </button>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-bold">Invoice {selectedInvoice.id}</h2>
          <p className="text-slate-600 mt-2">Status: <StatusBadge status={selectedInvoice.status} /></p>
          <p className="text-slate-600 mt-2">Amount: KES {selectedInvoice.amount.toLocaleString()}</p>
          <p className="text-slate-600 mt-2">Due Date: {selectedInvoice.dueDate}</p>
          <p className="text-slate-600 mt-2">Description: {selectedInvoice.description}</p>

          <button
            onClick={() => console.log('Download PDF', selectedInvoice.id)}
            className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <DownloadCloud size={16} /> Download PDF
          </button>
        </div>
      </div>
    );
  }

  // ================= PLAN DETAILS MODAL =================
  if (selectedPlan) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
        <button
          onClick={() => setSelectedPlanId(null)}
          className="text-sm text-slate-500 font-bold"
        >
          ← Back to Plans
        </button>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-bold">{selectedPlan.name} Plan</h2>
          <p className="text-slate-600 mt-2">
            Price: KES {selectedPlan.price.toLocaleString()} / month
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Clock size={14} />{selectedPlan.sla}</div>
            <div className="flex items-center gap-2"><Shield size={14} />SLA Commitment</div>
            <div className="flex items-center gap-2"><CreditCard size={14} />Billing Cycle: Monthly</div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg text-blue-700 font-bold text-sm">
            You are currently on this plan. To upgrade, click another plan. 
            For your current plan, payment prompts will be sent to your registered phone number.
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN BILLING VIEW =================
  return (
    <div className="space-y-6 animate-slide-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Billing & Plans</h2>
          <p className="text-sm text-slate-500">Contracts, invoices & billing cycles</p>
        </div>

        <button
          onClick={onOpenReport}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
        >
          <Activity size={14} /> Billing Report
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-6 py-3 font-bold ${activeTab === 'contracts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
        >
          Contract Schedules
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-bold ${activeTab === 'invoices' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
        >
          Invoice Ledger
        </button>
      </div>

      {/* ================= CONTRACTS ================= */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map(plan => {
            const isActive = plan.id === MOCK_CONTRACT.planId;

            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-6 bg-white relative ${isActive ? 'ring-2 ring-blue-600' : ''}`}
              >
                {isActive && <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">ACTIVE PLAN</span>}
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-extrabold mt-2">
                  KES {plan.price.toLocaleString()}<span className="text-sm text-slate-400"> / month</span>
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Clock size={14} />{plan.sla}</div>
                  <div className="flex items-center gap-2"><Shield size={14} />SLA Commitment</div>
                  <div className="flex items-center gap-2"><CreditCard size={14} />Billing Cycle: Monthly</div>
                </div>

                <button
                  onClick={() => isActive ? setSelectedPlanId(plan.id) : onRequestUpgrade(plan.id)}
                  className={`mt-6 w-full py-2 rounded-lg text-sm font-bold ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}
                >
                  {isActive ? 'Current Schedule – View Details' : 'Request Upgrade'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= INVOICES ================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {MOCK_INVOICES.map(inv => (
                <tr key={inv.id} className="border-b">
                  <td className="px-6 py-4 font-bold">{inv.id}</td>
                  <td className="px-6 py-4">KES {inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                    >
                      View
                    </button>
                    <button className="p-2">
                      <DownloadCloud size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
