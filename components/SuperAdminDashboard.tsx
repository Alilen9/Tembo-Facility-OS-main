
import React, { useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Zap, Target, 
  Layers, ArrowRight, ShieldCheck, AlertCircle, 
  Clock, Users, BarChart, AlertTriangle, Activity,
  Shield, DollarSign, ArrowLeft, Star, Wrench, Box, Hammer, SprayCan, Thermometer, Droplets
} from './Icons';

// --- STRATEGIC TYPES ---
interface ServiceMeta {
  type: string;
  margin: number;
  quality: number;
  revenue: number;
  target: number;
  leakage: number;
  yieldPerHour: number;
  status: 'SCALE' | 'FIX' | 'PAUSE';
  velocity: 'UP' | 'DOWN' | 'STABLE';
  utilization: number;
}

const STRATEGIC_DATA: ServiceMeta[] = [
  { type: 'Construction', margin: 55, quality: 65, revenue: 1200000, target: 2500000, leakage: 240000, yieldPerHour: 8400, status: 'FIX', velocity: 'DOWN', utilization: 98 },
  { type: 'HVAC', margin: 48, quality: 92, revenue: 850000, target: 1000000, leakage: 12000, yieldPerHour: 5200, status: 'SCALE', velocity: 'UP', utilization: 114 },
  { type: 'Electrical', margin: 32, quality: 78, revenue: 450000, target: 500000, leakage: 45000, yieldPerHour: 4800, status: 'FIX', velocity: 'STABLE', utilization: 82 },
  { type: 'Plumbing', margin: 22, quality: 94, revenue: 310000, target: 400000, leakage: 8000, yieldPerHour: 3100, status: 'SCALE', velocity: 'UP', utilization: 65 },
  { type: 'Cleaning', margin: 8, quality: 98, revenue: 950000, target: 1000000, leakage: 2000, yieldPerHour: 1800, status: 'PAUSE', velocity: 'STABLE', utilization: 45 },
];

const BLOCKERS_PATTERNS = [
  { cause: 'Parts Sourcing Lag', impactValue: 1150000, frequency: 'Low', status: 'Deteriorating' },
  { cause: 'Client Access Denied', impactValue: 820000, frequency: 'High', status: 'Stable' },
  { cause: 'Verification Backlog', impactValue: 430000, frequency: 'Medium', status: 'Improving' },
];

const OPERATIONAL_UNITS = [
  { name: 'Zone B Management', revenue: 1420000, target: 2500000, slaTrend: -5.8, hold: 480000, chronicCount: 3, risk: 'CRITICAL' },
  { name: 'North Zone Ops', revenue: 1850000, target: 2000000, slaTrend: -1.2, hold: 145000, chronicCount: 1, risk: 'MEDIUM' },
  { name: 'Central Logistics', revenue: 3100000, target: 3000000, slaTrend: 2.4, hold: 22000, chronicCount: 0, risk: 'OPTIMAL' },
  { name: 'Zone C Management', revenue: 920000, target: 1200000, slaTrend: -0.4, hold: 65000, chronicCount: 1, risk: 'LOW' },
];

// --- SUB-COMPONENTS ---

const StrategicCard: React.FC<{ 
  title: string; 
  insight: string; 
  action: string; 
  children: React.ReactNode;
  isAlert?: boolean;
  isDark?: boolean;
}> = ({ title, insight, action, children, isAlert, isDark }) => (
  <div className={`${isDark ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'} border-2 rounded-3xl p-6 flex flex-col h-full transition-all ${isAlert && !isDark ? 'border-red-500 shadow-lg shadow-red-50' : ''} ${isAlert && isDark ? 'border-red-600/50 ring-4 ring-red-600/10' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] leading-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</h3>
      {isAlert && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
    </div>
    
    <div className="mb-6">
      <p className={`text-xl font-black tracking-tight leading-tight ${isAlert && !isDark ? 'text-red-700' : isDark ? 'text-white' : 'text-slate-900'}`}>{insight}</p>
    </div>

    <div className="flex-1">
      {children}
    </div>

    <button className={`mt-8 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isAlert && !isDark ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' : isDark ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/40' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'}`}>
      {action} <ArrowRight size={14} />
    </button>
  </div>
);

export const SuperAdminDashboard: React.FC = () => {
  // --- DATA ENGINE ---
  const mtdTarget = 8500000;
  const mtdRealized = 5820000;
  const mtdShortfall = mtdTarget - mtdRealized;
  const timeElapsedPercent = 74; 
  const revenueVelocityPercent = (mtdRealized / mtdTarget) * 100;
  const isBehindVelocity = revenueVelocityPercent < timeElapsedPercent;

  const totalBlockedByFriction = BLOCKERS_PATTERNS.reduce((acc, p) => acc + p.impactValue, 0);

  const compositeScore = 88.4;
  const compositeDelta = -1.2;
  const isQualityDeclining = compositeDelta < 0;

  const qualityMetrics = [
    { label: 'SLA Compliance', value: '94.2%', delta: '-2.1 pts', isPositive: false },
    { label: 'Complaints / 100', value: '0.8', delta: '+0.2 units', isPositive: false },
    { label: 'Rework Rate', value: '4.2%', delta: '-0.5 pts', isPositive: true },
    { label: 'Audit Failure', value: '8.1%', delta: '+1.4 pts', isPositive: false },
  ];

  const predictiveForecast = [
    { period: '7 Days', riskAmount: 1250000, confidence: 5, status: 'Critical' },
    { period: '14 Days', riskAmount: 2840000, confidence: 3, status: 'High' },
    { period: '30 Days', riskAmount: 5400000, confidence: 2, status: 'Probable' },
  ];

  const sortedPortfolio = useMemo(() => 
    [...STRATEGIC_DATA].sort((a, b) => (b.target - b.revenue) - (a.target - a.revenue)),
  []);

  const sortedUnits = useMemo(() => 
    [...OPERATIONAL_UNITS].sort((a, b) => (b.target - b.revenue) - (a.target - a.revenue)),
  []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in pb-12">
      
      {/* 1. REVENUE REALITY (Decision: Gap Intervention) */}
      <StrategicCard 
        title="Revenue Reality" 
        insight={`KES ${mtdShortfall.toLocaleString()} Shortfall vs. MTD Target`} 
        action="Intervene in Revenue Gaps"
        isAlert={isBehindVelocity}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MTD Realized</p>
                <p className="text-xl font-black text-slate-900 font-mono">KES {(mtdRealized / 1000000).toFixed(2)}M</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yield Velocity</p>
                <p className={`text-sm font-black flex items-center justify-end gap-1 ${isBehindVelocity ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isBehindVelocity ? <TrendingDown size={14} /> : <TrendingUp size={14} />} 
                  {revenueVelocityPercent.toFixed(1)}%
                </p>
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Path ({timeElapsedPercent}% Month Elapsed)</span>
              <span className={`text-[10px] font-black uppercase ${isBehindVelocity ? 'text-red-600' : 'text-emerald-600'}`}>
                {isBehindVelocity ? 'Negative Variance' : 'On Track'}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
              <div className="h-full bg-slate-200 absolute left-0" style={{ width: `${timeElapsedPercent}%` }} />
              <div className={`h-full absolute left-0 transition-all duration-1000 ${isBehindVelocity ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${revenueVelocityPercent}%` }} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cost of Inaction (COI)</p>
               <p className="text-sm font-black text-amber-600 font-mono">KES {(mtdShortfall * 1.1).toLocaleString()}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Friction Grade</p>
               <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isBehindVelocity ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 {isBehindVelocity ? 'HIGH FRICTION' : 'OPTIMAL'}
               </span>
            </div>
          </div>
        </div>
      </StrategicCard>

      {/* 2. PORTFOLIO PERFORMANCE (Decision: Strategic Re-weighting) */}
      <StrategicCard 
        title="Portfolio Performance" 
        insight="Construction Gap Widening; HVAC Scaling at Peak Margin" 
        action="Rebalance Service Strategy"
      >
        <div className="space-y-3">
          {sortedPortfolio.map((service) => (
            <div key={service.type} className="group p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{service.type}</h4>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    service.status === 'SCALE' ? 'bg-emerald-100 text-emerald-700' :
                    service.status === 'FIX' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-slate-400 font-mono">KES {((service.target - service.revenue)/1000).toFixed(0)}k Gap</span>
                   {service.velocity === 'UP' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-400" />}
                </div>
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${service.status === 'SCALE' ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                  style={{ width: `${Math.min((service.revenue / service.target) * 100, 100)}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </StrategicCard>

      {/* 3. REVENUE BLOCKERS (Decision: Operational Intervention) */}
      <StrategicCard 
        title="Revenue Blockers" 
        insight={`KES ${(totalBlockedByFriction / 1000000).toFixed(1)}M Total Stalled Pipeline`} 
        action="Clear Operational Friction"
        isAlert
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Choke-Points</h4>
            {BLOCKERS_PATTERNS.map(pattern => (
              <div key={pattern.cause} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{pattern.cause}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Blocked: <span className="text-red-500">KES {(pattern.impactValue/1000).toFixed(0)}K</span></p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                  pattern.status === 'Deteriorating' ? 'bg-red-100 text-red-600' : 
                  pattern.status === 'Improving' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                }`}>
                  {pattern.status}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Global Capacity Stress</span>
                <span className="text-[10px] font-mono font-bold text-red-500">114% PEAK</span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 animate-pulse" style={{ width: '92%' }} />
             </div>
          </div>
        </div>
      </StrategicCard>

      {/* 4. EXECUTION QUALITY PULSE (Decision: Standardization Audit) */}
      <StrategicCard 
        title="Execution Quality Pulse" 
        insight={`Composite Index ${compositeScore.toFixed(1)} (Declining Trend)`} 
        action="Investigate Quality Decline"
        isAlert={isQualityDeclining}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Composite Quality Index</p>
              <p className={`text-4xl font-black font-mono tracking-tighter ${isQualityDeclining ? 'text-red-600' : 'text-slate-900'}`}>
                {compositeScore.toFixed(1)}
              </p>
            </div>
            <div className={`flex flex-col items-end ${isQualityDeclining ? 'text-red-600' : 'text-emerald-600'}`}>
              {isQualityDeclining ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
              <span className="text-xs font-black uppercase">{compositeDelta.toFixed(1)} pts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {qualityMetrics.map(m => (
              <div key={m.label} className={`p-3 rounded-xl border transition-all ${!m.isPositive ? 'border-red-100 bg-red-50/20' : 'border-slate-100 bg-white'}`}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">{m.label}</p>
                <div className="flex justify-between items-end">
                  <p className={`text-sm font-black font-mono ${!m.isPositive ? 'text-red-700' : 'text-slate-700'}`}>{m.value}</p>
                  <span className={`text-[8px] font-black uppercase ${m.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900 rounded-2xl flex items-start gap-3 relative overflow-hidden group border border-slate-800">
            <Zap size={24} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="relative z-10">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.15em] mb-1">Automated Root Cause</p>
              <p className="text-[10px] text-white/90 leading-relaxed font-medium italic">
                "Systemic decay in SLA compliance is correlated with rising travel times in Zone B. Corrective technician routing required."
              </p>
            </div>
          </div>
        </div>
      </StrategicCard>

      {/* 5. STRUCTURAL PERFORMANCE (Decision: Leadership Performance Review) */}
      <StrategicCard 
        title="Structural Performance" 
        insight="Zone B Management: Critical Variance Identified" 
        action="Review Leadership Performance"
        isAlert
      >
        <div className="space-y-4">
           <div className="flex px-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span className="flex-1">Management Node</span>
              <span className="w-20 text-right">Target Gap</span>
              <span className="w-16 text-right">SLA Velocity</span>
           </div>

           <div className="space-y-2">
              {sortedUnits.map(unit => (
                <div key={unit.name} className={`p-3 rounded-2xl border transition-all ${
                  unit.risk === 'CRITICAL' ? 'border-red-200 bg-red-50 ring-4 ring-red-500/5' : 'border-slate-100 bg-white'
                }`}>
                   <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{unit.name}</span>
                        {unit.chronicCount >= 2 && (
                          <span className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">
                            CHRONIC MISS
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-black font-mono ${unit.slaTrend < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {unit.slaTrend > 0 ? '+' : ''}{unit.slaTrend}%
                      </span>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            unit.risk === 'CRITICAL' ? 'bg-red-500 shadow-lg shadow-red-200' : 
                            unit.risk === 'MEDIUM' ? 'bg-orange-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(unit.revenue / unit.target) * 100}%` }}
                        />
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-mono font-black text-slate-900">
                           KES {((unit.target - unit.revenue)/1000).toFixed(0)}K
                         </p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </StrategicCard>

      {/* 6. PREDICTIVE WARNINGS (Decision: Executive Triage) */}
      <StrategicCard 
        title="Predictive Warnings" 
        insight="High-Exposure Operational Shortfall Projected" 
        action="Trigger Executive Intervention"
        isAlert
        isDark
      >
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {predictiveForecast.map(risk => (
              <div key={risk.period} className="flex flex-col bg-slate-800/30 p-3 rounded-2xl border border-slate-700/50">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{risk.period} Horizon</span>
                 <p className={`text-[11px] font-black font-mono ${risk.status === 'Critical' ? 'text-red-500' : 'text-orange-400'}`}>
                   KES {(risk.riskAmount / 1000000).toFixed(1)}M
                 </p>
                 <div className="mt-2 flex gap-0.5">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className={`h-1 flex-1 rounded-full ${i <= risk.confidence ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
                   ))}
                 </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Failure Signals</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-black text-red-200 uppercase tracking-tight">HVAC West Capacity Deficit</p>
                </div>
                <ArrowRight size={14} className="text-red-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <p className="text-[10px] font-black text-amber-200 uppercase tracking-tight">Supply Chain Latency - Zone C</p>
                </div>
                <ArrowRight size={14} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-900/10 border border-blue-900/20 flex items-center gap-3">
             <Activity size={16} className="text-blue-500 shrink-0" />
             <p className="text-[9px] text-blue-400/80 font-medium italic">
               Model Confidence: High. Correlation identified in 94% of previous similar pattern clusters.
             </p>
          </div>
        </div>
      </StrategicCard>

    </div>
  );
};
