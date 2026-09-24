import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCw, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Claim, ClaimStatus, Category } from '../types';
import { ClaimThumbnail } from './ClaimThumbnail';

interface PublicFeedViewProps {
  claims: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onRefresh: () => void;
}

export const PublicFeedView: React.FC<PublicFeedViewProps> = ({
  claims,
  onSelectClaim,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'risk'>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesText = claim.text.toLowerCase().includes(query);
        const matchesSubmitter = claim.submitterName?.toLowerCase().includes(query);
        const matchesCategory = claim.category.toLowerCase().includes(query);
        const matchesPlatform = claim.platform.toLowerCase().includes(query);
        if (!matchesText && !matchesSubmitter && !matchesCategory && !matchesPlatform) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'All' && claim.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'All') {
        const catNorm = categoryFilter.toLowerCase();
        const claimCatNorm = claim.category.toLowerCase();
        if (!claimCatNorm.includes(catNorm)) {
          return false;
        }
      }

      // Platform
      if (platformFilter !== 'All' && claim.platform !== platformFilter) {
        return false;
      }

      // Risk
      if (riskFilter === 'High' && !claim.flags.isHighRisk) return false;
      if (riskFilter === 'Normal' && claim.flags.isHighRisk) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'risk') {
        return b.flags.flagCount - a.flags.flagCount;
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [claims, searchTerm, statusFilter, categoryFilter, riskFilter, sortBy]);

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const renderStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'Verified True':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            VERIFIED TRUE
          </span>
        );
      case 'Verified False':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-800 border border-red-300 flex items-center gap-1 shadow-xs">
            <XCircle className="w-3 h-3 text-red-600" />
            FALSE
          </span>
        );
      case 'Misleading':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            MISLEADING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-xs">
            UNVERIFIED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Public Feed
          </h1>
          <p className="text-sm text-slate-600 mt-0.5 font-medium">
            Browse all claims from the community. Filter, search and explore.
          </p>
        </div>

        <button
          onClick={handleRefreshClick}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all hover:scale-105 active:scale-95 shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search claims by keyword, submitter, or context..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 focus:bg-white pr-8 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Unverified">Unverified</option>
              <option value="Verified True">Verified True</option>
              <option value="Verified False">Verified False</option>
              <option value="Misleading">Misleading</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 focus:bg-white pr-8 font-medium"
            >
              <option value="All">All Situations</option>
              <option value="Health">Public Health & Cures</option>
              <option value="Scams">Financial Scams & Banking</option>
              <option value="Disaster">Disasters & Extreme Weather</option>
              <option value="Civic">Civic, Taxes & Benefits</option>
              <option value="Election">Elections & Voting</option>
              <option value="Employment">Workplace & Employment</option>
              <option value="Education">Education & School Exams</option>
              <option value="Food">Food & Consumer Safety</option>
              <option value="Deepfake">AI & Deepfake Media</option>
              <option value="Crime">Local Crime & Safety</option>
              <option value="Phishing">Cyber Threats & Phishing</option>
              <option value="Science">Science & Climate</option>
              <option value="Other">Other Situations</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Platform Dropdown */}
          <div className="relative">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 focus:bg-white pr-8 font-medium"
            >
              <option value="All">All Platforms</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telegram">Telegram</option>
              <option value="Signal">Signal</option>
              <option value="SMS / Text">SMS / Text</option>
              <option value="X">X (Twitter)</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Facebook">Facebook</option>
              <option value="Reddit">Reddit</option>
              <option value="Threads">Threads</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Community Boards (Nextdoor/Citizen)">Community Boards</option>
              <option value="News / Web">News / Web</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Risk Level */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 focus:bg-white pr-8 font-medium"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk Only</option>
              <option value="Normal">Normal Risk</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative col-span-2 sm:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 focus:bg-white pr-8 font-medium"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="risk">Sort: Risk Score</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2 shadow-xs">
            <p className="text-slate-800 font-bold text-sm">No claims match the active filters.</p>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => onSelectClaim(claim)}
              className="bg-white hover:bg-slate-50/90 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 group shadow-xs hover:shadow-sm"
            >
              {/* Thumbnail Art */}
              <div className="shrink-0">
                <ClaimThumbnail
                  theme={claim.thumbnailTheme}
                  category={claim.category}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-xs border border-slate-200"
                />
              </div>

              {/* Body Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {claim.flags.isHighRisk && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-300 flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3 h-3" />
                      HIGH RISK
                    </span>
                  )}
                  {renderStatusBadge(claim.status)}
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {claim.category}
                  </span>
                </div>

                {/* Claim Text */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                  {claim.text}
                </h3>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-slate-800 font-semibold">{claim.platform}</span>
                  <span>•</span>
                  <span>{claim.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {getRelativeTime(claim.submittedAt)}
                  </span>
                  {claim.submitterName && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600">by {claim.submitterName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Arrow button */}
              <div className="self-end sm:self-center shrink-0 w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-all border border-slate-200 group-hover:border-transparent">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
