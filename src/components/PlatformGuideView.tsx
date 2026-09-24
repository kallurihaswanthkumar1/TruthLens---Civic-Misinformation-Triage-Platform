import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Eye, 
  Users, 
  HelpCircle,
  FileCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ActiveView } from '../types';

interface PlatformGuideViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const PlatformGuideView: React.FC<PlatformGuideViewProps> = ({ setActiveView }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          Documentation & Standards
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Guide & Verification Protocols
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          TruthLens is an algorithmic-first civic tech platform created to verify viral narratives with complete neutrality and transparency.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Neutral By Design</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Claims are flagged solely based on observable textual heuristics and source presence, never on political or ideological affiliation.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Open Triage Transparency</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every verdict requires documented reasoning, cross-referenced sources, and full audit logs visible to all citizens.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Citizen & Newsroom Link</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Community members report emerging claims; professional newsroom desks investigate and broadcast rapid context.
          </p>
        </div>
      </div>

      {/* The 3 Heuristic Risk Flags */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">The Three Algorithmic Heuristics</h2>
        <p className="text-xs text-slate-600">
          When any claim is submitted, TruthLens evaluates three objective indicators:
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Sensational Urgency</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-4">
              Detects high-panic trigger phrases such as <code className="text-rose-800 bg-rose-100 font-bold px-1.5 py-0.5 rounded">BREAKING</code>, <code className="text-rose-800 bg-rose-100 font-bold px-1.5 py-0.5 rounded">SHOCKING</code>, or <code className="text-rose-800 bg-rose-100 font-bold px-1.5 py-0.5 rounded">SHARE BEFORE DELETED</code>. Viral disinformation historically employs artificial scarcity and panic to discourage fact-checking before re-sharing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Typography Shouting</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-4">
              Flags any submission where <code className="text-amber-800 bg-amber-100 font-bold px-1.5 py-0.5 rounded">&gt; 50%</code> of alphabetical characters are uppercase. Shouting typography artificially amplifies emotional agitation and clickthrough velocity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Unsourced Origin</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-4">
              Identifies claims submitted without an active reference URL. In newsroom triage, unsourced assertions are prioritized for forensic origin tracing and reverse image queries.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
          <span className="font-bold">High Risk Determination:</span> When 2 or more flags trigger simultaneously, the claim enters the Newsroom High Risk Priority Queue immediately.
        </div>
      </div>

      {/* Built-in Claim Analysis & Verification Protocol */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Inbuilt Feature: Claim Analysis</h2>
            <p className="text-xs text-slate-600">Integrated verification heuristics baked into intake and triage workflows</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            TruthLens Standard
          </span>
        </div>

        {/* Possible issues detected */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Possible issues detected:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-xs text-rose-700">• Absolute statement</div>
              <p className="text-[11px] text-slate-600">
                Flags sweeping generalizations such as "cures all", "100%", "eliminates all cash", "guaranteed".
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-xs text-rose-700">• Emotional wording</div>
              <p className="text-[11px] text-slate-600">
                Detects fear-inducing adjectives ("shocking", "terrifying", "secret", "they don't want you to know").
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-xs text-amber-700">• Missing source</div>
              <p className="text-[11px] text-slate-600">
                Flags uncorroborated text lacking primary links or verifiable citations.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested verification steps */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Suggested verification steps:
          </h3>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">1</span>
              <span>Check the original source.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">2</span>
              <span>Compare the claim with reliable sources.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">3</span>
              <span>Check publication date.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">4</span>
              <span>Look for missing context.</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2 font-bold">
              <span className="text-blue-700 font-extrabold">•</span>
              <span>AI does not make the final decision.</span>
              <span className="font-normal text-[11px] text-slate-600 ml-auto hidden sm:inline">Human fact-checkers and primary documents decide.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict Standards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Editorial Verdict Standards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified True
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Substantiated by primary official records, peer-reviewed scientific literature, or accredited regulatory filings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
              <XCircle className="w-4 h-4 text-rose-600" />
              False
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Demonstrably contradicted by facts, manufactured via digital manipulation (CGI/deepfakes), or conclusively refuted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Misleading
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Contains a grain of truth but strips vital context, conflates unrelated statistics, or misrepresents dates and locations.
            </p>
          </div>
        </div>
      </div>

      {/* Quick CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all text-center cursor-pointer"
        >
          Explore Live Dashboard
        </button>
        <button
          onClick={() => setActiveView('submit')}
          className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-all text-center cursor-pointer"
        >
          Submit Community Claim
        </button>
      </div>
    </div>
  );
};
