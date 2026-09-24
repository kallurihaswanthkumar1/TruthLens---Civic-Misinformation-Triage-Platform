import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Shield,
  Filter,
  Check,
  RotateCcw,
  Edit3,
  ExternalLink,
  Info,
  X,
  SlidersHorizontal,
  Share2,
  Tag,
  MessageSquare,
  Download,
  FileText,
  Printer,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend as RechartsLegend,
} from 'recharts';
import { Claim, ActiveView, ClaimStatus } from '../types';
import { ClaimThumbnail } from './ClaimThumbnail';
import { PdfExportModal } from './PdfExportModal';
import { generateClaimsPdfReport } from '../utils/pdfGenerator';

interface DashboardViewProps {
  claims: Claim[];
  setActiveView: (view: ActiveView) => void;
  onSelectClaim: (claim: Claim) => void;
  onBulkUpdateClaimStatus?: (claimIds: string[], status: ClaimStatus, note?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  claims,
  setActiveView,
  onSelectClaim,
  onBulkUpdateClaimStatus,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'sourced' | 'unsourced'>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'risk' | 'text'>('newest');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(true);

  // Misinformation Trends State & 7-Day Analytics
  const [trendsChartMode, setTrendsChartMode] = useState<'area' | 'bar' | 'risk'>('area');
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);

  // 7-Day Misinformation Trends Data (Dynamic window calculated backwards from today)
  const sevenDaysTrend = useMemo(() => {
    const days: {
      key: string;
      dateLabel: string;
      dayShort: string;
      dayFull: string;
      totalClaims: number;
      highRisk: number;
      unverified: number;
      falseMisleading: number;
      verifiedTrue: number;
      topCategory: string;
    }[] = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const startOfDay = d.getTime();

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const endOfDay = nextD.getTime();

      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayFull = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const dayClaims = claims.filter((c) => {
        const claimTime = new Date(c.submittedAt).getTime();
        return claimTime >= startOfDay && claimTime < endOfDay;
      });

      const highRisk = dayClaims.filter(
        (c) => Boolean(c.flags?.isHighRisk || (c.flags?.flagCount && c.flags.flagCount >= 2))
      ).length;
      const unverified = dayClaims.filter((c) => c.status === 'Unverified').length;
      const falseMisleading = dayClaims.filter(
        (c) => c.status === 'Verified False' || c.status === 'Misleading'
      ).length;
      const verifiedTrue = dayClaims.filter((c) => c.status === 'Verified True').length;

      const catMap: Record<string, number> = {};
      dayClaims.forEach((c) => {
        catMap[c.category] = (catMap[c.category] || 0) + 1;
      });
      const topCategory =
        Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Civic Reports';

      days.push({
        key: dateKey,
        dateLabel,
        dayShort,
        dayFull,
        totalClaims: dayClaims.length,
        highRisk,
        unverified,
        falseMisleading,
        verifiedTrue,
        topCategory,
      });
    }

    return days;
  }, [claims]);

  const sevenDaysTotal = useMemo(() => {
    return sevenDaysTrend.reduce((sum, d) => sum + d.totalClaims, 0);
  }, [sevenDaysTrend]);

  const sevenDaysDailyAvg = (sevenDaysTotal / 7).toFixed(1);

  const sevenDaysHighRiskTotal = useMemo(() => {
    return sevenDaysTrend.reduce((sum, d) => sum + d.highRisk, 0);
  }, [sevenDaysTrend]);

  const sevenDaysHighRiskPct = sevenDaysTotal > 0
    ? Math.round((sevenDaysHighRiskTotal / sevenDaysTotal) * 100)
    : 0;

  const peakDay = useMemo(() => {
    return [...sevenDaysTrend].sort((a, b) => b.totalClaims - a.totalClaims)[0] || sevenDaysTrend[0];
  }, [sevenDaysTrend]);

  // Quick 1-click filter for a specific day from the trends chart
  const handleFilterToDay = (dateKey: string) => {
    setDatePreset('custom');
    setStartDate(dateKey);
    setEndDate(dateKey);
    const element = document.getElementById('claims-workbench-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Quick 1-click filter for the entire 7-day period
  const handleFilterTo7Days = () => {
    setDatePreset('7days');
    setStartDate('');
    setEndDate('');
    const element = document.getElementById('claims-workbench-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Quick Search Suggestions
  const quickSearchTags = [
    'Earthquake',
    'Diabetes',
    'Bank Scam',
    'Voting Machines',
    'Stipend',
    'Plastic Rice',
    'Offline UPI'
  ];

  // Quick Situation Categories
  const quickCategoryTags = [
    { label: 'All Situations', value: 'all' },
    { label: 'Health & Medical', value: 'Health' },
    { label: 'Financial Scams', value: 'Scams' },
    { label: 'Disasters & Weather', value: 'Disaster' },
    { label: 'Elections & Voting', value: 'Election' },
    { label: 'Civic & Benefits', value: 'Civic' },
    { label: 'AI & Deepfakes', value: 'Deepfake' },
    { label: 'Public Safety', value: 'Crime' },
  ];

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchNote, setBatchNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfScope, setPdfScope] = useState<'selected' | 'filtered' | 'all'>('filtered');
  const [isQuickDownloading, setIsQuickDownloading] = useState(false);

  // Dynamic Live Stats linked directly to claims
  const baseTracked = 1248;
  const highRiskQueue = claims.filter(c => c.flags.isHighRisk && c.status === 'Unverified').length + 215;
  const pendingTriage = claims.filter(c => c.status === 'Unverified').length + 138;
  const falseMisleading = claims.filter(c => c.status === 'Verified False' || c.status === 'Misleading').length + 191;
  const verifiedTrue = claims.filter(c => c.status === 'Verified True').length + 688;
  const totalTracked = baseTracked + claims.length - 9;

  // Donut chart status breakdown (adjusted with current claims distribution)
  const unverifiedClaimsCount = claims.filter(c => c.status === 'Unverified').length;
  const verifiedClaimsCount = claims.filter(c => c.status === 'Verified True').length;
  const falseClaimsCount = claims.filter(c => c.status === 'Verified False').length;
  const misleadingClaimsCount = claims.filter(c => c.status === 'Misleading').length;

  const totalStatusSum = unverifiedClaimsCount + verifiedClaimsCount + falseClaimsCount + misleadingClaimsCount || 1;
  const unverifiedPct = Math.round((unverifiedClaimsCount / totalStatusSum) * 100) || 12;
  const verifiedPct = Math.round((verifiedClaimsCount / totalStatusSum) * 100) || 55;
  const falsePct = Math.round((falseClaimsCount / totalStatusSum) * 100) || 10;
  const misleadingPct = Math.max(0, 100 - unverifiedPct - verifiedPct - falsePct) || 5;

  // Dynamic real-life category distribution from all incoming claims
  const categoryCounts: Record<string, number> = {};
  claims.forEach((c) => {
    let key = 'Other Situations';
    const catLower = c.category.toLowerCase();
    if (catLower.includes('health') || catLower.includes('medical')) key = 'Health & Medical';
    else if (catLower.includes('scam') || catLower.includes('financ') || catLower.includes('bank')) key = 'Financial Scams';
    else if (catLower.includes('disaster') || catLower.includes('weather') || catLower.includes('earthquake')) key = 'Disasters';
    else if (catLower.includes('civic') || catLower.includes('tax') || catLower.includes('benefit')) key = 'Civic & Govt';
    else if (catLower.includes('elect') || catLower.includes('politic')) key = 'Elections & Civic';
    else if (catLower.includes('work') || catLower.includes('employ') || catLower.includes('job')) key = 'Workplace';
    else if (catLower.includes('deepfake') || catLower.includes('ai')) key = 'Deepfake Media';
    else if (catLower.includes('food')) key = 'Food Safety';
    else if (catLower.includes('crime')) key = 'Public Safety';
    else if (catLower.includes('education')) key = 'Education';
    
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  const totalCategorized = claims.length || 1;
  const colorPalette = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];
  
  // Sort and take top 5 categories
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categories = sortedCategories.length > 0
    ? sortedCategories.map(([label, count], idx) => ({
        label,
        pct: Math.round((count / totalCategorized) * 100),
        color: colorPalette[idx % colorPalette.length],
      }))
    : [
        { label: 'Health & Medical', pct: 30, color: 'bg-blue-500' },
        { label: 'Financial Scams', pct: 25, color: 'bg-purple-500' },
        { label: 'Disasters', pct: 20, color: 'bg-cyan-500' },
        { label: 'Civic & Govt', pct: 15, color: 'bg-emerald-500' },
        { label: 'Other', pct: 10, color: 'bg-amber-500' },
      ];

  // Filtered and sorted claims matching keyword, status, platform, category, risk, source, and date range
  const displayedBulkClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Status filter
      if (statusFilter === 'unverified' || statusFilter === 'Unverified') {
        if (claim.status !== 'Unverified') return false;
      } else if (statusFilter === 'high-risk') {
        if (!claim.flags.isHighRisk) return false;
      } else if (statusFilter === 'verified' || statusFilter === 'Verified True') {
        if (claim.status !== 'Verified True') return false;
      } else if (statusFilter === 'false-misleading') {
        if (claim.status !== 'Verified False' && claim.status !== 'Misleading') return false;
      } else if (statusFilter === 'Verified False') {
        if (claim.status !== 'Verified False') return false;
      } else if (statusFilter === 'Misleading') {
        if (claim.status !== 'Misleading') return false;
      }

      // Platform filter
      if (platformFilter !== 'all') {
        if (claim.platform !== platformFilter) return false;
      }

      // Category / Real-Life Situation filter
      if (categoryFilter !== 'all') {
        const catNorm = categoryFilter.toLowerCase();
        const claimCatNorm = claim.category.toLowerCase();
        if (!claimCatNorm.includes(catNorm)) return false;
      }

      // Risk flags filter
      if (riskFilter === 'high-risk' && !claim.flags.isHighRisk) return false;
      if (riskFilter === 'sensational' && !claim.flags.sensational) return false;
      if (riskFilter === 'shouting' && !claim.flags.shouting) return false;
      if (riskFilter === 'unsourced' && !claim.flags.unsourced) return false;

      // Source verification filter
      if (sourceFilter === 'sourced' && !claim.sourceUrl) return false;
      if (sourceFilter === 'unsourced' && Boolean(claim.sourceUrl)) return false;

      // Date Range filter
      const claimDate = new Date(claim.submittedAt).getTime();
      const now = Date.now();

      if (datePreset === 'today') {
        const past24Hours = now - 24 * 60 * 60 * 1000;
        if (claimDate < past24Hours) return false;
      } else if (datePreset === '7days') {
        const past7Days = now - 7 * 24 * 60 * 60 * 1000;
        if (claimDate < past7Days) return false;
      } else if (datePreset === '30days') {
        const past30Days = now - 30 * 24 * 60 * 60 * 1000;
        if (claimDate < past30Days) return false;
      } else if (datePreset === 'custom' || startDate || endDate) {
        if (startDate) {
          const startEpoch = new Date(`${startDate}T00:00:00`).getTime();
          if (!isNaN(startEpoch) && claimDate < startEpoch) return false;
        }
        if (endDate) {
          const endEpoch = new Date(`${endDate}T23:59:59.999`).getTime();
          if (!isNaN(endEpoch) && claimDate > endEpoch) return false;
        }
      }

      // Keyword Search (claim text, platform, category, submitter, reviewer, reviewer notes, evidence)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesText = claim.text.toLowerCase().includes(q);
        const matchesPlatform = claim.platform.toLowerCase().includes(q);
        const matchesCategory = claim.category.toLowerCase().includes(q);
        const matchesSubmitter = claim.submitterName?.toLowerCase().includes(q);
        const matchesReviewer = claim.reviewerName?.toLowerCase().includes(q);
        const matchesNote = claim.reviewerNote?.toLowerCase().includes(q);
        const matchesKeywords = claim.flags.detectedKeywords?.some(k => k.toLowerCase().includes(q));
        const matchesEvidence = claim.evidenceAnalysis?.some(e => e.toLowerCase().includes(q));

        if (!matchesText && !matchesPlatform && !matchesCategory && !matchesSubmitter && !matchesReviewer && !matchesNote && !matchesKeywords && !matchesEvidence) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      if (sortBy === 'risk') return b.flags.flagCount - a.flags.flagCount;
      if (sortBy === 'text') return a.text.localeCompare(b.text);
      return 0;
    });
  }, [claims, statusFilter, platformFilter, categoryFilter, riskFilter, sourceFilter, datePreset, startDate, endDate, searchQuery, sortBy]);

  // Active filters count helper
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (platformFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (riskFilter !== 'all') count++;
    if (sourceFilter !== 'all') count++;
    if (datePreset !== 'all' || startDate || endDate) count++;
    return count;
  }, [searchQuery, statusFilter, platformFilter, categoryFilter, riskFilter, sourceFilter, datePreset, startDate, endDate]);

  // Check if any filter is active
  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlatformFilter('all');
    setCategoryFilter('all');
    setRiskFilter('all');
    setSourceFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  const getDateRangeLabel = () => {
    if (datePreset === 'today') return 'Past 24 Hours';
    if (datePreset === '7days') return 'Past 7 Days';
    if (datePreset === '30days') return 'Past 30 Days';
    if (datePreset === 'custom' || startDate || endDate) {
      if (startDate && endDate) return `${startDate} to ${endDate}`;
      if (startDate) return `From ${startDate}`;
      if (endDate) return `Until ${endDate}`;
      return 'Custom Range';
    }
    return null;
  };

  const handleKpiCardClick = (targetStatus: string) => {
    setStatusFilter(targetStatus);
    const element = document.getElementById('claims-workbench-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Master selection helpers
  const isAllVisibleSelected = displayedBulkClaims.length > 0 && displayedBulkClaims.every(c => selectedIds.includes(c.id));
  const isSomeVisibleSelected = displayedBulkClaims.some(c => selectedIds.includes(c.id)) && !isAllVisibleSelected;

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = new Set(displayedBulkClaims.map(c => c.id));
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const visibleIds = displayedBulkClaims.map(c => c.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectOnlyUnverified = () => {
    const unverifiedIds = claims.filter(c => c.status === 'Unverified').map(c => c.id);
    setSelectedIds(unverifiedIds);
  };

  const handleSelectOnlyHighRisk = () => {
    const highRiskIds = claims.filter(c => c.flags.isHighRisk).map(c => c.id);
    setSelectedIds(highRiskIds);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Perform bulk status update
  const handleExecuteBulkStatus = (newStatus: ClaimStatus) => {
    if (selectedIds.length === 0 || !onBulkUpdateClaimStatus) return;

    const count = selectedIds.length;
    const note = batchNote.trim() || undefined;

    onBulkUpdateClaimStatus(selectedIds, newStatus, note);

    // Toast notification
    const statusLabels: Record<ClaimStatus, string> = {
      'Verified True': 'Verified True',
      'Verified False': 'Verified False',
      'Misleading': 'Misleading / Debunked',
      'Unverified': 'Unverified (Queued)',
    };

    setToastMessage(`✓ Updated ${count} claim${count > 1 ? 's' : ''} to "${statusLabels[newStatus]}" in one operation`);
    setSelectedIds([]);
    setBatchNote('');
    setShowNoteInput(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Selected Claims list memo
  const selectedClaimsList = useMemo(() => {
    return claims.filter((c) => selectedIds.includes(c.id));
  }, [claims, selectedIds]);

  // Human-readable summary of active filters for reports
  const filterSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (searchQuery.trim()) parts.push(`Keyword: "${searchQuery.trim()}"`);
    if (statusFilter !== 'all') parts.push(`Status: ${statusFilter === 'false-misleading' ? 'False & Misleading' : statusFilter}`);
    if (platformFilter !== 'all') parts.push(`Platform: ${platformFilter}`);
    if (categoryFilter !== 'all') parts.push(`Situation: ${categoryFilter}`);
    if (riskFilter !== 'all') parts.push(`Risk Level: ${riskFilter}`);
    if (sourceFilter !== 'all') parts.push(`Source: ${sourceFilter === 'sourced' ? 'Verified URL' : 'Missing URL'}`);
    const dateLabel = getDateRangeLabel();
    if (dateLabel) parts.push(`Date Range: ${dateLabel}`);
    return parts.length > 0 ? parts.join(' | ') : 'All tracked claims (No active filter restrictions)';
  }, [searchQuery, statusFilter, platformFilter, categoryFilter, riskFilter, sourceFilter, datePreset, startDate, endDate]);

  // Open PDF modal with target default scope
  const handleOpenPdfModal = (scopeToOpen: 'selected' | 'filtered' | 'all' = 'filtered') => {
    setPdfScope(scopeToOpen);
    setIsPdfModalOpen(true);
  };

  // Quick 1-click download helper
  const handleQuickDownloadPdf = async (scopeToDownload: 'selected' | 'filtered') => {
    const targetList = scopeToDownload === 'selected' ? selectedClaimsList : displayedBulkClaims;
    if (targetList.length === 0) return;

    setIsQuickDownloading(true);
    try {
      const scopeLabel = scopeToDownload === 'selected' 
        ? `${targetList.length} Selected Claim${targetList.length === 1 ? '' : 's'}`
        : `Filtered Results (${targetList.length} Claim${targetList.length === 1 ? '' : 's'})`;

      const filename = await generateClaimsPdfReport(targetList, {
        title: 'TruthLens Misinformation & Claim Verification Summary Report',
        scopeLabel,
        filterDescription: scopeToDownload === 'filtered' ? filterSummaryText : undefined,
      });

      setToastMessage(`✓ Generated and downloaded PDF report "${filename}" (${targetList.length} claims).`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (e) {
      console.error('Failed quick PDF download', e);
    } finally {
      setIsQuickDownloading(false);
    }
  };

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Custom recharts tooltip for 7-Day Misinformation Trends
  const CustomTrendsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;
      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl shadow-xl p-3.5 text-xs z-50 min-w-[220px] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="font-bold text-slate-900">{data.dayFull}</div>
              <div className="text-[10px] text-slate-400 font-medium">Submission Timestamp Window</div>
            </div>
            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              {data.totalClaims} claim{data.totalClaims === 1 ? '' : 's'}
            </span>
          </div>
          <div className="space-y-1.5 text-slate-600 font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                High Risk Alerts:
              </span>
              <span className="font-bold text-rose-600">{data.highRisk}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                Pending Triage:
              </span>
              <span className="font-bold text-blue-700">{data.unverified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                False & Misleading:
              </span>
              <span className="font-bold text-red-600">{data.falseMisleading}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Verified True:
              </span>
              <span className="font-bold text-emerald-700">{data.verifiedTrue}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Primary Focus:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[120px]">{data.topCategory}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 max-w-md bg-emerald-800 border border-emerald-400 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white text-xs px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-0.5 font-medium">
            Track claims, monitor risk, and manage bulk verification operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Last updated: 24 Sep 2026, 14:32</span>
          </div>

          {/* Prominent PDF Report Button */}
          <button
            type="button"
            onClick={() => handleOpenPdfModal(selectedIds.length > 0 ? 'selected' : 'filtered')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Generate and download a PDF summary report of claims"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
            {selectedIds.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] text-white font-extrabold border border-blue-400">
                {selectedIds.length} Selected
              </span>
            ) : hasActiveFilters ? (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] text-white font-extrabold border border-blue-400">
                {displayedBulkClaims.length} Filtered
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* 5 KPI Top Cards (Interactive - Click to Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Tracked */}
        <div 
          onClick={() => handleKpiCardClick('all')}
          className={`col-span-2 sm:col-span-1 bg-white border rounded-2xl p-4.5 transition-all cursor-pointer group shadow-xs hover:shadow-sm ${
            statusFilter === 'all' && !searchQuery ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
          title="Click to view all claims"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition-colors">
              Total Tracked
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalTracked.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% this week</span>
          </div>
        </div>

        {/* High Risk Queue */}
        <div 
          onClick={() => handleKpiCardClick('high-risk')}
          className={`bg-white border rounded-2xl p-4.5 transition-all cursor-pointer group shadow-xs hover:shadow-sm ${
            statusFilter === 'high-risk' ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-rose-300'
          }`}
          title="Click to filter by High Risk claims"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-rose-700 transition-colors">
              High Risk Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {highRiskQueue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+10% this week</span>
          </div>
        </div>

        {/* Pending Triage */}
        <div 
          onClick={() => handleKpiCardClick('Unverified')}
          className={`bg-white border rounded-2xl p-4.5 transition-all cursor-pointer group shadow-xs hover:shadow-sm ${
            statusFilter === 'Unverified' || statusFilter === 'unverified' ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-amber-300'
          }`}
          title="Click to filter by Pending Triage (Unverified)"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              Pending Triage
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
            {pendingTriage.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+5% this week</span>
          </div>
        </div>

        {/* False / Misleading */}
        <div 
          onClick={() => handleKpiCardClick('false-misleading')}
          className={`bg-white border rounded-2xl p-4.5 transition-all cursor-pointer group shadow-xs hover:shadow-sm ${
            statusFilter === 'false-misleading' ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-rose-300'
          }`}
          title="Click to filter by False & Misleading claims"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-rose-700 transition-colors">
              False / Misleading
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight">
            {falseMisleading.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>-1% this week</span>
          </div>
        </div>

        {/* Verified True */}
        <div 
          onClick={() => handleKpiCardClick('Verified True')}
          className={`bg-white border rounded-2xl p-4.5 transition-all cursor-pointer group shadow-xs hover:shadow-sm ${
            statusFilter === 'Verified True' || statusFilter === 'verified' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'
          }`}
          title="Click to filter by Verified True claims"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              Verified True
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {verifiedTrue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+9% this week</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MISINFORMATION TRENDS (LAST 7 DAYS ANALYTICS) */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Misinformation Trends
                </h2>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                  Last 7 Days
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Daily volume of new claims submitted over the last 7 days across citizen tip-lines and social feeds.
              </p>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* View Mode Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setTrendsChartMode('area')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  trendsChartMode === 'area'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show volume area curve over 7 days"
              >
                Volume Area
              </button>
              <button
                type="button"
                onClick={() => setTrendsChartMode('bar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  trendsChartMode === 'bar'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show verification status stacked bars"
              >
                By Status
              </button>
              <button
                type="button"
                onClick={() => setTrendsChartMode('risk')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  trendsChartMode === 'risk'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show high risk queue trajectory lines"
              >
                Risk Trajectory
              </button>
            </div>

            {/* Quick 7-Day Filter Action */}
            <button
              type="button"
              onClick={handleFilterTo7Days}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                datePreset === '7days'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title="Filter Claims Workbench table to last 7 days"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{datePreset === '7days' ? 'Filtered: 7 Days' : 'Filter Desk (7D)'}</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              7-Day Submissions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {sevenDaysTotal}
              </span>
              <span className="text-xs font-semibold text-blue-600">new claims</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Intake across all monitored channels
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Daily Influx Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {sevenDaysDailyAvg}
              </span>
              <span className="text-xs font-semibold text-slate-600">claims / day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Average daily velocity
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Peak Spike Day
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight truncate">
                {peakDay ? peakDay.dayShort : 'N/A'}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                {peakDay ? `(${peakDay.totalClaims} claims)` : ''}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium truncate">
              {peakDay ? peakDay.dayFull : 'Rolling window peak'}
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              High-Risk Alert Ratio
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-rose-600 tracking-tight">
                {sevenDaysHighRiskPct}%
              </span>
              <span className="text-xs font-semibold text-rose-700">
                ({sevenDaysHighRiskTotal} flagged)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Claims flagged with 2+ risk heuristics
            </div>
          </div>
        </div>

        {/* Recharts Analytics Visualization */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              {trendsChartMode === 'area' && 'Daily Claim Volume & High-Risk Alert Area'}
              {trendsChartMode === 'bar' && 'Daily Submissions by Verification Status'}
              {trendsChartMode === 'risk' && 'Submission Trajectory vs Risk Escalation'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Hover data point for full audit telemetry
            </span>
          </div>

          <div className="w-full h-72 sm:h-80 bg-slate-50/50 rounded-xl border border-slate-100 p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              {trendsChartMode === 'area' ? (
                <AreaChart
                  data={sevenDaysTrend}
                  margin={{ top: 10, right: 12, left: -20, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="claimVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="highRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="dayShort"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip content={<CustomTrendsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalClaims"
                    name="New Claims Submitted"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#claimVolumeGrad)"
                    activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="highRisk"
                    name="High Risk Flagged"
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#highRiskGrad)"
                    activeDot={{ r: 5, stroke: '#e11d48', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </AreaChart>
              ) : trendsChartMode === 'bar' ? (
                <BarChart
                  data={sevenDaysTrend}
                  margin={{ top: 10, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="dayShort"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip content={<CustomTrendsTooltip />} />
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="verifiedTrue" name="Verified True" stackId="status" fill="#10b981" />
                  <Bar dataKey="unverified" name="Pending Triage" stackId="status" fill="#3b82f6" />
                  <Bar dataKey="falseMisleading" name="False & Misleading" stackId="status" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart
                  data={sevenDaysTrend}
                  margin={{ top: 10, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="dayShort"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip content={<CustomTrendsTooltip />} />
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalClaims"
                    name="Total Submissions"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 1.5, stroke: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="highRisk"
                    name="High Risk Queue"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#e11d48', strokeWidth: 1.5, stroke: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unverified"
                    name="Pending Review"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#ffffff' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Day-by-Day Card Strip (Interactive Click to Filter) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">7-Day Daily Breakdown</span>
            <span className="text-[11px] text-slate-500 font-medium">Click any day to filter desk</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {sevenDaysTrend.map((day) => {
              const isSelected = datePreset === 'custom' && startDate === day.key && endDate === day.key;
              return (
                <div
                  key={day.key}
                  onClick={() => handleFilterToDay(day.key)}
                  onMouseEnter={() => setHoveredDayKey(day.key)}
                  onMouseLeave={() => setHoveredDayKey(null)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left group ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                  }`}
                  title={`Click to filter desk for ${day.dayFull}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span className="group-hover:text-blue-700 font-bold transition-colors">{day.dayShort}</span>
                    <span>{day.dateLabel}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                      {day.totalClaims}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">new</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/80 text-[10px]">
                    {day.highRisk > 0 ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        {day.highRisk} risk
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Clean
                      </span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 truncate" title={day.topCategory}>
                      {day.topCategory.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3-Column Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Claims by Status (Donut) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Claims by Status</h2>
              <span className="text-xs text-slate-500 font-medium">Live Breakdown</span>
            </div>

            {/* SVG Donut Chart */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  {/* Verified True arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(verifiedPct / 100) * 238.76} 238.76`}
                    strokeDashoffset="0"
                    fill="none"
                    strokeLinecap="butt"
                  />
                  {/* Unverified arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#2563eb"
                    strokeWidth="12"
                    strokeDasharray={`${(unverifiedPct / 100) * 238.76} 238.76`}
                    strokeDashoffset={`-${(verifiedPct / 100) * 238.76}`}
                    fill="none"
                  />
                  {/* False arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#dc2626"
                    strokeWidth="12"
                    strokeDasharray={`${(falsePct / 100) * 238.76} 238.76`}
                    strokeDashoffset={`-${((verifiedPct + unverifiedPct) / 100) * 238.76}`}
                    fill="none"
                  />
                  {/* Misleading arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#d97706"
                    strokeWidth="12"
                    strokeDasharray={`${(misleadingPct / 100) * 238.76} 238.76`}
                    strokeDashoffset={`-${((verifiedPct + unverifiedPct + falsePct) / 100) * 238.76}`}
                    fill="none"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-semibold text-slate-500">Active</span>
                  <span className="text-base font-extrabold text-slate-900 leading-tight">{claims.length}</span>
                  <span className="text-[10px] text-slate-400 font-medium">In Desk</span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="space-y-2 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-700 font-medium">Unverified</span>
                  </div>
                  <span className="font-bold text-slate-900">{unverifiedClaimsCount} <span className="text-slate-500 font-normal">({unverifiedPct}%)</span></span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-slate-700 font-medium">Verified True</span>
                  </div>
                  <span className="font-bold text-slate-900">{verifiedClaimsCount} <span className="text-slate-500 font-normal">({verifiedPct}%)</span></span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span className="text-slate-700 font-medium">False</span>
                  </div>
                  <span className="font-bold text-slate-900">{falseClaimsCount} <span className="text-slate-500 font-normal">({falsePct}%)</span></span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span className="text-slate-700 font-medium">Misleading</span>
                  </div>
                  <span className="font-bold text-slate-900">{misleadingClaimsCount} <span className="text-slate-500 font-normal">({misleadingPct}%)</span></span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const element = document.getElementById('claims-workbench-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full mt-4 py-2 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>Batch Manage All Statuses Below</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Claims by Category (Vertical Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Claims by Category</h2>
              <span className="text-xs text-slate-500 font-medium">Distribution</span>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-4 px-2 pt-4 pb-2 border-b border-slate-200">
              {categories.map((cat) => (
                <div key={cat.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {cat.pct}%
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full max-h-[120px]">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${cat.color} group-hover:brightness-110 shadow-xs`}
                      style={{ height: `${(cat.pct / 40) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full">
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Politics & Health make up over 60% of flagged viral narratives this week.
            </p>
          </div>

          <button
            onClick={() => setActiveView('triage')}
            className="w-full mt-4 py-2 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Category Triage Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Activity</h2>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">New claim submitted</span>
                    <span className="text-[11px] text-slate-400 font-medium">2m ago</span>
                  </div>
                  <p className="text-slate-600 truncate mt-0.5 font-medium">
                    "BREAKING: Massive earthquake predicted in major cities..."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800">Claim reviewed (False)</span>
                    <span className="text-[11px] text-slate-400 font-medium">5m ago</span>
                  </div>
                  <p className="text-slate-600 truncate mt-0.5 font-medium">
                    "Viral post claims new tax rules will eliminate all cash."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-700">New high risk claim</span>
                    <span className="text-[11px] text-slate-400 font-medium">8m ago</span>
                  </div>
                  <p className="text-slate-600 truncate mt-0.5 font-medium">
                    "Emergency quarantine in city center. Share before deleted!"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">Claim verified (True)</span>
                    <span className="text-[11px] text-slate-400 font-medium">12m ago</span>
                  </div>
                  <p className="text-slate-600 truncate mt-0.5 font-medium">
                    "RBI announces new UPI feature for international payments."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">New claim submitted</span>
                    <span className="text-[11px] text-slate-400 font-medium">15m ago</span>
                  </div>
                  <p className="text-slate-600 truncate mt-0.5 font-medium">
                    "Drinking hot water cures diabetes."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('feed')}
            className="w-full mt-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Full Community Stream</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLAIMS SEARCH, FILTER & WORKBENCH */}
      {/* ========================================================================= */}
      <section 
        id="claims-workbench-section"
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Claim Search & Verification Workbench
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Find specific claims across keywords, status, and platform categories, and update verification statuses individually or in bulk.
            </p>
          </div>

          {/* Quick Selection Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={handleSelectOnlyUnverified}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <span>Select Unverified</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">
                {unverifiedClaimsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={handleSelectOnlyHighRisk}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <span>Select High Risk</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-200 text-[10px] font-bold text-red-900">
                {claims.filter(c => c.flags.isHighRisk).length}
              </span>
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors font-semibold"
              >
                Clear Selection ({selectedIds.length})
              </button>
            )}

            {/* Workbench PDF Report Trigger */}
            <div className="h-5 w-px bg-slate-300 hidden sm:block mx-0.5" />
            <button
              type="button"
              onClick={() => handleOpenPdfModal(selectedIds.length > 0 ? 'selected' : 'filtered')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold shadow-xs"
              title="Generate and download a PDF summary report of selected claims or filtered search results"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] font-bold text-white">
                {selectedIds.length > 0 ? `${selectedIds.length} Sel` : `${displayedBulkClaims.length} Filtered`}
              </span>
            </button>
          </div>
        </div>

        {/* SEARCH AND ADVANCED FILTERING WORKBENCH */}
        <div className="space-y-3.5 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
          {/* Top Row: Hero Search Input & Advanced Filters Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims by keywords, viral text, submitter, reviewer note, or evidence..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                  title="Clear search keyword"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 pointer-events-none hidden sm:block">
                {displayedBulkClaims.length} match{displayedBulkClaims.length === 1 ? '' : 'es'}
              </div>
            </div>

            {/* Advanced Filters Expand/Collapse Button */}
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                isAdvancedFiltersOpen || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isAdvancedFiltersOpen ? 'rotate-180' : ''
              }`} />
            </button>
          </div>

          {/* Quick Search Tag Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Suggested topics:
            </span>
            {quickSearchTags.map((tag) => {
              const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(isActive ? '' : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Quick Category / Situation Filter Pills */}
          <div className="pt-1">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Filter by Category / Situation</span>
              {categoryFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold hover:underline"
                >
                  Clear Category
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {quickCategoryTags.map((cat) => {
                const isActive = categoryFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoryFilter(isActive && cat.value !== 'all' ? 'all' : cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXPANDED ADVANCED FILTERS PANEL (Category, Status, Date Range, Platform, Risk, Source) */}
          {isAdvancedFiltersOpen && (
            <div className="pt-3 border-t border-slate-200 space-y-3.5 animate-in fade-in duration-200">
              
              {/* FEATURED: DATE RANGE FILTERING SECTION */}
              <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Date Range Filter
                    </span>
                    {getDateRangeLabel() && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                        {getDateRangeLabel()}
                      </span>
                    )}
                  </div>

                  {(datePreset !== 'all' || startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDatePreset('all');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold hover:underline self-start sm:self-auto cursor-pointer"
                    >
                      Clear Date Filter
                    </button>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                  {/* Date presets row */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setDatePreset('all');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        datePreset === 'all' && !startDate && !endDate
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDatePreset('today');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        datePreset === 'today'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Past 24 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDatePreset('7days');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        datePreset === '7days'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Past 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDatePreset('30days');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        datePreset === '30days'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Past 30 Days
                    </button>
                  </div>

                  {/* Custom Date Pickers */}
                  <div className="flex flex-wrap items-center gap-2 text-xs border-t lg:border-t-0 lg:border-l border-slate-200 pt-2 lg:pt-0 lg:pl-3">
                    <span className="text-[11px] font-bold text-slate-600">Custom:</span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase">From</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setDatePreset('custom');
                        }}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-slate-500 font-semibold uppercase">To</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setDatePreset('custom');
                        }}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setDatePreset('all');
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Clear custom dates"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ADVANCED MULTI-CRITERIA DROPDOWNS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                {/* 1. Status Filter */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 pr-8 font-medium shadow-xs"
                  >
                    <option value="all">All Statuses ({claims.length})</option>
                    <option value="Unverified">Unverified ({unverifiedClaimsCount})</option>
                    <option value="high-risk">High Risk Queue ({claims.filter(c => c.flags.isHighRisk).length})</option>
                    <option value="Verified True">Verified True ({verifiedClaimsCount})</option>
                    <option value="Verified False">Verified False ({falseClaimsCount})</option>
                    <option value="Misleading">Misleading / Debunked ({misleadingClaimsCount})</option>
                    <option value="false-misleading">False & Misleading ({falseClaimsCount + misleadingClaimsCount})</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 bottom-2.5 pointer-events-none" />
                </div>

                {/* 2. Situation / Category */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Situation Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 pr-8 font-medium shadow-xs"
                  >
                    <option value="all">All Situations</option>
                    <option value="Health">Public Health & Medical</option>
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
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 bottom-2.5 pointer-events-none" />
                </div>

                {/* 3. Platform Category / Channel */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Platform Category
                  </label>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 pr-8 font-medium shadow-xs"
                  >
                    <option value="all">All Platforms</option>
                    <optgroup label="Direct Messaging">
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Signal">Signal</option>
                      <option value="WeChat">WeChat</option>
                      <option value="SMS / Text">SMS / Text</option>
                    </optgroup>
                    <optgroup label="Social & Video Feeds">
                      <option value="X">X (Twitter)</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Reddit">Reddit</option>
                      <option value="Threads">Threads</option>
                    </optgroup>
                    <optgroup label="Community & Professional">
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Community Boards (Nextdoor/Citizen)">Community Boards</option>
                    </optgroup>
                    <optgroup label="Broadcast & Media">
                      <option value="News / Web">News / Web</option>
                      <option value="Email / Newsletter">Email / Newsletter</option>
                      <option value="Podcast / Audio">Podcast / Audio</option>
                      <option value="Physical Flyer">Physical Flyer</option>
                      <option value="Other">Other Platforms</option>
                    </optgroup>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 bottom-2.5 pointer-events-none" />
                </div>

                {/* 4. Risk Flags */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Risk Heuristic
                  </label>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 pr-8 font-medium shadow-xs"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="high-risk">High Risk (2+ Flags)</option>
                    <option value="sensational">Sensational Wording</option>
                    <option value="shouting">Shouting (&gt;50% CAPS)</option>
                    <option value="unsourced">Missing Source Link</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 bottom-2.5 pointer-events-none" />
                </div>

                {/* 5. Source Link Verification */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Citation Link
                  </label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 pr-8 font-medium shadow-xs"
                  >
                    <option value="all">All (Sourced & Unsourced)</option>
                    <option value="sourced">Verified Source Link Included</option>
                    <option value="unsourced">No Source Link (Unsourced)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 bottom-2.5 pointer-events-none" />
                </div>

                {/* 6. Sort Order */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 appearance-none focus:outline-none focus:border-blue-600 pr-8 font-medium shadow-xs"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="risk">Highest Risk Score</option>
                    <option value="text">Alphabetical (A-Z)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 bottom-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Status Tabs & Counter Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({claims.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Unverified')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'Unverified' || statusFilter === 'unverified'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Unverified ({unverifiedClaimsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('high-risk')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'high-risk'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                High Risk ({claims.filter(c => c.flags.isHighRisk).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Verified True')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'Verified True' || statusFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Verified True ({verifiedClaimsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('false-misleading')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'false-misleading' || statusFilter === 'Verified False' || statusFilter === 'Misleading'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                False & Misleading ({falseClaimsCount + misleadingClaimsCount})
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
              <span>
                Showing <span className="text-slate-900 font-bold">{displayedBulkClaims.length}</span> of <span className="text-slate-700 font-bold">{claims.length}</span> claims
              </span>
              <button
                type="button"
                onClick={() => handleOpenPdfModal('filtered')}
                className="hidden sm:inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline font-bold ml-1 cursor-pointer"
                title="Download PDF report for current filtered search results"
              >
                <Download className="w-3 h-3" />
                <span>PDF Summary</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips Row */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 text-[11px]">
              <span className="text-slate-600 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-blue-600" />
                Active filters ({activeFiltersCount}):
              </span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                  Keyword: "{searchQuery.trim()}"
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-blue-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                  Status: {statusFilter === 'false-misleading' ? 'False & Misleading' : statusFilter}
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="hover:text-blue-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {getDateRangeLabel() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  Date: {getDateRangeLabel()}
                  <button
                    type="button"
                    onClick={() => {
                      setDatePreset('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="hover:text-emerald-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium">
                  Situation: {categoryFilter}
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="hover:text-cyan-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {platformFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                  Platform: {platformFilter}
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('all')}
                    className="hover:text-purple-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {riskFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 font-medium">
                  Risk: {riskFilter}
                  <button
                    type="button"
                    onClick={() => setRiskFilter('all')}
                    className="hover:text-red-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {sourceFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                  Source: {sourceFilter === 'sourced' ? 'Verified URL' : 'Unsourced'}
                  <button
                    type="button"
                    onClick={() => setSourceFilter('all')}
                    className="hover:text-amber-950 font-bold cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetAllFilters}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:underline transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Floating / Sticky Bulk Action Toolbar (Active when 1+ selected) */}
        {selectedIds.length > 0 && (
          <div className="sticky top-16 z-30 bg-white border-2 border-blue-600 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                <span className="text-sm font-extrabold text-slate-900">
                  {selectedIds.length} {selectedIds.length === 1 ? 'claim' : 'claims'} selected
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Select new status to execute bulk change:
                </span>
              </div>

              {/* Status change action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Download PDF for Selected Claims */}
                <button
                  type="button"
                  onClick={() => handleOpenPdfModal('selected')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                  title="Generate and download a PDF summary report of selected claims"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF ({selectedIds.length})</span>
                </button>

                {/* Verified True */}
                <button
                  type="button"
                  onClick={() => handleExecuteBulkStatus('Verified True')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Set Verified True</span>
                </button>

                {/* False */}
                <button
                  type="button"
                  onClick={() => handleExecuteBulkStatus('Verified False')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Set False</span>
                </button>

                {/* Misleading / Debunked */}
                <button
                  type="button"
                  onClick={() => handleExecuteBulkStatus('Misleading')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Set Debunked / Misleading</span>
                </button>

                {/* Unverified */}
                <button
                  type="button"
                  onClick={() => handleExecuteBulkStatus('Unverified')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all"
                  title="Reset to Unverified"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Set Unverified</span>
                </button>

                {/* Note toggle */}
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    showNoteInput 
                      ? 'bg-blue-100 text-blue-900 border-blue-400' 
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                  {showNoteInput ? 'Hide Reason' : '+ Add Batch Note'}
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs text-slate-500 hover:text-slate-900 px-2 py-2 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Optional batch reviewer note input */}
            {showNoteInput && (
              <div className="pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                  placeholder="Optional bulk reviewer note (e.g. 'Debunked via Central Health Ministry statement' or 'Verified through official gazette bulletin')..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            )}
          </div>
        )}

        {/* Claims Table / List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* Table Header */}
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 select-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-slate-500 hover:text-slate-900 p-0.5 rounded transition-colors"
                title={isAllVisibleSelected ? 'Deselect all visible' : 'Select all visible'}
              >
                {isAllVisibleSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : isSomeVisibleSelected ? (
                  <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-blue-600" />
                  </div>
                ) : (
                  <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                )}
              </button>
              <span className="uppercase tracking-wider">
                Claim Summary ({displayedBulkClaims.length})
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-8 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
              <span className="w-28 text-center">Status</span>
              <span className="w-24 text-center">Risk Level</span>
              <span className="w-24 text-right">Actions</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-200">
            {displayedBulkClaims.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">No matching claims found</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    We couldn't find any claims matching your current search query or active filter settings.
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters & Search</span>
                  </button>
                )}
              </div>
            ) : (
              displayedBulkClaims.map((claim) => {
                const isSelected = selectedIds.includes(claim.id);
                return (
                  <div
                    key={claim.id}
                    className={`px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Checkbox + Thumbnail + Claim text */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleRow(claim.id)}
                        className="mt-1 sm:mt-0 p-0.5 text-slate-400 hover:text-slate-800 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>

                      <ClaimThumbnail
                        theme={claim.thumbnailTheme}
                        category={claim.category}
                        className="w-10 h-10 rounded-lg shrink-0 hidden sm:flex object-cover shadow-xs border border-slate-200"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div
                          onClick={() => handleToggleRow(claim.id)}
                          className="cursor-pointer"
                        >
                          <p className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-1 transition-colors ${
                            isSelected ? 'text-blue-950 font-bold' : 'text-slate-900 hover:text-blue-600'
                          }`}>
                            {claim.text}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span className="text-slate-800 font-semibold">{claim.platform}</span>
                          <span>•</span>
                          <span>{claim.category}</span>
                          <span>•</span>
                          <span>{getRelativeTime(claim.submittedAt)}</span>
                          {claim.reviewerNote && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-[200px]" title={claim.reviewerNote}>
                                Note: {claim.reviewerNote}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge + Risk badge + Action link */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto shrink-0 pl-7 sm:pl-0 pt-1 sm:pt-0">
                      {/* Status badge */}
                      <div className="w-28 flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider text-center ${
                          claim.status === 'Verified True'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : claim.status === 'Verified False'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : claim.status === 'Misleading'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {claim.status === 'Verified False' ? 'FALSE' : claim.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Risk flag */}
                      <div className="w-24 flex justify-center">
                        {claim.flags.isHighRisk ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-300 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            HIGH RISK
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Normal
                          </span>
                        )}
                      </div>

                      {/* View details CTA */}
                      <div className="w-24 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onSelectClaim(claim)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* PDF Export Configuration & Generation Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        selectedClaims={selectedClaimsList}
        filteredClaims={displayedBulkClaims}
        allClaims={claims}
        filterSummaryText={filterSummaryText}
        onDownloadSuccess={(filename, count) => {
          setToastMessage(`✓ Generated and downloaded "${filename}" containing ${count} claim${count === 1 ? '' : 's'}.`);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};
