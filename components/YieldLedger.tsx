import React, { useState } from 'react';

type LedgerStatus = 'PENDING' | 'APPROVED' | 'FLAGGED';

interface LedgerEntry {
  id: string;
  jobId: string;
  client: string;
  technician: string;
  amount: number;
  commission: number;
  payout: number;
  status: LedgerStatus;
  date: string;
}

const MOCK_LEDGER: LedgerEntry[] = [
  {
    id: 'L001',
    jobId: 'J1021',
    client: 'Safaricom PLC',
    technician: 'John Mwangi',
    amount: 12000,
    commission: 2000,
    payout: 10000,
    status: 'PENDING',
    date: '2026-01-02',
  },
  {
    id: 'L002',
    jobId: 'J1022',
    client: 'KCB Bank',
    technician: 'Alice Njeri',
    amount: 18000,
    commission: 3000,
    payout: 15000,
    status: 'APPROVED',
    date: '2026-01-01',
  },
];

export const YieldLedger: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>(MOCK_LEDGER);
  const [filter, setFilter] = useState<LedgerStatus | 'ALL'>('ALL');

  const filteredEntries =
    filter === 'ALL'
      ? entries
      : entries.filter(e => e.status === filter);

  const updateStatus = (id: string, status: LedgerStatus) => {
    setEntries(prev =>
      prev.map(e =>
        e.id === id ? { ...e, status } : e
      )
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Yield Ledger</h2>
        <p className="text-gray-500 text-sm">
          Review, approve and track operational revenue
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Collected"
          value={`KES ${entries.reduce((a, b) => a + b.amount, 0).toLocaleString()}`}
        />
        <SummaryCard
          title="Pending Approval"
          value={entries.filter(e => e.status === 'PENDING').length}
        />
        <SummaryCard
          title="Approved Payouts"
          value={`KES ${entries
            .filter(e => e.status === 'APPROVED')
            .reduce((a, b) => a + b.payout, 0)
            .toLocaleString()}`}
        />
      </div>

      {/* FILTER */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 md:flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'FLAGGED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium border whitespace-nowrap
              ${filter === s
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'}
            `}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Job</th>
              <th className="p-3">Client</th>
              <th className="p-3">Technician</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Commission</th>
              <th className="p-3">Payout</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(entry => (
              <tr key={entry.id} className="border-t">
                <td className="p-3">{entry.jobId}</td>
                <td className="p-3">{entry.client}</td>
                <td className="p-3">{entry.technician}</td>
                <td className="p-3">KES {entry.amount.toLocaleString()}</td>
                <td className="p-3 text-red-600">
                  KES {entry.commission.toLocaleString()}
                </td>
                <td className="p-3 text-green-600">
                  KES {entry.payout.toLocaleString()}
                </td>
                <td className="p-3">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="p-3 space-x-2">
                  {entry.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(entry.id, 'APPROVED')}
                        className="text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(entry.id, 'FLAGGED')}
                        className="text-red-600 hover:underline"
                      >
                        Flag
                      </button>
                    </>
                  )}
                  {entry.status !== 'PENDING' && (
                    <span className="text-gray-400">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- SUB COMPONENTS ---------- */

const SummaryCard: React.FC<{ title: string; value: any }> = ({ title, value }) => (
  <div className="border rounded-lg p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold mt-1">{value}</p>
  </div>
);

const StatusBadge: React.FC<{ status: LedgerStatus }> = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    FLAGGED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
};
