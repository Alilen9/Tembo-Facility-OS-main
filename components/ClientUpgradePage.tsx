import React, { useState } from 'react';

interface UpgradeRequest {
  id: string;
  planName: string;
  phone: string;
  message?: string;
  status: 'pending' | 'stk-sent' | 'paid';
}

// Mock requests — in real app, fetch from backend
const MOCK_REQUESTS: UpgradeRequest[] = [
  {
    id: 'r1',
    planName: 'Premium',
    phone: '0712345678',
    message: 'Please upgrade ASAP',
    status: 'pending',
  },
  {
    id: 'r2',
    planName: 'Business',
    phone: '0723456789',
    status: 'pending',
  },
];

export const TechnicianUpgradePage: React.FC = () => {
  const [requests, setRequests] = useState<UpgradeRequest[]>(MOCK_REQUESTS);

  // Send STK push to client
  const sendSTK = (id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'stk-sent' } : r))
    );
    console.log('STK push sent for request:', id);
    alert('STK push simulated. Client should enter MPESA PIN.');
  };

  // Confirm payment & upgrade plan
  const markPaid = (id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'paid' } : r))
    );
    alert('Payment received! Plan upgraded.');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pending Upgrade Requests</h1>

      {requests.length === 0 && <p>No pending requests.</p>}

      {requests.map(r => (
        <div
          key={r.id}
          className="border rounded-xl p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-bold">{r.planName} Plan</p>
            <p>Phone: {r.phone}</p>
            {r.message && <p>Message: {r.message}</p>}
            <p>
              Status:{' '}
              <span
                className={`font-bold ${
                  r.status === 'paid'
                    ? 'text-green-600'
                    : r.status === 'stk-sent'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {r.status}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {r.status === 'pending' && (
              <button
                onClick={() => sendSTK(r.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Send STK
              </button>
            )}

            {r.status === 'stk-sent' && (
              <button
                onClick={() => markPaid(r.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm Paid & Upgrade
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
