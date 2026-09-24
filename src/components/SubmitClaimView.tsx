import React, { useState } from 'react';
import { 
  Zap, 
  Link as LinkIcon, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  ChevronDown,
  Search,
  MessageSquare,
  Share2,
  Users,
  Radio,
  FileText,
  Activity,
  DollarSign,
  CloudLightning,
  Landmark,
  Vote,
  Briefcase,
  GraduationCap,
  Utensils,
  Cpu,
  ShieldAlert,
  Terminal,
  Globe,
  Compass
} from 'lucide-react';
import { Platform, Category, Claim, ActiveView } from '../types';
import { calculateRiskFlags, analyzeClaimIssues } from '../utils/triageEngine';
import { ClaimAnalysisCard } from './ClaimAnalysisCard';

interface SubmitClaimViewProps {
  onSubmit: (claimData: {
    text: string;
    platform: Platform;
    category: Category;
    sourceUrl?: string;
    submitterName?: string;
  }) => void;
  setActiveView: (view: ActiveView) => void;
}

// Grouped real-life platforms
const PLATFORM_GROUPS: { label: string; icon: React.ReactNode; platforms: Platform[] }[] = [
  {
    label: 'Messaging & Direct Chats',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    platforms: ['WhatsApp', 'Telegram', 'Signal', 'WeChat', 'SMS / Text'],
  },
  {
    label: 'Social & Video Feeds',
    icon: <Share2 className="w-3.5 h-3.5" />,
    platforms: ['X', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Reddit', 'Threads'],
  },
  {
    label: 'Professional & Local Community',
    icon: <Users className="w-3.5 h-3.5" />,
    platforms: ['LinkedIn', 'Discord', 'Community Boards (Nextdoor/Citizen)'],
  },
  {
    label: 'Web, Broadcast & Offline',
    icon: <Radio className="w-3.5 h-3.5" />,
    platforms: ['News / Web', 'Email / Newsletter', 'Podcast / Audio', 'Physical Flyer', 'Other'],
  },
];

// Rich real-world situation categories with descriptive contexts
const SITUATION_CATEGORIES: { 
  category: Category; 
  icon: React.ReactNode; 
  description: string;
  tag: string;
}[] = [
  {
    category: 'Public Health & Medical',
    icon: <Activity className="w-4 h-4 text-emerald-400" />,
    description: 'Unproven cures, miracle home remedies, epidemic panics, medical claims',
    tag: 'Health & Cures',
  },
  {
    category: 'Financial Scams & Banking',
    icon: <DollarSign className="w-4 h-4 text-cyan-400" />,
    description: 'Bank account freeze alerts, KYC SMS links, crypto schemes, tax hoaxes',
    tag: 'Banking & Money',
  },
  {
    category: 'Disasters & Severe Weather',
    icon: <CloudLightning className="w-4 h-4 text-amber-400" />,
    description: 'Unverified earthquake predictions, cyclone alerts, dam breaches, flood panics',
    tag: 'Emergency Alerts',
  },
  {
    category: 'Civic, Taxes & Govt Benefits',
    icon: <Landmark className="w-4 h-4 text-blue-400" />,
    description: 'Direct cash stipend rumors, welfare beneficiary lists, new civic laws',
    tag: 'Government & Subsidies',
  },
  {
    category: 'Elections & Voting',
    icon: <Vote className="w-4 h-4 text-purple-400" />,
    description: 'EVM tampering claims, polling booth rumors, voter ID registration hoaxes',
    tag: 'Elections',
  },
  {
    category: 'Workplace & Employment',
    icon: <Briefcase className="w-4 h-4 text-teal-400" />,
    description: 'Fake remote jobs, urgent hiring scams, registration fee demands',
    tag: 'Jobs & Employment',
  },
  {
    category: 'Education & Schools',
    icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
    description: 'Exam paper leak rumors, school holiday chain messages, syllabus changes',
    tag: 'Exams & Schools',
  },
  {
    category: 'Food & Consumer Safety',
    icon: <Utensils className="w-4 h-4 text-orange-400" />,
    description: 'Plastic rice, contaminated milk hoaxes, product adulteration rumors',
    tag: 'Food Safety',
  },
  {
    category: 'AI & Deepfake Media',
    icon: <Cpu className="w-4 h-4 text-rose-400" />,
    description: 'Synthetic voice clones, face-swapped political videos, generated audio',
    tag: 'Deepfakes & AI',
  },
  {
    category: 'Local Crime & Public Safety',
    icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
    description: 'Suspicious neighborhood vehicle alerts, child kidnapper panic posts',
    tag: 'Public Safety',
  },
  {
    category: 'Cyber Threats & Phishing',
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
    description: 'Malicious APK downloads (e.g. WhatsApp Pink), lottery phishing URLs',
    tag: 'Phishing & Malware',
  },
  {
    category: 'Science & Climate',
    icon: <Globe className="w-4 h-4 text-sky-400" />,
    description: 'Alien signal claims, solar flare power grid shutdowns, climate hoaxes',
    tag: 'Science & Environment',
  },
  {
    category: 'Other Real-Life Situation',
    icon: <Compass className="w-4 h-4 text-slate-400" />,
    description: 'Any other emerging real-world claim not listed above',
    tag: 'Custom Situation',
  },
];

export const SubmitClaimView: React.FC<SubmitClaimViewProps> = ({
  onSubmit,
  setActiveView,
}) => {
  const [claimText, setClaimText] = useState('');
  const [platform, setPlatform] = useState<Platform>('WhatsApp');
  const [category, setCategory] = useState<Category>('Public Health & Medical');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categorySearch, setCategorySearch] = useState('');
  const [activePlatformGroup, setActivePlatformGroup] = useState<string>('All');
  const [submittedClaim, setSubmittedClaim] = useState<Claim | null>(null);

  // Live heuristic and Claim Analysis calculation
  const liveFlags = calculateRiskFlags(claimText, sourceUrl);
  const liveAnalysis = analyzeClaimIssues(claimText, sourceUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;

    setStep(2); // Analyzing state

    setTimeout(() => {
      const newClaimId = `claim-${Date.now()}`;
      const newClaim: Claim = {
        id: newClaimId,
        text: claimText.trim(),
        platform,
        category,
        sourceUrl: sourceUrl.trim() || undefined,
        submittedAt: new Date().toISOString(),
        submitterName: submitterName.trim() || 'Citizen Contributor',
        flags: liveFlags,
        analysis: liveAnalysis,
        status: 'Unverified',
        thumbnailTheme: category.toLowerCase().includes('health') 
          ? 'health' 
          : category.toLowerCase().includes('finance') || category.toLowerCase().includes('scam')
          ? 'finance' 
          : category.toLowerCase().includes('politic') || category.toLowerCase().includes('election')
          ? 'politics' 
          : category.toLowerCase().includes('weather') || category.toLowerCase().includes('disaster')
          ? 'flood'
          : 'generic',
        evidenceAnalysis: [
          'Initial intake heuristic scan completed',
          liveFlags.unsourced ? 'Missing source: No credible primary URL link attached' : 'Primary source link registered for fact-check routing',
          liveAnalysis.possibleIssues.absoluteStatement ? 'Absolute statement patterns detected in claim wording' : 'No absolute claims detected',
          liveAnalysis.possibleIssues.emotionalWording ? 'Emotional panic language detected in narrative' : 'Objective phrasing observed',
        ],
      };

      onSubmit({
        text: claimText.trim(),
        platform,
        category,
        sourceUrl: sourceUrl.trim() || undefined,
        submitterName: submitterName.trim() || 'Citizen Contributor',
      });

      setSubmittedClaim(newClaim);
      setStep(3); // Confirmed state
    }, 600);
  };

  const handleReset = () => {
    setClaimText('');
    setSourceUrl('');
    setSubmitterName('');
    setCategorySearch('');
    setStep(1);
    setSubmittedClaim(null);
  };

  // Filtered categories
  const filteredCategories = SITUATION_CATEGORIES.filter(item => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase();
    return (
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit a Claim
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Report unverified viral information from any real-life situation for civic verification and newsroom fact-checking.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-3 sm:px-6 shadow-xs">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            1
          </div>
          <span className={`text-xs sm:text-sm font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
            Claim Details
          </span>
        </div>

        <div className="h-0.5 w-12 sm:w-20 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            2
          </div>
          <span className={`text-xs sm:text-sm font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-500'}`}>
            Analyze
          </span>
        </div>

        <div className="h-0.5 w-12 sm:w-20 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            3
          </div>
          <span className={`text-xs sm:text-sm font-bold ${step === 3 ? 'text-slate-900' : 'text-slate-500'}`}>
            Confirm
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
          {/* Claim Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Claim Text <span className="text-blue-600">*</span>
              </label>
              <span className={`text-xs font-mono ${claimText.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                {claimText.length}/500
              </span>
            </div>
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="e.g. BREAKING: Drinking boiled turmeric and neem leaves cures all diabetes and eliminates cancer in 7 days guaranteed! Share before deleted!"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none leading-relaxed"
            />

            {/* Inbuilt Claim Analysis Card (Interactive Live Feedback) */}
            {claimText.trim().length > 3 && (
              <div className="mt-4">
                <ClaimAnalysisCard
                  analysis={liveAnalysis}
                  sourceUrl={sourceUrl}
                />
              </div>
            )}
          </div>

          {/* Source Platform (Expanded Real-Life Platforms) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Source Platform <span className="text-blue-600">*</span>
              </label>
              <span className="text-[11px] text-slate-600 font-medium">
                Selected: <span className="text-blue-600 font-bold">{platform}</span>
              </span>
            </div>

            {/* Platform Group Filters */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => setActivePlatformGroup('All')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePlatformGroup === 'All'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Platforms ({PLATFORM_GROUPS.flatMap(g => g.platforms).length})
              </button>
              {PLATFORM_GROUPS.map((group) => (
                <button
                  type="button"
                  key={group.label}
                  onClick={() => setActivePlatformGroup(group.label)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activePlatformGroup === group.label
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {group.icon}
                  <span>{group.label}</span>
                </button>
              ))}
            </div>

            {/* Platform Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PLATFORM_GROUPS
                .filter(group => activePlatformGroup === 'All' || activePlatformGroup === group.label)
                .flatMap(group => group.platforms)
                .map((p) => {
                  const isSelected = platform === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-200" />}
                      <span>{p}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Real-Life Situation Category */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Real-Life Situation Category <span className="text-blue-600">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Choose the specific domain matching this viral claim
                </p>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                Selected: <span className="text-emerald-700 font-bold">{category}</span>
              </span>
            </div>

            {/* Category Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search situations (e.g. 'cures', 'banking', 'earthquake', 'scam', 'jobs')..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Grid of Real-Life Situations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredCategories.map((item) => {
                const isSelected = category === item.category;
                return (
                  <button
                    type="button"
                    key={item.category}
                    onClick={() => setCategory(item.category)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-slate-900">
                          {item.category}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* External Source Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                External Source Link (Optional)
              </label>
              <span className="text-[11px] text-slate-500">
                {sourceUrl ? 'Citing primary link' : 'Helps fact-checkers verify'}
              </span>
            </div>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/news/report-link"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Submitter Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Submitter Tag / Handle (Optional)
              </label>
              <span className="text-[11px] text-slate-500">Anonymous by default</span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="Citizen Contributor or @handle"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!claimText.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Analyze & Submit to Community Feed</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Analyzing State */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Running Inbuilt Claim Analysis...</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Checking for absolute statements, emotional phrasing, and source links across the civic verification engine.
          </p>
        </div>
      )}

      {/* Step 3: Confirmed State */}
      {step === 3 && submittedClaim && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 shadow-xs">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Claim Successfully Submitted
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your claim has entered the community feed and the newsroom triage workbench for factual verification.
            </p>
          </div>

          {/* Full Claim Analysis Review */}
          <div className="space-y-4">
            <ClaimAnalysisCard
              analysis={submittedClaim.analysis}
              sourceUrl={submittedClaim.sourceUrl}
            />

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Submitted Claim Summary</span>
                <span className="text-blue-600 font-semibold">{submittedClaim.platform} • {submittedClaim.category}</span>
              </div>
              <p className="text-slate-700 italic">"{submittedClaim.text}"</p>
            </div>
          </div>

          {/* Next Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('feed')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all text-center cursor-pointer"
            >
              View in Public Feed
            </button>

            <button
              onClick={() => setActiveView('triage')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-all text-center cursor-pointer"
            >
              Open Newsroom Triage
            </button>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors text-center cursor-pointer"
            >
              Submit Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
