import React, { useState } from 'react';
import { BrainCircuit, Users, Wrench, Shield, Briefcase } from './Icons';

export enum UserRole {
  CLIENT = 'CLIENT',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

const ROLE_STYLES = {
  CLIENT: 'bg-emerald-600 hover:bg-emerald-700',
  TECHNICIAN: 'bg-blue-600 hover:bg-blue-700',
  ADMIN: 'bg-orange-600 hover:bg-orange-700',
  SUPER_ADMIN: 'bg-purple-600 hover:bg-purple-700',
};

export const LoginScreen: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registered, setRegistered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
            <BrainCircuit className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Tembo Facility OS</h1>
          <p className="text-slate-400 text-sm mt-2">
            Facility operations & service management
          </p>
        </div>

        {/* ROLE SWITCHER */}
        <div className="flex justify-between bg-slate-800 rounded-xl p-1 mb-6">
          {Object.values(UserRole).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setRegistered(false);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                role === r
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* AUTH CARD */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">

          <h2 className="text-xl font-semibold mb-1">
            {role === UserRole.CLIENT && !registered
              ? 'Create an account'
              : 'Sign in'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Access your dashboard
          </p>

          <div className="space-y-4">
            {role === UserRole.CLIENT && !registered && (
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className={`w-full py-3 text-white font-semibold rounded-lg transition ${ROLE_STYLES[role]}`}
              onClick={() => {
                if (role === UserRole.CLIENT && !registered) {
                  setRegistered(true);
                  alert('Registered successfully');
                } else {
                  alert(`Logged in as ${role}`);
                }
              }}
            >
              {role === UserRole.CLIENT && !registered
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
