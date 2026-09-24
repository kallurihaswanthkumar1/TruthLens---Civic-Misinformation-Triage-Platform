import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  ShieldCheck, 
  PlusCircle, 
  BookOpen,
  Shield,
  Radio
} from 'lucide-react';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  pendingCount,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feed' as ActiveView, label: 'Public Feed', icon: Globe },
    { 
      id: 'triage' as ActiveView, 
      label: 'Newsroom Triage', 
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
    { id: 'submit' as ActiveView, label: 'Submit Claim', icon: PlusCircle },
    { id: 'guide' as ActiveView, label: 'Platform Guide', icon: BookOpen },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen text-slate-700 select-none z-30 shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Shield className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <div className="text-slate-900 font-extrabold text-lg tracking-tight flex items-center gap-1.5">
            TruthLens
          </div>
          <p className="text-xs text-slate-500 font-medium">Civic Tech Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Civic Integrity Notice */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-900 font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Verification Active
          </span>
          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Realtime
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Neutral heuristic assessment and open civic verification.
        </p>
      </div>
    </aside>
  );
};
