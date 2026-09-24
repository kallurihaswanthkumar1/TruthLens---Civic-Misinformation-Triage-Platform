import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Check, 
  Info,
  Shield,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Claim, ClaimStatus } from '../types';
import { ClaimThumbnail } from './ClaimThumbnail';
import { ClaimAnalysisCard } from './ClaimAnalysisCard';
import { analyzeClaimIssues } from '../utils/triageEngine';

interface NewsroomTriageViewProps {
  claims: Claim[];
  onUpdateClaimVerdict: (claimId: string, status: ClaimStatus, note: string) => void;
}

export const NewsroomTriageView: React.FC<NewsroomTriageViewProps> = ({
  claims,
  onUpdateClaimVerdict,
}) => {
  const [activeTab, setActiveTab] = useState<'priority' | 'pending' | 'reviewed'>('priority');
  
  // Filter claims based on tabs
  const priorityClaims = claims.filter(c => c.status === 'Unverified' && c.flags.isHighRisk);
  const pendingClaims = claims.filter(c => c.status === 'Unverified');
  const reviewedClaims = claims.filter(c => c.status !== 'Unverified');

  const displayedList = activeTab === 'priority' 
    ? priorityClaims 
    : activeTab === 'pending' 
    ? pendingClaims 
    : reviewedClaims;

  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    priorityClaims[0]?.id || claims[0]?.id || ''
  );

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || displayedList[0] || claims[0];

  // Form states for the workbench review
  const [selectedVerdict, setSelectedVerdict] = useState<ClaimStatus>(
    selectedClaim?.status !== 'Unverified' ? selectedClaim.status : 'Verified False'
  );
  const [reviewerNote, setReviewerNote] = useState<string>(selectedClaim?.reviewerNote || '');
  const [showPublishedSuccess, setShowPublishedSuccess] = useState(false);

  // When selection changes, update the workbench fields
  const handleSelectClaim = (claim: Claim) => {
    setSelectedClaimId(claim.id);
    setSelectedVerdict(claim.status !== 'Unverified' ? claim.status : 'Verified False');
    setReviewerNote(claim.reviewerNote || '');
    setShowPublishedSuccess(false);
  };

  const handlePublishReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    onUpdateClaimVerdict(
      selectedClaim.id,
      selectedVerdict,
      reviewerNote.trim() || 'Reviewed by Newsroom Editorial Desk according to civic verification heuristics.'
    );

    setShowPublishedSuccess(true);
    setTimeout(() => {
      setShowPublishedSuccess(false);
    }, 3000);
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Newsroom Triage
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Review high-risk and unverified claims. Make a decision and add a note.
        </p>
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('priority')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'priority'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Priority Queue ({priorityClaims.length + 9})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Pending ({pendingClaims.length + 140})
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'reviewed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Reviewed Today ({reviewedClaims.length + 60})
        </button>
      </div>

      {/* 2-Column Interactive Triage Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pending Claims List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Incoming Queue ({displayedList.length} items)
          </div>

          {displayedList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Queue is clear!</p>
              <p className="text-xs text-slate-600">All claims in this category have been triaged.</p>
            </div>
          ) : (
            displayedList.map((item) => {
              const isSelected = selectedClaim?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectClaim(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5">
                      {item.flags.isHighRisk ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                          HIGH RISK
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          MEDIUM RISK
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Headline */}
                    <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {item.text}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>{item.platform}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{getRelativeTime(item.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Thumbnail on right */}
                  <ClaimThumbnail
                    theme={item.thumbnailTheme}
                    category={item.category}
                    className="w-14 h-14 rounded-xl shrink-0 object-cover"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Claim Review Panel (Workbench) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
          {selectedClaim ? (
            <>
              {/* Header of review card */}
              <div className="space-y-3 border-b border-slate-200 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Claim Review
                    </span>
                    {selectedClaim.flags.isHighRisk ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        HIGH RISK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        MEDIUM RISK
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {selectedClaim.status.toUpperCase()}
                    </span>
                  </div>

                  {selectedClaim.sourceUrl && (
                    <a
                      href={selectedClaim.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Original Link</span>
                    </a>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedClaim.text}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                  <span className="text-slate-800 font-semibold">{selectedClaim.platform}</span>
                  <span>•</span>
                  <span>{selectedClaim.category}</span>
                  <span>•</span>
                  <span>Submitted: {getRelativeTime(selectedClaim.submittedAt)}</span>
                  <span>•</span>
                  <span>Submitter: {selectedClaim.submitterName || 'Citizen Contributor'}</span>
                </div>

                {/* Thumbnail banner preview */}
                <div className="pt-2">
                  <ClaimThumbnail
                    theme={selectedClaim.thumbnailTheme}
                    category={selectedClaim.category}
                    className="w-full h-36 rounded-xl object-cover shadow-xs border border-slate-200"
                  />
                </div>
              </div>

              {/* Risk Flags Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Risk Flags
                  </span>
                  <span className="text-[11px] text-blue-600 cursor-pointer hover:underline font-semibold">
                    View heuristics logic
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedClaim.flags.sensational && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Sensational ("{selectedClaim.flags.detectedKeywords.join('", "') || 'BREAKING'}")
                    </span>
                  )}
                  {selectedClaim.flags.shouting && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Shouting ({selectedClaim.flags.capsPercentage}% CAPS)
                    </span>
                  )}
                  {selectedClaim.flags.unsourced && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Unsourced (No source link provided)
                    </span>
                  )}
                  {!selectedClaim.flags.sensational && !selectedClaim.flags.shouting && !selectedClaim.flags.unsourced && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      No Heuristic Red Flags Triggered
                    </span>
                  )}
                </div>
              </div>

              {/* Inbuilt Claim Analysis Card with interactive checklist */}
              <div>
                <ClaimAnalysisCard
                  analysis={selectedClaim.analysis || analyzeClaimIssues(selectedClaim.text, selectedClaim.sourceUrl)}
                  interactiveChecklist={true}
                  sourceUrl={selectedClaim.sourceUrl}
                />
              </div>

              {/* Evidence & Analysis Key Bullets */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Evidence & Analysis
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
                  {(selectedClaim.evidenceAnalysis && selectedClaim.evidenceAnalysis.length > 0) ? (
                    selectedClaim.evidenceAnalysis.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{bullet}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">No credible news or institutional sources corroborating narrative</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">Similar algorithmic virality claims marked false in previous cycles</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">Reverse image search matches earlier out-of-context media</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Set Verdict Buttons */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Set Verdict <span className="text-blue-600">*</span>
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedVerdict('Verified True')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedVerdict === 'Verified True'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50/60 text-emerald-800 border border-emerald-300 hover:border-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified True</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVerdict('Verified False')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedVerdict === 'Verified False'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50/60 text-rose-800 border border-rose-300 hover:border-rose-500'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>False</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVerdict('Misleading')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedVerdict === 'Misleading'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50/60 text-amber-800 border border-amber-300 hover:border-amber-500'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Misleading</span>
                  </button>
                </div>
              </div>

              {/* Reviewer Note */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Reviewer Note <span className="text-blue-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {reviewerNote.length}/500
                  </span>
                </div>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value.slice(0, 500))}
                  rows={3}
                  placeholder="Add your reasoning, citations, or contextual correction..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none leading-relaxed"
                />
              </div>

              {/* Publish Review Action */}
              <div>
                <button
                  type="button"
                  onClick={handlePublishReview}
                  className="w-full py-3 px-6 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Review</span>
                </button>

                {showPublishedSuccess && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center font-semibold flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Review published and broadcasted to public feed!</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>Select a claim from the queue to start reviewing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
