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
  orange: "#F37D59",
  red: "#E05047",
  purple: "#8E456A",
  frost: "#EFF5F6",
  white: "#fafafa"
};

const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val || 0));
const formatPreciseCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatCompact = (val) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);
const formatCompactUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(val || 0);

export default function TrendsApp({ data = [] }) {
  // Navigation & Filter States
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('YEAR');
  const [selectedSegment, setSelectedSegment] = useState('ALL');

  // Core Data Parsing Logic specific to Trends (Segments, Budget, Forecast)
  const parsedData = useMemo(() => {
    const result = {
      rows: [],
      years: ['2026', '2025'],
      roomsConfig: 188,
      propertyName: "REBEL HOTEL",
      budgetEntries: {},
      forecastEntries: {}
    };

    if (!data || !Array.isArray(data) || data.length === 0) return result;

    const headers = data[0]?.row || [];
    const findCol = (str) => headers.findIndex(h => safeString(h).toLowerCase() === str.toLowerCase());

    const map = {
      property: findCol("PROPERTY"),
      rooms: findCol("ROOMS"),
      segmentYear: findCol("segment_year") !== -1 ? findCol("segment_year") : findCol("source_year"),
      segmentMonth: findCol("segment_stay_month") !== -1 ? findCol("segment_stay_month") : findCol("source_stay_month"),
      segmentMetric: findCol("segment_metric") !== -1 ? findCol("segment_metric") : findCol("source_metric"),
      segmentNights: findCol("segment_nights") !== -1 ? findCol("segment_nights") : findCol("source_nights"),
      segmentRev: findCol("segment_revenue") !== -1 ? findCol("segment_revenue") : findCol("source_revenue"),
      segmentADR: findCol("segment_adr") !== -1 ? findCol("segment_adr") : findCol("source_adr"),
      budgetYear: findCol("budget_year") !== -1 ? findCol("budget_year") : findCol("segment_year"),
      budgetMonth: findCol("budget_stay_month") !== -1 ? findCol("budget_stay_month") : findCol("segment_stay_month"),
      budgetRooms: findCol("budget_rooms"),
      budgetRev: findCol("budget_revenue"),
      forecastYear: findCol("forecast_year") !== -1 ? findCol("forecast_year") : findCol("segment_year"),
      forecastMonth: findCol("forecast_stay_month") !== -1 ? findCol("forecast_stay_month") : findCol("segment_stay_month"),
      forecastRooms: findCol("forecast_rooms"),
      forecastRev: findCol("forecast_revenue")
    };

    // Metadata Extract
    for (let idx = 1; idx < Math.min(5, data.length); idx++) {
      const row = data[idx]?.row;
      if (!row) continue;
      if (map.property !== -1 && row[map.property]) result.propertyName = safeString(row[map.property]).toUpperCase();
      if (map.rooms !== -1 && !isNaN(Number(row[map.rooms]))) {
        const rVal = Number(row[map.rooms]);
        if (rVal > 0) result.roomsConfig = rVal;
      }
    }

    data.forEach((item, idx) => {
      if (idx <= 1) return; // Skip headers
      const r = item.row;
      if (!r) return;

      // Extract Segments
      if (map.segmentYear !== -1 && r[map.segmentYear]) {
        const yr = Number(r[map.segmentYear]);
        if (!isNaN(yr) && yr > 2000) {
          result.rows.push({
            year: yr,
            month: safeString(r[map.segmentMonth]).toUpperCase(),
            metric: safeString(r[map.segmentMetric]).toUpperCase() || 'TOTAL',
            nights: Number(r[map.segmentNights]) || 0,
            revenue: Number(r[map.segmentRev]) || 0,
            adr: Number(r[map.segmentADR]) || 0
          });
        }
      }

      // Extract Budgets
      if (map.budgetRev !== -1 && r[map.budgetRev]) {
        const yr = r[map.budgetYear] ? safeString(r[map.budgetYear]) : '2026';
        const m3 = safeString(r[map.budgetMonth]).toUpperCase();
        if (MONTH_ORDER.includes(m3)) {
          if (!result.budgetEntries[yr]) result.budgetEntries[yr] = {};
          if (!result.budgetEntries[yr][m3]) result.budgetEntries[yr][m3] = { rooms: 0, revenue: 0 };
          result.budgetEntries[yr][m3].rooms += (Number(r[map.budgetRooms]) || 0);
          result.budgetEntries[yr][m3].revenue += (Number(r[map.budgetRev]) || 0);
        }
      }

      // Extract Forecasts
      if (map.forecastRev !== -1 && r[map.forecastRev]) {
        const yr = r[map.forecastYear] ? safeString(r[map.forecastYear]) : '2026';
        const m3 = safeString(r[map.forecastMonth]).toUpperCase();
        if (MONTH_ORDER.includes(m3)) {
          if (!result.forecastEntries[yr]) result.forecastEntries[yr] = {};
          if (!result.forecastEntries[yr][m3]) result.forecastEntries[yr][m3] = { rooms: 0, revenue: 0 };
          result.forecastEntries[yr][m3].rooms += (Number(r[map.forecastRooms]) || 0);
          result.forecastEntries[yr][m3].revenue += (Number(r[map.forecastRev]) || 0);
        }
      }
    });

    const yrSet = new Set(result.rows.map(r => String(r.year)));
    if (yrSet.size > 0) result.years = Array.from(yrSet).sort().reverse();

    return result;
  }, [data]);

  const { rows, years, roomsConfig, propertyName, budgetEntries, forecastEntries } = parsedData;

  const segmentOptions = useMemo(() => {
    return Array.from(new Set(rows.map(r => r.metric).filter(m => m && m !== 'TOTAL' && m !== 'COMPLIMENTARY'))).sort();
  }, [rows]);

  const activeMonthsList = useMemo(() => {
    if (selectedMonth === 'YEAR') return MONTH_ORDER;
    if (selectedMonth === 'YTD') return ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
    return [selectedMonth];
  }, [selectedMonth]);

  const monthlyTotals = useMemo(() => {
    const targetMetric = selectedSegment === 'ALL' ? 'TOTAL' : selectedSegment.toUpperCase();
    return rows
      .filter(r => String(r.year) === selectedYear && (r.metric === targetMetric || (selectedSegment !== 'ALL' && r.metric.includes(targetMetric))))
      .map(r => {
        let days = 30;
        if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(r.month)) days = 31;
        else if (r.month === "FEB") days = 28;
        return { ...r, occupancy: (days > 0 && roomsConfig > 0) ? (r.nights / (days * roomsConfig)) : 0 };
      })
      .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
  }, [rows, selectedYear, selectedSegment, roomsConfig]);

  const stlyData = useMemo(() => {
    const prevYear = String(Number(selectedYear) - 1);
    const targetMetric = selectedSegment === 'ALL' ? 'TOTAL' : selectedSegment.toUpperCase();
    return rows.filter(r => String(r.year) === prevYear && (r.metric === targetMetric || (selectedSegment !== 'ALL' && r.metric.includes(targetMetric))));
  }, [rows, selectedYear, selectedSegment]);

  const stats = useMemo(() => {
    const activeData = monthlyTotals.filter(m => activeMonthsList.includes(m.month));
    const activeStlyData = stlyData.filter(m => activeMonthsList.includes(m.month));
    
    const totalRev = activeData.reduce((acc, d) => acc + d.revenue, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.nights, 0);
    const stlyRev = activeStlyData.reduce((acc, d) => acc + d.revenue, 0);
    const stlyNights = activeStlyData.reduce((acc, d) => acc + d.nights, 0);

    const daysInPeriod = activeMonthsList.reduce((acc, month) => {
      if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) return acc + 31;
      if (month === "FEB") return acc + 28;
      return acc + 30;
    }, 0);

    return {
      totalRev, stlyRev, totalNights, stlyNights,
      avgADR: totalNights > 0 ? totalRev / totalNights : 0,
      stlyADR: stlyNights > 0 ? stlyRev / stlyNights : 0,
      occupancy: (daysInPeriod > 0 && roomsConfig > 0) ? (totalNights / (daysInPeriod * roomsConfig)) : 0,
      stlyOccupancy: (daysInPeriod > 0 && roomsConfig > 0) ? (stlyNights / (daysInPeriod * roomsConfig)) : 0,
      revpar: (daysInPeriod > 0 && roomsConfig > 0) ? (totalRev / (daysInPeriod * roomsConfig)) : 0,
      stlyRevPar: (daysInPeriod > 0 && roomsConfig > 0) ? (stlyRev / (daysInPeriod * roomsConfig)) : 0
    };
  }, [monthlyTotals, stlyData, activeMonthsList, roomsConfig]);

  const planningStats = useMemo(() => {
    const yearBudget = budgetEntries[selectedYear] || {};
    const yearForecast = forecastEntries[selectedYear] || {};
    let budgetRev = 0, budgetRooms = 0, forecastRev = 0, forecastRooms = 0;

    activeMonthsList.forEach(m => {
      budgetRev += (yearBudget[m]?.revenue || 0);
      budgetRooms += (yearBudget[m]?.rooms || 0);
      forecastRev += (yearForecast[m]?.revenue || 0);
      forecastRooms += (yearForecast[m]?.rooms || 0);
    });

    const daysInPeriod = activeMonthsList.reduce((acc, month) => {
      if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) return acc + 31;
      if (month === "FEB") return acc + 28;
      return acc + 30;
    }, 0);

    return {
      budget: { 
        revenue: budgetRev, rooms: budgetRooms, 
        occupancy: (daysInPeriod > 0 && roomsConfig > 0) ? (budgetRooms / (daysInPeriod * roomsConfig)) : 0, 
        adr: budgetRooms > 0 ? budgetRev / budgetRooms : 0, 
        revpar: (daysInPeriod > 0 && roomsConfig > 0) ? budgetRev / (daysInPeriod * roomsConfig) : 0 
      },
      forecast: { 
        revenue: forecastRev, rooms: forecastRooms, 
        occupancy: (daysInPeriod > 0 && roomsConfig > 0) ? (forecastRooms / (daysInPeriod * roomsConfig)) : 0, 
        adr: forecastRooms > 0 ? forecastRev / forecastRooms : 0, 
        revpar: (daysInPeriod > 0 && roomsConfig > 0) ? forecastRev / (daysInPeriod * roomsConfig) : 0 
      }
    };
  }, [budgetEntries, forecastEntries, selectedYear, activeMonthsList, roomsConfig]);

  const targetVariances = useMemo(() => ({
    budget: {
      revenueDiff: planningStats.budget.revenue - stats.stlyRev,
      occupancyDiff: (planningStats.budget.occupancy - stats.stlyOccupancy) * 100,
      roomsDiff: planningStats.budget.rooms - stats.stlyNights,
      adrDiff: planningStats.budget.adr - stats.stlyADR,
      revparDiff: planningStats.budget.revpar - stats.stlyRevPar,
      reachedPct: planningStats.budget.revenue > 0 ? (stats.totalRev / planningStats.budget.revenue) * 100 : 0
    },
    forecast: {
      revenueDiff: planningStats.forecast.revenue - stats.stlyRev,
      occupancyDiff: (planningStats.forecast.occupancy - stats.stlyOccupancy) * 100,
      roomsDiff: planningStats.forecast.rooms - stats.stlyNights,
      adrDiff: planningStats.forecast.adr - stats.stlyADR,
      revparDiff: planningStats.forecast.revpar - stats.stlyRevPar,
      reachedPct: planningStats.forecast.revenue > 0 ? (stats.totalRev / planningStats.forecast.revenue) * 100 : 0
    }
  }), [planningStats, stats]);

  const variances = useMemo(() => ({
    revenueDiff: stats.totalRev - stats.stlyRev,
    occupancyDiff: (stats.occupancy - stats.stlyOccupancy) * 100,
    nightsDiff: stats.totalNights - stats.stlyNights,
    adrDiff: stats.avgADR - stats.stlyADR,
    revparDiff: stats.revpar - stats.stlyRevPar
  }), [stats]);

  const scopeTitle = selectedMonth === 'YEAR' ? 'FULL YEAR' : (selectedMonth === 'YTD' ? 'YTD' : selectedMonth);

  const renderVariance = (val, type, label = "var STLY") => {
    const isNegative = val < 0;
    const color = isNegative ? BRAND_COLORS.red : BRAND_COLORS.cyan;
    let formattedVal = "";
    if (type === 'percent') formattedVal = `${!isNegative ? "+" : ""}${val.toFixed(2)}%`;
    else if (type === 'number') formattedVal = `${!isNegative ? "+" : ""}${formatNumber(val)}`;
    else if (type === 'currency') formattedVal = `${!isNegative ? "+$" : "-$"}${formatNumber(Math.abs(val))}`;
    else if (type === 'precise_currency') formattedVal = `${!isNegative ? "+$" : "-$"}${Math.abs(val).toFixed(2)}`;
  
    return (
      <span className="inline-flex items-center gap-1 font-bold text-[11px] font-roboto" style={{ color: color }}>
        <span>{isNegative ? "▼" : "▲"}</span>
        <span>{formattedVal}</span>
        <span className="font-medium ml-0.5" style={{ color: `${BRAND_COLORS.primary}66` }}>{label}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen font-roboto pb-12" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      
      {/* Global Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-4xl font-bold uppercase tracking-tight" style={{ color: BRAND_COLORS.primary }}>{propertyName} | TRENDS</h1>
            
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
        
        {/* Top Trends Summary Card */}
        <div className="bg-[#fafafa] border-[3px] p-8 md:p-10 w-full flex flex-col md:flex-row md:justify-between md:items-center gap-8 shadow-sm" style={{ borderColor: BRAND_COLORS.primary }}>
            <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>{scopeTitle}</h2>
                {selectedSegment !== 'ALL' && (
                <span className="text-sm font-bold uppercase tracking-widest px-3 py-1 bg-[#163666] text-[#B2D3DE] border" style={{ borderColor: BRAND_COLORS.cyan }}>
                    SEGMENT: {selectedSegment}
                </span>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>Occupancy</p>
                <p className="text-2xl md:text-3xl font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{`${(stats.occupancy * 100).toFixed(1)}%`}</p>
                {renderVariance(variances.occupancyDiff, 'percent')}
                </div>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>Rooms Sold</p>
                <p className="text-2xl md:text-3xl font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatNumber(stats.totalNights)}</p>
                {renderVariance(variances.nightsDiff, 'number')}
                </div>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ADR</p>
                <p className="text-2xl md:text-3xl font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(stats.avgADR)}</p>
                {renderVariance(variances.adrDiff, 'precise_currency')}
                </div>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>RevPAR</p>
                <p className="text-2xl md:text-3xl font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(stats.revpar)}</p>
                {renderVariance(variances.revparDiff, 'precise_currency')}
                </div>
            </div>
            </div>
            <div className="flex flex-col md:items-end justify-center min-w-[240px] pt-4 md:pt-0 md:border-l-[3px] md:pl-10" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
            <h3 className="text-2xl font-bold uppercase leading-none mb-2" style={{ color: BRAND_COLORS.primary }}>Revenue</h3>
            <p className="text-5xl md:text-6xl font-bold tracking-tight leading-none mb-2" style={{ color: BRAND_COLORS.primary }}>{formatCurrency(stats.totalRev)}</p>
            {renderVariance(variances.revenueDiff, 'currency')}
            </div>
        </div>

        {/* Budget & Forecast Pacing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] border-[3px] w-full shadow-md" style={{ backgroundColor: BRAND_COLORS.primary, borderColor: BRAND_COLORS.primary }}>
            
            {/* Budget Box */}
            <div className="bg-[#fafafa] p-8 flex flex-col justify-between" style={{ color: BRAND_COLORS.primary }}>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                <div className="sm:col-span-7 flex flex-col justify-between space-y-6">
                <div className="flex gap-10">
                    <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>OCCP</p>
                    <p className="text-2xl font-bold leading-none mb-1">{`${(planningStats.budget.occupancy * 100).toFixed(1)}%`}</p>
                    {renderVariance(targetVariances.budget.occupancyDiff, 'percent', 'to PY')}
                    </div>
                    <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ROOMS</p>
                    <p className="text-2xl font-bold leading-none mb-1">{formatNumber(planningStats.budget.rooms)}</p>
                    {renderVariance(targetVariances.budget.roomsDiff, 'number', 'to PY')}
                    </div>
                </div>
                <div>
                    <h3 className="text-5xl font-bold uppercase tracking-tight leading-none mb-1">Budget</h3>
                    <p className="text-3xl font-bold tracking-tight leading-none mb-2" style={{ color: `${BRAND_COLORS.primary}E6` }}>{formatCurrency(planningStats.budget.revenue)}</p>
                    {renderVariance(targetVariances.budget.revenueDiff, 'currency', 'to PY')}
                </div>
                
                {/* Visual Tick Bar */}
                <div className="flex flex-col space-y-1">
                    <div className="flex items-end gap-[3px] h-[26px]">
                    {Array.from({ length: 34 }).map((_, i) => {
                        const activeTicks = Math.round((Math.min(100, Math.max(0, targetVariances.budget.reachedPct)) / 100) * 34);
                        return (
                        <div key={i} className={`w-[4px] transition-all duration-500 ease-out ${i === 33 ? 'h-6' : (i % 4 === 0 ? 'h-4' : 'h-3')}`} style={{ backgroundColor: i <= activeTicks ? BRAND_COLORS.primary : BRAND_COLORS.frost, border: i === 33 ? `1px solid ${BRAND_COLORS.primary}` : 'none' }} />
                        );
                    })}
                    </div>
                </div>
                </div>
                
                {/* SVG Donut */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                    <svg width={150} height={150} viewBox="0 0 150 150" className="transform -rotate-90">
                        <circle cx={75} cy={75} r={66} stroke={BRAND_COLORS.orange} strokeWidth={18} fill="transparent" />
                        <circle cx={75} cy={75} r={66} stroke={BRAND_COLORS.purple} strokeWidth={18} strokeDasharray={2 * Math.PI * 66} strokeDashoffset={(2 * Math.PI * 66) - (Math.min(100, targetVariances.budget.reachedPct) / 100) * (2 * Math.PI * 66)} fill="transparent" strokeLinecap="square" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute text-center flex flex-col">
                        <span className="text-base font-bold leading-none">{formatCompactUSD(stats.totalRev)}</span>
                        <span className="text-[8px] font-bold opacity-50 uppercase mt-1 tracking-wider">OTB REACH</span>
                        <span className="text-[10px] font-bold mt-0.5" style={{ color: BRAND_COLORS.purple }}>{targetVariances.budget.reachedPct.toFixed(1)}%</span>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <div className="flex justify-between items-center border-t pt-6 mt-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ADR</p>
                <p className="text-2xl font-bold leading-none mb-1">{formatPreciseCurrency(planningStats.budget.adr)}</p>
                {renderVariance(targetVariances.budget.adrDiff, 'precise_currency', 'to PY')}
                </div>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>REVPAR</p>
                <p className="text-2xl font-bold leading-none mb-1">{formatPreciseCurrency(planningStats.budget.revpar)}</p>
                {renderVariance(targetVariances.budget.revparDiff, 'precise_currency', 'to PY')}
                </div>
            </div>
            </div>

            {/* Forecast Box */}
            <div className="bg-[#fafafa] p-8 flex flex-col justify-between" style={{ color: BRAND_COLORS.primary }}>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                <div className="sm:col-span-7 flex flex-col justify-between space-y-6">
                <div className="flex gap-10">
                    <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>OCCP</p>
                    <p className="text-2xl font-bold leading-none mb-1">{`${(planningStats.forecast.occupancy * 100).toFixed(1)}%`}</p>
                    {renderVariance(targetVariances.forecast.occupancyDiff, 'percent', 'to PY')}
                    </div>
                    <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ROOMS</p>
                    <p className="text-2xl font-bold leading-none mb-1">{formatNumber(planningStats.forecast.rooms)}</p>
                    {renderVariance(targetVariances.forecast.roomsDiff, 'number', 'to PY')}
                    </div>
                </div>
                <div>
                    <h3 className="text-5xl font-bold uppercase tracking-tight leading-none mb-1">Forecast</h3>
                    <p className="text-3xl font-bold tracking-tight leading-none mb-2" style={{ color: `${BRAND_COLORS.primary}E6` }}>{formatCurrency(planningStats.forecast.revenue)}</p>
                    {renderVariance(targetVariances.forecast.revenueDiff, 'currency', 'to PY')}
                </div>
                
                <div className="flex flex-col space-y-1">
                    <div className="flex items-end gap-[3px] h-[26px]">
                    {Array.from({ length: 34 }).map((_, i) => {
                        const activeTicks = Math.round((Math.min(100, Math.max(0, targetVariances.forecast.reachedPct)) / 100) * 34);
                        return (
                        <div key={i} className={`w-[4px] transition-all duration-500 ease-out ${i === 33 ? 'h-6' : (i % 4 === 0 ? 'h-4' : 'h-3')}`} style={{ backgroundColor: i <= activeTicks ? BRAND_COLORS.primary : BRAND_COLORS.frost, border: i === 33 ? `1px solid ${BRAND_COLORS.primary}` : 'none' }} />
                        );
                    })}
                    </div>
                </div>
                </div>

                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                    <svg width={150} height={150} viewBox="0 0 150 150" className="transform -rotate-90">
                        <circle cx={75} cy={75} r={66} stroke={BRAND_COLORS.orange} strokeWidth={18} fill="transparent" />
                        <circle cx={75} cy={75} r={66} stroke={BRAND_COLORS.purple} strokeWidth={18} strokeDasharray={2 * Math.PI * 66} strokeDashoffset={(2 * Math.PI * 66) - (Math.min(100, targetVariances.forecast.reachedPct) / 100) * (2 * Math.PI * 66)} fill="transparent" strokeLinecap="square" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute text-center flex flex-col">
                        <span className="text-base font-bold leading-none">{formatCompactUSD(stats.totalRev)}</span>
                        <span className="text-[8px] font-bold opacity-50 uppercase mt-1 tracking-wider">OTB REACH</span>
                        <span className="text-[10px] font-bold mt-0.5" style={{ color: BRAND_COLORS.purple }}>{targetVariances.forecast.reachedPct.toFixed(1)}%</span>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <div className="flex justify-between items-center border-t pt-6 mt-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ADR</p>
                <p className="text-2xl font-bold leading-none mb-1">{formatPreciseCurrency(planningStats.forecast.adr)}</p>
                {renderVariance(targetVariances.forecast.adrDiff, 'precise_currency', 'to PY')}
                </div>
                <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>REVPAR</p>
                <p className="text-2xl font-bold leading-none mb-1">{formatPreciseCurrency(planningStats.forecast.revpar)}</p>
                {renderVariance(targetVariances.forecast.revparDiff, 'precise_currency', 'to PY')}
                </div>
            </div>
            </div>
        </div>

        {/* Progression Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ADR Bar Chart */}
            <div className="bg-[#fafafa] p-6 border-[3px] w-full shadow-sm" style={{ borderColor: BRAND_COLORS.primary }}>
            <h4 className="uppercase font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.primary }}>
                <TrendingUp size={16} style={{ color: BRAND_COLORS.cyan }} /> Average Daily Rate (ADR) Progression
            </h4>
            <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
                {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const maxVal = Math.max(...monthlyTotals.map(d => d.adr || 0), 1) * 1.15;
                const y = 200 - ((maxVal * f / maxVal) * 175);
                return (
                    <g key={f}>
                    <line x1={65} x2={580} y1={y} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                    <text x={55} y={y + 3} textAnchor="end" fontSize="10" className="font-bold" fill={`${BRAND_COLORS.primary}80`}>
                        {formatCompact(maxVal * f)}
                    </text>
                    </g>
                );
                })}
                {monthlyTotals.map((d, i) => {
                const maxVal = Math.max(...monthlyTotals.map(item => item.adr || 0), 1) * 1.15;
                const x = 65 + (i * (515) / Math.max(monthlyTotals.length, 1)) + 5;
                const bw = (515 / Math.max(monthlyTotals.length, 1)) * 0.7;
                const bh = ((d.adr || 0) / maxVal) * 175;
                const y = 200 - bh;
                return <rect key={i} x={x} y={y} width={bw} height={Math.max(0, bh)} fill={BRAND_COLORS.cyan} className="transition-all duration-700 ease-out" />;
                })}
                {monthlyTotals.map((d, i) => {
                const x = 65 + (i * (515) / Math.max(monthlyTotals.length, 1)) + 5;
                const bw = (515 / Math.max(monthlyTotals.length, 1)) * 0.7;
                return <text key={i} x={x + bw / 2} y={216} textAnchor="middle" fontSize="10" className="font-bold" fill={BRAND_COLORS.primary}>{d.month}</text>;
                })}
            </svg>
            </div>

            {/* Rooms Sold Bar Chart */}
            <div className="bg-[#fafafa] p-6 border-[3px] w-full shadow-sm" style={{ borderColor: BRAND_COLORS.primary }}>
            <h4 className="uppercase font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.primary }}>
                <TrendingUp size={16} style={{ color: BRAND_COLORS.cyan }} /> Rooms Sold Progression
            </h4>
            <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
                {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const maxVal = Math.max(...monthlyTotals.map(d => d.nights || 0), 1) * 1.15;
                const y = 200 - ((maxVal * f / maxVal) * 175);
                return (
                    <g key={f}>
                    <line x1={65} x2={580} y1={y} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                    <text x={55} y={y + 3} textAnchor="end" fontSize="10" className="font-bold" fill={`${BRAND_COLORS.primary}80`}>
                        {formatNumber(maxVal * f)}
                    </text>
                    </g>
                );
                })}
                {monthlyTotals.map((d, i) => {
                const maxVal = Math.max(...monthlyTotals.map(item => item.nights || 0), 1) * 1.15;
                const x = 65 + (i * (515) / Math.max(monthlyTotals.length, 1)) + 5;
                const bw = (515 / Math.max(monthlyTotals.length, 1)) * 0.7;
                const bh = ((d.nights || 0) / maxVal) * 175;
                const y = 200 - bh;
                return <rect key={i} x={x} y={y} width={bw} height={Math.max(0, bh)} fill={BRAND_COLORS.primary} className="transition-all duration-700 ease-out" />;
                })}
                {monthlyTotals.map((d, i) => {
                const x = 65 + (i * (515) / Math.max(monthlyTotals.length, 1)) + 5;
                const bw = (515 / Math.max(monthlyTotals.length, 1)) * 0.7;
                return <text key={i} x={x + bw / 2} y={216} textAnchor="middle" fontSize="10" className="font-bold" fill={BRAND_COLORS.primary}>{d.month}</text>;
                })}
            </svg>
            </div>

        </div>

      </main>
    </div>
  );
}