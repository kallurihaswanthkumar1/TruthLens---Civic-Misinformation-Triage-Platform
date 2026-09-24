import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  Sliders, 
  ShieldAlert, 
  FileCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { Claim } from '../types';
import { generateClaimsPdfReport, PdfExportOptions } from '../utils/pdfGenerator';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClaims: Claim[];
  filteredClaims: Claim[];
  allClaims: Claim[];
  filterSummaryText?: string;
  onDownloadSuccess?: (filename: string, count: number) => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  selectedClaims,
  filteredClaims,
  allClaims,
  filterSummaryText,
  onDownloadSuccess,
}) => {
  // Determine default scope
  const defaultScope = selectedClaims.length > 0 ? 'selected' : 'filtered';
  const [scope, setScope] = useState<'selected' | 'filtered' | 'all'>(defaultScope);

  const [reportTitle, setReportTitle] = useState('TruthLens Misinformation & Claim Verification Summary Report');
  const [customNote, setCustomNote] = useState('');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [includeRiskFlags, setIncludeRiskFlags] = useState(true);
  const [includeReviewerNotes, setIncludeReviewerNotes] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Compute claims to be exported based on scope
  const targetClaims = 
    scope === 'selected' 
      ? selectedClaims 
      : scope === 'filtered' 
      ? filteredClaims 
      : allClaims;

  // Breakdown of targeted claims
  const trueCount = targetClaims.filter(c => c.status === 'Verified True').length;
  const falseCount = targetClaims.filter(c => c.status === 'Verified False').length;
  const misleadingCount = targetClaims.filter(c => c.status === 'Misleading').length;
  const unverifiedCount = targetClaims.filter(c => c.status === 'Unverified').length;
  const highRiskCount = targetClaims.filter(c => c.flags.isHighRisk).length;

  const handleDownload = async () => {
    if (targetClaims.length === 0) return;

    setIsGenerating(true);
    try {
      let scopeLabel = '';
      if (scope === 'selected') {
        scopeLabel = `${targetClaims.length} Selected Claim${targetClaims.length === 1 ? '' : 's'}`;
      } else if (scope === 'filtered') {
        scopeLabel = `Filtered Search Results (${targetClaims.length} Claim${targetClaims.length === 1 ? '' : 's'})`;
      } else {
        scopeLabel = `All Workspace Claims (${targetClaims.length} Total)`;
      }

      const options: PdfExportOptions = {
        title: reportTitle.trim() || 'TruthLens Misinformation & Claim Verification Summary Report',
        scopeLabel,
        generatedBy: 'TruthLens Civic Verification Desk',
        filterDescription: scope === 'filtered' ? (filterSummaryText || 'Filtered by active dashboard parameters') : undefined,
        customNote: customNote.trim() || undefined,
        includeExecutiveSummary,
        includeAnalysis,
        includeRiskFlags,
        includeReviewerNotes,
        includeEvidence,
      };

      // Slight timeout to allow render loop
      await new Promise(res => setTimeout(res, 120));
      const filename = await generateClaimsPdfReport(targetClaims, options);

      if (onDownloadSuccess) {
        onDownloadSuccess(filename, targetClaims.length);
      }
      onClose();
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Generate PDF Summary Report
              </h2>
              <p className="text-xs text-slate-600">
                Create a publication-ready fact-check dossier with inbuilt claim analyses & verification heuristics.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Choose Report Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option: Selected */}
              <button
                type="button"
                onClick={() => setScope('selected')}
                disabled={selectedClaims.length === 0}
                className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                  scope === 'selected'
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500/30'
                    : selectedClaims.length === 0
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Selected Claims</span>
                  {scope === 'selected' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">
                  {selectedClaims.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedClaims.length === 0 ? 'No rows selected' : 'Manual checkboxes'}
                </div>
              </button>

              {/* Option: Filtered */}
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                  scope === 'filtered'
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Filtered Results</span>
                  {scope === 'filtered' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">
                  {filteredClaims.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Current dashboard view
                </div>
              </button>

              {/* Option: All */}
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                  scope === 'all'
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">All Desk Claims</span>
                  {scope === 'all' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">
                  {allClaims.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Complete database
                </div>
              </button>
            </div>
          </div>

          {/* Target Scope Preview Metrics Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-bold uppercase">Included in dossier:</span>
              <span className="text-blue-700 font-bold bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                {targetClaims.length} total claims
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <span className="text-emerald-700">✓ {trueCount} True</span>
              <span className="text-rose-700">✕ {falseCount} False</span>
              <span className="text-amber-700">⚠ {misleadingCount} Misleading</span>
              <span className="text-blue-700">⏳ {unverifiedCount} Unverified</span>
              {highRiskCount > 0 && (
                <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {highRiskCount} High Risk
                </span>
              )}
            </div>
          </div>

          {/* Report Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Report Title & Heading
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Weekly Misinformation Triage Summary - March 2026"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Custom Memorandum Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Memorandum / Editorial Note (Optional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Add an editorial memo to appear at the top of the executive summary..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Configuration Checkboxes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Report Modules & Heuristic Sections
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Executive Summary */}
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeExecutiveSummary}
                  onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Executive Metrics Summary</span>
                  <span className="text-[10px] text-slate-500">Total sample counts, status breakdowns, and high risk percentage banner</span>
                </div>
              </label>

              {/* Claim Analysis Module */}
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeAnalysis}
                  onChange={(e) => setIncludeAnalysis(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                    Claim Analysis
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[9px] font-bold text-blue-700 border border-blue-200">Inbuilt</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Possible issues (Absolute statements, Emotional wording, Missing source) & Suggested verification steps</span>
                </div>
              </label>

              {/* Risk Flags */}
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeRiskFlags}
                  onChange={(e) => setIncludeRiskFlags(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Risk Evaluation Heuristics</span>
                  <span className="text-[10px] text-slate-500">Sensational keywords, uppercase % shouting, unsourced links</span>
                </div>
              </label>

              {/* Reviewer Notes & Verdicts */}
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeReviewerNotes}
                  onChange={(e) => setIncludeReviewerNotes(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Reviewer Verdict & Editorial Notes</span>
                  <span className="text-[10px] text-slate-500">Verified status badge, fact-checker notes, reviewer identity</span>
                </div>
              </label>

              {/* Evidence & Context */}
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-white transition-colors sm:col-span-2">
                <input
                  type="checkbox"
                  checked={includeEvidence}
                  onChange={(e) => setIncludeEvidence(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Evidence Analysis & Triage Context</span>
                  <span className="text-[10px] text-slate-500">Recorded evidence URLs, intake heuristics, and cross-verification trail</span>
                </div>
              </label>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>TruthLens Policy:</strong> All generated summary reports automatically include institutional watermarks and our core principle: <em>"AI does not make the final decision. Verification must be confirmed by human fact-checkers."</em>
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating || targetClaims.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling PDF Document...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Summary ({targetClaims.length} Claims)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
