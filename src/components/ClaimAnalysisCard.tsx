import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink,
  Calendar,
  Layers,
  Check,
  Search
} from 'lucide-react';
import { ClaimAnalysis } from '../types';

interface ClaimAnalysisCardProps {
  analysis?: ClaimAnalysis;
  interactiveChecklist?: boolean;
  className?: string;
  sourceUrl?: string;
}

export const ClaimAnalysisCard: React.FC<ClaimAnalysisCardProps> = ({
  analysis,
  interactiveChecklist = false,
  className = '',
  sourceUrl,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  if (!analysis) return null;

  const { possibleIssues, suggestedSteps, aiNotice } = analysis;

  const toggleStep = (index: number) => {
    if (!interactiveChecklist) return;
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const hasIssues = 
    possibleIssues.absoluteStatement || 
    possibleIssues.emotionalWording || 
    possibleIssues.missingSource;

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs ${className}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Claim Analysis
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Inbuilt heuristic inspection & guided verification
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          hasIssues 
            ? 'bg-amber-50 text-amber-800 border border-amber-300' 
            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
        }`}>
          {hasIssues ? 'Issues Flagged' : 'Neutral Intake'}
        </span>
      </div>

      {/* Possible issues detected */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Possible issues detected:</span>
          <span className="text-[10px] text-slate-500 font-medium">Algorithmic Scan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Issue 1: Absolute statement */}
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            possibleIssues.absoluteStatement
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {possibleIssues.absoluteStatement ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className={possibleIssues.absoluteStatement ? 'text-rose-800 font-bold' : 'text-slate-800 font-semibold'}>
                • Absolute statement
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {possibleIssues.absoluteStatement
                ? `Absolute claims detected: "${possibleIssues.absoluteTerms.slice(0, 2).join('", "')}"`
                : 'No unverified absolutes or universal guarantees detected.'}
            </p>
          </div>

          {/* Issue 2: Emotional wording */}
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            possibleIssues.emotionalWording
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {possibleIssues.emotionalWording ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className={possibleIssues.emotionalWording ? 'text-rose-800 font-bold' : 'text-slate-800 font-semibold'}>
                • Emotional wording
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {possibleIssues.emotionalWording
                ? `High emotional terms detected: "${possibleIssues.emotionalTerms.slice(0, 2).join('", "')}"`
                : 'Tone appears objective without sensationalized triggers.'}
            </p>
          </div>

          {/* Issue 3: Missing source */}
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            possibleIssues.missingSource
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {possibleIssues.missingSource ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className={possibleIssues.missingSource ? 'text-amber-800 font-bold' : 'text-slate-800 font-semibold'}>
                • Missing source
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {possibleIssues.missingSource
                ? 'No credible external domain or documentation provided.'
                : 'Primary source or reference link attached.'}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested verification steps */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Suggested verification steps:</span>
          {interactiveChecklist && (
            <span className="text-[10px] text-blue-700 font-bold">
              Click to check off verified steps
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {suggestedSteps.map((step, idx) => {
            const isLastStep = idx === suggestedSteps.length - 1; // "AI does not make the final decision."
            const isChecked = checkedSteps[idx];

            if (isLastStep) {
              // Highlight the civic tech principle: AI does not make the final decision
              return (
                <div 
                  key={idx}
                  className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-900 shadow-xs"
                >
                  <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block sm:inline mr-1.5">
                      • {step}
                    </span>
                    <span className="text-slate-600 text-[11px] font-medium">
                      TruthLens heuristics flag anomalies; human verification and primary evidence establish facts.
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                  interactiveChecklist ? 'cursor-pointer hover:bg-slate-100' : ''
                } ${
                  isChecked 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    isChecked 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}>
                    {isChecked ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className={`font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {step}
                  </span>
                </div>

                {/* Helpful action hint */}
                {idx === 0 && sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-blue-700 font-bold hover:text-blue-900 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Visit link</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
