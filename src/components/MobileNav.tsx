import React from 'react';
import { LayoutDashboard, Globe, ShieldCheck, BookOpen, Plus, X } from 'lucide-react';
import { ActiveView } from '../types';

interface MobileNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  pendingCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  pendingCount,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Slide-over Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white border-r border-slate-200 p-5 space-y-6 z-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  TL
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">TruthLens</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Civic Tech Platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => { setActiveView('dashboard'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeView === 'dashboard' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveView('feed'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeView === 'feed' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public Feed</span>
              </button>

              <button
                onClick={() => { setActiveView('triage'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeView === 'triage' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Newsroom Triage</span>
                </div>
                {pendingCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveView('submit'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeView === 'submit' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Submit Claim</span>
              </button>

              <button
                onClick={() => { setActiveView('guide'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeView === 'guide' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Platform Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-xs">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeView === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveView('feed')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeView === 'feed' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveView('triage')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeView === 'triage' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Triage</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
          )}
        </button>

        <button
          onClick={() => setActiveView('guide')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeView === 'guide' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Guide</span>
        </button>
      </div>
    </>
  );
};
