import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Plus, 
  SlidersHorizontal, 
  Glasses, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { DecisionPointsState } from '../types';

interface HeaderProps {
  viewMode: 'public' | 'newsroom';
  setViewMode: (mode: 'public' | 'newsroom') => void;
  openSubmitModal: () => void;
  openDecisionPointsModal: () => void;
  onResetData: () => void;
  decisionPoints: DecisionPointsState;
  unverifiedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  openSubmitModal,
  openDecisionPointsModal,
  onResetData,
  decisionPoints,
  unverifiedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Civic Tech Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 shadow-sm text-white">
              <Glasses className="w-6 h-6 text-white stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
                  Truth<span className="text-blue-600">Lens</span>
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Public Feed vs Newsroom Desk */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('public')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'public'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Public Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('newsroom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                viewMode === 'newsroom'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Newsroom Desk</span>
              {unverifiedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {unverifiedCount}
                </span>
              )}
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* System Governance Policies Button */}
            <button
              type="button"
              onClick={openDecisionPointsModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-300 hover:bg-blue-100/80 transition-all shadow-xs group cursor-pointer"
              title="System Governance Policies (Feed Order, Quarantine, Audit Trail)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">Governance</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                Policies
              </span>
            </button>

            {/* Clear Data */}
            <button
              type="button"
              onClick={onResetData}
              title="Clear claims from feed"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Submit Viral Claim CTA */}
            <button
              type="button"
              onClick={openSubmitModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Submit Claim</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
