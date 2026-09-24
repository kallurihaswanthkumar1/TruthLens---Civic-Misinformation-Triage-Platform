import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Volume2, 
  Link2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  User,
  Share2
} from 'lucide-react';
import { Claim, ClaimStatus, Platform, Category } from '../types';

interface ClaimCardProps {
  claim: Claim;
  onSelect: (claim: Claim) => void;
  onQuickVerify?: (claimId: string, status: ClaimStatus) => void;
  viewMode: 'public' | 'newsroom';
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  onSelect,
  onQuickVerify,
  viewMode,
}) => {
  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'Verified True':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified True</span>
          </span>
        );
      case 'Verified False':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-300 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Verified False</span>
          </span>
        );
      case 'Misleading':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Misleading</span>
          </span>
        );
      case 'Unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Unverified · In Triage</span>
          </span>
        );
    }
  };

  const getPlatformStyle = (platform: Platform) => {
    switch (platform) {
      case 'WhatsApp':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'TikTok':
        return 'text-cyan-900 bg-cyan-50 border-cyan-200';
      case 'YouTube':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'X':
        return 'text-slate-800 bg-slate-100 border-slate-300';
      case 'Facebook':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'Instagram':
        return 'text-pink-800 bg-pink-50 border-pink-200';
      case 'Telegram':
        return 'text-sky-800 bg-sky-50 border-sky-200';
      case 'Reddit':
        return 'text-orange-800 bg-orange-50 border-orange-200';
      case 'Threads':
        return 'text-violet-800 bg-violet-50 border-violet-200';
      case 'Signal':
        return 'text-teal-800 bg-teal-50 border-teal-200';
      case 'Discord':
        return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      case 'LinkedIn':
        return 'text-blue-900 bg-blue-50 border-blue-200';
      case 'WeChat':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'SMS / Text':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'News / Web':
        return 'text-amber-900 bg-amber-50 border-amber-200';
      case 'Email / Newsletter':
        return 'text-purple-800 bg-purple-50 border-purple-200';
      case 'Physical Flyer':
        return 'text-yellow-900 bg-yellow-50 border-yellow-200';
      default:
        return 'text-slate-800 bg-slate-100 border-slate-200';
    }
  };

  const getCategoryStyle = (category: Category) => {
    switch (category) {
      case 'Disasters & Severe Weather':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'Elections & Voting':
        return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      case 'Public Health & Medical':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'AI & Deepfake Media':
        return 'text-purple-800 bg-purple-50 border-purple-200';
      case 'Financial Scams & Banking':
        return 'text-teal-800 bg-teal-50 border-teal-200';
      case 'Cyber Threats & Phishing':
        return 'text-amber-900 bg-amber-50 border-amber-200';
      case 'War & Geopolitical Conflict':
        return 'text-orange-900 bg-orange-50 border-orange-200';
      case 'Local Crime & Public Safety':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      case 'Food & Consumer Safety':
        return 'text-lime-900 bg-lime-50 border-lime-200';
      case 'Science & Climate':
        return 'text-cyan-900 bg-cyan-50 border-cyan-200';
      case 'Civic, Taxes & Govt Benefits':
        return 'text-sky-800 bg-sky-50 border-sky-200';
      case 'Workplace & Employment':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'Education & Schools':
        return 'text-fuchsia-800 bg-fuchsia-50 border-fuchsia-200';
      default:
        return 'text-slate-800 bg-slate-100 border-slate-200';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div 
      className={`group relative bg-white hover:bg-slate-50/90 border rounded-2xl p-5 transition-all duration-200 shadow-xs flex flex-col justify-between ${
        claim.flags.isHighRisk 
          ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400' 
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* High-Risk Ambient Attention Aura to draw attention to new high-risk submissions */}
      {claim.flags.isHighRisk && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.4, 0.2] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: 2 }}
          className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-red-500/25 to-amber-500/20 blur-[2px] -z-10 pointer-events-none"
        />
      )}

      {/* Top Banner for High Risk claims (2+ flags) */}
      {claim.flags.isHighRisk && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="mb-3 -mt-2 -mx-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-1.5 text-rose-700 font-bold">
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>HIGH RISK CLAIM · {claim.flags.flagCount}/3 Flags Triggered</span>
          </div>
          <span className="text-[10px] text-rose-800 font-mono font-bold">Prioritized for Triage</span>
        </motion.div>
      )}

      {/* Meta Bar: Platform + Category + Status + Time */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Platform Tag */}
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getPlatformStyle(claim.platform)}`}>
              {claim.platform}
            </span>
            {/* Category Tag */}
            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${getCategoryStyle(claim.category)}`}>
              {claim.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(claim.status)}
            <span className="text-[11px] text-slate-500 font-medium">
              {formatRelativeTime(claim.submittedAt)}
            </span>
          </div>
        </div>

        {/* Claim Text */}
        <p className="text-slate-900 text-sm font-semibold leading-relaxed mb-4 line-clamp-3 font-sans selection:bg-blue-600 selection:text-white">
          {claim.text}
        </p>

        {/* Risk Flags Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          
          {/* Sensational Flag */}
          {claim.flags.sensational ? (
            <span 
              title={`Sensational keyword: ${claim.flags.detectedKeywords.join(', ')}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
            >
              <Flame className="w-3 h-3 text-rose-600" />
              <span>Sensational</span>
            </span>
          ) : null}

          {/* Shouting Flag */}
          {claim.flags.shouting ? (
            <span 
              title={`Shouting detected: ${claim.flags.capsPercentage}% CAPS letters`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
            >
              <Volume2 className="w-3 h-3 text-amber-600" />
              <span>Shouting ({claim.flags.capsPercentage}% CAPS)</span>
            </span>
          ) : null}

          {/* Unsourced Flag */}
          {claim.flags.unsourced ? (
            <span 
              title="No original source link or verifiable citation provided"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <Link2 className="w-3 h-3 text-indigo-600" />
              <span>Unsourced</span>
            </span>
          ) : (
            <span 
              title={`Sourced from: ${claim.sourceUrl}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <Link2 className="w-3 h-3 text-emerald-600" />
              <span>Sourced</span>
            </span>
          )}

          {/* Revision count badge if edited (DP3) */}
          {claim.editHistory && claim.editHistory.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-300">
              rev {claim.editHistory.length + 1}
            </span>
          )}
        </div>

        {/* Reviewer's Note Preview (if verified or misleading) */}
        {claim.reviewerNote && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fact-Checker Verdict Note:</span>
            </div>
            <p className="text-slate-800 line-clamp-2 italic font-medium">
              "{claim.reviewerNote}"
            </p>
          </div>
        )}
        {/* Quick Triage Bar for Fact-Checkers / Reviewers */}
        {viewMode === 'newsroom' && claim.status === 'Unverified' && onQuickVerify && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-blue-200 flex items-center justify-between gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-blue-900">Quick Verdict:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickVerify(claim.id, 'Verified True');
                }}
                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 transition-colors"
                title="Mark as Verified True"
              >
                ✓ True
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickVerify(claim.id, 'Verified False');
                }}
                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300 transition-colors"
                title="Mark as Verified False"
              >
                ✗ False
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickVerify(claim.id, 'Misleading');
                }}
                className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300 transition-colors"
                title="Mark as Misleading"
              >
                ⚠ Misleading
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[120px]">
            {claim.submitterName || 'Anonymous Citizen'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(claim)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white transition-colors border border-slate-200 hover:border-transparent group-hover:bg-blue-600 group-hover:text-white"
        >
          <span>{viewMode === 'newsroom' ? 'Review & Notes' : 'View Detail'}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

    </div>
  );
};
