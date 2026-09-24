import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Layers, 
  EyeOff, 
  Lock,
  Plus,
  Sparkles
} from 'lucide-react';
import { 
  Claim, 
  Category, 
  ClaimStatus, 
  Platform, 
  DecisionPointsState,
  FeedOrderPolicy 
} from '../types';
import { ClaimCard } from './ClaimCard';

interface PublicFeedProps {
  claims: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onQuickVerify?: (claimId: string, status: ClaimStatus) => void;
  viewMode: 'public' | 'newsroom';
  decisionPoints: DecisionPointsState;
  onOpenSubmit: () => void;
  onOpenDecisionPoints: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const PublicFeed: React.FC<PublicFeedProps> = ({
  claims,
  onSelectClaim,
  onQuickVerify,
  viewMode,
  decisionPoints,
  onOpenSubmit,
  onOpenDecisionPoints,
  activeFilter,
  setActiveFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const categories: string[] = [
    'All',
    'Public Health & Medical',
    'Elections & Voting',
    'Disasters & Severe Weather',
    'Financial Scams & Banking',
    'Cyber Threats & Phishing',
    'War & Geopolitical Conflict',
    'AI & Deepfake Media',
    'Local Crime & Public Safety',
    'Food & Consumer Safety',
    'Science & Climate',
    'Civic, Taxes & Govt Benefits',
    'Workplace & Employment',
    'Education & Schools',
    'Other',
  ];
  const platforms: string[] = [
    'All',
    'WhatsApp',
    'Telegram',
    'Signal',
    'TikTok',
    'YouTube',
    'X',
    'Facebook',
    'Instagram',
    'Threads',
    'Reddit',
    'Discord',
    'LinkedIn',
    'WeChat',
    'SMS / Text',
    'News / Web',
    'Email / Newsletter',
    'Physical Flyer',
    'Other',
  ];
  const statuses: string[] = ['All', 'Unverified', 'Verified True', 'Verified False', 'Misleading'];

  // Apply filters and DP2 (Visibility) & DP1 (Ordering)
  const filteredAndOrderedClaims = useMemo(() => {
    let result = [...claims];

    // DP2: Visibility enforcement
    if (decisionPoints.visibility === 'hold-unverified' && viewMode === 'public') {
      result = result.filter((c) => c.status !== 'Unverified');
    }

    // Top metrics filter shortcut
    if (activeFilter === 'high-risk') {
      result = result.filter((c) => c.flags.isHighRisk);
    } else if (activeFilter === 'unverified') {
      result = result.filter((c) => c.status === 'Unverified');
    } else if (activeFilter === 'debunked') {
      result = result.filter((c) => c.status === 'Verified False' || c.status === 'Misleading');
    } else if (activeFilter === 'verified-true') {
      result = result.filter((c) => c.status === 'Verified True');
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Platform filter
    if (selectedPlatform !== 'All') {
      result = result.filter((c) => c.platform === selectedPlatform);
    }

    // Status filter
    if (selectedStatus !== 'All') {
      result = result.filter((c) => c.status === selectedStatus);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          (c.reviewerNote && c.reviewerNote.toLowerCase().includes(q)) ||
          (c.submitterName && c.submitterName.toLowerCase().includes(q))
      );
    }

    // DP1: Feed Order Sorting
    switch (decisionPoints.feedOrder) {
      case 'risk-first':
        // High risk first (descending flag count), then by recency
        result.sort((a, b) => {
          if (a.flags.isHighRisk !== b.flags.isHighRisk) {
            return a.flags.isHighRisk ? -1 : 1;
          }
          if (a.flags.flagCount !== b.flags.flagCount) {
            return b.flags.flagCount - a.flags.flagCount;
          }
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        });
        break;

      case 'recency':
        // Pure chronological order (newest first)
        result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;

      case 'status-triage':
        // Status hierarchy: False & Misleading first, then Unverified, then True
        const rank = (status: ClaimStatus) => {
          if (status === 'Verified False') return 1;
          if (status === 'Misleading') return 2;
          if (status === 'Unverified') return 3;
          return 4;
        };
        result.sort((a, b) => {
          const rankA = rank(a.status);
          const rankB = rank(b.status);
          if (rankA !== rankB) return rankA - rankB;
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        });
        break;

      default:
        break;
    }

    return result;
  }, [
    claims,
    decisionPoints.visibility,
    decisionPoints.feedOrder,
    viewMode,
    activeFilter,
    selectedCategory,
    selectedPlatform,
    selectedStatus,
    searchTerm,
  ]);

  const heldBackCount = useMemo(() => {
    return claims.filter((c) => c.status === 'Unverified').length;
  }, [claims]);

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search viral claims, keywords, debunks, submitters..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Feed Order Policy Indicator / Selector (DP1) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDecisionPoints}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Order: {decisionPoints.feedOrder}</span>
            </button>
          </div>

        </div>

        {/* Filter Badges Row */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          
          {/* Category / Situation Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              Situation / Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/40">
            {/* Platform Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-slate-400 font-semibold mr-1 shrink-0">Platform:</span>
              {platforms.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedPlatform === plat
                      ? 'bg-slate-700 text-white font-semibold ring-1 ring-slate-500'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-slate-400 font-semibold mr-1 shrink-0">Status:</span>
              {statuses.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedStatus === st
                      ? 'bg-slate-700 text-white font-semibold ring-1 ring-slate-500'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* DP2 Interstitial Notification if Held Back */}
      {decisionPoints.visibility === 'hold-unverified' && viewMode === 'public' && heldBackCount > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-600/40 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DP2 Governance Rule in effect:</strong> {heldBackCount} unverified incoming claims are currently held back from the public feed until newsroom fact-checkers verify them.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenDecisionPoints}
            className="underline font-semibold hover:text-amber-200"
          >
            Adjust Visibility Policy
          </button>
        </div>
      )}

      {/* Public Quarantine Warning Banner if policy is public-quarantine */}
      {decisionPoints.visibility === 'public-quarantine' && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>Civic Inoculation Active:</strong> Unverified viral claims are displayed with explicit risk flags to pre-bunk misinformation before viral saturation.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            Friction protocol engaged
          </span>
        </div>
      )}

      {/* Claims Grid */}
      {filteredAndOrderedClaims.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndOrderedClaims.map((claim, idx) => (
              <motion.div
                key={claim.id}
                layout
                initial={
                  claim.flags.isHighRisk
                    ? { opacity: 0, y: -24, scale: 0.95 }
                    : { opacity: 0, y: 20, scale: 0.98 }
                }
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    duration: 0.42,
                    ease: [0.16, 1, 0.3, 1],
                    delay: Math.min(idx * 0.04, 0.2),
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  transition: { duration: 0.2 } 
                }}
                className="h-full flex flex-col"
              >
                <ClaimCard
                  claim={claim}
                  onSelect={onSelectClaim}
                  onQuickVerify={onQuickVerify}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : claims.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Civic Triage Desk is Ready</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No claims have been ingested yet. Use the interactive input station above to submit your first claim and watch the heuristic engine evaluate risk flags live!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Submit Viral Claim</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-4">
          <div className="inline-flex p-4 rounded-full bg-slate-800/80 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">No viral claims match your active filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, clearing category filters, or submit a new viral claim to triage.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPlatform('All');
                setSelectedStatus('All');
                setActiveFilter('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit New Claim</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
