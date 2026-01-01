import React from 'react';
import { MOCK_INVOICES } from '../../constants';
import { ArrowLeft } from '../Icons';

interface BillingReportProps {
  onBack: () => void;
}

export const BillingReport: React.FC<BillingReportProps> = ({ onBack }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Billing Report</h2>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <pre className="bg-slate-900 text-white p-4 rounded">
        {JSON.stringify(MOCK_INVOICES, null, 2)}
      </pre>
    </div>
  );
};
