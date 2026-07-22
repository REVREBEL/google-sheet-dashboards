import React, { useState, useMemo } from 'react';
import { TrendingUp, Filter, Layers } from 'lucide-react';

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const BRAND_COLORS = {
  primary: "#163666",
  teal: "#047C97",
  cyan: "#00A6B6",
  aqua: "#71C9C5",
  powder: "#B2D3DE",
  yellow: "#FACA78",
  red: "#E05047",
  frost: "#EFF5F6",
  white: "#fafafa"
};

const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
const formatCompact = (val) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);
const formatCompactUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(val || 0);

export default function PaceApp({ data = [] }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('YEAR');
  const [selectedSegment, setSelectedSegment] = useState('ALL');

  const parsedData = useMemo(() => {
    const result = { rows: [], paceRows: [], years: ['2026', '2025'], propertyName: "REBEL HOTEL" };
    if (!data || !Array.isArray(data) || data.length === 0) return result;

    const headers = data[0]?.row || [];
    const findCol = (str) => headers.findIndex(h => safeString(h).toLowerCase() === str.toLowerCase());

    const map = {
      property: findCol("PROPERTY"),
      segmentYear: findCol("segment_year") !== -1 ? findCol("segment_year") : findCol("source_year"),
      segmentMonth: findCol("segment_stay_month") !== -1 ? findCol("segment_stay_month") : findCol("source_stay_month"),
      segmentMetric: findCol("segment_metric") !== -1 ? findCol("segment_metric") : findCol("source_metric"),
      segmentResn: findCol("segment_no_resn") !== -1 ? findCol("segment_no_resn") : findCol("source_no_resn"),
      segmentNights: findCol("segment_nights") !== -1 ? findCol("segment_nights") : findCol("source_nights"),
      segmentRev: findCol("segment_revenue") !== -1 ? findCol("segment_revenue") : findCol("source_revenue"),
      segmentADR: findCol("segment_adr") !== -1 ? findCol("segment_adr") : findCol("source_adr"),
      segmentALOS: findCol("segment_alos") !== -1 ? findCol("segment_alos") : findCol("source_alos"),
      segmentLead: findCol("segment_lead_days") !== -1 ? findCol("segment_lead_days") : findCol("source_lead_days"),
      paceYear: findCol("pace_year") !== -1 ? findCol("pace_year") : findCol("pickup_year"),
      paceMonth: findCol("pace_stay_month") !== -1 ? findCol("pace_stay_month") : findCol("pickup_stay_month"),
      paceMetricType: findCol("pace_metric_type") !== -1 ? findCol("pace_metric_type") : findCol("pickup_metric_type"),
      paceMetric: findCol("pace_metric") !== -1 ? findCol("pace_metric") : findCol("pickup_metric"),
      paceTYRev: findCol("pace_ty_revenue") !== -1 ? findCol("pace_ty_revenue") : findCol("pickup_ty_revenue"),
      paceSTLYRev: findCol("pace_stly_revenue") !== -1 ? findCol("pace_stly_revenue") : findCol("pickup_stly_revenue")
    };

    for (let idx = 1; idx < Math.min(5, data.length); idx++) {
      const row = data[idx]?.row;
      if (row && map.property !== -1 && row[map.property]) {
        result.propertyName = safeString(row[map.property]).toUpperCase();
      }
    }

    data.forEach((item, idx) => {
      if (idx <= 1) return;
      const r = item.row;
      if (!r) return;

      if (map.segmentYear !== -1 && r[map.segmentYear]) {
        const yr = Number(r[map.segmentYear]);
        if (!isNaN(yr) && yr > 2000) {
          result.rows.push({
            year: yr, month: safeString(r[map.segmentMonth]).toUpperCase(),
            metric: safeString(r[map.segmentMetric]).toUpperCase() || 'TOTAL',
            nights: Number(r[map.segmentNights]) || 0, revenue: Number(r[map.segmentRev]) || 0,
            adr: Number(r[map.segmentADR]) || 0, alos: Number(r[map.segmentALOS]) || 0,
            lead: Number(r[map.segmentLead]) || 0, resn: Number(r[map.segmentResn]) || 0
          });
        }
      }

      if (map.paceYear !== -1 && r[map.paceYear]) {
        const yr = Number(r[map.paceYear]);
        if (!isNaN(yr) && yr > 2000) {
          result.paceRows.push({
            year: yr, month: safeString(r[map.paceMonth]).toUpperCase(),
            metricType: safeString(r[map.paceMetricType]).toUpperCase(),
            metric: safeString(r[map.paceMetric]).toUpperCase(),
            ty: Number(r[map.paceTYRev]) || 0, stly: Number(r[map.paceSTLYRev]) || 0
          });
        }
      }
    });

    const yrSet = new Set(result.rows.map(r => String(r.year)));
    if (yrSet.size > 0) result.years = Array.from(yrSet).sort().reverse();

    return result;
  }, [data]);

  const { rows, paceRows, years, propertyName } = parsedData;

  const segmentOptions = useMemo(() => Array.from(new Set(paceRows.filter(r => r.metricType.includes('SEGMENT') || (r.metric && r.metric !== 'TOTAL')).map(r => r.metric).filter(Boolean))).sort(), [paceRows]);

  const activeMonthsList = useMemo(() => {
    if (selectedMonth === 'YEAR') return MONTH_ORDER;
    if (selectedMonth === 'YTD') return ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
    return [selectedMonth];
  }, [selectedMonth]);

  const filteredPaceRows = useMemo(() => {
    let list = paceRows.filter(r => activeMonthsList.includes(r.month));
    if (selectedSegment !== 'ALL') {
      const target = selectedSegment.toUpperCase();
      list = list.filter(r => r.metricType === 'SEGMENT' && (r.metric === target || r.metric.includes(target)));
    } else {
      list = list.filter(r => r.metricType === 'TOTAL' || !r.metricType || r.metric === 'TOTAL');
      if (list.length === 0) list = paceRows.filter(r => activeMonthsList.includes(r.month));
    }
    return list;
  }, [paceRows, activeMonthsList, selectedSegment]);

  const paceTotals = useMemo(() => {
    const totalTY = filteredPaceRows.reduce((sum, d) => sum + (d.ty || 0), 0);
    const totalSTLY = filteredPaceRows.reduce((sum, d) => sum + (d.stly || 0), 0);
    const paceVar = totalTY - totalSTLY;
    return { totalTY, totalSTLY, paceVar, paceVarPct: totalSTLY > 0 ? (paceVar / totalSTLY) * 100 : 0 };
  }, [filteredPaceRows]);

  const stats = useMemo(() => {
    const targetMetric = selectedSegment === 'ALL' ? 'TOTAL' : selectedSegment.toUpperCase();
    const activeData = rows.filter(r => String(r.year) === selectedYear && activeMonthsList.includes(r.month) && (r.metric === targetMetric || (selectedSegment !== 'ALL' && r.metric.includes(targetMetric))));
    const activeStlyData = rows.filter(r => String(r.year) === String(Number(selectedYear) - 1) && activeMonthsList.includes(r.month) && (r.metric === targetMetric || (selectedSegment !== 'ALL' && r.metric.includes(targetMetric))));
    
    const totalRev = activeData.reduce((acc, d) => acc + d.revenue, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.nights, 0);
    const stlyRev = activeStlyData.reduce((acc, d) => acc + d.revenue, 0);
    const stlyNights = activeStlyData.reduce((acc, d) => acc + d.nights, 0);

    const totalResn = activeData.reduce((acc, d) => acc + d.resn, 0);

    return {
      totalRev, avgADR: totalNights > 0 ? totalRev / totalNights : 0,
      stlyADR: stlyNights > 0 ? stlyRev / stlyNights : 0,
      totalLead: activeData.length > 0 ? activeData.reduce((acc, d) => acc + d.lead, 0) / activeData.length : 16,
      avgALOS: totalResn > 0 ? (totalNights / totalResn) : (activeData.length > 0 ? activeData.reduce((acc, d) => acc + d.alos, 0) / activeData.length : 2.5)
    };
  }, [rows, selectedYear, activeMonthsList, selectedSegment]);

  const periodLabel = `${selectedYear || '---'} ${selectedMonth === 'YEAR' ? 'FULL YEAR' : (selectedMonth === 'YTD' ? 'YTD' : selectedMonth)}`;

  const renderIndicator = (isNeg, textColor, bgColor) => (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: textColor }}>
      <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform duration-300" style={{ transform: isNeg ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        <path d="M 12 3 L 4 12 H 8.5 V 21 H 15.5 V 12 H 20 Z" fill={bgColor} />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen font-roboto pb-12" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-4xl font-bold uppercase tracking-tight" style={{ color: BRAND_COLORS.primary }}>{propertyName} | PICKUP & PACE</h1>
            <div className="flex items-center gap-3">
                <div className="flex items-center p-1.5 border shadow-sm" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                  <Layers size={14} className="ml-2" style={{ color: BRAND_COLORS.cyan }} />
                  <select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} className="bg-transparent border-none text-xs font-bold focus:ring-0 py-1 pl-2 pr-8 cursor-pointer uppercase">
                    <option value="ALL">ALL SEGMENTS</option>
                    {segmentOptions.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                  </select>
                </div>
                <div className="flex items-center p-1.5 border shadow-sm" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                  <Filter size={14} className="ml-2" style={{ color: BRAND_COLORS.cyan }} />
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent border-none text-xs font-bold focus:ring-0 py-1 pl-2 pr-8 cursor-pointer uppercase">
                    <option value="YEAR">FULL YEAR</option><option value="YTD">YTD VIEW</option>
                    {MONTH_ORDER.map(m => <option key={m} value={m}>{m} VIEW</option>)}
                  </select>
                </div>
                <div className="flex items-center p-1.5 border shadow-sm" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent border-none text-xs font-bold focus:ring-0 py-1 pl-2 pr-8 cursor-pointer uppercase">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Top Pace KPI Block Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
            <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.primary }}>
            <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.powder}B3` }}>
                Pace Variance {selectedSegment !== 'ALL' ? `(${selectedSegment})` : ''}
            </span>
            <div className="flex flex-col gap-0.5 -mt-6">
                <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.powder }}>
                {paceTotals.paceVar >= 0 ? `+$${formatCompact(paceTotals.paceVar)}` : `-$${formatCompact(Math.abs(paceTotals.paceVar))}`}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                {renderIndicator(paceTotals.paceVar < 0, BRAND_COLORS.powder, BRAND_COLORS.primary)}
                <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.powder }}>{paceTotals.paceVarPct.toFixed(1)}% YOY</span>
                </div>
            </div>
            </div>

            <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.teal }}>
            <span className="text-lg font-khand font-bold uppercase tracking-wider text-white/70">ADR CHG</span>
            <div className="flex flex-col gap-0.5 -mt-6">
                <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none text-white">
                {stats.avgADR - stats.stlyADR >= 0 ? `+$${(stats.avgADR - stats.stlyADR).toFixed(2)}` : `-$${Math.abs(stats.avgADR - stats.stlyADR).toFixed(2)}`}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                {renderIndicator(stats.avgADR - stats.stlyADR < 0, "#FFFFFF", BRAND_COLORS.teal)}
                <span className="text-sm font-roboto font-medium tracking-normal text-white">{stats.stlyADR > 0 ? `${(((stats.avgADR - stats.stlyADR) / stats.stlyADR) * 100).toFixed(1)}%` : '0.0%'}</span>
                </div>
            </div>
            </div>

            <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.cyan }}>
            <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.yellow}B3` }}>OTB Revenue</span>
            <div className="flex flex-col gap-0.5 -mt-6">
                <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.yellow }}>
                ${formatCompact(paceTotals.totalTY || stats.totalRev)}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                {renderIndicator(paceTotals.paceVar < 0, BRAND_COLORS.yellow, BRAND_COLORS.cyan)}
                <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.yellow }}>(${formatCompact(Math.abs(paceTotals.paceVar))})</span>
                </div>
            </div>
            </div>

            <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.aqua }}>
            <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.teal}B3` }}>Avg LOS</span>
            <div className="flex flex-col gap-0.5 -mt-6">
                <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.teal }}>
                {(stats.avgALOS || 0).toFixed(1)}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                {renderIndicator(stats.avgALOS - 2.5 < 0, BRAND_COLORS.teal, BRAND_COLORS.aqua)}
                <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.teal }}>Nights</span>
                </div>
            </div>
            </div>

            <div className="p-5 flex flex-col justify-center items-center text-center h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.powder }}>
            <h3 className="text-6xl font-khand font-bold tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>{Math.round(stats.totalLead || 0)}</h3>
            <p className="text-xs sm:text-sm font-khand font-bold uppercase tracking-wider mt-1" style={{ color: BRAND_COLORS.primary }}>LEAD DAYS</p>
            </div>
        </div>

        {/* Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Pace Bar Chart */}
            <div className="p-8 border-[3px] rounded-none" style={{ backgroundColor: BRAND_COLORS.white, borderColor: BRAND_COLORS.primary }}>
            <h3 className="font-khand uppercase font-bold tracking-wider text-xl mb-4" style={{ color: BRAND_COLORS.primary }}>
                Revenue OTB Pace ({selectedYear || '2026'} vs. {selectedYear ? Number(selectedYear) - 1 : '2025'}) {selectedSegment !== 'ALL' ? `- ${selectedSegment}` : ''}
            </h3>
            {filteredPaceRows.length > 0 ? (
                <div className="w-full overflow-x-auto select-none">
                <svg viewBox="0 0 600 280" className="w-full h-auto select-none">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const maxVal = Math.max(...filteredPaceRows.map(d => Math.max(d.ty || 0, d.stly || 0)), 100) * 1.15;
                    const val = maxVal * ratio;
                    const y = 20 + 220 - (ratio * 220);
                    return (
                        <g key={ratio}>
                        <line x1={60} y1={y} x2={580} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                        <text x={52} y={y + 4} textAnchor="end" className="font-roboto font-bold" fontSize="10" fill={`${BRAND_COLORS.primary}80`}>{formatCompactUSD(val)}</text>
                        </g>
                    );
                    })}
                    {filteredPaceRows.map((d, i) => {
                    const maxVal = Math.max(...filteredPaceRows.map(item => Math.max(item.ty || 0, item.stly || 0)), 100) * 1.15;
                    const groupWidth = 520 / filteredPaceRows.length;
                    const barWidth = Math.max(8, groupWidth * 0.35);
                    const groupX = 60 + (i * groupWidth) + (groupWidth - (barWidth * 2 + 4)) / 2;
                    const tyH = (d.ty / maxVal) * 220;
                    const stlyH = (d.stly / maxVal) * 220;
                    return (
                        <g key={d.month || i}>
                        <rect x={groupX} y={240 - tyH} width={barWidth} height={tyH} fill={BRAND_COLORS.cyan} />
                        <rect x={groupX + barWidth + 4} y={240 - stlyH} width={barWidth} height={stlyH} fill={BRAND_COLORS.primary} />
                        <text x={groupX + barWidth + 2} y={268} textAnchor="middle" className="font-khand font-bold uppercase" fontSize="11" fill={BRAND_COLORS.primary}>{String(d.month).substring(0, 3).toUpperCase()}</text>
                        </g>
                    );
                    })}
                </svg>
                <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs font-khand font-bold uppercase"><div className="w-3 h-3" style={{ backgroundColor: BRAND_COLORS.cyan }}></div><span>TY OTB REVENUE</span></div>
                    <div className="flex items-center gap-2 text-xs font-khand font-bold uppercase"><div className="w-3 h-3" style={{ backgroundColor: BRAND_COLORS.primary }}></div><span>STLY REVENUE</span></div>
                </div>
                </div>
            ) : (
                <div className="text-center py-12 text-sm font-khand uppercase tracking-widest opacity-60">No Pace Data Found For Selection</div>
            )}
            </div>

            {/* Pickup Velocity Logistic Curve Chart */}
            <div className="p-8 border-[3px] rounded-none" style={{ backgroundColor: BRAND_COLORS.white, borderColor: BRAND_COLORS.primary }}>
            <h3 className="font-khand uppercase font-bold tracking-wider text-xl mb-4" style={{ color: BRAND_COLORS.primary }}>Occupancy Booking Window Pickup Velocity</h3>
            <div className="w-full overflow-x-auto select-none">
                <svg viewBox="0 0 600 260" className="w-full h-auto select-none">
                {[0, 25, 50, 75, 100].map((pct) => {
                    const y = 20 + 200 - (pct / 100) * 200;
                    return (
                    <g key={pct}>
                        <line x1={50} y1={y} x2={580} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                        <text x={42} y={y + 4} textAnchor="end" className="font-roboto font-bold" fontSize="10" fill={`${BRAND_COLORS.primary}80`}>{`${pct}%`}</text>
                    </g>
                    );
                })}
                {[90, 60, 30, 0].map((d) => (
                    <text key={d} x={50 + ((90 - d) / 90) * 530} y={248} textAnchor="middle" className="font-roboto font-bold" fontSize="10" fill={BRAND_COLORS.primary}>{`${d}D`}</text>
                ))}
                {(() => {
                    const x0 = stats.totalLead || 15;
                    const points = [];
                    for (let d = 90; d >= 0; d -= 2) {
                        const pct = 100 / (1 + Math.exp(0.08 * (d - x0)));
                        points.push({ x: 50 + ((90 - d) / 90) * 530, y: 220 - (pct / 100) * 200 });
                    }
                    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
                    const markerX = 50 + ((90 - x0) / 90) * 530;
                    const markerY = 220 - ((100 / (1 + Math.exp(0))) / 100) * 200;
                    return (
                    <>
                        <path d={pathD} fill="none" stroke={BRAND_COLORS.cyan} strokeWidth="4" />
                        <circle cx={markerX} cy={markerY} r="6" fill={BRAND_COLORS.yellow} stroke={BRAND_COLORS.primary} strokeWidth="2" />
                    </>
                    );
                })()}
                </svg>
            </div>
            </div>
        </div>

        {/* Pace Breakdown Matrix Table */}
        <div className="border-[3px] rounded-none overflow-hidden" style={{ backgroundColor: BRAND_COLORS.white, borderColor: BRAND_COLORS.primary }}>
            <div className="p-6 border-b-[3px] flex justify-between items-center" style={{ backgroundColor: BRAND_COLORS.white, borderColor: BRAND_COLORS.primary }}>
            <h3 className="font-khand uppercase font-bold tracking-wider text-lg" style={{ color: BRAND_COLORS.primary }}>
                Monthly Matrix Breakdown {selectedSegment !== 'ALL' ? `(${selectedSegment})` : ''}
            </h3>
            <span className="text-xs font-khand font-bold uppercase tracking-widest text-white px-3 pt-[6px] pb-1 rounded-none" style={{ backgroundColor: BRAND_COLORS.cyan }}>
                {periodLabel} Calendar Pacing
            </span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left font-roboto text-sm">
                <thead className="text-[11px] font-khand uppercase tracking-widest border-b-[2px]" style={{ color: `${BRAND_COLORS.primary}99`, backgroundColor: `${BRAND_COLORS.frost}80`, borderColor: `${BRAND_COLORS.primary}1A` }}>
                <tr>
                    <th className="px-6 py-4">Stay Month</th>
                    <th className="px-6 py-4 text-right">{selectedYear || '2026'} OTB Revenue</th>
                    <th className="px-6 py-4 text-right">{selectedYear ? Number(selectedYear) - 1 : '2025'} STLY Revenue</th>
                    <th className="px-6 py-4 text-right">Absolute Var</th>
                    <th className="px-6 py-4 text-right">% Var</th>
                </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: `${BRAND_COLORS.primary}1A` }}>
                {filteredPaceRows.map((m, idx) => {
                    const absoluteVar = m.ty - m.stly;
                    const pctVar = m.stly > 0 ? absoluteVar / m.stly : 0;
                    return (
                    <tr key={idx} className="transition-colors hover-bg-dynamic" style={{ '--hover-bg-color': `${BRAND_COLORS.primary}0D` }}>
                        <td className="px-6 py-4 font-bold uppercase" style={{ color: BRAND_COLORS.primary }}>{m.month}</td>
                        <td className="px-6 py-4 text-right font-medium">{formatCurrency(m.ty)}</td>
                        <td className="px-6 py-4 text-right opacity-70" style={{ color: BRAND_COLORS.primary }}>{formatCurrency(m.stly)}</td>
                        <td className="px-6 py-4 text-right font-bold" style={{ color: absoluteVar >= 0 ? BRAND_COLORS.cyan : BRAND_COLORS.red }}>
                        {absoluteVar >= 0 ? `+${formatCurrency(absoluteVar)}` : `(${formatCurrency(Math.abs(absoluteVar))})`}
                        </td>
                        <td className="px-6 py-4 text-right font-bold" style={{ color: pctVar >= 0 ? BRAND_COLORS.cyan : BRAND_COLORS.red }}>
                        {pctVar >= 0 ? `+${(pctVar * 100).toFixed(1)}%` : `(${Math.abs(pctVar * 100).toFixed(1)}%)`}
                        </td>
                    </tr>
                    );
                })}
                {filteredPaceRows.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-12 text-xs font-khand uppercase tracking-widest opacity-60">No pacing entries found for selection</td></tr>
                )}
                </tbody>
            </table>
            </div>
        </div>

      </main>
    </div>
  );
}