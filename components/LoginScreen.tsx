import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
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
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(true);

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
              onClick={() => { setRole(r); setRegistered(true); }}
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
              </>
            )}

            <input
              placeholder="Email"
              className="w-full p-3 border rounded-lg"
              value={email}
              onChange={e => setEmail(e.target.value.toLowerCase().trim())}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full p-3 border rounded-lg pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            <button
              className={`w-full py-3 text-black font-semibold rounded-lg transition ${ROLE_STYLES[role]}`}
              onClick={async () => {
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  toast.error('Please enter a valid email address');
                  return;
                }

                try {
                  if (role === UserRole.CLIENT && !registered) {
                    const data = await authService.register(name, email, password, role, 'Default Company');
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

            {role === UserRole.CLIENT && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setRegistered(!registered)}
                  className="text-sm text-slate-500 hover:text-blue-600 font-medium"
                >
                  {!registered ? 'Already have an account? Sign in' : 'Need an account? Create one'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
