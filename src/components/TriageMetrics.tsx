import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp, 
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Claim, DecisionPointsState } from '../types';
import { MisinformationWaveChart } from './MisinformationWaveChart';

interface TriageMetricsProps {
  claims: Claim[];
  decisionPoints: DecisionPointsState;
  onOpenDecisionPoints: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const TriageMetrics: React.FC<TriageMetricsProps> = ({
  claims,
  decisionPoints,
  onOpenDecisionPoints,
  activeFilter,
  setActiveFilter,
}) => {
  const [showChart, setShowChart] = useState(true);
  const total = claims.length;
  const highRiskCount = claims.filter((c) => c.flags.isHighRisk).length;
  const unverifiedCount = claims.filter((c) => c.status === 'Unverified').length;
  const falseCount = claims.filter((c) => c.status === 'Verified False').length;
  const misleadingCount = claims.filter((c) => c.status === 'Misleading').length;
  const trueCount = claims.filter((c) => c.status === 'Verified True').length;

  return (
    <div className="space-y-3">
      {/* Top Banner with Decision Point Active Policy Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-800 font-bold">
            Active Triage Governance:
          </span>
          <span className="text-blue-700 font-mono font-bold">
            DP1: {decisionPoints.feedOrder}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-mono font-bold">
            DP2: {decisionPoints.visibility}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-700 font-mono font-bold">
            DP3: {decisionPoints.editPolicy}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDecisionPoints}
          className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-bold group cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform text-blue-600" />
          <span>Inspect Governance Policies & Decision Rules</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Total Ingested */}
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            activeFilter === 'all'
              ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Claims Ingested</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Total viral reports</div>
        </button>

        {/* High Risk (2+ Flags) */}
        <button
          type="button"
          onClick={() => setActiveFilter('high-risk')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            activeFilter === 'high-risk'
              ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500/30'
              : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk</span>
            <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">{highRiskCount}</div>
          <div className="text-[11px] text-rose-700 font-semibold mt-1">2+ Heuristic Flags</div>
        </button>

        {/* Unverified Queue */}
        <button
          type="button"
          onClick={() => setActiveFilter('unverified')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            activeFilter === 'unverified'
              ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500/30'
              : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-sky-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Triage</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-800 font-mono">{unverifiedCount}</div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1">Pending newsroom review</div>
        </button>

        {/* Debunked (False & Misleading) */}
        <button
          type="button"
          onClick={() => setActiveFilter('debunked')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            activeFilter === 'debunked'
              ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/30'
              : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Debunked</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">{falseCount + misleadingCount}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">{falseCount} False · {misleadingCount} Misleading</div>
        </button>

        {/* Verified True */}
        <button
          type="button"
          onClick={() => setActiveFilter('verified-true')}
          className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 cursor-pointer shadow-xs ${
            activeFilter === 'verified-true'
              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30'
              : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Verified True</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">{trueCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Substantiated by evidence</div>
        </button>

      </div>

      {/* Misinformation Wave Telemetry Chart (Recharts) */}
      <MisinformationWaveChart claims={claims} />
    </div>
  );
};
