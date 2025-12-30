import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BrainCircuit } from './Icons';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';
import { authService } from '../services/authService';

const ROLE_STYLES = {
  CLIENT: 'bg-emerald-600 hover:bg-emerald-700',
  TECHNICIAN: 'bg-blue-600 hover:bg-blue-700',
  ADMIN: 'bg-orange-600 hover:bg-orange-700',
  SUPER_ADMIN: 'bg-purple-600 hover:bg-purple-700',
};

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registered, setRegistered] = useState(false);
  const [company, setCompany] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
            <BrainCircuit className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Tembo Facility OS</h1>
          <p className="text-slate-400 text-sm mt-2">Facility operations & service management</p>
        </div>

        {/* Role Switcher */}
        <div className="flex justify-between bg-slate-800 rounded-xl p-1 mb-6">
          {Object.values(UserRole).map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setRegistered(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                role === r ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">
            {role === UserRole.CLIENT && !registered ? 'Create an account' : 'Sign in'}
          </h2>

          <div className="space-y-4">
            {role === UserRole.CLIENT && !registered && (
              <>
                <input
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-lg"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <input
                  placeholder="Company"
                  className="w-full p-3 border rounded-lg"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </>
            )}

            <input
              placeholder="Email"
              className="w-full p-3 border rounded-lg"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              className={`w-full py-3 text-white font-semibold rounded-lg transition ${ROLE_STYLES[role]}`}
              onClick={async () => {
                try {
                  if (role === UserRole.CLIENT && !registered) {
                    const data = await authService.register(name, email, password, role, company);
                    if (data.token) {
                      setRegistered(true);
                      toast.success('Registered successfully');
                    }
                  } else {
                    const data = await authService.login(email, password);
                    if (data.token) {
                      login(data.user, data.token);
                    }
                  }
                } catch (error: any) {
                  console.error(error);
                  const message = error.response?.data?.message || 'Authentication failed';
                  toast.error(message);
                }
              }}
            >
              {role === UserRole.CLIENT && !registered ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
