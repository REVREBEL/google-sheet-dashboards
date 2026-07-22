avascript
import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Filter,
  ChevronRight,
  Hotel,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  UserCheck
} from 'lucide-react';

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
  successGreen: "#00A6B6"
};

// Formatting Utilities
const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const formatNumber = (val) =>
  new Intl.NumberFormat('en-US').format(Math.round(val || 0));

const formatPreciseCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

const formatCompact = (val) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);

// Increased precision to avoid distorting rounding (e.g., $3.5M vs $4M)
const formatCompactUSD = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Khand:wght@600;700&family=Roboto:wght@400;500;700&display=swap');
  .font-khand { font-family: 'Khand', sans-serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }
  .group:hover .group-hover-text-dynamic { color: var(--group-hover-color); }
`;

function App({ data = [], updateItem, deleteItem, insertItem, followLink }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('YEAR');
  const [propertyNameConfig, setPropertyNameConfig] = useState("Grand Horizon Resort");
  const [isEditingData, setIsEditingData] = useState(null);

  // --- DATA PARSING ---
  const parsedData = useMemo(() => {
    const result = {
      rows: [],
      years: ['2026', '2025'],
      roomsConfig: 188,
      budgetEntries: {},
      forecastEntries: {},
      parsedDOW: [],
      headerMap: { segment: {}, budget: {}, forecast: {}, dow: {} }
    };

    if (!data || !Array.isArray(data) || data.length === 0) return result;

    let segmentHeadersIdx = -1;
    let dowHeadersIdx = -1;
    let budgetHeadersIdx = -1;
    let forecastHeadersIdx = -1;

    data.forEach((item, index) => {
      if (!item || !item.row) return;
      const rowLower = item.row.map(cell => String(cell || '').toLowerCase().trim());
      
      // Rooms Capacity discovery
      if (index === 1 && !isNaN(Number(item.row[0]))) {
        result.roomsConfig = Number(item.row[0]) || 188;
      }

      if (rowLower.includes('segment_year')) segmentHeadersIdx = index;
      if (rowLower.includes('dow_year')) dowHeadersIdx = index;
      if (rowLower.includes('budget_year')) budgetHeadersIdx = index;
      if (rowLower.includes('forecast_rooms')) forecastHeadersIdx = index;
    });

    const getRowMapping = (idx) => {
      if (idx === -1) return {};
      const mapping = {};
      data[idx].row.forEach((colName, i) => {
        if (colName) mapping[String(colName).toLowerCase().trim()] = i;
      });
      return mapping;
    };

    // Segment actuals
    if (segmentHeadersIdx !== -1) {
      const map = getRowMapping(segmentHeadersIdx);
      result.headerMap.segment = map;
      data.forEach((item, idx) => {
        if (idx <= segmentHeadersIdx) return;
        const r = item.row;
        const yr = Number(r[map['segment_year']]);
        if (!yr || isNaN(yr)) return;

        result.rows.push({
          index_: item.index_,
          YEAR: yr,
          STAY_MONTH: String(r[map['segment_stay_month']] || '').trim().toUpperCase(),
          METRIC: String(r[map['segment_metric']] || '').trim().toUpperCase(),
          NO_RESN: Number(r[map['segment_no_resn']]) || 0,
          NIGHTS: Number(r[map['segment_nights']]) || 0,
          ADR: Number(r[map['segment_adr']]) || 0,
          REVENUE: Number(r[map['segment_revenue']]) || 0,
          ALOS: Number(r[map['segment_alos']]) || 0,
          LEAD_DAYS: Number(r[map['segment_lead_days']]) || 0,
        });
      });
    }

    const yrSet = new Set(result.rows.map(r => String(r.YEAR)));
    if (yrSet.size > 0) result.years = Array.from(yrSet).sort().reverse();

    // Budget
    if (budgetHeadersIdx !== -1) {
      const map = getRowMapping(budgetHeadersIdx);
      result.headerMap.budget = map;
      data.forEach((item, idx) => {
        if (idx <= budgetHeadersIdx) return;
        const r = item.row;
        const yr = String(r[map['budget_year']] || '').trim();
        // The month is often shared in column 3 (segment_stay_month) rather than the metric label column
        const month = String(r[3] || '').trim().toUpperCase();
        
        if (!yr || !MONTH_ORDER.includes(month)) return;

        if (!result.budgetEntries[yr]) result.budgetEntries[yr] = {};
        if (!result.budgetEntries[yr][month]) result.budgetEntries[yr][month] = { rooms: 0, revenue: 0 };
        result.budgetEntries[yr][month].rooms += Number(r[map['budget_rooms']]) || 0;
        result.budgetEntries[yr][month].revenue += Number(r[map['budget_revenue']]) || 0;
      });
    }

    // Forecast
    if (forecastHeadersIdx !== -1) {
      const map = getRowMapping(forecastHeadersIdx);
      result.headerMap.forecast = map;
      data.forEach((item, idx) => {
        if (idx <= forecastHeadersIdx) return;
        const r = item.row;
        const month = String(r[3] || '').trim().toUpperCase();
        
        if (!MONTH_ORDER.includes(month)) return;

        const yr = selectedYear; 
        if (!result.forecastEntries[yr]) result.forecastEntries[yr] = {};
        if (!result.forecastEntries[yr][month]) result.forecastEntries[yr][month] = { rooms: 0, revenue: 0 };
        result.forecastEntries[yr][month].rooms += Number(r[map['forecast_rooms']]) || 0;
        result.forecastEntries[yr][month].revenue += Number(r[map['forecast_revenue']]) || 0;
      });
    }

    // Day of Week
    if (dowHeadersIdx !== -1) {
      const map = getRowMapping(dowHeadersIdx);
      result.headerMap.dow = map;
      data.forEach((item, idx) => {
        if (idx <= dowHeadersIdx) return;
        const r = item.row;
        const yr = Number(r[map['dow_year']]);
        if (!yr || isNaN(yr)) return;

        result.parsedDOW.push({
          year: String(yr),
          month: String(r[map['dow_month']] || '').toUpperCase().trim(),
          metric: String(r[map['dow_metric']] || '').trim(),
          SUN: Number(r[map['dow_sun']]) || 0,
          MON: Number(r[map['dow_mon']]) || 0,
          TUE: Number(r[map['dow_tue']]) || 0,
          WED: Number(r[map['dow_wed']]) || 0,
          THU: Number(r[map['dow_thu']]) || 0,
          FRI: Number(r[map['dow_fri']]) || 0,
          SAT: Number(r[map['dow_sat']]) || 0,
        });
      });
    }

    return result;
  }, [data, selectedYear]);

  const { rows, years, roomsConfig, budgetEntries, forecastEntries, parsedDOW } = parsedData;

  const activeMonthsList = useMemo(() => {
    if (selectedMonth === 'YEAR') return MONTH_ORDER;
    if (selectedMonth === 'YTD') return MONTH_ORDER.slice(0, 7); 
    return [selectedMonth];
  }, [selectedMonth]);

  const monthlyTotals = useMemo(() => {
    return rows
      .filter(r => String(r.YEAR) === selectedYear && r.METRIC.toUpperCase() === 'TOTAL')
      .map(r => {
        const month = r.STAY_MONTH;
        let days = 30;
        if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) days = 31;
        else if (month === "FEB") days = 28;
        const occupancy = (days > 0 && roomsConfig > 0) ? (r.NIGHTS / (days * roomsConfig)) : 0;
        return { ...r, occupancy };
      })
      .sort((a, b) => MONTH_ORDER.indexOf(a.STAY_MONTH) - MONTH_ORDER.indexOf(b.STAY_MONTH));
  }, [rows, selectedYear, roomsConfig]);

  const stlyData = useMemo(() => {
    const prevYear = String(Number(selectedYear) - 1);
    return rows
      .filter(r => String(r.YEAR) === prevYear && r.METRIC.toUpperCase() === 'TOTAL')
      .map(r => {
        const month = r.STAY_MONTH;
        let days = 30;
        if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) days = 31;
        else if (month === "FEB") days = 28;
        const occupancy = (days > 0 && roomsConfig > 0) ? (r.NIGHTS / (days * roomsConfig)) : 0;
        return { ...r, occupancy };
      });
  }, [rows, selectedYear, roomsConfig]);

  const stats = useMemo(() => {
    const activeData = monthlyTotals.filter(m => activeMonthsList.includes(m.STAY_MONTH));
    const totalRev = activeData.reduce((acc, d) => acc + d.REVENUE, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.NIGHTS, 0);
    const totalResn = activeData.reduce((acc, d) => acc + d.NO_RESN, 0);
    
    const avgADR = totalNights > 0 ? totalRev / totalNights : 0;
    
    // Correct Weighted Average for Lead Days & ALOS
    const weightedLeadDays = totalResn > 0 
      ? activeData.reduce((acc, d) => acc + (d.LEAD_DAYS * d.NO_RESN), 0) / totalResn 
      : 0;
    const weightedALOS = totalResn > 0 
      ? activeData.reduce((acc, d) => acc + (d.ALOS * d.NO_RESN), 0) / totalResn 
      : 0;

    const daysInPeriod = activeMonthsList.reduce((acc, month) => {
      if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) return acc + 31;
      if (month === "FEB") return acc + 28;
      return acc + 30;
    }, 0);

    const occupancy = (daysInPeriod > 0 && roomsConfig > 0) ? (totalNights / (daysInPeriod * roomsConfig)) : 0;
    const revpar = (daysInPeriod > 0 && roomsConfig > 0) ? (totalRev / (daysInPeriod * roomsConfig)) : 0;

    return { totalRev, totalNights, avgADR, weightedLeadDays, weightedALOS, occupancy, revpar };
  }, [monthlyTotals, activeMonthsList, roomsConfig]);

  const stlyStats = useMemo(() => {
    const activeData = stlyData.filter(m => activeMonthsList.includes(m.STAY_MONTH));
    const totalRev = activeData.reduce((acc, d) => acc + d.REVENUE, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.NIGHTS, 0);
    const avgADR = totalNights > 0 ? totalRev / totalNights : 0;

    const daysInPeriod = activeMonthsList.reduce((acc, month) => {
      if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) return acc + 31;
      if (month === "FEB") return acc + 28;
      return acc + 30;
    }, 0);

    const occupancy = (daysInPeriod > 0 && roomsConfig > 0) ? (totalNights / (daysInPeriod * roomsConfig)) : 0;
    const revpar = (daysInPeriod > 0 && roomsConfig > 0) ? (totalRev / (daysInPeriod * roomsConfig)) : 0;

    return { totalRev, totalNights, avgADR, occupancy, revpar };
  }, [stlyData, activeMonthsList, roomsConfig]);

  const variances = useMemo(() => ({
    revenueDiff: stats.totalRev - stlyStats.totalRev,
    occupancyDiff: (stats.occupancy - stlyStats.occupancy) * 100,
    nightsDiff: stats.totalNights - stlyStats.totalNights,
    adrDiff: stats.avgADR - stlyStats.avgADR,
    revparDiff: stats.revpar - stlyStats.revpar
  }), [stats, stlyStats]);

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
      const days = ["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month) ? 31 : (month === "FEB" ? 28 : 30);
      return acc + days;
    }, 0);
    const bOcc = (daysInPeriod > 0 && roomsConfig > 0) ? (budgetRooms / (daysInPeriod * roomsConfig)) : 0;
    const fOcc = (daysInPeriod > 0 && roomsConfig > 0) ? (forecastRooms / (daysInPeriod * roomsConfig)) : 0;
    return {
      budget: { revenue: budgetRev, rooms: budgetRooms, occupancy: bOcc, adr: budgetRooms > 0 ? budgetRev/budgetRooms : 0, revpar: (daysInPeriod > 0 && roomsConfig > 0) ? budgetRev/(daysInPeriod*roomsConfig) : 0 },
      forecast: { revenue: forecastRev, rooms: forecastRooms, occupancy: fOcc, adr: forecastRooms > 0 ? forecastRev/forecastRooms : 0, revpar: (daysInPeriod > 0 && roomsConfig > 0) ? forecastRev/(daysInPeriod*roomsConfig) : 0 }
    };
  }, [budgetEntries, forecastEntries, selectedYear, activeMonthsList, roomsConfig]);

  const targetVariances = useMemo(() => ({
    budget: {
      revenueDiff: planningStats.budget.revenue - stlyStats.totalRev,
      occupancyDiff: (planningStats.budget.occupancy - stlyStats.occupancy) * 100,
      roomsDiff: planningStats.budget.rooms - stlyStats.totalNights,
      adrDiff: planningStats.budget.adr - stlyStats.avgADR,
      revparDiff: planningStats.budget.revpar - stlyStats.revpar,
      reachedPct: planningStats.budget.revenue > 0 ? (stats.totalRev / planningStats.budget.revenue) * 100 : 0
    },
    forecast: {
      revenueDiff: planningStats.forecast.revenue - stlyStats.totalRev,
      occupancyDiff: (planningStats.forecast.occupancy - stlyStats.occupancy) * 100,
      roomsDiff: planningStats.forecast.rooms - stlyStats.totalNights,
      adrDiff: planningStats.forecast.adr - stlyStats.avgADR,
      revparDiff: planningStats.forecast.revpar - stlyStats.revpar,
      reachedPct: planningStats.forecast.revenue > 0 ? (stats.totalRev / planningStats.forecast.revenue) * 100 : 0
    }
  }), [planningStats, stlyStats, stats]);

  const aggregatedSegments = useMemo(() => {
    const filtered = rows.filter(r =>
      String(r.YEAR) === selectedYear &&
      r.METRIC.toUpperCase() !== 'TOTAL' &&
      r.METRIC.toUpperCase() !== 'COMPLIMENTARY' &&
      activeMonthsList.includes(r.STAY_MONTH)
    );

    const segmentMap = {};
    filtered.forEach(row => {
      const key = row.METRIC;
      if (!segmentMap[key]) {
        segmentMap[key] = { METRIC: key, REVENUE: 0, NIGHTS: 0, LEAD_DAYS: 0, count: 0, NO_RESN: 0 };
      }
      segmentMap[key].REVENUE += (row.REVENUE || 0);
      segmentMap[key].NIGHTS += (row.NIGHTS || 0);
      segmentMap[key].LEAD_DAYS += (row.LEAD_DAYS * row.NO_RESN); // for weighting
      segmentMap[key].NO_RESN += row.NO_RESN;
      segmentMap[key].count += 1;
    });

    return Object.values(segmentMap)
      .map(s => ({
        ...s,
        ADR: s.NIGHTS > 0 ? s.REVENUE / s.NIGHTS : 0,
        AVG_LEAD: s.NO_RESN > 0 ? s.LEAD_DAYS / s.NO_RESN : 0
      }))
      .sort((a, b) => b.REVENUE - a.REVENUE);
  }, [rows, selectedYear, activeMonthsList]);

  const stlyAggregatedSegments = useMemo(() => {
    const prevYear = String(Number(selectedYear) - 1);
    const filtered = rows.filter(r =>
      String(r.YEAR) === prevYear &&
      r.METRIC.toUpperCase() !== 'TOTAL' &&
      activeMonthsList.includes(r.STAY_MONTH)
    );

    const segmentMap = {};
    filtered.forEach(row => {
      const key = row.METRIC;
      if (!segmentMap[key]) {
        segmentMap[key] = { METRIC: key, REVENUE: 0 };
      }
      segmentMap[key].REVENUE += (row.REVENUE || 0);
    });

    return Object.values(segmentMap).reduce((acc, curr) => {
      acc[curr.METRIC] = curr.REVENUE;
      return acc;
    }, {});
  }, [rows, selectedYear, activeMonthsList]);

  const scopeTitle = selectedMonth === 'YEAR' ? 'Full Year' : (selectedMonth === 'YTD' ? 'Year to Date' : selectedMonth);

  const handleUpdateTotalRow = (index_, nights, revenue) => {
    const patch = new Array(data[0].row.length).fill(undefined);
    const map = result.headerMap.segment;
    patch[map['segment_nights']] = nights;
    patch[map['segment_revenue']] = revenue;
    updateItem(index_, patch);
    setIsEditingData(null);
  };

  return (
    <div className="min-h-screen font-roboto pb-12" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      <style>{fontStyles}</style>

      {/* Admin Bar */}
      <div className="text-white py-2.5 px-4 text-xs" style={{ backgroundColor: BRAND_COLORS.primary }}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Hotel size={14} style={{ color: BRAND_COLORS.aqua }} />
            <span className="font-bold uppercase tracking-wider font-khand">Property Dashboard Administration</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="opacity-80 font-semibold">Active Property:</span>
              <input
                type="text"
                value={propertyNameConfig}
                onChange={(e) => setPropertyNameConfig(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-none px-2 py-0.5 text-white text-xs focus:outline-none font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-80 font-semibold">Capacity Keys:</span>
              <span className="bg-white/10 border border-white/20 px-3 py-0.5 text-white text-xs font-bold text-center">
                {roomsConfig}
              </span>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white border-b sticky top-0 z-40 shadow-sm" style={{ borderColor: `${BRAND_COLORS.aqua}33` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 sm:py-0 sm:h-24 gap-4">
            <h1 className="text-2xl font-khand font-bold uppercase tracking-tight" style={{ color: BRAND_COLORS.primary }}>
              {propertyNameConfig} <span style={{ color: BRAND_COLORS.cyan }}>METRICS</span>
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center p-1.5 rounded-none border shadow-sm" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                <Filter size={14} className="ml-2" style={{ color: BRAND_COLORS.cyan }} />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold focus:ring-0 py-1 pl-2 pr-8 cursor-pointer font-khand uppercase tracking-wider"
                  style={{ color: BRAND_COLORS.primary }}
                >
                  <option value="YEAR">FULL YEAR</option>
                  <option value="YTD">YTD VIEW</option>
                  {MONTH_ORDER.map(m => <option key={m} value={m}>{m} VIEW</option>)}
                </select>
              </div>
              <div className="flex items-center p-1.5 rounded-none border shadow-sm" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold focus:ring-0 py-1 pl-2 pr-8 cursor-pointer font-khand uppercase tracking-wider"
                  style={{ color: BRAND_COLORS.primary }}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <nav className="flex space-x-1 -mb-px overflow-x-auto">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Overview" />
            <TabButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={BarChart3} label="Monthly Trends" />
            <TabButton active={activeTab === 'segments'} onClick={() => setActiveTab('segments')} icon={PieChart} label="Segment Analysis" />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
              <KPICard
                label="REVENUE"
                value={formatCompactUSD(stats.totalRev)}
                diff={formatCompact(Math.abs(variances.revenueDiff))}
                isNeg={variances.revenueDiff < 0}
                bgColor={BRAND_COLORS.primary}
                textColor={BRAND_COLORS.powder}
                labelColor={`${BRAND_COLORS.powder}B3`}
              />
              <KPICard
                label="OCCUPANCY"
                value={`${(stats.occupancy * 100).toFixed(1)}%`}
                diff={`${Math.abs(variances.occupancyDiff).toFixed(1)}%`}
                isNeg={variances.occupancyDiff < 0}
                bgColor={BRAND_COLORS.teal}
                textColor="#FFFFFF"
                labelColor="#FFFFFFB3"
              />
              <KPICard
                label="AVG RATE"
                value={formatPreciseCurrency(stats.avgADR)}
                diff={`$${Math.abs(variances.adrDiff).toFixed(2)}`}
                isNeg={variances.adrDiff < 0}
                bgColor={BRAND_COLORS.cyan}
                textColor="#27330d" // Compliant Color Fix
                labelColor="#27330d" // Compliant Color Fix
                diffColor="#402b00"  // Compliant Color Fix
              />
              <KPICard
                label="ROOMS SOLD"
                value={formatNumber(stats.totalNights)}
                diff={formatNumber(Math.abs(variances.nightsDiff))}
                isNeg={variances.nightsDiff < 0}
                bgColor={BRAND_COLORS.aqua}
                textColor={BRAND_COLORS.primary}
                labelColor={`${BRAND_COLORS.primary}B3`}
              />
              <div className="p-6 flex flex-col justify-center items-center text-center h-44 shadow-md transition-transform hover:scale-[1.02] rounded-none bg-white border border-gray-100">
                <h3 className="text-7xl font-khand font-bold tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>
                  {Math.round(stats.weightedLeadDays)}
                </h3>
                <p className="text-xs sm:text-sm font-khand font-bold uppercase tracking-wider mt-1" style={{ color: BRAND_COLORS.primary }}> LEAD DAYS </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <DayOfWeekOccupancy
                  selectedYear={selectedYear}
                  parsedDOW={parsedDOW}
                />
              </div>
              <div className="lg:col-span-5">
                <SegmentPaceChart
                  actuals={aggregatedSegments}
                  stlyMap={stlyAggregatedSegments}
                  periodLabel={`${selectedYear} ${scopeTitle}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[3px] border-[3px] w-full shadow-md rounded-none" style={{ backgroundColor: BRAND_COLORS.primary, borderColor: BRAND_COLORS.primary }}>
              <div className="lg:col-span-2 bg-[#fafafa]">
                <div className="p-6 border-b-[3px] bg-[#fafafa] flex justify-between items-center" style={{ borderColor: BRAND_COLORS.primary }}>
                  <h3 className="font-khand uppercase font-bold tracking-wider text-lg">Performance Summary</h3>
                  <div className="text-xs font-bold text-white px-3 py-1 uppercase tracking-widest rounded-none" style={{ backgroundColor: BRAND_COLORS.cyan }}>{selectedYear} {scopeTitle}</div>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left">
                    <thead className="text-[11px] font-khand uppercase tracking-widest border-b-[3px] sticky top-0 z-10" style={{ color: `${BRAND_COLORS.primary}99`, backgroundColor: `#f2f4f7`, borderColor: `${BRAND_COLORS.primary}1A` }}>
                      <tr>
                        <th className="px-6 py-4">Stay Month</th>
                        <th className="px-6 py-4">Revenue</th>
                        <th className="px-6 py-4">Occupancy</th>
                        <th className="px-6 py-4">Nights</th>
                        <th className="px-6 py-4">ADR</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-roboto">
                      {monthlyTotals.filter(m => activeMonthsList.includes(m.STAY_MONTH)).map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#163666]/5 border-b border-gray-100 transition-colors group">
                          <td className="px-6 py-4 font-bold" style={{ color: BRAND_COLORS.primary }}>{m.STAY_MONTH}</td>
                          <td className="px-6 py-4 font-medium">
                            {isEditingData === m.index_ ? (
                              <input
                                type="number"
                                defaultValue={m.REVENUE}
                                id={`rev-${m.index_}`}
                                className="w-24 border border-gray-300 px-1 py-0.5 text-sm"
                              />
                            ) : formatCurrency(m.REVENUE)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center p-1.5 px-2 rounded-none text-xs font-bold" style={{ backgroundColor: BRAND_COLORS.primary, color: BRAND_COLORS.powder }}>
                              {(m.occupancy * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4" style={{ color: `${BRAND_COLORS.primary}CC` }}>
                            {isEditingData === m.index_ ? (
                              <input
                                type="number"
                                defaultValue={m.NIGHTS}
                                id={`nights-${m.index_}`}
                                className="w-16 border border-gray-300 px-1 py-0.5 text-sm"
                              />
                            ) : formatNumber(m.NIGHTS)}
                          </td>
                          <td className="px-6 py-4 font-bold" style={{ color: BRAND_COLORS.cyan }}>{formatPreciseCurrency(m.ADR)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {isEditingData === m.index_ ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const n = document.getElementById(`nights-${m.index_}`).value;
                                      const r = document.getElementById(`rev-${m.index_}`).value;
                                      handleUpdateTotalRow(m.index_, Number(n), Number(r));
                                    }}
                                    className="p-1 text-green-600 hover:bg-green-50"
                                  ><Check size={16} /></button>
                                  <button onClick={() => setIsEditingData(null)} className="p-1 text-gray-400 hover:bg-gray-50"><X size={16} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setIsEditingData(m.index_)} className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={14} /></button>
                                  <button onClick={() => deleteItem(m.index_)} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-[#fafafa] p-8 flex flex-col h-full border-l-[3px] lg:border-l-0" style={{ borderColor: BRAND_COLORS.primary }}>
                <h3 className="font-khand uppercase font-bold tracking-widest text-lg mb-8">Segment Revenue Mix</h3>
                <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2">
                  {aggregatedSegments.map((s, i) => (
                    <div key={i} className="animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                        <span className="uppercase truncate pr-4" style={{ color: `${BRAND_COLORS.primary}CC` }}>{s.METRIC}</span>
                        <span className="font-khand text-sm" style={{ color: BRAND_COLORS.cyan }}>{formatCompact(s.REVENUE)}</span>
                      </div>
                      <div className="w-full h-2 overflow-hidden border rounded-none" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.aqua}1A` }}>
                        <div
                          className="h-full transition-all duration-1000 ease-out rounded-none"
                          style={{ width: `${stats.totalRev > 0 ? (s.REVENUE / stats.totalRev) * 100 : 0}%`, backgroundColor: BRAND_COLORS.cyan }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('segments')}
                  className="mt-12 w-full flex items-center justify-center gap-2 py-3.5 border-[3px] font-khand font-bold uppercase text-xs hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 rounded-none"
                  style={{ borderColor: BRAND_COLORS.primary, color: BRAND_COLORS.primary }}
                >
                  Segment Details <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Factual Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white border-[3px] p-8 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-none"><Clock size={24} /></div>
                  <h4 className="font-khand font-bold text-xl uppercase tracking-wider">Average Lead Window</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-khand font-bold" style={{ color: BRAND_COLORS.primary }}>{stats.weightedLeadDays.toFixed(1)}</span>
                  <span className="text-lg font-bold text-gray-400">DAYS</span>
                </div>
                <p className="text-xs text-gray-500 uppercase mt-2">Weighted average lead time for period</p>
              </div>
              <div className="bg-white border-[3px] p-8 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-none"><UserCheck size={24} /></div>
                  <h4 className="font-khand font-bold text-xl uppercase tracking-wider">Length of Stay</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-khand font-bold" style={{ color: BRAND_COLORS.primary }}>{stats.weightedALOS.toFixed(1)}</span>
                  <span className="text-lg font-bold text-gray-400">NIGHTS</span>
                </div>
                <p className="text-xs text-gray-500 uppercase mt-2">Average duration per reservation</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-white border-[3px] p-8 md:p-10 w-full flex flex-col md:flex-row md:justify-between md:items-center gap-8 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
              <div className="flex-1 space-y-6">
                <h2 className="text-5xl md:text-6xl font-khand font-bold uppercase tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>{scopeTitle}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                  <MetricBrief label="Occupancy" value={`${(stats.occupancy * 100).toFixed(1)}%`} variance={renderVariance(variances.occupancyDiff, 'percent')} />
                  <MetricBrief label="Rooms Sold" value={formatNumber(stats.totalNights)} variance={renderVariance(variances.nightsDiff, 'number')} />
                  <MetricBrief label="ADR" value={formatPreciseCurrency(stats.avgADR)} variance={renderVariance(variances.adrDiff, 'precise_currency')} />
                  <MetricBrief label="RevPAR" value={formatPreciseCurrency(stats.revpar)} variance={renderVariance(variances.revparDiff, 'precise_currency')} />
                </div>
              </div>
              <div className="flex flex-col md:items-end justify-center min-w-[240px] pt-4 md:pt-0 md:border-l-[3px] md:pl-10" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                <h3 className="text-2xl font-khand font-bold uppercase leading-none mb-2" style={{ color: BRAND_COLORS.primary }}>Revenue</h3>
                <p className="text-5xl md:text-6xl font-khand font-bold tracking-tight leading-none mb-2" style={{ color: BRAND_COLORS.primary }}>{formatCurrency(stats.totalRev)}</p>
                {renderVariance(variances.revenueDiff, 'currency')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] border-[3px] w-full shadow-md rounded-none" style={{ backgroundColor: BRAND_COLORS.primary, borderColor: BRAND_COLORS.primary }}>
              <PacingCard title="Budget" actual={stats.totalRev} target={planningStats.budget} variances={targetVariances.budget} />
              <PacingCard title="Forecast" actual={stats.totalRev} target={planningStats.forecast} variances={targetVariances.forecast} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BarChart data={monthlyTotals} xKey="STAY_MONTH" yKey="ADR" label="Average Daily Rate (ADR) Progression" format="adr" color={BRAND_COLORS.cyan} />
              <BarChart data={monthlyTotals} xKey="STAY_MONTH" yKey="NIGHTS" label="Rooms Sold Progression" format="number" color={BRAND_COLORS.primary} />
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white border-[3px] p-8 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-khand uppercase font-bold" style={{ color: BRAND_COLORS.primary }}>Detailed Segment Breakdown</h3>
                  <p className="text-xs font-medium" style={{ color: `${BRAND_COLORS.primary}99` }}>Channel performance for {selectedYear} {scopeTitle}</p>
                </div>
                <div className="px-4 py-3 border rounded-none" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: `${BRAND_COLORS.primary}66` }}>Period Total</p>
                  <p className="text-xl font-bold font-khand" style={{ color: BRAND_COLORS.cyan }}>{formatCurrency(stats.totalRev)}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-roboto">
                  <thead className="text-[11px] font-khand uppercase tracking-widest border-b" style={{ backgroundColor: `${BRAND_COLORS.frost}80`, color: `${BRAND_COLORS.primary}99`, borderColor: `${BRAND_COLORS.primary}1A` }}>
                    <tr>
                      <th className="px-6 py-5">Distribution Segment</th>
                      <th className="px-6 py-5">Revenue</th>
                      <th className="px-6 py-5">% Mix</th>
                      <th className="px-6 py-5">Total Nights</th>
                      <th className="px-6 py-5">ADR</th>
                      <th className="px-6 py-5 text-right">Weighted Lead Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedSegments.map((seg, idx) => (
                      <tr key={idx} className="hover:bg-[#163666]/5 border-b border-gray-50 transition-colors">
                        <td className="px-6 py-5 font-bold text-sm" style={{ color: BRAND_COLORS.primary }}>{seg.METRIC}</td>
                        <td className="px-6 py-5 text-sm font-bold">{formatCurrency(seg.REVENUE)}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-2 border border-black/5 overflow-hidden rounded-none" style={{ backgroundColor: BRAND_COLORS.frost }}>
                              <div
                                className="h-full transition-all duration-1000 rounded-none"
                                style={{ width: `${stats.totalRev > 0 ? (seg.REVENUE / stats.totalRev) * 100 : 0}%`, backgroundColor: BRAND_COLORS.cyan }}
                              />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: BRAND_COLORS.cyan }}>{stats.totalRev > 0 ? ((seg.REVENUE / stats.totalRev) * 100).toFixed(1) : 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm" style={{ color: `${BRAND_COLORS.primary}B3` }}>{formatNumber(seg.NIGHTS)}</td>
                        <td className="px-6 py-5 text-sm font-bold" style={{ color: BRAND_COLORS.cyan }}>{formatPreciseCurrency(seg.ADR)}</td>
                        <td className="px-6 py-5 text-sm text-right">
                          <div className="flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-wider rounded-none" style={{ color: `${BRAND_COLORS.primary}99` }}>
                            <Clock size={12} /> {seg.AVG_LEAD.toFixed(1)}d
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Contrast Corrected Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 border-t pt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6a7788' }}>
        <span>ANALYTICS ENGINE V3</span>
        <span>{propertyNameConfig} • {selectedYear}</span>
      </footer>
    </div>
  );
}

function PacingCard({ title, actual, target, variances }) {
  return (
    <div className="bg-[#fafafa] p-8 flex flex-col justify-between transition-colors duration-200 rounded-none" style={{ color: BRAND_COLORS.primary }}>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
        <div className="sm:col-span-7 flex flex-col justify-between space-y-6">
          <div className="flex gap-10">
            <MetricBrief label="OCCP" value={`${(target.occupancy * 100).toFixed(1)}%`} variance={renderVariance(variances.occupancyDiff, 'percent', 'to PY')} />
            <MetricBrief label="ROOMS" value={formatNumber(target.rooms)} variance={renderVariance(variances.roomsDiff, 'number', 'to PY')} />
          </div>
          <div>
            <h3 className="text-5xl font-khand font-bold uppercase tracking-tight leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{title}</h3>
            <p className="text-3xl font-roboto font-bold tracking-tight leading-none mb-2" style={{ color: `${BRAND_COLORS.primary}E6` }}>{formatCurrency(target.revenue)}</p>
            {renderVariance(variances.revenueDiff, 'currency', 'to PY')}
          </div>
          <TickPacingBar pct={variances.reachedPct} />
        </div>
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <DonutChart achieved={actual} target={target.revenue} fillColor={BRAND_COLORS.purple} trackColor={BRAND_COLORS.orange} targetLabel={`${title} Target`}/>
        </div>
      </div>
      <div className="flex justify-between items-center border-t pt-6 mt-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
        <MetricBrief label="ADR" value={formatPreciseCurrency(target.adr)} variance={renderVariance(variances.adrDiff, 'precise_currency', 'to PY')} />
        <MetricBrief label="REVPAR" value={formatPreciseCurrency(target.revpar)} variance={renderVariance(variances.revparDiff, 'precise_currency', 'to PY')} />
      </div>
    </div>
  );
}

function DonutChart({ achieved, target, fillColor, trackColor, targetLabel }) {
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = target > 0 ? Math.min(100, (achieved / target) * 100) : 0;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-[150px] h-[150px] flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="transparent" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={fillColor} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} fill="transparent" strokeLinecap="square" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute text-center flex flex-col font-roboto">
          <span className="text-base font-bold leading-none" style={{ color: BRAND_COLORS.primary }}>{formatCompactUSD(achieved)}</span>
          <span className="text-[8px] font-khand font-bold opacity-50 uppercase mt-1 tracking-wider">OTB REACH</span>
          <span className="text-[10px] font-bold mt-0.5" style={{ color: BRAND_COLORS.purple }}>{percent.toFixed(1)}%</span>
        </div>
      </div>
      <div className="text-[10px] font-roboto space-y-1 w-full max-w-[130px] border-t pt-2.5" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: fillColor }} /><span className="font-semibold" style={{ color: `${BRAND_COLORS.primary}CC` }}>OTB (Actuals)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: trackColor }} /><span className="font-semibold truncate" style={{ color: `${BRAND_COLORS.primary}CC` }}>{targetLabel}</span></div>
      </div>
    </div>
  );
}

function TickPacingBar({ pct }) {
  const totalTicks = 34;
  const activeTicks = Math.round((Math.min(100, Math.max(0, pct)) / 100) * totalTicks);
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-end gap-[3px] h-[26px]">
        {Array.from({ length: totalTicks }).map((_, i) => (
          <div key={i} className={`w-[4px] transition-all duration-500 ease-out ${i === totalTicks - 1 ? 'h-6' : (i % 4 === 0 ? 'h-4' : 'h-3')}`} style={{ backgroundColor: i <= activeTicks ? BRAND_COLORS.primary : BRAND_COLORS.frost, border: i === totalTicks - 1 ? `1px solid ${BRAND_COLORS.primary}` : 'none' }} />
        ))}
      </div>
    </div>
  );
}

// --- Sub-Components ---

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-all duration-200 shrink-0 rounded-none group ${active ? 'bg-[#fafafa]' : ''}`}
      style={{
        borderColor: active ? BRAND_COLORS.cyan : 'transparent',
        color: active ? BRAND_COLORS.cyan : `${BRAND_COLORS.primary}99`,
      }}
    >
      <Icon size={18} />
      <span className="font-khand uppercase font-bold tracking-wider text-sm whitespace-nowrap">{label}</span>
    </button>
  );
}

function KPICard({ label, value, diff, isNeg, bgColor, textColor, labelColor, diffColor }) {
  return (
    <div
      className="p-6 flex flex-col justify-center items-center text-center h-44 gap-y-1 shadow-md transition-transform hover:scale-[1.02] rounded-none"
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-xs sm:text-sm font-khand font-bold uppercase tracking-wider" style={{ color: labelColor }}>{label}</p>
      <h3 className="text-4xl sm:text-5xl font-khand font-bold tracking-tight leading-none" style={{ color: textColor }}>{value}</h3>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-roboto mt-1" style={{ color: diffColor || textColor }}>
        <ChangeIndicator isNeg={isNeg} textColor={diffColor || textColor} bgColor={bgColor} />
        <span className="font-bold">{isNeg ? '-' : '+'}{diff}</span>
      </div>
    </div>
  );
}

function ChangeIndicator({ isNeg, textColor, bgColor }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block shrink-0 transition-transform duration-500">
      <circle cx="12" cy="12" r="12" fill={textColor} />
      <path
        d="M 12 3 L 5 11 H 8.5 V 21 H 15.5 V 11 H 19 Z"
        fill={bgColor}
        transform={isNeg ? "rotate(180 12 12)" : undefined}
      />
    </svg>
  );
}

function MetricBrief({ label, value, variance }) {
  return (
    <div className="animate-in fade-in duration-500">
      <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>{label}</p>
      <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{value}</p>
      <div className="leading-none">{variance}</div>
    </div>
  );
}

function DayOfWeekOccupancy({ selectedYear, parsedDOW }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const computedDOW = useMemo(() => {
    // Precise extraction of occupancy metric to avoid volume conflation
    let activeDowRows = parsedDOW.filter(d => 
      String(d.year) === String(selectedYear) && 
      (d.metric === 'OCC_OTB' || d.metric === 'DOW_OCC')
    );

    if (activeDowRows.length > 0) {
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const sums = { SUN: 0, MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0 };
      activeDowRows.forEach(row => {
        days.forEach(day => { sums[day] += row[day]; });
      });
      const count = activeDowRows.length;
      return {
        SUN: Math.round(sums.SUN / count * 100),
        MON: Math.round(sums.MON / count * 100),
        TUE: Math.round(sums.TUE / count * 100),
        WED: Math.round(sums.WED / count * 100),
        THU: Math.round(sums.THU / count * 100),
        FRI: Math.round(sums.FRI / count * 100),
        SAT: Math.round(sums.SAT / count * 100),
      };
    }

    // Secondary fallback: Calc from DOW_TOTALS / RMS_AVAILABLE
    const totals = parsedDOW.find(d => String(d.year) === String(selectedYear) && d.metric === 'DOW_TOTALS');
    const available = parsedDOW.find(d => String(d.year) === String(selectedYear) && d.metric === 'RMS_AVAILABLE');

    if (totals && available) {
      return {
        SUN: Math.round((totals.SUN / available.SUN) * 100),
        MON: Math.round((totals.MON / available.MON) * 100),
        TUE: Math.round((totals.TUE / available.TUE) * 100),
        WED: Math.round((totals.WED / available.WED) * 100),
        THU: Math.round((totals.THU / available.THU) * 100),
        FRI: Math.round((totals.FRI / available.FRI) * 100),
        SAT: Math.round((totals.SAT / available.SAT) * 100),
      };
    }

    return { SUN: 0, MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0 };
  }, [parsedDOW, selectedYear]);

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="bg-white border-[3px] p-6 flex flex-col h-full relative rounded-none shadow-sm" style={{ borderColor: BRAND_COLORS.primary }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-[3px] pb-5 mb-6 gap-4" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
        <div>
          <h3 className="font-khand text-xl font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS.primary }}> DAY OF WEEK OCCUPANCY </h3>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: `${BRAND_COLORS.primary}99` }}> ACTUAL OCCUPANCY % TRENDS </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 sm:gap-4 flex-1 items-end pt-12 pb-2">
        {days.map((day) => {
          const val = computedDOW[day];
          const isHovered = hoveredDay === day;

          return (
            <div
              key={day}
              className="flex flex-col items-center group cursor-pointer relative h-full justify-end"
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div
                className={`absolute -top-7 transition-all duration-300 transform -translate-y-2 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-none shadow-md pointer-events-none z-10 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                {val}%
                <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: BRAND_COLORS.primary }}></div>
              </div>
              <div className="w-full border-2 rounded-none aspect-[1/3.5] flex flex-col justify-end p-0.5 overflow-hidden" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}1A` }}>
                <div className="w-full rounded-none transition-all duration-500 ease-out" style={{ height: `${Math.min(100, val)}%`, backgroundColor: BRAND_COLORS.cyan }} />
              </div>
              <span className="text-[10px] sm:text-xs font-khand font-bold uppercase tracking-wider group-hover-text-dynamic mt-3" style={{ color: `${BRAND_COLORS.primary}99`, '--group-hover-color': BRAND_COLORS.primary }}> {day} </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SegmentPaceChart({ actuals, stlyMap, periodLabel }) {
  return (
    <div className="bg-white border-[3px] p-6 flex flex-col h-full justify-between rounded-none shadow-sm" style={{ borderColor: BRAND_COLORS.primary }}>
      <div>
        <div className="flex justify-between items-start border-b-[3px] pb-5 mb-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
          <div>
            <h3 className="font-khand text-xl font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS.primary }}> PACE VS STLY </h3>
            <p className="text-xs font-medium tracking-wide uppercase" style={{ color: `${BRAND_COLORS.primary}99` }}> HISTORICAL REVENUE COMPARISON </p>
          </div>
          <TrendingUp className="w-5 h-5 mt-1" style={{ color: BRAND_COLORS.cyan }} />
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
          {actuals.map((seg, idx) => {
            const actRev = seg.REVENUE;
            const stlyRev = stlyMap[seg.METRIC] || 0;
            const variancePct = stlyRev > 0 ? ((actRev - stlyRev) / stlyRev) * 100 : 0;
            const isNegative = variancePct < 0;

            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="w-full sm:w-1/2">
                  <span className="font-khand font-bold text-[10px] uppercase tracking-wider truncate block" style={{ color: BRAND_COLORS.primary }}> {seg.METRIC} </span>
                </div>
                <div className="flex-1 flex items-center justify-between p-1.5 rounded-none border transition-colors" style={{ borderColor: `${BRAND_COLORS.primary}33`, backgroundColor: BRAND_COLORS.frost }}>
                  <span className="font-bold text-[11px]" style={{ color: BRAND_COLORS.primary }}> {formatCurrency(actRev)} </span>
                  <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded-none ${isNegative ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'}`}>
                    {variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t-[3px] pt-4 mt-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: `${BRAND_COLORS.primary}1A`, color: `#6a7788` }}>
        <span>STLY COMPARISON</span>
        <span>{periodLabel}</span>
      </div>
    </div>
  );
}

const renderVariance = (val, type, label = "vs STLY") => {
  const isNegative = val < 0;
  const color = isNegative ? BRAND_COLORS.red : BRAND_COLORS.cyan;
  let formattedVal = "";
  if (type === 'percent') formattedVal = `${!isNegative ? "+" : ""}${val.toFixed(2)}%`;
  else if (type === 'number') formattedVal = `${!isNegative ? "+" : ""}${formatNumber(val)}`;
  else if (type === 'currency') formattedVal = `${!isNegative ? "+$" : "-$"}${formatNumber(Math.abs(val))}`;
  else if (type === 'precise_currency') formattedVal = `${!isNegative ? "+$" : "-$"}${Math.abs(val).toFixed(2)}`;

  return (
    <span className="inline-flex items-center gap-1 font-bold text-[11px] font-roboto" style={{ color: color }}>
      <span>{isNegative ? <ArrowDown size={10} /> : <ArrowUp size={10} />}</span>
      <span>{formattedVal}</span>
      <span className="font-medium ml-0.5" style={{ color: `${BRAND_COLORS.primary}66` }}>{label}</span>
    </span>
  );
};

function BarChart({ data, xKey, yKey, label, format, color }) {
  const width = 600;
  const height = 240;
  const margin = { top: 25, right: 20, bottom: 40, left: 65 };
  const maxVal = Math.max(...data.map(d => d[yKey] || 0), 1) * 1.15;

  const getX = (i) => margin.left + (i * (width - margin.left - margin.right) / Math.max(data.length, 1)) + 5;
  const getBarWidth = () => ((width - margin.left - margin.right) / Math.max(data.length, 1)) * 0.7;
  const getY = (v) => height - margin.bottom - ((v / maxVal) * (height - margin.top - margin.bottom));
  const getBarHeight = (v) => (v / maxVal) * (height - margin.top - margin.bottom);

  return (
    <div className="bg-white p-6 border-[3px] w-full shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
      <h4 className="font-khand uppercase font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.primary }}>
        <TrendingUp size={16} style={{ color: BRAND_COLORS.cyan }} /> {label}
      </h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = getY(maxVal * f);
          return (
            <g key={f}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
              <text x={margin.left - 10} y={y + 3} textAnchor="end" fontSize="10" className="font-bold font-roboto" fill={`${BRAND_COLORS.primary}80`}>
                {format === 'adr' ? formatCompact(maxVal * f) : formatNumber(maxVal * f)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => (
          <rect key={i} x={getX(i)} y={getY(d[yKey])} width={getBarWidth()} height={Math.max(0, getBarHeight(d[yKey]))} fill={color} className="transition-all duration-700 ease-out rounded-none" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={getX(i) + getBarWidth() / 2} y={height - margin.bottom + 16} textAnchor="middle" fontSize="10" className="font-khand font-bold" fill={BRAND_COLORS.primary}>{d[xKey]}</text>
        ))}
      </svg>
    </div>
  );
}
/* canvas_id:1816731838 */