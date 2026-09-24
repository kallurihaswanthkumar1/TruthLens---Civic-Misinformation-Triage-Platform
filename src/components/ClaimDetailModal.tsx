import React, { useState, useMemo } from 'react';
import { 
  X, 
  Flame, 
  Volume2, 
  Link2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Send, 
  Edit3, 
  History, 
  Copy, 
  Check, 
  Share2,
  FileText,
  User,
  Radio
} from 'lucide-react';
import { Claim, ClaimStatus, EditPolicy } from '../types';
import { calculateRiskFlags } from '../utils/triageEngine';

interface ClaimDetailModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (claimId: string, status: ClaimStatus, note: string, reviewerName: string, evidenceUrls?: string[]) => void;
  onEditClaim: (claimId: string, newText: string, newSourceUrl?: string, reason?: string) => void;
  viewMode: 'public' | 'newsroom';
  editPolicy: EditPolicy;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  isOpen,
  onClose,
  onUpdateStatus,
  onEditClaim,
  viewMode,
  editPolicy,
}) => {
  if (!isOpen || !claim) return null;

  // Reviewer workflow form states
  const [targetStatus, setTargetStatus] = useState<ClaimStatus>(
    claim.status === 'Unverified' ? 'Misleading' : claim.status
  );
  const [reviewerNote, setReviewerNote] = useState(claim.reviewerNote || '');
  const [reviewerName, setReviewerName] = useState(claim.reviewerName || 'FactCheck Desk Monitor');
  const [evidenceInput, setEvidenceInput] = useState((claim.evidenceUrls || []).join('\n'));

  // Editing state (DP3)
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(claim.text);
  const [editSourceUrl, setEditSourceUrl] = useState(claim.sourceUrl || '');
  const [editReason, setEditReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Live recalculation during editing
  const previewFlags = useMemo(() => {
    return calculateRiskFlags(editText, editSourceUrl);
  }, [editText, editSourceUrl]);

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerNote.trim()) return;

    const urls = evidenceInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    onUpdateStatus(claim.id, targetStatus, reviewerNote.trim(), reviewerName.trim(), urls);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;

    onEditClaim(claim.id, editText.trim(), editSourceUrl.trim() || undefined, editReason.trim() || 'Claim content updated');
    setIsEditing(false);
  };

  const copyShareCard = () => {
    const textToCopy = `[TruthLens Fact-Check Summary]\nStatus: ${claim.status}\nPlatform: ${claim.platform}\nClaim: "${claim.text}"\nVerdict Note: ${claim.reviewerNote || 'Pending verification'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-xs">
              {claim.platform}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 shadow-xs">
              {claim.category}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ID: {claim.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyShareCard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 shadow-xs cursor-pointer"
              title="Copy verified summary"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* High Risk Banner if applicable */}
          {claim.flags.isHighRisk && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  High Risk Misinformation Profile (2+ Heuristic Flags Triggered)
                </h4>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                  This post has triggered multiple objective risk heuristics (Sensational phrasing, Shouting capitalization, or Missing source verification). It has been prioritized on the newsroom verification queue.
                </p>
              </div>
            </div>
          )}

          {/* Full Claim Text Section */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Viral Claim Text
              </span>
              <div className="flex items-center gap-2">
                {editPolicy === 'audit-reflag' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditText(claim.text);
                      setEditSourceUrl(claim.sourceUrl || '');
                    }}
                    className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Claim (DP3)'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Policy: Immutable Locked
                  </span>
                )}

                {claim.editHistory && claim.editHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Log ({claim.editHistory.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* If In Edit Mode (DP3 Demonstration) */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Edit Text (Will trigger automatic heuristic re-flagging):
                  </label>
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Source Link:
                  </label>
                  <input
                    type="text"
                    value={editSourceUrl}
                    onChange={(e) => setEditSourceUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Reason for Revision:
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g. Added missing context, corrected transcription error"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Live Heuristic Preview */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-800">
                    <span className="font-bold text-blue-900">New Flags Preview:</span>
                    <span>Sensational: {previewFlags.sensational ? 'YES' : 'No'}</span>
                    <span>Caps: {previewFlags.capsPercentage}% ({previewFlags.shouting ? 'Shouting' : 'Normal'})</span>
                    <span>Unsourced: {previewFlags.unsourced ? 'YES' : 'No'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    previewFlags.isHighRisk ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {previewFlags.isHighRisk ? 'High Risk' : 'Standard'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>DP3 Integrity Policy:</strong> Updating this claim text will automatically append an immutable audit log entry and reset any prior fact-check verdict back to <em>Unverified</em>.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    Commit Revision & Re-calculate Flags
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-base sm:text-lg text-slate-900 font-serif leading-relaxed select-text font-medium">
                  "{claim.text}"
                </p>
                {claim.sourceUrl && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Original Source: </span>
                    <a 
                      href={claim.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline truncate max-w-md hover:text-blue-900"
                    >
                      {claim.sourceUrl}
                    </a>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit History Drawer if toggled (DP3 showcase) */}
          {showHistory && claim.editHistory && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-600" />
                Immutable Revision Diff History (DP3)
              </h5>
              <div className="space-y-3">
                {claim.editHistory.map((edit, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span className="font-bold text-slate-800">Revision #{idx + 1}</span>
                      <span>{new Date(edit.editedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 italic">Reason: {edit.reason || 'No reason provided'}</p>
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded font-mono text-[11px] text-rose-800 line-through">
                      - {edit.previousText}
                    </div>
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded font-mono text-[11px] text-emerald-800 font-semibold">
                      + {edit.newText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HEURISTIC RISK FLAGS BREAKDOWN (Detailed Diagnostics) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Automated Heuristic Diagnostic Breakdown
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Sensational Diagnostic */}
              <div className={`p-4 rounded-xl border ${
                claim.flags.sensational 
                  ? 'border-rose-300 bg-rose-50 text-rose-950 shadow-xs' 
                  : 'border-slate-200 bg-white text-slate-700 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Sensational Language
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    claim.flags.sensational 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {claim.flags.sensational ? 'FLAGGED' : 'PASSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {claim.flags.sensational ? (
                    <>Matched viral clickbait trigger: <strong className="text-rose-900 font-bold">"{claim.flags.detectedKeywords.join('", "')}"</strong></>
                  ) : (
                    'No alarmist virality patterns detected.'
                  )}
                </p>
              </div>

              {/* Shouting Diagnostic */}
              <div className={`p-4 rounded-xl border ${
                claim.flags.shouting 
                  ? 'border-amber-300 bg-amber-50 text-amber-950 shadow-xs' 
                  : 'border-slate-200 bg-white text-slate-700 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    Capitalization / Shouting
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    claim.flags.shouting 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {claim.flags.capsPercentage}% CAPS
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {claim.flags.shouting ? (
                    <>Exceeds 50% uppercase threshold (<strong className="text-amber-900 font-bold">{claim.flags.capsPercentage}%</strong>). Common marker of coercive forward spam.</>
                  ) : (
                    `Normal sentence case (${claim.flags.capsPercentage}% caps).`
                  )}
                </p>
              </div>

              {/* Unsourced Diagnostic */}
              <div className={`p-4 rounded-xl border ${
                claim.flags.unsourced 
                  ? 'border-blue-300 bg-blue-50 text-blue-950 shadow-xs' 
                  : 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    Source Verification
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    claim.flags.unsourced 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {claim.flags.unsourced ? 'UNSOURCED' : 'VERIFIED LINK'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {claim.flags.unsourced 
                    ? 'No official publication, primary document, or agency URL provided.'
                    : 'External reference link provided for cross-referencing.'}
                </p>
              </div>

            </div>
          </div>

          {/* FACT-CHECKER VERDICT & REVIEW WORKFLOW */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Review Workflow & Verification Status
              </h4>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                claim.status === 'Verified True'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : claim.status === 'Verified False'
                  ? 'bg-rose-50 text-rose-800 border border-rose-300'
                  : claim.status === 'Misleading'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                  : 'bg-blue-50 text-blue-800 border border-blue-300'
              }`}>
                Current: {claim.status}
              </span>
            </div>

            {/* If Already Reviewed: Display Verdict Summary */}
            {claim.reviewerNote && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">
                    Reviewer: {claim.reviewerName || 'Newsroom Verification Desk'}
                  </span>
                  {claim.reviewedAt && (
                    <span className="font-mono text-[11px]">
                      {new Date(claim.reviewedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-800 font-sans leading-relaxed">
                  {claim.reviewerNote}
                </p>
                {claim.evidenceUrls && claim.evidenceUrls.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                    <span className="text-slate-600 font-bold">Authoritative Evidence Links:</span>
                    {claim.evidenceUrls.map((url, i) => (
                      <div key={i} className="flex items-center gap-1 text-blue-700 hover:text-blue-900">
                        <ExternalLink className="w-3 h-3" />
                        <a href={url} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-lg">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEW WORKFLOW ACTIONS (Always open in Newsroom mode, or expandable in public view) */}
            <div className="pt-3 border-t border-slate-200">
              <h5 className="text-xs font-bold text-slate-800 mb-3">
                {claim.status === 'Unverified' ? 'Execute Newsroom Triage & Move Claim:' : 'Update / Amend Verification Verdict:'}
              </h5>

              <form onSubmit={handleSaveReview} className="space-y-4">
                
                {/* Target Status Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Unverified', 'Verified True', 'Verified False', 'Misleading'] as ClaimStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTargetStatus(st)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        targetStatus === st
                          ? st === 'Verified True'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : st === 'Verified False'
                            ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30'
                            : st === 'Misleading'
                            ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/30'
                            : 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Reviewer Note Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Reviewer's Note & Neutral Rationale *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    placeholder="Explain the factual basis for this status (e.g. Cross-checked with official ministry records, medical consensus, or primary documents)..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Reviewer Name and Evidence Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Reviewer / Fact-Checker Signature
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Sarah Lin (Fact-Check Bureau)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Authoritative Evidence URLs (One per line)
                    </label>
                    <textarea
                      rows={2}
                      value={evidenceInput}
                      onChange={(e) => setEvidenceInput(e.target.value)}
                      placeholder="https://official-source.gov/bulletin"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Submit Verification Action */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Publish Triage Verdict to Feed</span>
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Submitted: {new Date(claim.submittedAt).toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
