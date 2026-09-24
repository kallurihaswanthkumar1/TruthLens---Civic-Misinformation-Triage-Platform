import React from 'react';
import { Plus, User, Shield, Menu } from 'lucide-react';
import { ActiveView } from '../types';

interface TopBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  setActiveView,
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Mobile brand header */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2" onClick={() => setActiveView('dashboard')} role="button">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-base">TruthLens</span>
        </div>
      </div>

      {/* Desktop breadcrumb or view title */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
          Platform Mode
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-900 capitalize">
          {activeView === 'feed' ? 'Public Feed' : activeView === 'triage' ? 'Newsroom Triage' : activeView === 'submit' ? 'Submit Claim' : activeView === 'guide' ? 'Platform Guide' : 'Executive Dashboard'}
        </span>
      </div>

      {/* Action items on right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop Quick Nav Tabs */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveView('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'feed'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Public Feed
          </button>
          <button
            onClick={() => setActiveView('triage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'triage'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Newsroom Triage
          </button>
          <button
            onClick={() => setActiveView('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'guide'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Platform Guide
          </button>
        </div>

        {/* Primary CTA: Submit Claim */}
        <button
          onClick={() => setActiveView('submit')}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Claim</span>
        </button>

        {/* Profile / Avatar */}
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
