import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  Activity, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Radio, 
  BarChart3, 
  Waves,
  Clock,
  Info
} from 'lucide-react';
import { Claim } from '../types';

interface MisinformationWaveChartProps {
  claims: Claim[];
}

interface TimePointData {
  timeLabel: string;
  timestamp: number;
  highRisk: number;
  moderateRisk: number;
  lowRisk: number;
  total: number;
  platforms: string[];
}

export const MisinformationWaveChart: React.FC<MisinformationWaveChartProps> = ({ claims }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeGrouping, setTimeGrouping] = useState<'auto' | 'hourly'>('auto');

  // Process claims into chronological timeline buckets
  const { chartData, waveMetrics } = useMemo(() => {
    if (claims.length === 0) {
      return {
        chartData: [],
        waveMetrics: {
          total: 0,
          highRiskCount: 0,
          moderateRiskCount: 0,
          lowRiskCount: 0,
          highRiskRatio: 0,
          status: 'idle' as const,
          peakTime: 'N/A',
          peakVolume: 0,
        },
      };
    }

    // Sort claims by submission time (ascending)
    const sorted = [...claims].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );

    const now = Date.now();
    const timestamps = sorted.map((c) => new Date(c.submittedAt).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps, now);
    const spanMinutes = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60)));

    // Categorization helper
    const getRiskCategory = (claim: Claim): 'high' | 'moderate' | 'low' => {
      if (claim.flags.isHighRisk || claim.flags.flagCount >= 2) return 'high';
      if (claim.flags.flagCount === 1) return 'moderate';
      return 'low';
    };

    // Determine bucket size in minutes
    // If claims span less than 2 hours, group by 15-minute intervals
    // If span is 2-12 hours, group by 30-minute intervals
    // If span is > 12 hours, group by 1-hour intervals
    let intervalMinutes = 15;
    if (timeGrouping === 'hourly' || spanMinutes > 12 * 60) {
      intervalMinutes = 60;
    } else if (spanMinutes > 4 * 60) {
      intervalMinutes = 30;
    } else {
      intervalMinutes = 15;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Ensure we have at least 4-5 continuous intervals for a smooth wave visual
    const roundedStart = Math.floor(minTime / intervalMs) * intervalMs;
    const roundedEnd = Math.max(Math.ceil(maxTime / intervalMs) * intervalMs, roundedStart + intervalMs * 4);

    const bucketsMap = new Map<number, TimePointData>();

    // Initialize all chronological slots to zero
    for (let t = roundedStart; t <= roundedEnd; t += intervalMs) {
      const date = new Date(t);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      bucketsMap.set(t, {
        timeLabel: timeStr,
        timestamp: t,
        highRisk: 0,
        moderateRisk: 0,
        lowRisk: 0,
        total: 0,
        platforms: [],
      });
    }

    // Populate counts
    let totalHigh = 0;
    let totalModerate = 0;
    let totalLow = 0;

    sorted.forEach((claim) => {
      const time = new Date(claim.submittedAt).getTime();
      const bucketKey = Math.floor(time / intervalMs) * intervalMs;
      
      const bucket = bucketsMap.get(bucketKey);
      const cat = getRiskCategory(claim);

      if (cat === 'high') totalHigh++;
      else if (cat === 'moderate') totalModerate++;
      else totalLow++;

      if (bucket) {
        if (cat === 'high') bucket.highRisk += 1;
        else if (cat === 'moderate') bucket.moderateRisk += 1;
        else bucket.lowRisk += 1;

        bucket.total += 1;
        if (!bucket.platforms.includes(claim.platform)) {
          bucket.platforms.push(claim.platform);
        }
      }
    });

    const dataArray = Array.from(bucketsMap.values()).sort((a, b) => a.timestamp - b.timestamp);

    // Calculate wave metrics
    let peakVolume = 0;
    let peakTime = 'N/A';
    dataArray.forEach((slot) => {
      if (slot.total > peakVolume) {
        peakVolume = slot.total;
        peakTime = slot.timeLabel;
      }
    });

    const highRiskRatio = claims.length > 0 ? Math.round((totalHigh / claims.length) * 100) : 0;
    
    // Determine viral wave alert status
    let status: 'critical' | 'elevated' | 'stable' = 'stable';
    if (totalHigh >= 2 && highRiskRatio >= 40) {
      status = 'critical';
    } else if (totalHigh >= 1 || totalModerate >= 2) {
      status = 'elevated';
    }

    return {
      chartData: dataArray,
      waveMetrics: {
        total: claims.length,
        highRiskCount: totalHigh,
        moderateRiskCount: totalModerate,
        lowRiskCount: totalLow,
        highRiskRatio,
        status,
        peakTime,
        peakVolume,
      },
    };
  }, [claims, timeGrouping]);

  // Custom Light High-Contrast Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const slotData: TimePointData = payload[0]?.payload;
      const totalSlot = (slotData?.total || 0);

      return (
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[210px] text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-mono">
            <span className="text-slate-500 flex items-center gap-1 font-sans">
              <Clock className="w-3 h-3 text-blue-600" />
              Window: <strong className="text-slate-800">{label}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {totalSlot} {totalSlot === 1 ? 'claim' : 'claims'}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                High Risk (2+ Flags):
              </span>
              <span className="font-mono font-bold text-rose-800">{slotData?.highRisk || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Moderate Risk (1 Flag):
              </span>
              <span className="font-mono font-bold text-amber-800">{slotData?.moderateRisk || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Low Risk (0 Flags):
              </span>
              <span className="font-mono font-bold text-emerald-800">{slotData?.lowRisk || 0}</span>
            </div>
          </div>

          {slotData?.platforms && slotData.platforms.length > 0 && (
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1">
              <span>Platforms:</span>
              <span className="text-slate-700 font-medium truncate">
                {slotData.platforms.join(', ')}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      
      {/* Wave Telemetry Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Misinformation Wave Telemetry</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                Incoming Velocity
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            Real-time volume of incoming viral claims over time, categorized by objective heuristic risk level.
          </p>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Wave Alert Badge */}
          {waveMetrics.status === 'critical' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Viral Surge Detected</span>
            </div>
          ) : waveMetrics.status === 'elevated' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Elevated Activity</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Flow Baseline Normal</span>
            </div>
          )}

          {/* Chart Display Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Stacked Area View (Volume Wave Dynamics)"
            >
              <Waves className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Waves</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Stacked Bar View (Discrete Interval Breakdown)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bars</span>
            </button>
          </div>

          {/* Granularity Toggle */}
          <button
            type="button"
            onClick={() => setTimeGrouping(timeGrouping === 'auto' ? 'hourly' : 'auto')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Toggle between auto interval and strict hourly binning"
          >
            {timeGrouping === 'auto' ? 'Interval: Auto' : 'Interval: 1-Hour'}
          </button>
        </div>
      </div>

      {/* Wave Quick Stats Micro-Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] text-slate-500 font-semibold">Wave Volume</div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{waveMetrics.total} claims</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-rose-200">
          <div className="text-[11px] text-rose-800 font-semibold flex items-center justify-between">
            <span>High Risk Ratio</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-700 font-mono mt-0.5">
            {waveMetrics.highRiskRatio}% <span className="text-xs text-slate-500 font-normal">({waveMetrics.highRiskCount})</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-amber-200">
          <div className="text-[11px] text-amber-800 font-semibold flex items-center justify-between">
            <span>Moderate Risk</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-lg font-bold text-amber-700 font-mono mt-0.5">
            {waveMetrics.moderateRiskCount} <span className="text-xs text-slate-500 font-normal">claims</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] text-slate-500 font-semibold">Peak Surge Window</div>
          <div className="text-sm font-bold text-blue-700 font-mono mt-1 truncate">
            {waveMetrics.peakTime} {waveMetrics.peakVolume > 0 ? `(${waveMetrics.peakVolume} max)` : ''}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 relative">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-2">
            <Radio className="w-8 h-8 text-blue-500/60 animate-pulse" />
            <div className="font-semibold text-sm text-slate-800">Awaiting Claim Stream</div>
            <p className="text-xs text-slate-500 max-w-sm">
              No claims in timeline yet. Use the claim workbench above to ingest viral claims; the timeline chart will plot incoming misinformation waves in real-time.
            </p>
          </div>
        ) : chartType === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorMod" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={30}
                formatter={(value) => {
                  if (value === 'highRisk') return <span className="text-rose-700 font-semibold text-xs">High Risk (2+ Flags)</span>;
                  if (value === 'moderateRisk') return <span className="text-amber-700 font-semibold text-xs">Moderate Risk (1 Flag)</span>;
                  return <span className="text-emerald-700 font-semibold text-xs">Low Risk (0 Flags)</span>;
                }}
              />
              <Area
                type="monotone"
                dataKey="highRisk"
                stackId="1"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHigh)"
              />
              <Area
                type="monotone"
                dataKey="moderateRisk"
                stackId="1"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMod)"
              />
              <Area
                type="monotone"
                dataKey="lowRisk"
                stackId="1"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={30}
                formatter={(value) => {
                  if (value === 'highRisk') return <span className="text-rose-700 font-semibold text-xs">High Risk (2+ Flags)</span>;
                  if (value === 'moderateRisk') return <span className="text-amber-700 font-semibold text-xs">Moderate Risk (1 Flag)</span>;
                  return <span className="text-emerald-700 font-semibold text-xs">Low Risk (0 Flags)</span>;
                }}
              />
              <Bar dataKey="highRisk" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="moderateRisk" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lowRisk" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Insight Note */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Heuristic wave analysis detects sudden clusters of unvetted sensational rumors before viral cascade.
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">
          Live Telemetry Active
        </span>
      </div>

    </div>
  );
};
