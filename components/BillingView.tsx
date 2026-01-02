import React, { useState } from 'react';
import { MOCK_INVOICES, MOCK_CONTRACT, PRICING_PLANS } from '../constants';

import {
  DownloadCloud,
  Activity,
  Clock,
  Shield,
  CreditCard
} from './Icons';

interface BillingViewProps {
  onOpenReport: () => void;
  onRequestUpgrade: (planId: string) => void;
}

// Badge component for invoice status
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Expired: 'bg-red-100 text-red-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Paid: 'bg-slate-100 text-slate-700'
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const BillingView: React.FC<BillingViewProps> = ({
  onOpenReport,
  onRequestUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices'>(
    'contracts'
  );

  const totalOwed = MOCK_INVOICES.reduce(
    (s, i) => (i.status !== 'Paid' ? s + i.amount : s),
    0
  );

  return (
    <div className="space-y-6 animate-slide-in">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Billing & Plans</h2>
          <p className="text-sm text-slate-500">
            Contracts, invoices & billing cycles
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
        >
          <Activity size={14} />
          Billing Report
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-6 py-3 font-bold ${
            activeTab === 'contracts'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500'
          }`}
        >
          Contract Schedules
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-bold ${
            activeTab === 'invoices'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500'
          }`}
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
                className={`rounded-xl border p-6 bg-white relative ${
                  isActive ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {isActive && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    ACTIVE PLAN
                  </span>
                )}

                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-extrabold mt-2">
                  KES {plan.price.toLocaleString()}
                  <span className="text-sm text-slate-400"> / month</span>
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {plan.sla}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} />
                    SLA Commitment
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} />
                    Billing Cycle: Monthly
                  </div>
                </div>

                {/* REQUEST UPGRADE BUTTON */}
                <button
                  onClick={() => !isActive && onRequestUpgrade(plan.id)}
                  className={`mt-6 w-full py-2 rounded-lg text-sm font-bold ${
                    isActive
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white'
                  }`}
                  disabled={isActive}
                >
                  {isActive ? 'Current Schedule' : 'Request Upgrade'}
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
                  <td className="px-6 py-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
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
