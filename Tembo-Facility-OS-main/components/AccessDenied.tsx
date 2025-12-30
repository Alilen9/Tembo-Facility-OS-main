import React from 'react';
import { Lock } from './Icons';

export const AccessDenied: React.FC<{ message?: string }> = ({ message = "You do not have permission to view this area." }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 mb-4">
        <Lock size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
      <p className="text-slate-500 mt-2 max-w-sm">{message}</p>
    </div>
  );
};
