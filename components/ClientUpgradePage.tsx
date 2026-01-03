import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';

interface UpgradeRequest {
  id: string;
  clientName: string;
  planName: string;
  phone: string;
  message?: string;
  status: string;
  createdAt: string;
}

export const TechnicianUpgradePage: React.FC = () => {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRequests(page);
  }, [page]);

  const loadRequests = async (currentPage: number) => {
    setLoading(true);
    try {
      const data = await adminService.getUpgradeRequests(currentPage);
      
      const mappedRequests = data.requests.map((item: any) => {
        // Parse description: "Client requested upgrade to Plan: {plan}. Contact: {phone}. Message: {msg}"
        const desc = item.description || '';
        const planMatch = desc.match(/Plan: (.*?)\./);
        const phoneMatch = desc.match(/Contact: (.*?)\./);
        const msgMatch = desc.match(/Message: (.*)/);

        return {
          id: item.id,
          clientName: item.client_name,
          planName: planMatch ? planMatch[1] : 'Unknown Plan',
          phone: phoneMatch ? phoneMatch[1] : item.client_phone || 'N/A',
          message: msgMatch ? msgMatch[1] : desc,
          status: item.status,
          createdAt: item.created_at
        };
      });

      setRequests(mappedRequests);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load upgrade requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (!window.confirm('Mark this upgrade request as completed?')) return;
    try {
      await adminService.resolveTicket(id);
      toast.success('Request marked as resolved');
      loadRequests(page); // Refresh list
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleSendSTK = (phone: string) => {
    toast.success(`STK Push initiated for ${phone}`);
    // In production, this would call adminService.sendSTK(phone, amount)
  };

  if (loading) return <div className="p-6 text-slate-400">Loading requests...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pending Upgrade Requests</h1>

      {requests.length === 0 && <p className="text-slate-500">No pending requests.</p>}

      {requests.map(r => (
        <div
          key={r.id}
          className="border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-slate-900">{r.planName} Plan</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Request</span>
            </div>
            <p className="text-sm text-slate-600"><span className="font-bold">Client:</span> {r.clientName}</p>
            <p className="text-sm text-slate-600"><span className="font-bold">Contact:</span> {r.phone}</p>
            {r.message && <p className="text-sm text-slate-500 mt-1 italic">"{r.message}"</p>}
            <p className="text-xs text-slate-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSendSTK(r.phone)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Smartphone size={16} /> Send STK Push
            </button>
            <button
              onClick={() => handleResolve(r.id)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              Mark as Completed
            </button>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
