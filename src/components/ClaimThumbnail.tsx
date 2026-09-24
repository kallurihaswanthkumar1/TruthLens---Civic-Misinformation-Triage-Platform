import React from 'react';

interface ClaimThumbnailProps {
  theme?: 'earthquake' | 'health' | 'finance' | 'politics' | 'forest' | 'flood' | 'generic';
  className?: string;
  category?: string;
}

export const ClaimThumbnail: React.FC<ClaimThumbnailProps> = ({
  theme = 'generic',
  className = 'w-16 h-16 rounded-xl',
  category = '',
}) => {
  // Deduce theme if not explicitly set
  const resolvedTheme = theme !== 'generic' 
    ? theme 
    : category.toLowerCase().includes('health') 
    ? 'health' 
    : category.toLowerCase().includes('finance') 
    ? 'finance' 
    : category.toLowerCase().includes('politic') 
    ? 'politics' 
    : category.toLowerCase().includes('weather') || category.toLowerCase().includes('disaster') 
    ? 'earthquake' 
    : 'generic';

  switch (resolvedTheme) {
    case 'earthquake':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-amber-950/80 via-stone-900 to-stone-950 flex items-center justify-center border border-amber-900/40 shadow-inner ${className}`}>
          {/* Cracked ground / crumbling city skyline SVG silhouette */}
          <svg className="w-full h-full opacity-75" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="eqSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350f" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1c1917" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#eqSky)" />
            {/* Distant ruined buildings */}
            <polygon points="10,65 18,45 25,48 28,65" fill="#44403c" opacity="0.7" />
            <polygon points="26,65 32,35 44,40 46,65" fill="#292524" opacity="0.9" />
            <polygon points="45,65 52,50 62,54 65,65" fill="#44403c" opacity="0.7" />
            <polygon points="63,65 72,30 84,38 88,65" fill="#1c1917" opacity="0.9" />
            {/* Debris / crack lines */}
            <path d="M 5,85 Q 30,70 55,80 T 95,72 L 100,100 L 0,100 Z" fill="#292524" />
            <path d="M 15,80 L 25,88 L 35,82 L 48,90 L 60,84 L 75,95 L 90,82" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3,2" fill="none" opacity="0.8" />
            <circle cx="55" cy="45" r="2" fill="#f59e0b" opacity="0.6" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />
        </div>
      );

    case 'health':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-amber-900/60 via-stone-900 to-emerald-950/50 flex items-center justify-center border border-amber-800/30 shadow-inner ${className}`}>
          {/* Cup of hot tea / steam / herbal water silhouette */}
          <svg className="w-full h-full opacity-85" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="#451a03" opacity="0.5" />
            {/* Cup saucers & mug */}
            <ellipse cx="50" cy="65" rx="24" ry="7" fill="#78350f" opacity="0.8" />
            <ellipse cx="50" cy="52" rx="18" ry="14" fill="#b45309" opacity="0.7" />
            <ellipse cx="50" cy="48" rx="15" ry="5" fill="#fef3c7" opacity="0.9" />
            {/* Lemon slice */}
            <circle cx="62" cy="44" r="8" fill="#f59e0b" opacity="0.85" />
            <circle cx="62" cy="44" r="6" stroke="#fef08a" strokeWidth="1" fill="none" />
            {/* Steam curves */}
            <path d="M 45,38 Q 42,28 47,20" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 52,36 Q 56,26 50,18" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      );

    case 'politics':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 flex items-center justify-center border border-indigo-900/30 shadow-inner ${className}`}>
          {/* Tax documents / official papers / stamps */}
          <svg className="w-full h-full opacity-80" viewBox="0 0 100 100">
            {/* Paper sheet 1 */}
            <rect x="22" y="18" width="45" height="60" rx="3" fill="#cbd5e1" opacity="0.3" transform="rotate(-6 45 48)" />
            {/* Paper sheet 2 */}
            <rect x="30" y="22" width="45" height="58" rx="3" fill="#f8fafc" opacity="0.85" />
            {/* Document lines */}
            <line x1="38" y1="32" x2="65" y2="32" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="38" y1="40" x2="68" y2="40" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="47" x2="62" y2="47" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="54" x2="58" y2="54" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            {/* Red audit seal */}
            <circle cx="62" cy="64" r="7" fill="#ef4444" opacity="0.85" />
            <polygon points="62,59 64,63 68,64 65,66 66,70 62,68 58,70 59,66 56,64 60,63" fill="#fef2f2" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>
      );

    case 'finance':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-amber-950/70 via-slate-900 to-emerald-950/60 flex items-center justify-center border border-amber-700/30 shadow-inner ${className}`}>
          {/* Gold coin / digital payment emblem */}
          <svg className="w-full h-full opacity-85" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="32" fill="#78350f" opacity="0.6" />
            <circle cx="50" cy="50" r="28" fill="#d97706" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="50" cy="50" r="22" stroke="#fef08a" strokeWidth="1" strokeDasharray="3,2" fill="#b45309" />
            {/* Currency pillar / digital arrows */}
            <path d="M 42,38 L 58,38 L 50,48 Z" fill="#fef08a" opacity="0.9" />
            <rect x="47" y="44" width="6" height="18" fill="#fef08a" opacity="0.9" />
            <line x1="42" y1="62" x2="58" y2="62" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>
      );

    case 'forest':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-950/80 via-slate-950 to-indigo-950/60 flex items-center justify-center border border-emerald-900/30 shadow-inner ${className}`}>
          {/* Moody misty dark forest with mysterious silhouette */}
          <svg className="w-full h-full opacity-80" viewBox="0 0 100 100">
            {/* Fog mist */}
            <circle cx="50" cy="35" r="28" fill="#1e293b" opacity="0.7" />
            {/* Pine trees */}
            <polygon points="20,75 25,45 30,75" fill="#064e3b" opacity="0.9" />
            <polygon points="32,80 38,40 44,80" fill="#022c22" opacity="0.95" />
            <polygon points="50,75 58,30 66,75" fill="#064e3b" opacity="0.9" />
            <polygon points="68,80 75,42 82,80" fill="#022c22" opacity="0.95" />
            {/* Eerie glow point */}
            <circle cx="50" cy="42" r="3" fill="#67e8f9" opacity="0.8" />
            <circle cx="50" cy="42" r="8" fill="#67e8f9" opacity="0.2" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      );

    case 'flood':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-stone-950 flex items-center justify-center border border-sky-900/30 shadow-inner ${className}`}>
          {/* Submerged city street / reflections */}
          <svg className="w-full h-full opacity-80" viewBox="0 0 100 100">
            <rect x="20" y="25" width="20" height="40" fill="#334155" opacity="0.8" />
            <rect x="45" y="20" width="25" height="45" fill="#1e293b" opacity="0.9" />
            <rect x="74" y="32" width="16" height="33" fill="#334155" opacity="0.8" />
            {/* Water surface ripples */}
            <rect x="0" y="62" width="100" height="38" fill="#0c4a6e" opacity="0.7" />
            <line x1="10" y1="70" x2="40" y2="70" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            <line x1="30" y1="78" x2="80" y2="78" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
            <line x1="50" y1="88" x2="90" y2="88" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>
      );

    default:
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center border border-slate-700/50 shadow-inner ${className}`}>
          <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        </div>
      );
  }
};
