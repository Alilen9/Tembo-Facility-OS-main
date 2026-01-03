import React from 'react';
import { MOCK_INVOICES } from '../../constants';
import { ArrowLeft } from '../Icons';

interface BillingReportProps {
  onBack: () => void;
}

export const BillingReport: React.FC<BillingReportProps> = ({ onBack }) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold">Billing Report</h2>
        <button onClick={onBack} className="flex items-center justify-center w-full md:w-auto gap-2 text-sm font-bold px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="bg-slate-900 text-white p-4 rounded overflow-x-auto">
        <pre className="text-xs md:text-sm">
          {JSON.stringify(MOCK_INVOICES, null, 2)}
        </pre>
      </div>
    </div>
  );
};
