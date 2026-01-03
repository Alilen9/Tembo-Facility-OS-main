import { PRICING_PLANS } from '@/constants';
import React, { useState } from 'react';
import { clientService } from '../../services/clientService';
import toast from 'react-hot-toast';

interface Props {
  planId: string;
  onBack: () => void;
}

export const UpgradeRequestPage: React.FC<Props> = ({ planId, onBack }) => {
  const plan = PRICING_PLANS.find(p => p.id === planId);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!plan) return null;

  const submitRequest = async () => {
    if (!phone) {
      toast.error('Please enter your phone number.');
      return;
    }

    try {
      await clientService.requestUpgrade({ planId, phone, message });
      setSubmitted(true);
      toast.success('Upgrade request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit upgrade request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
      <button
        onClick={onBack}
        className="text-sm text-slate-500 font-bold"
      >
        ← Back to Billing
      </button>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold">{plan.name} Plan</h2>
        <p className="text-slate-600 mt-2">
          This plan offers enhanced SLA coverage, faster response times, and priority support.
        </p>

        <p className="mt-4 text-lg font-extrabold">
          KES {plan.price.toLocaleString()} / month
        </p>

        {!submitted ? (
          <>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-4 border rounded-lg p-3 text-sm"
            />

            <textarea
              placeholder="Optional message to admin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-4 border rounded-lg p-3 text-sm"
            />

            <button
              onClick={submitRequest}
              className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold w-full"
            >
              Submit Upgrade Request
            </button>
          </>
        ) : (
          <div className="mt-6 bg-emerald-100 text-emerald-700 p-4 rounded-lg font-bold text-sm space-y-2">
            <p>✅ Upgrade request submitted successfully!</p>
            <p>A prompt will be sent to <span className="font-bold">{phone}</span> to enter your PIN to confirm the upgrade.</p>
            <p>The operator/admin will review your request afterward.</p>
          </div>
        )}
      </div>
    </div>
  );
};
