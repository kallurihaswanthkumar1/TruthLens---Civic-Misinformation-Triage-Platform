import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  ExternalLink, 
  Check, 
  Edit3, 
  Download,
  MessageSquare,
  Send,
  AtSign,
  Pin,
  PinOff,
  Trash2,
  Reply,
  Lock,
  Users,
  Filter,
  Info,
  CheckCheck,
  Tag,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { Claim, ActiveView, ClaimStatus, TeamComment } from '../types';
import { ClaimThumbnail } from './ClaimThumbnail';
import { ClaimAnalysisCard } from './ClaimAnalysisCard';
import { analyzeClaimIssues } from '../utils/triageEngine';
import { generateClaimsPdfReport } from '../utils/pdfGenerator';

interface ClaimDetailViewProps {
  claim: Claim;
  onBack: () => void;
  setActiveView: (view: ActiveView) => void;
  onTriageThisClaim: (claim: Claim) => void;
  onAddTeamComment?: (claimId: string, commentData: Omit<TeamComment, 'id' | 'createdAt'>) => void;
  onTogglePinComment?: (claimId: string, commentId: string) => void;
  onDeleteTeamComment?: (claimId: string, commentId: string) => void;
}

// Active newsroom staff directory for @mentions
const TEAM_MEMBERS = [
  { id: 'elena', name: 'Elena Rostova', handle: '@Elena Rostova', role: 'Senior Fact-Checker', badge: 'ER', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'marcus', name: 'Marcus Vance', handle: '@Marcus Vance', role: 'Forensics & OSINT', badge: 'MV', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'priya', name: 'Priya Sharma', handle: '@Priya Sharma', role: 'Economic Desk', badge: 'PS', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'dev', name: 'Dev Patel', handle: '@Dev Patel', role: 'Cyber & Phishing Desk', badge: 'DP', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'aris', name: 'Dr. Aris Thorne', handle: '@Dr. Aris Thorne', role: 'Medical & Health Lead', badge: 'AT', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'aisha', name: 'Aisha Khan', handle: '@Aisha Khan', role: 'Editor in Chief', badge: 'AK', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'legal', name: 'Legal Desk', handle: '@Legal Desk', role: 'Compliance & Legal', badge: 'LD', color: 'bg-amber-100 text-amber-800 border-amber-300' },
];

export const ClaimDetailView: React.FC<ClaimDetailViewProps> = ({
  claim,
  onBack,
  setActiveView,
  onTriageThisClaim,
  onAddTeamComment,
  onTogglePinComment,
  onDeleteTeamComment,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Local comments state initialized from claim.teamComments
  const [comments, setComments] = useState<TeamComment[]>(claim.teamComments || []);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('Fact-Checker (You)');
  const [authorRole, setAuthorRole] = useState('Fact-Checker');
  const [commentCategory, setCommentCategory] = useState<'investigation' | 'source-verification' | 'legal' | 'editorial' | 'general'>('investigation');
  const [isPinned, setIsPinned] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'investigation' | 'legal'>('all');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [commentToast, setCommentToast] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep in sync with claim updates
  useEffect(() => {
    setComments(claim.teamComments || []);
  }, [claim.teamComments]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await generateClaimsPdfReport([claim], {
        title: `TruthLens Verification Dossier: ${claim.category}`,
        scopeLabel: `Claim Record #${claim.id}`,
      });
    } catch (e) {
      console.error('Failed to download PDF dossier', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Quick tag insertion handler
  const handleInsertTag = (handle: string) => {
    setCommentText((prev) => {
      const cleanPrev = prev.trimEnd();
      if (!cleanPrev) return `${handle} `;
      return `${cleanPrev} ${handle} `;
    });
    setShowMentionDropdown(false);
    textareaRef.current?.focus();
  };

  // Reply to an existing comment
  const handleReplyToComment = (author: string) => {
    const replyTag = `@${author} `;
    setCommentText((prev) => (prev.includes(replyTag) ? prev : `${replyTag}${prev}`));
    textareaRef.current?.focus();
    const el = document.getElementById('new-team-comment-box');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle textarea text change & autocomplete trigger
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(value);

    // Check if the user is typing an @mention
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && lastAtIndex === textBeforeCursor.length - 1) {
      // Just typed '@'
      setMentionQuery('');
      setShowMentionDropdown(true);
    } else if (lastAtIndex !== -1 && !textBeforeCursor.slice(lastAtIndex).includes(' ')) {
      // Typing characters right after '@'
      setMentionQuery(textBeforeCursor.slice(lastAtIndex + 1).toLowerCase());
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  // Post a new comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Detect tagged team members from content
    const tagged = TEAM_MEMBERS
      .filter((m) => commentText.includes(m.handle) || commentText.includes(`@${m.name.split(' ')[0]}`))
      .map((m) => m.handle);

    const commentData: Omit<TeamComment, 'id' | 'createdAt'> = {
      authorName: authorName.trim() || 'Fact-Checker (You)',
      authorRole,
      text: commentText.trim(),
      taggedMembers: tagged,
      pinned: isPinned,
      category: commentCategory,
    };

    // Optimistic local update
    const optimisticComment: TeamComment = {
      ...commentData,
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimisticComment]);

    // Call persistent handler if provided
    if (onAddTeamComment) {
      onAddTeamComment(claim.id, commentData);
    }

    setCommentText('');
    setIsPinned(false);
    setShowMentionDropdown(false);
    setCommentToast('✓ Internal team note posted. Official verdict remains unchanged.');
    setTimeout(() => setCommentToast(null), 4500);
  };

  // Toggle Pin on comment
  const handleTogglePin = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, pinned: !c.pinned } : c))
    );
    if (onTogglePinComment) {
      onTogglePinComment(claim.id, commentId);
    }
  };

  // Delete comment
  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (onDeleteTeamComment) {
      onDeleteTeamComment(claim.id, commentId);
    }
  };

  // Filtered comments list
  const filteredComments = comments.filter((c) => {
    if (activeFilter === 'pinned') return c.pinned;
    if (activeFilter === 'investigation') return c.category === 'investigation' || c.category === 'source-verification';
    if (activeFilter === 'legal') return c.category === 'legal' || c.category === 'editorial';
    return true;
  });

  // Sort: pinned comments first, then newest
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Render text with styled @Mentions
  const renderCommentWithMentions = (text: string) => {
    const parts = text.split(/(@[A-Za-z0-9_.\s-]+?)(?=[,!?:]?(?:\s|$))/g);
    return (
      <span className="whitespace-pre-wrap leading-relaxed text-slate-800">
        {parts.map((part, idx) => {
          if (part.startsWith('@')) {
            const cleanHandle = part.trim();
            const member = TEAM_MEMBERS.find(
              (m) => m.handle.toLowerCase() === cleanHandle.toLowerCase() ||
                     cleanHandle.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
            );
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs hover:bg-blue-100 transition-colors"
                title={member ? `${member.name} (${member.role})` : `Tagged Member: ${cleanHandle}`}
              >
                <AtSign className="w-3 h-3 text-blue-600 inline" />
                <span>{cleanHandle.substring(1)}</span>
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const getRoleBadgeColor = (role: string) => {
    const lower = role.toLowerCase();
    if (lower.includes('forensic') || lower.includes('osint')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (lower.includes('health') || lower.includes('medic')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (lower.includes('econ') || lower.includes('financ')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (lower.includes('legal') || lower.includes('complian')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (lower.includes('editor')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const filteredTeamMembersForMention = TEAM_MEMBERS.filter(
    (m) => m.name.toLowerCase().includes(mentionQuery) || m.role.toLowerCase().includes(mentionQuery)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {commentToast && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 max-w-md bg-emerald-800 border border-emerald-400 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{commentToast}</span>
          </div>
          <button
            onClick={() => setCommentToast(null)}
            className="text-emerald-200 hover:text-white text-xs px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          {claim.status === 'Unverified' && (
            <button
              onClick={() => onTriageThisClaim(claim)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Triage This Claim</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
            title="Download complete PDF Dossier for this claim"
          >
            {downloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{downloadingPdf ? 'Exporting...' : 'Download PDF Dossier'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {claim.flags.isHighRisk && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              HIGH RISK
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
            claim.status === 'Verified True'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : claim.status === 'Verified False'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : claim.status === 'Misleading'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            {claim.status.toUpperCase()}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {claim.category}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {claim.text}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 border-b border-slate-200 pb-5 font-medium">
          <span className="text-slate-900 font-bold">{claim.platform}</span>
          <span>•</span>
          <span>{claim.category}</span>
          <span>•</span>
          <span>Submitted: {getRelativeTime(claim.submittedAt)}</span>
          <span>•</span>
          <span>Submitter: {claim.submitterName || 'Citizen Contributor'}</span>
        </div>

        {/* Hero Visual Card */}
        <div>
          <ClaimThumbnail
            theme={claim.thumbnailTheme}
            category={claim.category}
            className="w-full h-48 sm:h-64 rounded-2xl object-cover shadow-xs border border-slate-200"
          />
        </div>

        {/* Inbuilt Claim Analysis Card */}
        <ClaimAnalysisCard
          analysis={claim.analysis || analyzeClaimIssues(claim.text, claim.sourceUrl)}
          sourceUrl={claim.sourceUrl}
        />

        {/* Risk Flags Breakdown */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Algorithmic Risk Flags
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border ${
              claim.flags.sensational 
                ? 'bg-rose-50 border-rose-300 text-rose-800' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <div className="font-bold text-xs">Sensational Urgency</div>
              <div className="text-[11px] mt-1 font-medium">
                {claim.flags.sensational
                  ? `Triggered ("${claim.flags.detectedKeywords.join('", "')}")`
                  : 'No urgency keywords'}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              claim.flags.shouting 
                ? 'bg-rose-50 border-rose-300 text-rose-800' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <div className="font-bold text-xs">Typography Shouting</div>
              <div className="text-[11px] mt-1 font-medium">
                {claim.flags.capsPercentage}% uppercase characters ({claim.flags.shouting ? 'Over 50%' : 'Normal'})
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              claim.flags.unsourced 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <div className="font-bold text-xs">External Source Link</div>
              <div className="text-[11px] mt-1 font-medium">
                {claim.flags.unsourced ? 'No credible URL provided' : 'Source URL attached'}
              </div>
            </div>
          </div>
        </div>

        {/* Original Claim Text */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Original Submission
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm leading-relaxed font-mono">
            {claim.text}
          </div>
        </div>

        {/* Review Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Official Review Information
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Published Verdict Record
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1 font-medium">Official Status</span>
              <span className={`font-bold text-sm ${
                claim.status === 'Verified True'
                  ? 'text-emerald-700'
                  : claim.status === 'Verified False'
                  ? 'text-rose-700'
                  : claim.status === 'Misleading'
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}>
                {claim.status}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1 font-medium">Reviewed By</span>
              <span className="font-bold text-slate-900">
                {claim.reviewerName || (claim.status === 'Unverified' ? 'Pending newsroom triage' : 'Editorial Desk')}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 block mb-1 font-medium">Official Reviewer Note (Public)</span>
              <p className="text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200 font-medium">
                "{claim.reviewerNote || 'Not yet reviewed. This claim is queued in newsroom triage for forensic verification.'}"
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1 font-medium">Submitted</span>
              <span className="text-slate-700 font-medium">{getRelativeTime(claim.submittedAt)}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1 font-medium">Last Updated</span>
              <span className="text-slate-700 font-medium">
                {claim.reviewedAt ? getRelativeTime(claim.reviewedAt) : getRelativeTime(claim.submittedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TEAM COMMENTS & INTERNAL VERIFICATION DISCUSSION SECTION */}
        {/* ========================================================================= */}
        <section 
          id="team-comments-section"
          className="border-t border-slate-200 pt-6 space-y-6"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Team Comments & Internal Notes
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Internal Discussion
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Discuss evidence, tag colleagues, and coordinate investigation steps without modifying the official published verdict.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {comments.length} Note{comments.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Verdict Protection Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-900">Verdict Integrity Safeguard: </span>
              Internal notes and investigator tags here are private to the fact-checking team. Discussion and notes do <span className="font-bold text-slate-900">not alter or overwrite</span> the official verdict (<span className="font-semibold text-blue-700">{claim.status}</span>). 
              {claim.status === 'Unverified' ? (
                <button
                  type="button"
                  onClick={() => onTriageThisClaim(claim)}
                  className="ml-2 font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Use Newsroom Triage to set official verdict →
                </button>
              ) : (
                <span className="text-slate-500 ml-1">Official verdict is managed via formal triage sign-off.</span>
              )}
            </div>
          </div>

          {/* Comment Thread Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Notes ({comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('pinned')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'pinned'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pin className="w-3 h-3 text-amber-600" />
                <span>Pinned ({comments.filter((c) => c.pinned).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('investigation')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                  activeFilter === 'investigation'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Investigation
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('legal')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                  activeFilter === 'legal'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Editorial & Legal
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Click <span className="font-bold text-slate-700">Reply</span> to cite specialist
            </div>
          </div>

          {/* Comments Stream */}
          <div className="space-y-3.5">
            {sortedComments.length === 0 ? (
              <div className="bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  {activeFilter === 'pinned' ? 'No pinned internal notes' : 'No internal team notes yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {activeFilter === 'pinned' 
                    ? 'Pin crucial forensic findings or evidentiary bookmarks to highlight them at the top of the stream.'
                    : 'Start the investigative discussion below: share open-source intelligence, flag forensic anomalies, or tag colleagues for secondary review.'}
                </p>
              </div>
            ) : (
              sortedComments.map((comment) => {
                const member = TEAM_MEMBERS.find((m) => m.name.toLowerCase() === comment.authorName.toLowerCase());
                const roleBadgeColor = getRoleBadgeColor(comment.authorRole);

                return (
                  <div
                    key={comment.id}
                    className={`rounded-2xl p-4 sm:p-5 transition-all border ${
                      comment.pinned
                        ? 'bg-amber-50/40 border-amber-200/90 shadow-xs ring-1 ring-amber-400/20'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border ${
                          member?.color || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {member?.badge || comment.authorName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {comment.authorName}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
                              {comment.authorRole}
                            </span>
                            {comment.pinned && (
                              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5" />
                                Pinned Note
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 inline" />
                            <span>{getRelativeTime(comment.createdAt)}</span>
                            <span>•</span>
                            <span className="capitalize">{comment.category || 'General Note'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(comment.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            comment.pinned
                              ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title={comment.pinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          {comment.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReplyToComment(comment.authorName)}
                          className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                          title={`Reply and mention ${comment.authorName}`}
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Comment Body */}
                    <div className="pl-12 text-sm leading-relaxed text-slate-800 font-medium">
                      {renderCommentWithMentions(comment.text)}
                    </div>

                    {/* Tagged members indicator */}
                    {comment.taggedMembers && comment.taggedMembers.length > 0 && (
                      <div className="pl-12 mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Tagged in note:
                        </span>
                        {comment.taggedMembers.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            <AtSign className="w-2.5 h-2.5 text-slate-500" />
                            {tag.replace('@', '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* New Comment Submission Box */}
          <div 
            id="new-team-comment-box"
            className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Compose Internal Investigation Note</span>
              </div>

              {/* Author & Role Configuration */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Author Name"
                />

                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  title="Your Desk Role"
                >
                  <option value="Fact-Checker">Fact-Checker</option>
                  <option value="Forensics & OSINT">Forensics & OSINT</option>
                  <option value="Cyber & Phishing Desk">Cyber & Phishing</option>
                  <option value="Economic Desk">Economic Desk</option>
                  <option value="Medical & Health Lead">Medical & Health</option>
                  <option value="Legal & Compliance">Legal Desk</option>
                  <option value="Editor in Chief">Editor in Chief</option>
                </select>

                <select
                  value={commentCategory}
                  onChange={(e) => setCommentCategory(e.target.value as any)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  title="Note Category"
                >
                  <option value="investigation">Investigation</option>
                  <option value="source-verification">Source Verification</option>
                  <option value="legal">Legal & Policy</option>
                  <option value="editorial">Editorial</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* Quick Tag Team Members Strip */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <AtSign className="w-3.5 h-3.5 text-blue-600" />
                  Quick Tag Team Specialists (Click to insert):
                </span>
                <span className="text-slate-400">or type @ directly in your note</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {TEAM_MEMBERS.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleInsertTag(member.handle)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 shadow-2xs transition-colors cursor-pointer"
                    title={`Tag ${member.name} (${member.role})`}
                  >
                    <span className="font-bold text-blue-600">+</span>
                    <span>{member.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({member.role.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea with Mention Autocomplete Popover */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={3}
                value={commentText}
                onChange={handleTextChange}
                placeholder="Type your internal note... Use @ to tag colleagues (e.g. @Elena, @Marcus). Notes here do not alter the published official verdict."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed font-medium shadow-inner"
              />

              {/* Mentions Dropdown Autocomplete */}
              {showMentionDropdown && filteredTeamMembersForMention.length > 0 && (
                <div className="absolute left-3 bottom-full mb-1 z-30 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Tag Newsroom Specialist</span>
                    <span>Esc to cancel</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredTeamMembersForMention.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleInsertTag(member.handle)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${member.color}`}>
                            {member.badge}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700">
                              {member.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {member.role}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600">
                          {member.handle}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-600" />
                  Pin note as key investigation bookmark
                </span>
              </label>

              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-end sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Internal Note</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Civic Tech Quote Banner */}
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-center text-center gap-2 text-xs sm:text-sm text-blue-900 font-medium shadow-xs">
          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
          <span>"Our goal is a more informed internet. Not to silence, but to verify."</span>
        </div>
      </div>
    </div>
  );
};
