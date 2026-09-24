import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  Volume2, 
  Flame, 
  Link2, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';
import { Platform, Category, Claim } from '../types';
import { calculateRiskFlags } from '../utils/triageEngine';

interface SubmitClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newClaimData: {
    text: string;
    platform: Platform;
    category: Category;
    sourceUrl?: string;
    submitterName?: string;
  }) => void;
}

export const SubmitClaimModal: React.FC<SubmitClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState<Platform>('WhatsApp');
  const [category, setCategory] = useState<Category>('Public Health & Medical');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('');

  // Live real-time heuristic calculation
  const liveFlags = useMemo(() => {
    return calculateRiskFlags(text, sourceUrl);
  }, [text, sourceUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSubmit({
      text: text.trim(),
      platform,
      category,
      sourceUrl: sourceUrl.trim() || undefined,
      submitterName: submitterName.trim() || undefined,
    });

    // Reset form
    setText('');
    setSourceUrl('');
    setSubmitterName('');
    onClose();
  };

  const platforms: { id: Platform; label: string; color: string }[] = [
    { id: 'WhatsApp', label: '💬 WhatsApp', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' },
    { id: 'Telegram', label: '✈️ Telegram', color: 'border-sky-500/50 text-sky-400 bg-sky-950/30' },
    { id: 'Signal', label: '🔒 Signal', color: 'border-teal-500/50 text-teal-300 bg-teal-950/30' },
    { id: 'TikTok', label: '🎵 TikTok', color: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/30' },
    { id: 'YouTube', label: '▶️ YouTube', color: 'border-red-500/50 text-red-400 bg-red-950/30' },
    { id: 'X', label: '✖️ X / Twitter', color: 'border-slate-500/50 text-slate-200 bg-slate-900/60' },
    { id: 'Facebook', label: '👥 Facebook', color: 'border-blue-500/50 text-blue-400 bg-blue-950/30' },
    { id: 'Instagram', label: '📸 Instagram', color: 'border-pink-500/50 text-pink-400 bg-pink-950/30' },
    { id: 'Threads', label: '🧵 Threads', color: 'border-violet-500/50 text-violet-300 bg-violet-950/30' },
    { id: 'Reddit', label: '🤖 Reddit', color: 'border-orange-500/50 text-orange-400 bg-orange-950/30' },
    { id: 'Discord', label: '👾 Discord', color: 'border-indigo-500/50 text-indigo-300 bg-indigo-950/30' },
    { id: 'LinkedIn', label: '💼 LinkedIn', color: 'border-blue-600/50 text-blue-300 bg-blue-950/30' },
    { id: 'WeChat', label: '🟢 WeChat', color: 'border-green-500/50 text-green-300 bg-green-950/30' },
    { id: 'SMS / Text', label: '📱 SMS / Text', color: 'border-emerald-600/50 text-emerald-300 bg-emerald-950/30' },
    { id: 'News / Web', label: '🌐 News / Web', color: 'border-amber-500/50 text-amber-300 bg-amber-950/30' },
    { id: 'Email / Newsletter', label: '📧 Email Alert', color: 'border-purple-500/50 text-purple-300 bg-purple-950/30' },
    { id: 'Physical Flyer', label: '📄 Physical Notice', color: 'border-yellow-500/50 text-yellow-300 bg-yellow-950/30' },
    { id: 'Other', label: '📁 Other Channel', color: 'border-slate-500/50 text-slate-300 bg-slate-900/40' },
  ];

  const categories: { id: Category; label: string; icon: string }[] = [
    { id: 'Public Health & Medical', label: 'Public Health & Medical', icon: '🩺' },
    { id: 'Elections & Voting', label: 'Elections & Voting', icon: '🗳️' },
    { id: 'Disasters & Severe Weather', label: 'Disasters & Severe Weather', icon: '🌪️' },
    { id: 'Financial Scams & Banking', label: 'Financial Scams & Banking', icon: '💳' },
    { id: 'Cyber Threats & Phishing', label: 'Cyber Threats & Phishing', icon: '🛡️' },
    { id: 'War & Geopolitical Conflict', label: 'War & Geopolitical Conflict', icon: '⚔️' },
    { id: 'AI & Deepfake Media', label: 'AI & Deepfake Media', icon: '🤖' },
    { id: 'Local Crime & Public Safety', label: 'Local Crime & Public Safety', icon: '🚨' },
    { id: 'Food & Consumer Safety', label: 'Food & Consumer Safety', icon: '🥗' },
    { id: 'Science & Climate', label: 'Science & Climate', icon: '🔬' },
    { id: 'Civic, Taxes & Govt Benefits', label: 'Civic, Taxes & Benefits', icon: '🏛️' },
    { id: 'Workplace & Employment', label: 'Workplace & Employment', icon: '💼' },
    { id: 'Education & Schools', label: 'Education & Schools', icon: '🎓' },
    { id: 'Other', label: 'Other Situation', icon: '📌' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Submit Viral Claim for Civic Triage
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Automated objective heuristic analysis detects risk patterns neutrally upon entry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Source Platform Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Source Platform *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all truncate text-left cursor-pointer ${
                    platform === p.id
                      ? 'bg-blue-600 text-white font-bold border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Claim Situation / Category *
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Selected: <strong className="text-blue-700">{category}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 truncate cursor-pointer ${
                    category === c.id
                      ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/30 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Claim Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Viral Post Text *
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {text.length} chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g., "URGENT: Drinking lemon juice and salt kills virus immediately! SHARE BEFORE DELETED!" or copy-paste viral post verbatim...'
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* Source Link Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Original Source Link / Reference URL (Optional)
              </label>
              <span className="text-[11px] text-slate-500">
                Missing link triggers "Unsourced" flag
              </span>
            </div>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/post-or-reference"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-mono text-xs"
              />
            </div>
          </div>

          {/* Submitter Name / Alias (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Submitter Alias or Citizen Handle (Optional)
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="e.g. CitizenMonitor_NYC or Anonymous"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
            />
          </div>

          {/* LIVE HEURISTIC TELEMETRY HUD */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Live Heuristic Analyzer
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                liveFlags.isHighRisk 
                  ? 'bg-rose-50 text-rose-800 border border-rose-300'
                  : liveFlags.flagCount === 1
                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              }`}>
                {liveFlags.isHighRisk ? (
                  <>
                    <Flame className="w-3 h-3 text-rose-600" />
                    <span>HIGH RISK (2+ Flags)</span>
                  </>
                ) : liveFlags.flagCount === 1 ? (
                  <span>Medium Risk (1 Flag)</span>
                ) : (
                  <span>Low Risk (0 Flags)</span>
                )}
              </span>
            </div>

            {/* Heuristic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              
              {/* Sensational Check */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                liveFlags.sensational
                  ? 'border-rose-300 bg-rose-50/70 text-rose-900'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1 text-slate-800">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Sensational
                  </span>
                  {liveFlags.sensational ? (
                    <span className="text-[10px] font-bold px-1 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      TRIGGERED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">PASS</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
                  {liveFlags.sensational 
                    ? `Matched: "${liveFlags.detectedKeywords.join('", "')}"`
                    : '"breaking", "shocking", etc.'}
                </p>
              </div>

              {/* Shouting Check */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                liveFlags.shouting
                  ? 'border-rose-300 bg-rose-50/70 text-rose-900'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1 text-slate-800">
                    <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                    Shouting
                  </span>
                  {liveFlags.shouting ? (
                    <span className="text-[10px] font-bold px-1 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      &gt;50% CAPS
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">PASS</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${liveFlags.shouting ? 'bg-rose-500' : 'bg-slate-400'}`}
                      style={{ width: `${Math.min(liveFlags.capsPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 font-bold">{liveFlags.capsPercentage}%</span>
                </div>
              </div>

              {/* Unsourced Check */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                liveFlags.unsourced
                  ? 'border-amber-300 bg-amber-50/70 text-amber-900'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1 text-slate-800">
                    <Link2 className="w-3.5 h-3.5 text-amber-600" />
                    Unsourced
                  </span>
                  {liveFlags.unsourced ? (
                    <span className="text-[10px] font-bold px-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      NO LINK
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold">LINKED</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {liveFlags.unsourced ? 'Missing verification URL' : 'Valid URL provided'}
                </p>
              </div>

            </div>
          </div>

          {/* Footer Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Ingest & Triage Claim</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
