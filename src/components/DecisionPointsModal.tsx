import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Scale, 
  Eye, 
  ArrowUpDown, 
  FileEdit, 
  ShieldAlert, 
  HelpCircle, 
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { DecisionPointsState, FeedOrderPolicy, VisibilityPolicy, EditPolicy } from '../types';

interface DecisionPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionPoints: DecisionPointsState;
  onUpdatePolicy: (updater: Partial<DecisionPointsState>) => void;
}

export const DecisionPointsModal: React.FC<DecisionPointsModalProps> = ({
  isOpen,
  onClose,
  decisionPoints,
  onUpdatePolicy,
}) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'defense'>('interactive');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const systemDefenseMarkdown = `# TruthLens — System Governance & Editorial Policy Architecture

### DP1 · Feed Order: Why "Risk-Weighted Triage" is Superior to Chronological
**Our Approach**: Hybrid Priority Queue — High-Risk claims (2+ heuristic flags) with recent virality are elevated to the top of the newsroom desk and clearly flagged at the top of the public feed.
**Why**:
1. *Asymmetry of Misinformation*: Viral lies spread 6x faster than truth (Vosoughi et al., Science). A pure chronological feed buries urgent, dangerous falsehoods (e.g. bogus medical cures or banking panic) beneath low-stakes claims.
2. *Neutrality by Objective Heuristics*: Ordering by quantifiable flags (CAPS percentage, missing sources, sensational triggers) rather than subjective topic or ideology keeps the feed completely unbiased.
3. *Triage Ergonomics*: Newsrooms have finite investigative capacity; elevating High-Risk claims ensures that fact-checkers debunk the most hazardous claims before they achieve uncontainable viral saturation.

---

### DP2 · Visibility: Why "Quarantined with Visual Friction" Beats Total Blackout
**Our Approach**: Controlled Visibility with Prominent Warning Interstitials. Unverified claims appear in the public feed, but encased in a high-visibility amber/slate "Pending Heuristic Verification" border with disabled social sharing until reviewed.
**Why**:
1. *The Information Vacuum Hazard*: If unverified claims are held back, citizens searching for a rumor currently blowing up on encrypted channels find nothing, falsely assuming "no one is calling it fake, so it must be true."
2. *Pre-Bunking & Inoculation*: Psychological research proves cognitive inoculation works: exposing people to a claim *with* clear warning indicators prepares them to reject the falsehood before confirmation bias sets in.
3. *Radical Auditability*: Citizen groups trust the platform because the triage intake is not an opaque black box.

---

### DP3 · Editing: Strict Append-Only Audit Trail + Automatic Heuristic Re-Flagging
**Our Approach**: Allowed with Immutable Versioning. Submissions can be edited for typos or context, BUT every edit triggers an automatic rerun of the heuristic engine and permanently preserves a public diff history. Furthermore, if a claim was already "Verified", editing its text immediately voids the verdict back to "Unverified".
**Why**:
1. *Preventing the "Bait-and-Switch" Exploit*: Malicious actors might submit an innocuous claim (e.g. "Tomorrow is sunny"), wait for it to be verified True, and then edit the text into dangerous election misinformation.
2. *Civic Transparency*: Preserving previous revisions (previous text, old flags, edit timestamp) ensures bad-faith revisions are immediately visible to both the public and reviewers.
3. *Continuous Heuristic Integrity*: The automated risk engine recalculates shouting percentages, sensational triggers, and source links on every single keystroke.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(systemDefenseMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Decision Points & Governance Architecture
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  System Policies
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Algorithmic policy choices, verification standards, and real-time governance controls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'interactive'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Interactive Policy Simulator</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              Live in App
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('defense')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'defense'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Governance Rationale & Policy Defense</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'interactive' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Content moderation in civic triage requires deliberate trade-offs. Use this simulator to switch TruthLens' live operational policy and inspect how the feed, quarantine visibility, and triage engine adapt instantaneously.
                </p>
              </div>

              {/* DP1 Control */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center border border-blue-200">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ArrowUpDown className="w-4 h-4 text-blue-600" />
                      DP1 · Feed Order Policy
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Active: <span className="text-blue-700 font-bold">{decisionPoints.feedOrder}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  How should the claims feed be prioritized for the public and newsroom editors?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ feedOrder: 'risk-first' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.feedOrder === 'risk-first'
                        ? 'border-blue-500 bg-blue-50/80 text-slate-900 ring-1 ring-blue-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Risk-Weighted First</span>
                      {decisionPoints.feedOrder === 'risk-first' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      High-Risk items (2+ flags) bubble to top. Mitigates high-speed virality of dangerous claims.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ feedOrder: 'recency' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.feedOrder === 'recency'
                        ? 'border-blue-500 bg-blue-50/80 text-slate-900 ring-1 ring-blue-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Chronological (Recency)</span>
                      {decisionPoints.feedOrder === 'recency' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Pure timestamp order (newest first). Unbiased timeline approach favored by wire services.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ feedOrder: 'status-triage' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.feedOrder === 'status-triage'
                        ? 'border-blue-500 bg-blue-50/80 text-slate-900 ring-1 ring-blue-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Debunks & Verified First</span>
                      {decisionPoints.feedOrder === 'status-triage' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Prioritizes resolved claims with authoritative fact-checker notes to inoculate readers.
                    </p>
                  </button>
                </div>
              </div>

              {/* DP2 Control */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center border border-emerald-200">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      DP2 · Visibility Policy for Unverified Claims
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Active: <span className="text-emerald-700 font-bold">{decisionPoints.visibility}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Should pending claims be publicly accessible before a human fact-checker finishes verification?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ visibility: 'public-quarantine' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.visibility === 'public-quarantine'
                        ? 'border-emerald-500 bg-emerald-50/80 text-slate-900 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Quarantine & Warning (Default)</span>
                      {decisionPoints.visibility === 'public-quarantine' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Visible to public, but marked with prominent "Pending Triage" banner and friction to curb amplification.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ visibility: 'hold-unverified' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.visibility === 'hold-unverified'
                        ? 'border-emerald-500 bg-emerald-50/80 text-slate-900 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Strict Newsroom Hold-Back</span>
                      {decisionPoints.visibility === 'hold-unverified' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Unverified claims are hidden from public feed entirely until fact-checkers verify them.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ visibility: 'transparent-all' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.visibility === 'transparent-all'
                        ? 'border-emerald-500 bg-emerald-50/80 text-slate-900 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Transparent Stream</span>
                      {decisionPoints.visibility === 'transparent-all' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Full open stream without embargo or quarantine. Maximum transparency for citizen monitors.
                    </p>
                  </button>
                </div>
              </div>

              {/* DP3 Control */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center border border-amber-200">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <FileEdit className="w-4 h-4 text-amber-600" />
                      DP3 · Post-Submission Editing & Flag Recalculation
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Active: <span className="text-amber-700 font-bold">{decisionPoints.editPolicy}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Can claims be amended after submission, and what happens to heuristic flags and fact-checker verdicts?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ editPolicy: 'audit-reflag' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.editPolicy === 'audit-reflag'
                        ? 'border-amber-500 bg-amber-50/80 text-slate-900 ring-1 ring-amber-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Audit-Logged Re-Flagging (Default)</span>
                      {decisionPoints.editPolicy === 'audit-reflag' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Edits are recorded in an immutable revision log. Heuristic flags immediately recalculate. Prior verification is automatically reset to prevent bait-and-switch exploits!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePolicy({ editPolicy: 'immutable-lock' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                      decisionPoints.editPolicy === 'immutable-lock'
                        ? 'border-amber-500 bg-amber-50/80 text-slate-900 ring-1 ring-amber-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Immutable Lock</span>
                      {decisionPoints.editPolicy === 'immutable-lock' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Strict forensic preservation. Once submitted, claim text cannot be changed; submitters must submit a new claim referencing the original.
                    </p>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  System Governance Specifications & Editorial Defense
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Specifications!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Policy Documentation (Markdown)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[420px]">
                {systemDefenseMarkdown}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time heuristic synchronization active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
