import React, { useEffect, useState } from 'react';
import { clientService, ClientStats } from '../../services/clientService';
import {
  Activity,
  Clock,
  DollarSign,
  Calendar,
  ClipboardList,
} from '../Icons';
import { JobStatus } from '../../types';

export const ClientDashboard: React.FC = () => {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService
      .getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Active Jobs"
          value={stats?.activeJobsCount ?? 0}
          subtitle="Currently being worked on"
          icon={<Activity />}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingActionsCount ?? 0}
          subtitle="Waiting for action"
          icon={<Clock />}
          color="amber"
        />
        <StatCard
          title="Monthly Spend"
          value={`KES ${stats?.totalSpend.toLocaleString() ?? 0}`}
          subtitle="This month"
          icon={<DollarSign />}
          color="emerald"
        />
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <QuickAction
          icon={<ClipboardList />}
          title="My Requests"
          desc="View all service requests"
        />
        <QuickAction
          icon={<Calendar />}
          title="Scheduled Jobs"
          desc="Upcoming services"
        />
        <QuickAction
          icon={<Activity />}
          title="Job History"
          desc="Completed maintenance jobs"
        />
      </section>

      {/* ================= RECENT REQUESTS ================= */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-black text-slate-900">Recent Requests</h3>
        </div>

        {stats?.recentJobs?.length ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Request</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.category}</p>
                      </td>
                      <td>
                        <StatusPill status={job.status} />
                      </td>
                      <td className="text-slate-500">
                        {new Date(job.dateCreated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {stats.recentJobs.map((job) => (
                <div key={job.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{job.category}</p>
                    </div>
                    <StatusPill status={job.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>{new Date(job.dateCreated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-400">
            No recent requests found.
          </div>
        )}
      </section>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'emerald';
}) => {
  // Tailwind classes mapped for colors
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-xl ${colorMap[color].bg} ${colorMap[color].text} mb-4`}
      >
        {icon}
      </div>
      <p className="text-sm text-slate-500 font-bold uppercase">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
};

const QuickAction = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition">
    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="font-black text-slate-900">{title}</p>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const StatusPill = ({ status }: { status: JobStatus }) => {
  const styles: Record<JobStatus, string> = {
    PENDING: 'bg-slate-100 text-slate-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    SCHEDULED: 'bg-indigo-100 text-indigo-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};
