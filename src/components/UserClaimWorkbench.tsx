import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Flame, 
  Volume2, 
  Link2, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  RotateCcw,
  CornerDownLeft,
  Info
} from 'lucide-react';
import { Platform, Category } from '../types';
import { calculateRiskFlags } from '../utils/triageEngine';

interface UserClaimWorkbenchProps {
  onSubmitClaim: (claimData: {
    text: string;
    platform: Platform;
    category: Category;
    sourceUrl?: string;
    submitterName?: string;
  }) => void;
  onClearClaims: () => void;
  totalClaimsCount: number;
}

export const UserClaimWorkbench: React.FC<UserClaimWorkbenchProps> = ({
  onSubmitClaim,
  onClearClaims,
  totalClaimsCount,
}) => {
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState<Platform>('WhatsApp');
  const [category, setCategory] = useState<Category>('Public Health & Medical');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [customDetail, setCustomDetail] = useState('');

  // Live real-time heuristic calculation
  const liveFlags = useMemo(() => {
    return calculateRiskFlags(text, sourceUrl);
  }, [text, sourceUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // If user provided a custom detail/situation and chose Other, prepend or attach cleanly
    const finalSubmitter = submitterName.trim() 
      ? submitterName.trim() 
      : customDetail.trim() 
      ? `Citizen (${customDetail.trim().slice(0, 20)})` 
      : undefined;

    onSubmitClaim({
      text: text.trim(),
      platform,
      category,
      sourceUrl: sourceUrl.trim() || undefined,
      submitterName: finalSubmitter,
    });

    // Clear text to allow quick consecutive entries
    setText('');
    setSourceUrl('');
    setCustomDetail('');
  };

  const platforms: { id: Platform; label: string; icon: string }[] = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️' },
    { id: 'Signal', label: 'Signal', icon: '🔒' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵' },
    { id: 'YouTube', label: 'YouTube', icon: '▶️' },
    { id: 'X', label: 'X (Twitter)', icon: '✖️' },
    { id: 'Facebook', label: 'Facebook', icon: '👥' },
    { id: 'Instagram', label: 'Instagram', icon: '📸' },
    { id: 'Threads', label: 'Threads', icon: '🧵' },
    { id: 'Reddit', label: 'Reddit', icon: '🤖' },
    { id: 'Discord', label: 'Discord', icon: '👾' },
    { id: 'LinkedIn', label: 'LinkedIn', icon: '💼' },
    { id: 'WeChat', label: 'WeChat', icon: '🟢' },
    { id: 'SMS / Text', label: 'SMS / Text', icon: '📱' },
    { id: 'News / Web', label: 'News / Web', icon: '🌐' },
    { id: 'Email / Newsletter', label: 'Email / Blast', icon: '📧' },
    { id: 'Physical Flyer', label: 'Physical Flyer', icon: '📄' },
    { id: 'Other', label: 'Other Source', icon: '📁' },
  ];

  const categories: { id: Category; label: string; icon: string }[] = [
    { id: 'Public Health & Medical', label: 'Public Health & Medical', icon: '🩺' },
    { id: 'Elections & Voting', label: 'Elections & Voting', icon: '🗳️' },
    { id: 'Disasters & Severe Weather', label: 'Disasters & Severe Weather', icon: '🌪️' },
    { id: 'Financial Scams & Banking', label: 'Financial Scams & Banking', icon: '💳' },
    { id: 'Cyber Threats & Phishing', label: 'Cyber Threats & Phishing', icon: '🛡️' },
    { id: 'War & Geopolitical Conflict', label: 'War & Conflict', icon: '⚔️' },
    { id: 'AI & Deepfake Media', label: 'AI & Deepfakes', icon: '🤖' },
    { id: 'Local Crime & Public Safety', label: 'Local Crime & Safety', icon: '🚨' },
    { id: 'Food & Consumer Safety', label: 'Food & Product Safety', icon: '🥗' },
    { id: 'Science & Climate', label: 'Science & Climate', icon: '🔬' },
    { id: 'Civic, Taxes & Govt Benefits', label: 'Civic, Taxes & Benefits', icon: '🏛️' },
    { id: 'Workplace & Employment', label: 'Workplace & Labor', icon: '💼' },
    { id: 'Education & Schools', label: 'Education & Schools', icon: '🎓' },
    { id: 'Other', label: 'Other Situation', icon: '📌' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Interactive Claim Input & Real-Time Triage</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                User Driven
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Type or paste any viral post below. Watch the heuristic flags evaluate your input live before submitting.
            </p>
          </div>
        </div>

        {totalClaimsCount > 0 && (
          <button
            type="button"
            onClick={onClearClaims}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            title="Remove all claims to start completely blank"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Feed & Start Blank</span>
          </button>
        )}
      </div>

      {/* Main interactive form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Step 1: Input text area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Enter Viral Claim Text *</span>
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">{text.length} characters</span>
              {text.trim() && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  liveFlags.isHighRisk
                    ? 'bg-rose-50 text-rose-800 border border-rose-300'
                    : liveFlags.flagCount === 1
                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                }`}>
                  {liveFlags.isHighRisk ? 'HIGH RISK (2+ Flags)' : `${liveFlags.flagCount} Flag(s)`}
                </span>
              )}
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type or paste any viral post, claim, forward, or rumor here (e.g., "BREAKING: Water supply contaminated across southern district! DO NOT DRINK! SHARE IMMEDIATELY!")...'
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-sans shadow-xs"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Enter exact claim phrasing to evaluate capital letters, sensational words, and source links.</span>
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-slate-600 hover:text-rose-600 underline font-medium cursor-pointer"
              >
                Clear input
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Metadata Selection (Platform & Category) */}
        <div className="space-y-3 pt-1">
          
          {/* Platform buttons (12 real-life platforms) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Source Platform *
              </label>
              <span className="text-[11px] text-slate-600">
                Selected: <strong className="text-blue-700">{platform}</strong>
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    platform === p.id
                      ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-500/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category buttons (11 real-world categories) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Real-Life Situation & Category *
              </label>
              <span className="text-[11px] text-slate-600">
                Selected: <strong className="text-emerald-700">{category}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    category === c.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-2 ring-emerald-500/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Optional Custom Context / Channel if Other selected */}
        {(platform === 'Other' || category === 'Other') && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 animate-in fade-in">
            <label className="block text-xs font-bold text-blue-950">
              Custom Situation Context / Channel Name (Optional)
            </label>
            <input
              type="text"
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              placeholder="e.g. Local neighborhood WhatsApp group, church newsletter, flyers posted at transit hub..."
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        )}

        {/* Step 3: Optional Source URL & Submitter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Source URL (Optional)</span>
              <span className="text-[10px] text-slate-500">Leaving empty flags as Unsourced</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://news-or-tweet-source.com/..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Submitter Alias (Optional)
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="e.g. CitizenMonitor_01"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* LIVE RISK FLAGS VISUALIZER (Real-time HUD) */}
        <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Live Heuristic Risk Telemetry (Updates as you type)
            </span>
            <span className="text-xs text-slate-600">
              Rule: <strong className="text-rose-700 font-bold">2+ flags = High Risk</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Sensational indicator */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              liveFlags.sensational
                ? 'border-rose-300 bg-rose-50 text-rose-950 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  Sensational
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  liveFlags.sensational ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {liveFlags.sensational ? 'TRIGGERED' : 'CLEAR'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {liveFlags.sensational
                  ? `Found: "${liveFlags.detectedKeywords.join('", "')}"`
                  : 'Triggers on: "breaking", "shocking", "share before deleted"'}
              </p>
            </div>

            {/* Shouting indicator */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              liveFlags.shouting
                ? 'border-amber-300 bg-amber-50 text-amber-950 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  Shouting (&gt;50% CAPS)
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  liveFlags.shouting ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {liveFlags.capsPercentage}% CAPS
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      liveFlags.shouting ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(liveFlags.capsPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-600 font-semibold">
                  {liveFlags.shouting ? 'Exceeds 50%' : 'Normal'}
                </span>
              </div>
            </div>

            {/* Unsourced indicator */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              liveFlags.unsourced
                ? 'border-blue-300 bg-blue-50 text-blue-950 shadow-xs'
                : 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" />
                  Source Link
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  liveFlags.unsourced ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {liveFlags.unsourced ? 'UNSOURCED' : 'VERIFIED LINK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {liveFlags.unsourced
                  ? 'No valid source link provided'
                  : 'Valid URL attached'}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Clicking submit will ingest the claim into the triage feed as <strong>Unverified</strong> for newsroom review.</span>
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Ingest & Triage Claim Now</span>
          </button>
        </div>

      </form>
    </div>
  );
};
