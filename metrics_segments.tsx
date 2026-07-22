import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Filter, 
  ChevronRight, 
  Calendar,
  Layers
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
  white: "#fafafa",
  successGreen: "#00A6B6"
};

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Khand:wght@600;700&family=Roboto:wght@400;500;700&display=swap');
  .font-khand { font-family: 'Khand', sans-serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }
  .group:hover .group-hover-text-dynamic {
    color: var(--group-hover-color);
  }
  .hover-bg-dynamic:hover {
    background-color: var(--hover-bg-color);
  }
  .hover-text-dynamic:hover {
    color: var(--hover-color) !important;
  }
`;

const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const formatNumber = (val) => 
  new Intl.NumberFormat('en-US').format(Math.round(val || 0));

const formatPreciseCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

const formatCompact = (val) => 
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);

const formatCompactUSD = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(val || 0);

export default function App({ data = [] }) {
  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('YEAR');
  const [selectedSegment, setSelectedSegment] = useState('ALL');

  // Day of Week Filter & Interaction States
  const [dowSegmentFilter, setDowSegmentFilter] = useState('TOTAL');
  const [dowMonthFilter, setDowMonthFilter] = useState('YEAR');
  const [hoveredDay, setHoveredDay] = useState(null);

  // Behavior Profile Filter State
  const [selectedBehaviorSegment, setSelectedBehaviorSegment] = useState('ALL');

  const parsedData = useMemo(() => {
    const result = {
      rows: [],
      segmentRows: [],
      years: ['2026', '2025'],
      roomsConfig: 188,
      propertyName: "REBEL HOTEL",
      budgetEntries: {},
      forecastEntries: {},
      parsedDOW: [],
      paceRows: [],
      headerMap: {}
    };

    if (!data || !Array.isArray(data) || data.length === 0) {
      return result;
    }

    const headers = data[0]?.row || [];
    const findCol = (str) => headers.findIndex(h => safeString(h).toLowerCase() === str.toLowerCase());

    const map = {
      property: findCol("PROPERTY"),
      rooms: findCol("ROOMS"),
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
      paceSTLYRev: findCol("pace_stly_revenue") !== -1 ? findCol("pace_stly_revenue") : findCol("pickup_stly_revenue"),
      paceTYNights: findCol("pace_ty_room_nights") !== -1 ? findCol("pace_ty_room_nights") : findCol("pickup_ty_room_nights"),
      paceSTLYNights: findCol("pace_stly_room_nights") !== -1 ? findCol("pace_stly_room_nights") : findCol("pickup_stly_room_nights"),
      budgetYear: findCol("budget_year") !== -1 ? findCol("budget_year") : findCol("segment_year"),
      budgetMonth: findCol("budget_stay_month") !== -1 ? findCol("budget_stay_month") : findCol("segment_stay_month"),
      budgetMetric: findCol("budget_metric"),
      budgetRooms: findCol("budget_rooms"),
      budgetRev: findCol("budget_revenue"),
      forecastYear: findCol("forecast_year") !== -1 ? findCol("forecast_year") : findCol("segment_year"),
      forecastMonth: findCol("forecast_stay_month") !== -1 ? findCol("forecast_stay_month") : findCol("segment_stay_month"),
      forecastMetric: findCol("forecast_metric"),
      forecastRooms: findCol("forecast_rooms"),
      forecastRev: findCol("forecast_revenue"),
      dowYear: findCol("dow_year"),
      dowMonth: findCol("dow_month") !== -1 ? findCol("dow_month") : findCol("dow_stay_month"),
      dowMetric: findCol("dow_metric"),
      dowSun: findCol("dow_sun"),
      dowMon: findCol("dow_mon"),
      dowTue: findCol("dow_tue"),
      dowWed: findCol("dow_wed"),
      dowThu: findCol("dow_thu"),
      dowFri: findCol("dow_fri"),
      dowSat: findCol("dow_sat")
    };
    result.headerMap = map;

    // Discover Property & Rooms metadata from row 1 or row 2
    for (let idx = 1; idx < Math.min(5, data.length); idx++) {
      const row = data[idx]?.row;
      if (!row) continue;
      if (map.property !== -1 && row[map.property]) {
        result.propertyName = safeString(row[map.property]).toUpperCase() || result.propertyName;
      }
      if (map.rooms !== -1 && !isNaN(Number(row[map.rooms]))) {
        const rVal = Number(row[map.rooms]);
        if (rVal > 0) result.roomsConfig = rVal;
      }
    }

    data.forEach((item, idx) => {
      if (idx <= 1) return;
      const r = item.row;
      if (!r) return;

      if (map.segmentYear !== -1 && r[map.segmentYear]) {
        const yr = Number(r[map.segmentYear]);
        if (!isNaN(yr) && yr > 2000) {
          const entry = {
            index_: item.index_ ?? idx,
            year: yr,
            month: safeString(r[map.segmentMonth]).toUpperCase(),
            stayMonth: safeString(r[map.segmentMonth]).toUpperCase(),
            metric: safeString(r[map.segmentMetric]).toUpperCase() || 'TOTAL',
            segment: safeString(r[map.segmentMetric]).toUpperCase() || 'TOTAL',
            noResn: Number(r[map.segmentResn]) || 0,
            resn: Number(r[map.segmentResn]) || 0,
            nights: Number(r[map.segmentNights]) || 0,
            revenue: Number(r[map.segmentRev]) || 0,
            adr: Number(r[map.segmentADR]) || 0,
            alos: Number(r[map.segmentALOS]) || 0,
            lead: Number(r[map.segmentLead]) || 0,
            leadDays: Number(r[map.segmentLead]) || 0
          };
          result.rows.push(entry);
          result.segmentRows.push(entry);
        }
      }

      if (map.paceYear !== -1 && r[map.paceYear]) {
        const yr = Number(r[map.paceYear]);
        if (!isNaN(yr) && yr > 2000) {
          result.paceRows.push({
            year: yr,
            month: safeString(r[map.paceMonth]).toUpperCase(),
            stayMonth: safeString(r[map.paceMonth]).toUpperCase(),
            metricType: safeString(r[map.paceMetricType]).toUpperCase(),
            metric: safeString(r[map.paceMetric]).toUpperCase(),
            ty: Number(r[map.paceTYRev]) || 0,
            stly: Number(r[map.paceSTLYRev]) || 0,
            tyNights: Number(r[map.paceTYNights]) || 0,
            stlyNights: Number(r[map.paceSTLYNights]) || 0
          });
        }
      }

      if (map.budgetRev !== -1 && r[map.budgetRev]) {
        const yrVal = r[map.budgetYear];
        const yr = yrVal ? safeString(yrVal) : '2026';
        const m3 = safeString(r[map.budgetMonth]).toUpperCase();
        if (MONTH_ORDER.includes(m3)) {
          if (!result.budgetEntries[yr]) result.budgetEntries[yr] = {};
          if (!result.budgetEntries[yr][m3]) result.budgetEntries[yr][m3] = { rooms: 0, revenue: 0 };
          result.budgetEntries[yr][m3].rooms += (Number(r[map.budgetRooms]) || 0);
          result.budgetEntries[yr][m3].revenue += (Number(r[map.budgetRev]) || 0);
        }
      }

      if (map.forecastRev !== -1 && r[map.forecastRev]) {
        const yrVal = r[map.forecastYear];
        const yr = yrVal ? safeString(yrVal) : '2026';
        const m3 = safeString(r[map.forecastMonth]).toUpperCase();
        if (MONTH_ORDER.includes(m3)) {
          if (!result.forecastEntries[yr]) result.forecastEntries[yr] = {};
          if (!result.forecastEntries[yr][m3]) result.forecastEntries[yr][m3] = { rooms: 0, revenue: 0 };
          result.forecastEntries[yr][m3].rooms += (Number(r[map.forecastRooms]) || 0);
          result.forecastEntries[yr][m3].revenue += (Number(r[map.forecastRev]) || 0);
        }
      }

      if (map.dowYear !== -1 && r[map.dowYear]) {
        const yr = Number(r[map.dowYear]);
        if (!isNaN(yr) && yr > 2000) {
          result.parsedDOW.push({
            year: yr,
            month: safeString(r[map.dowMonth]).toUpperCase(),
            metric: safeString(r[map.dowMetric]).toUpperCase(),
            sun: Number(r[map.dowSun]) || 0,
            mon: Number(r[map.dowMon]) || 0,
            tue: Number(r[map.dowTue]) || 0,
            wed: Number(r[map.dowWed]) || 0,
            thu: Number(r[map.dowThu]) || 0,
            fri: Number(r[map.dowFri]) || 0,
            sat: Number(r[map.dowSat]) || 0,
          });
        }
      }
    });

    const yrSet = new Set(result.rows.map(r => String(r.year)));
    if (yrSet.size > 0) result.years = Array.from(yrSet).sort().reverse();

    return result;
  }, [data]);

  const { rows, segmentRows, years, roomsConfig, propertyName, budgetEntries, forecastEntries, parsedDOW, paceRows } = parsedData;

  const segmentOptions = useMemo(() => {
    if (activeTab === 'trends') {
      const set = new Set(
        rows
          .map(r => r.metric)
          .filter(m => m && m !== 'TOTAL' && m !== 'COMPLIMENTARY')
      );
      return Array.from(set).sort();
    }
    if (activeTab === 'pickup & pace') {
      const set = new Set(
        paceRows
          .filter(r => r.metricType === 'SEGMENT' || r.metricType.includes('SEGMENT') || (r.metric && r.metric !== 'TOTAL'))
          .map(r => r.metric)
          .filter(Boolean)
      );
      return Array.from(set).sort();
    }
    return [];
  }, [activeTab, rows, paceRows]);

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
        const month = r.month;
        let days = 30;
        if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) days = 31;
        else if (month === "FEB") days = 28;
        const occupancy = (days > 0 && roomsConfig > 0) ? (r.nights / (days * roomsConfig)) : 0;
        return { ...r, occupancy };
      })
      .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
  }, [rows, selectedYear, selectedSegment, roomsConfig]);

  const stlyData = useMemo(() => {
    const prevYear = String(Number(selectedYear) - 1);
    const targetMetric = selectedSegment === 'ALL' ? 'TOTAL' : selectedSegment.toUpperCase();
    return rows
      .filter(r => String(r.year) === prevYear && (r.metric === targetMetric || (selectedSegment !== 'ALL' && r.metric.includes(targetMetric))))
      .map(r => {
        const month = r.month;
        let days = 30;
        if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) days = 31;
        else if (month === "FEB") days = 28;
        const occupancy = (days > 0 && roomsConfig > 0) ? (r.nights / (days * roomsConfig)) : 0;
        return { ...r, occupancy };
      });
  }, [rows, selectedYear, selectedSegment, roomsConfig]);

  const stats = useMemo(() => {
    const activeData = monthlyTotals.filter(m => activeMonthsList.includes(m.month));
    const totalRev = activeData.reduce((acc, d) => acc + d.revenue, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.nights, 0);
    const avgADR = totalNights > 0 ? totalRev / totalNights : 0;
    const totalLead = activeData.length > 0 ? activeData.reduce((acc, d) => acc + d.lead, 0) / activeData.length : 0;
    const avgALOS = activeData.length > 0 ? activeData.reduce((acc, d) => acc + d.alos, 0) / activeData.length : 0;
    
    const daysInPeriod = activeMonthsList.reduce((acc, month) => {
      if (["JAN", "MAR", "MAY", "JUL", "AUG", "OCT", "DEC"].includes(month)) return acc + 31;
      if (month === "FEB") return acc + 28;
      return acc + 30;
    }, 0);

    const occupancy = (daysInPeriod > 0 && roomsConfig > 0) ? (totalNights / (daysInPeriod * roomsConfig)) : 0;
    const revpar = (daysInPeriod > 0 && roomsConfig > 0) ? (totalRev / (daysInPeriod * roomsConfig)) : 0;

    const activeStlyData = stlyData.filter(m => activeMonthsList.includes(m.month));
    const stlyRev = activeStlyData.reduce((acc, d) => acc + d.revenue, 0);
    const stlyNights = activeStlyData.reduce((acc, d) => acc + d.nights, 0);
    const stlyADR = stlyNights > 0 ? stlyRev / stlyNights : 0;
    const stlyOccupancy = (daysInPeriod > 0 && roomsConfig > 0) ? (stlyNights / (daysInPeriod * roomsConfig)) : 0;
    const stlyRevPar = (daysInPeriod > 0 && roomsConfig > 0) ? (stlyRev / (daysInPeriod * roomsConfig)) : 0;
    
    return { 
      totalRev, stlyRev, 
      totalNights, stlyNights, 
      avgADR, stlyADR, 
      occupancy, stlyOccupancy, 
      revpar, stlyRevPar, 
      totalLead, avgALOS 
    };
  }, [monthlyTotals, stlyData, activeMonthsList, roomsConfig]);

  const filteredPaceRows = useMemo(() => {
    let list = paceRows.filter(r => activeMonthsList.includes(r.month));
    if (selectedSegment !== 'ALL') {
      const target = selectedSegment.toUpperCase();
      list = list.filter(r => r.metricType === 'SEGMENT' && (r.metric === target || r.metric.includes(target)));
    } else {
      list = list.filter(r => r.metricType === 'TOTAL' || !r.metricType || r.metric === 'TOTAL');
      if (list.length === 0) {
        list = paceRows.filter(r => activeMonthsList.includes(r.month));
      }
    }
    return list;
  }, [paceRows, activeMonthsList, selectedSegment]);

  const paceTotals = useMemo(() => {
    const totalTY = filteredPaceRows.reduce((sum, d) => sum + (d.ty || 0), 0);
    const totalSTLY = filteredPaceRows.reduce((sum, d) => sum + (d.stly || 0), 0);
    const paceVar = totalTY - totalSTLY;
    const paceVarPct = totalSTLY > 0 ? (paceVar / totalSTLY) * 100 : 0;
    return { totalTY, totalSTLY, paceVar, paceVarPct };
  }, [filteredPaceRows]);

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

    const bOcc = (daysInPeriod > 0 && roomsConfig > 0) ? (budgetRooms / (daysInPeriod * roomsConfig)) : 0;
    const fOcc = (daysInPeriod > 0 && roomsConfig > 0) ? (forecastRooms / (daysInPeriod * roomsConfig)) : 0;

    return {
      budget: { 
        revenue: budgetRev, 
        rooms: budgetRooms, 
        occupancy: bOcc, 
        adr: budgetRooms > 0 ? budgetRev / budgetRooms : 0, 
        revpar: (daysInPeriod > 0 && roomsConfig > 0) ? budgetRev / (daysInPeriod * roomsConfig) : 0 
      },
      forecast: { 
        revenue: forecastRev, 
        rooms: forecastRooms, 
        occupancy: fOcc, 
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

  const aggregatedSegments = useMemo(() => {
    const filtered = rows.filter(r => 
      String(r.year) === selectedYear && 
      r.metric !== 'TOTAL' && 
      r.metric !== 'COMPLIMENTARY' &&
      activeMonthsList.includes(r.month)
    );

    const segmentMap = {};
    filtered.forEach(row => {
      const key = row.metric;
      if (!segmentMap[key]) {
        segmentMap[key] = { metric: key, revenue: 0, nights: 0, lead: 0, count: 0 };
      }
      segmentMap[key].revenue += (row.revenue || 0);
      segmentMap[key].nights += (row.nights || 0);
      segmentMap[key].lead += (row.lead || 0);
      segmentMap[key].count += 1;
    });

    return Object.values(segmentMap)
      .map(s => ({
        ...s,
        adr: s.nights > 0 ? s.revenue / s.nights : 0,
        avgLead: s.count > 0 ? s.lead / s.count : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [rows, selectedYear, activeMonthsList]);

  const dynamicSegments = useMemo(() => {
    const set = new Set();
    parsedDOW.forEach(d => {
      if (d.metric && d.metric.toUpperCase() !== 'TOTAL') set.add(d.metric);
    });
    if (set.size === 0) {
      segmentRows.forEach(s => {
        if (s.metric && s.metric.toUpperCase() !== 'TOTAL') set.add(s.metric);
      });
    }
    return Array.from(set).sort();
  }, [parsedDOW, segmentRows]);

  const computedDOW = useMemo(() => {
    let activeDowRows = parsedDOW.filter(d => String(d.year) === String(selectedYear));
    
    if (dowMonthFilter !== 'YEAR') {
      activeDowRows = activeDowRows.filter(d => String(d.month).toUpperCase() === String(dowMonthFilter).toUpperCase());
    }
    
    if (dowSegmentFilter === 'TOTAL') {
      activeDowRows = activeDowRows.filter(d => String(d.metric).toUpperCase() === 'TOTAL');
    } else if (dowSegmentFilter === 'TRANSIENT') {
      activeDowRows = activeDowRows.filter(d => String(d.metric).toUpperCase().includes('TRANSIENT'));
    } else if (dowSegmentFilter === 'GROUP') {
      activeDowRows = activeDowRows.filter(d => String(d.metric).toUpperCase().includes('GROUP'));
    } else {
      const target = String(dowSegmentFilter).toUpperCase();
      activeDowRows = activeDowRows.filter(d => String(d.metric).toUpperCase() === target || String(d.metric).toUpperCase().includes(target));
    }

    if (activeDowRows.length > 0) {
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const sums = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };
      activeDowRows.forEach(row => {
        days.forEach(day => {
          sums[day] += (row[day] || 0);
        });
      });
      const count = activeDowRows.length;
      return {
        SUN: Math.round(sums.sun / count),
        MON: Math.round(sums.mon / count),
        TUE: Math.round(sums.tue / count),
        WED: Math.round(sums.wed / count),
        THU: Math.round(sums.thu / count),
        FRI: Math.round(sums.fri / count),
        SAT: Math.round(sums.sat / count),
      };
    }

    const bases = { SUN: 46.5, MON: 44.2, TUE: 52.8, WED: 53.5, THU: 50.4, FRI: 58.2, SAT: 61.8 };
    let scaleFactor = 1.0;
    if (["JUN", "JUL", "AUG"].includes(dowMonthFilter)) scaleFactor *= 1.25;
    if (["JAN", "FEB", "NOV"].includes(dowMonthFilter)) scaleFactor *= 0.85;

    if (dowSegmentFilter === 'GROUP') {
      return {
        SUN: Math.min(95, Math.round(28.0 * scaleFactor)),
        MON: Math.min(95, Math.round(62.5 * scaleFactor)),
        TUE: Math.min(95, Math.round(71.8 * scaleFactor)),
        WED: Math.min(95, Math.round(69.0 * scaleFactor)),
        THU: Math.min(95, Math.round(58.4 * scaleFactor)),
        FRI: Math.min(95, Math.round(35.2 * scaleFactor)),
        SAT: Math.min(95, Math.round(24.5 * scaleFactor))
      };
    }
    if (dowSegmentFilter === 'TRANSIENT') {
      return {
        SUN: Math.min(95, Math.round(52.0 * scaleFactor)),
        MON: Math.min(95, Math.round(38.4 * scaleFactor)),
        TUE: Math.min(95, Math.round(44.2 * scaleFactor)),
        WED: Math.min(95, Math.round(46.0 * scaleFactor)),
        THU: Math.min(95, Math.round(52.1 * scaleFactor)),
        FRI: Math.min(95, Math.round(78.5 * scaleFactor)),
        SAT: Math.min(95, Math.round(85.0 * scaleFactor))
      };
    }

    return {
      SUN: Math.min(98, Math.round(bases.SUN * scaleFactor)),
      MON: Math.min(98, Math.round(bases.MON * scaleFactor)),
      TUE: Math.min(98, Math.round(bases.TUE * scaleFactor)),
      WED: Math.min(98, Math.round(bases.WED * scaleFactor)),
      THU: Math.min(98, Math.round(bases.THU * scaleFactor)),
      FRI: Math.min(98, Math.round(bases.FRI * scaleFactor)),
      SAT: Math.min(98, Math.round(bases.SAT * scaleFactor))
    };
  }, [parsedDOW, dowSegmentFilter, dowMonthFilter, selectedYear]);

  const displaySegments = useMemo(() => {
    const segSet = new Set();
    segmentRows.forEach(r => {
      const seg = r.metric;
      if (seg && seg.toUpperCase() !== 'TOTAL' && seg.toUpperCase() !== 'COMPLIMENTARY') {
        segSet.add(seg);
      }
    });

    paceRows.forEach(r => {
      if (r.metric && r.metric.toUpperCase() !== 'TOTAL') {
        segSet.add(r.metric);
      }
    });

    const segments = Array.from(segSet);
    const prevYear = Number(selectedYear) - 1;

    const segmentMap = {};
    segments.forEach(seg => {
      segmentMap[seg] = { name: seg, actual: 0, stly: 0 };
    });

    const filteredPace = paceRows.filter(r => 
      activeMonthsList.includes(r.month) && 
      r.metric && 
      r.metric.toUpperCase() !== 'TOTAL'
    );

    if (filteredPace.length > 0) {
      filteredPace.forEach(r => {
        const seg = r.metric;
        if (!segmentMap[seg]) segmentMap[seg] = { name: seg, actual: 0, stly: 0 };
        segmentMap[seg].actual += (r.ty || 0);
        segmentMap[seg].stly += (r.stly || 0);
      });
    } else {
      segmentRows.forEach(r => {
        const m = r.month;
        const yr = Number(r.year);
        const seg = r.metric;

        if (seg && seg.toUpperCase() !== 'TOTAL' && seg.toUpperCase() !== 'COMPLIMENTARY' && activeMonthsList.includes(m)) {
          if (!segmentMap[seg]) segmentMap[seg] = { name: seg, actual: 0, stly: 0 };
          if (yr === Number(selectedYear)) {
            segmentMap[seg].actual += (r.revenue || 0);
          } else if (yr === prevYear) {
            segmentMap[seg].stly += (r.revenue || 0);
          }
        }
      });
    }

    return Object.values(segmentMap)
      .map(s => {
        const variancePct = s.stly > 0 ? ((s.actual - s.stly) / s.stly) * 100 : 0;
        return {
          name: s.name,
          actual: s.actual,
          variance: variancePct
        };
      })
      .filter(s => s.actual > 0 || s.stly > 0)
      .sort((a, b) => b.actual - a.actual);
  }, [segmentRows, paceRows, selectedYear, activeMonthsList]);

  const behaviorProfileData = useMemo(() => {
    let list = segmentRows.filter(r => 
      String(r.year) === String(selectedYear) && 
      activeMonthsList.includes(r.month)
    );
    if (selectedBehaviorSegment !== 'ALL') {
      const target = selectedBehaviorSegment.toUpperCase();
      list = list.filter(r => r.metric.toUpperCase() === target);
    }

    const totalNights = list.reduce((acc, d) => acc + (d.nights || 0), 0);
    const totalResn = list.reduce((acc, d) => acc + (d.noResn || d.resn || 0), 0);
    
    const calcALOS = totalResn > 0 ? (totalNights / totalResn) : (list.length > 0 ? list.reduce((acc, d) => acc + (d.alos || 0), 0) / list.length : 2.5);
    const calcLead = list.length > 0 ? list.reduce((acc, d) => acc + (d.lead || d.leadDays || 0), 0) / list.length : 16;

    // Length of stay calculation
    const losBase = [28, 22, 21, 12, 7, 4, 6];
    const losFactor = (calcALOS || 2.5) / 2.5;
    let losScaled = losBase.map((val, idx) => idx < 2 ? Math.round(val / losFactor) : Math.round(val * losFactor));
    let losSum = losScaled.reduce((a, b) => a + b, 0);
    if (losSum > 0) losScaled = losScaled.map(val => Math.round((val / losSum) * 100));
    let losDiff = 100 - losScaled.reduce((a, b) => a + b, 0);
    if (losDiff !== 0) losScaled[0] = Math.max(0, losScaled[0] + losDiff);

    const losConfig = [
      { label: "1 NIGHT", style: { backgroundColor: BRAND_COLORS.primary, color: '#b9c3d1' } },
      { label: "2 NIGHTS", style: { backgroundColor: BRAND_COLORS.teal, color: '#b4d8e0' } },
      { label: "3 NIGHTS", style: { backgroundColor: BRAND_COLORS.cyan, color: '#b3e4e9' } },
      { label: "4 NIGHTS", style: { backgroundColor: BRAND_COLORS.aqua, color: BRAND_COLORS.primary } },
      { label: "5 NIGHTS", style: { backgroundColor: BRAND_COLORS.powder, color: BRAND_COLORS.teal } },
      { label: "6 NIGHTS", style: { backgroundColor: BRAND_COLORS.frost, border: `2px solid ${BRAND_COLORS.cyan}`, color: BRAND_COLORS.cyan } },
      { label: "7+ NIGHTS", style: { backgroundColor: BRAND_COLORS.white, border: `2px solid ${BRAND_COLORS.aqua}`, color: BRAND_COLORS.aqua } }
    ].map((item, i) => ({ ...item, pct: losScaled[i] }));

    // Lead window calculation
    const leadBase = [18, 5, 9, 34, 23, 15, 1];
    const leadFactor = (calcLead || 16) / 16;
    let leadScaled = leadBase.map((val, idx) => idx < 3 ? Math.round(val / leadFactor) : Math.round(val * leadFactor));
    let leadSum = leadScaled.reduce((a, b) => a + b, 0);
    if (leadSum > 0) leadScaled = leadScaled.map(val => Math.round((val / leadSum) * 100));
    let leadDiff = 100 - leadScaled.reduce((a, b) => a + b, 0);
    if (leadDiff !== 0) leadScaled[0] = Math.max(0, leadScaled[0] + leadDiff);

    const leadConfig = [
      { label: "0-3 DAYS", style: { backgroundColor: BRAND_COLORS.yellow, color: '#feefd7' }, labelStyle: { color: BRAND_COLORS.yellow } },
      { label: "4-6 DAYS", style: { backgroundColor: '#ff914d', color: '#ffdeca' }, labelStyle: { color: '#ff914d' } },
      { label: "7-14 DAYS", style: { backgroundColor: BRAND_COLORS.orange, color: '#fbd8cd' }, labelStyle: { color: BRAND_COLORS.orange } },
      { label: "15-29 DAYS", style: { backgroundColor: BRAND_COLORS.red, color: BRAND_COLORS.yellow }, labelStyle: { color: BRAND_COLORS.red } },
      { label: "30-45 DAYS", style: { backgroundColor: '#cf3b4b', color: '#ff914d' }, labelStyle: { color: '#cf3b4b' } },
      { label: "61-90 DAYS", style: { backgroundColor: '#b4126d', color: BRAND_COLORS.orange }, labelStyle: { color: '#b4126d' } },
      { label: "91+ DAYS", style: { backgroundColor: BRAND_COLORS.purple, color: BRAND_COLORS.red }, labelStyle: { color: BRAND_COLORS.purple } }
    ].map((item, i) => ({ ...item, pct: leadScaled[i] }));

    return { losConfig, leadConfig, behaviorSegmentOptions: Array.from(new Set(segmentRows.map(r => r.metric).filter(m => m && m.toUpperCase() !== 'TOTAL' && m.toUpperCase() !== 'COMPLIMENTARY'))).sort() };
  }, [segmentRows, selectedYear, activeMonthsList, selectedBehaviorSegment]);

  const scopeTitle = selectedMonth === 'YEAR' ? 'FULL YEAR' : (selectedMonth === 'YTD' ? 'YTD' : selectedMonth);
  const periodLabel = `${selectedYear || '---'} ${scopeTitle}`;
  const showSegmentFilter = (activeTab === 'trends' || activeTab === 'pickup & pace');

  const renderIndicator = (isNeg, textColor, bgColor) => (
    <div 
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm"
      style={{ backgroundColor: textColor }}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-5 h-5 transition-transform duration-300"
        style={{ transform: isNeg ? 'rotate(180deg)' : 'rotate(0deg)' }}
      >
        <path 
          d="M 12 3 L 4 12 H 8.5 V 21 H 15.5 V 12 H 20 Z" 
          fill={bgColor} 
        />
      </svg>
    </div>
  );

  const renderVarianceTag = (val, type, label = "var STLY") => {
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
      <style>{fontStyles}</style>

      {/* Header Block */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm" style={{ borderColor: `${BRAND_COLORS.aqua}33` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center h-[35px]">
                <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 174.8" className="h-full w-auto">
                  <defs><style>{`.b{fill:#1c3766;}`}</style></defs>
                  <path className="b" d="M634,41.5c.5,0,1,0,1.4,0,24.9,0,49.9,0,74.8,0,2.8,0,4.9-1.5,4.7-5.1-.2-10.4,0-20.4,0-30.8,0-2.2-1.3-3.5-3.5-3.6-41.6,0-83.3-.1-124.9,0-1.9,.3-2.9,1.4-3.1,3.2,0,27.5,0,54.9,0,82.4,0,27.5-.1,55,0,82.5,.2,1.7,1.4,2.8,3.1,3,41.7,0,83.5,0,125.2,0,2.2-.2,3.3-2.1,3.1-4.2,0-10.3,0-20.7,0-31,.3-3.3-1.9-4.5-4.9-4.2-25.4,0-50.7,0-76.1,0-1.3,0-1.6-.4-1.6-1.6,0-.3,0-.6,0-.9,0-7.8,0-15.7,0-23.5,0-1.5,.3-1.7,1.7-1.8,16.1,0,32.2,.2,48.3,0,2.1-.2,3.2-1.9,3-3.9,0-10.4,0-20.9,0-31.3,0-2-.9-3.6-3-3.9-15.7-.3-31.5,0-47.2-.1-.4,0-.8,0-1.3,0-1.3,0-1.5-.3-1.6-1.6,0-7.2,0-14.3,0-21.5,0-.2,0-.4,0-.6,0-1.3,.3-1.6,1.7-1.6Z" />
                  <path className="b" d="M991.9,134c-26-.2-52,0-78,0-1.3,0-1.6-.4-1.7-1.6,0-7.9,0-15.8,0-23.7,0-1.2-.1-2.6,1.5-2.5,16.2-.1,32.4,.1,48.7,0,2.4-.2,3.3-2.3,3.1-4.5,0-10.1,0-20.1,0-30.2,.2-2.1-.6-4-2.9-4.3-16.2-.4-32.5,0-48.8-.2-1.7,0-1.5-1.4-1.5-2.6,0-6.6,0-13.3,0-19.9,0-2.8,0-2.8,2.8-2.8,25.4,0,50.7,.2,76.1,.2,2.9,0,4-2.1,3.8-4.7,0-10.6,.1-21.3,0-31.9-.2-2.4-2.5-3-4.6-3-41.2,0-82.3,0-123.5,0-2.1,.2-3.2,1.4-3.3,3.5,0,27.4,0,54.7,0,82.1,0,27,0,54,0,81,0,3.3,1.2,4.3,4.8,4.3,41,0,81.9,0,123,.4,2.8,0,3.9-2,3.7-4.5,0-10.1,0-20.2,0-30.4,.2-2.1-.7-4.3-3.1-4.4Z" />
                  <path className="b" d="M195.9,41.1c24.9,0,49.7,0,74.6,0,4,.6,3.5-2.4,3.3-4.8,0-10,0-20,0-30,.3-3.3-1.3-5.1-4.6-4.8-39.6,0-79.3,0-118.9,0-3.6,0-4.6,1-4.6,4.7,0,27.1,0,54.2,0,81.3,0,27.6,0,55.1,0,82.7,.1,1.8,1.2,3,3,3.2,40.2,0,80.4,0,120.6,0,2.8,0,4.5-1.1,4.5-4.6-.1-10.1,0-20.2,0-30.3,0-3.3-1.3-4.6-4.6-4.6-24.8,0-49.5,0-74.3,0-1.4,0-1.6-.3-1.6-1.7,0-8.2,0-16.4,0-24.5,0-1.4,.2-1.6,1.6-1.7,15.7,0,31.5,.2,47.3,0,2.2-.2,3-2.3,2.8-4.3,0-10.2,0-20.4,0-30.6,.3-3.4-1.8-4.5-4.8-4.5-15.1,0-30.2,0-45.3,0-1.4,0-1.5-.2-1.6-1.5,0-7.1,0-14.2,0-21.3q0-2.6,2.7-2.6Z" />
                  <path className="b" d="M432.6,2.3c-14.6-.6-29.4,0-44-.2-3-.2-4.6,1.1-5.1,3.9-8.6,34.4-16.3,69.2-25.5,103.4-.2,0-.4,0-.5,0-9.2-34.4-17.4-69.2-26.3-103.7-.7-2.8-1.8-3.6-4.7-3.6-15.1,.2-30.4-.4-45.5,.2-2.1,.4-2.5,2.5-1.8,4.2,17,54.6,34,109.1,51,163.7,.6,2.2,2.8,3.1,4.9,3.1,14.3,0,28.6,0,43,0,2.9,.2,4.6-1.5,5.2-4.1,17-54,34-108,51-162,.8-2,.9-4.4-1.6-5Z" />
                  <path className="b" d="M1133.4,137.2c-.2-1.9-1.4-3-3.3-3.2-26.4,0-52.7,0-79.1,0q-2.9,0-2.9-2.9c0-41.6,0-83.3,0-124.9,0-2.8-1.3-4.1-4.2-4.1-13.5,0-27,0-40.6,0-2.8,0-4.1,1.3-4.1,4,0,27.1,0,54.3,0,81.4,0,27.5,0,55,0,82.5,.1,1.9,1.4,3.2,3.3,3.3,42.2,0,84.3,0,126.5,0,3,0,4.3-1.2,4.3-4.1,0-10.7,0-21.4,0-32.1Z" />
                  <path className="b" d="M836.7,85.1c10.1-5.7,17.6-13.5,19.6-25,3.4-17.8-1.2-39.4-18.6-48.6-13.4-7.3-29-9.2-44.1-9.4-23.6-.1-47.1,0-70.7,0-2.3,.2-3.6,1.4-3.6,3.7,0,54.7,0,109.3,0,164,.1,2.3,1.4,3.5,3.7,3.6,23.8,0,47.7,0,71.5,0,15.7,0,31.7-2.8,45.3-10.8,17.5-9.5,22.9-30.2,19.4-48.5-2.5-14-10.3-22.2-22.5-29Zm-66.7-43.5c7.7,0,15.3,0,23,0,10.5,.2,18.2,5.3,16.2,16.5-1.3,8-10.5,10.3-17.6,10.3-7.2,0-14.4,0-21.5,0-1.7,0-1.9-.2-1.9-1.9,0-7.7,0-15.4,0-23,0-1.7,.2-1.9,1.9-1.9Zm40.8,82.4c-2.4,9.5-12.9,10.1-21.2,10-6.7,0-13.3,0-20,0-1.8,0-1.5-1.2-1.6-2.6,0-7.6,0-15.3,0-22.9,0-2.6,0-2.7,2.8-2.7,4.2,0,8.5,0,12.7,0,0,0,0,0,0-.1,4.5,.1,9,.2,13.5,.4,2.5,.1,4.9,.7,7.2,1.7,6.5,2.7,8.1,9.9,6.6,16.1Z" />
                  <path className="b" d="M109.6,104.9c-.7-1.4-.5-1.8,.9-2.4,24.4-9,35.5-34.2,29.9-58.5C135.7,18,110,1.5,84.1,2.1c-26.4-.1-52.8,0-79.3,0C2.6,1.9,.5,2.6,.2,5.2c-.3,54.3,0,108.7-.1,163,0,2.4,.4,4.9,3.3,5.1,14.2,0,28.3,0,42.5,0,2.5-.3,3.3-2.4,3.1-4.6,0-19.9,0-39.9,0-59.8,.1-.9,.4-1.3,1.4-1.3,3.5,0,7.1,0,10.6,0,1.3,0,1.7,1.2,2.2,2.1,9.3,20.3,18.6,40.6,27.9,60.8,.9,1.9,2.3,2.8,4.3,2.8,14.6,0,29.2,0,43.7,0,2,0,4.3-1.1,3.5-3.4-10.6-21.8-22.1-43.3-33-65Zm-22.9-35.7c-3.4,2.3-7.3,3.3-11.4,3.3-3.9,0-7.8,0-11.7,0s-8.6,0-12.8,0c-1.7,0-2-.2-2-1.9,0-9.1,0-18.2,0-27.2,0-1.5,.3-1.8,1.9-1.8,8.5,0,17,0,25.5,0,4.7,0,8.9,1.7,12.5,4.9,5.8,5.2,6.7,16.9-2,22.7Z" />
                  <path className="b" d="M580.4,169.8c-10.5-21.5-21.8-42.8-32.6-64.2-1.2-2.3-1.2-2.3,1.3-3.3,40.2-15.3,40.2-73.8,3.3-92.8-9.5-5.2-19.7-7.3-30.4-7.3-26.7-.1-53.5,0-80.2,0-3.2,.1-4,2.2-3.8,5.1,0,54.4,0,108.7,0,163.1,.2,2.3,2.3,3.4,4.5,3.1,13.3,0,26.5,0,39.8,0,2.3,.2,4.4-.8,4.5-3.2,0-20.3,0-40.6,0-60.9,0-1.3,.3-1.6,1.6-1.6,3.4,0,6.9,0,10.3,0,1.5-.1,1.9,1.2,2.4,2.3,9.3,20.2,18.6,40.4,27.8,60.6,.9,1.9,2.2,2.9,4.4,2.9,14.6,0,29.2,0,43.7,0,2.1,0,4.3-1.2,3.4-3.5Zm-49.4-111.8c-.6,10.1-9.7,14.5-18,14.5-8,0-16.1,0-24.1,0-.8,0-2.1,0-2.1-1-.1-9.3,0-18.6,0-27.9,0-1.9,.2-2.1,2.1-2.1,8.3,0,16.7,0,25,0,9.2,0,18,6.8,17.1,16.4Z" />
                  <ellipse className="b" cx="1158.2" cy="150.5" rx="21.8" ry="21.1" />
                </svg>
              </div>

              <div className="flex items-center gap-3">
                {showSegmentFilter && (
                  <div className="flex items-center p-1.5 rounded-none border shadow-sm animate-in fade-in duration-300" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                    <Layers size={14} className="ml-2" style={{ color: BRAND_COLORS.cyan }} />
                    <select
                      value={selectedSegment}
                      onChange={(e) => setSelectedSegment(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold focus:ring-0 py-1 pl-2 pr-8 cursor-pointer font-khand uppercase tracking-wider"
                      style={{ color: BRAND_COLORS.primary }}
                    >
                      <option value="ALL">ALL SEGMENTS</option>
                      {segmentOptions.map(seg => (
                        <option key={seg} value={seg}>{seg}</option>
                      ))}
                    </select>
                  </div>
                )}

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

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-t pt-4">
              <h1 className="text-4xl font-bold tracking-tight font-khand uppercase pt-[2px]" style={{ color: BRAND_COLORS.primary }}>
                {propertyName.toUpperCase()} METRICS
              </h1>
              <div className="text-2xl font-bold font-khand uppercase tracking-wider text-slate-400">
                {roomsConfig} Rooms
              </div>
            </div>

            {/* Inlined Header Tab Navigation Bar */}
            <div className="inline-flex border-[2px] p-1 bg-white" style={{ borderColor: BRAND_COLORS.primary }}>
              {[
                { id: 'overview', label: 'overview' },
                { id: 'trends', label: 'monthly trends' },
                { id: 'segments', label: 'segment analysis' },
                { id: 'pickup & pace', label: 'pickup & pace' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setSelectedSegment('ALL');
                  }}
                  className={`px-5 py-2 text-sm font-khand font-bold uppercase tracking-wider transition-all ${
                    activeTab === id ? '' : 'text-slate-500 hover-text-dynamic'
                  }`}
                  style={activeTab === id ? { backgroundColor: BRAND_COLORS.primary, color: BRAND_COLORS.powder } : { '--hover-color': BRAND_COLORS.primary }}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* OVERVIEW TAB VIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">

            {/* Inlined Top KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full select-none">
              
              {/* REVENUE KPI CARD */}
              <div 
                className="p-5 flex flex-col justify-between h-44 shadow-md transition-transform hover:scale-[1.02] rounded-none border border-black/5"
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.powder}B3` }}>
                  REVENUE
                </span>
                <div className="flex flex-col gap-0.5 -mt-4">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.powder }}>
                    {formatCompactUSD(stats.totalRev)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator(stats.totalRev - stats.stlyRev < 0, BRAND_COLORS.powder, BRAND_COLORS.primary)}
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.powder }}>
                      {stats.totalRev - stats.stlyRev < 0 ? `(${formatCompact(Math.abs(stats.totalRev - stats.stlyRev)).toLowerCase()})` : `${formatCompact(stats.totalRev - stats.stlyRev).toLowerCase()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* OCCUPANCY KPI CARD */}
              <div 
                className="p-5 flex flex-col justify-between h-44 shadow-md transition-transform hover:scale-[1.02] rounded-none border border-black/5"
                style={{ backgroundColor: BRAND_COLORS.teal }}
              >
                <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: "#FFFFFFB3" }}>
                  OCCUPANCY
                </span>
                <div className="flex flex-col gap-0.5 -mt-4">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: "#FFFFFF" }}>
                    {(stats.occupancy * 100).toFixed(1)}%
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator((stats.occupancy - stats.stlyOccupancy) < 0, "#FFFFFF", BRAND_COLORS.teal)}
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: "#FFFFFF" }}>
                      {`${Math.abs((stats.occupancy - stats.stlyOccupancy) * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* AVG RATE KPI CARD */}
              <div 
                className="p-5 flex flex-col justify-between h-44 shadow-md transition-transform hover:scale-[1.02] rounded-none border border-black/5"
                style={{ backgroundColor: BRAND_COLORS.cyan }}
              >
                <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.yellow}B3` }}>
                  AVG RATE
                </span>
                <div className="flex flex-col gap-0.5 -mt-4">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.yellow }}>
                    {formatPreciseCurrency(stats.avgADR)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator(stats.avgADR - stats.stlyADR < 0, BRAND_COLORS.yellow, BRAND_COLORS.cyan)}
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.yellow }}>
                      {`($${Math.abs(stats.avgADR - stats.stlyADR).toFixed(2)})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROOMS SOLD KPI CARD */}
              <div 
                className="p-5 flex flex-col justify-between h-44 shadow-md transition-transform hover:scale-[1.02] rounded-none border border-black/5"
                style={{ backgroundColor: BRAND_COLORS.aqua }}
              >
                <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.teal}B3` }}>
                  ROOMS SOLD
                </span>
                <div className="flex flex-col gap-0.5 -mt-4">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.teal }}>
                    {formatNumber(stats.totalNights)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator(stats.totalNights - stats.stlyNights < 0, BRAND_COLORS.teal, BRAND_COLORS.aqua)}
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.teal }}>
                      {formatNumber(Math.abs(stats.totalNights - stats.stlyNights))}
                    </span>
                  </div>
                </div>
              </div>

              {/* LEAD DAYS KPI CARD */}
              <div 
                className="p-5 flex flex-col justify-center items-center text-center h-44 shadow-md transition-transform hover:scale-[1.02] rounded-none border border-black/5"
                style={{ backgroundColor: BRAND_COLORS.powder }}
              >
                <h3 className="text-6xl font-khand font-bold tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>
                  {Math.round(stats.totalLead)}
                </h3>
                <p className="text-xs sm:text-sm font-khand font-bold uppercase tracking-wider mt-1" style={{ color: BRAND_COLORS.primary }}>
                  LEAD DAYS
                </p>
              </div>
            </div>

            {/* Inlined DOW and Pace Visualizers Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* INLINED DAY OF WEEK OCCUPANCY WIDGET */}
              <div className="lg:col-span-7">
                <div className="bg-[#fafafa] border-[3px] p-6 flex flex-col h-full relative rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-[3px] pb-5 mb-6 gap-4" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                    <div>
                      <h3 className="font-khand text-xl font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS.primary }}>
                        DAY OF WEEK OCCUPANCY
                      </h3>
                      <p className="text-xs font-medium tracking-wide uppercase" style={{ color: `${BRAND_COLORS.primary}99` }}>
                        HISTORICAL TREND FOR SELECTED PERIOD
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center p-1 border rounded-none text-xs" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                        <Layers size={12} className="ml-1" style={{ color: BRAND_COLORS.cyan }} />
                        <select
                          value={dowSegmentFilter}
                          onChange={(e) => setDowSegmentFilter(e.target.value)}
                          className="bg-transparent border-none py-0.5 pl-1.5 pr-6 text-[10px] font-bold tracking-wider uppercase cursor-pointer focus:ring-0 rounded-none"
                          style={{ color: BRAND_COLORS.primary }}>
                          <option value="TOTAL">ALL SEGMENTS</option>
                          <option value="TRANSIENT">TRANSIENT</option>
                          <option value="GROUP">GROUP</option>
                          {dynamicSegments.map(seg => (
                            <option key={seg} value={seg}>{seg}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center p-1 border rounded-none text-xs" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                        <Calendar size={12} className="ml-1" style={{ color: BRAND_COLORS.cyan }} />
                        <select
                          value={dowMonthFilter}
                          onChange={(e) => setDowMonthFilter(e.target.value)}
                          className="bg-transparent border-none py-0.5 pl-1.5 pr-6 text-[10px] font-khand font-bold tracking-wider uppercase cursor-pointer focus:ring-0 rounded-none"
                          style={{ color: BRAND_COLORS.primary }}>
                          <option value="YEAR">FULL YEAR</option>
                          {MONTH_ORDER.map(m => (
                            <option key={m} value={m}>{m} VIEW</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-3 sm:gap-4 flex-1 items-end pt-12 pb-2">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => {
                      const val = computedDOW[day];
                      const isHovered = hoveredDay === day || (!hoveredDay && day === "THU");

                      return (
                        <div 
                          key={day} 
                          className="flex flex-col items-center group cursor-pointer relative h-full justify-end"
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <div 
                            className={`absolute -top-7 transition-all duration-300 transform -translate-y-2 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-none shadow-md pointer-events-none z-10 ${
                              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                            }`} style={{ backgroundColor: BRAND_COLORS.primary }}
                          >
                            {val}%
                            <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: BRAND_COLORS.primary }}></div>
                          </div>

                          <div className="w-full border-2 rounded-none aspect-[1/3.5] flex flex-col justify-end p-0.5 overflow-hidden" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}1A` }}>
                            <div 
                              className="w-full rounded-none transition-all duration-500 ease-out"
                              style={{ height: `${val}%`, backgroundColor: BRAND_COLORS.cyan }}
                            />
                          </div>

                          <span className="text-[10px] sm:text-xs font-khand font-bold uppercase tracking-wider group-hover-text-dynamic mt-3" style={{ color: `${BRAND_COLORS.primary}99`, '--group-hover-color': BRAND_COLORS.primary }}>
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* INLINED SEGMENT PACE CHART WIDGET */}
              <div className="lg:col-span-5">
                <div className="bg-[#fafafa] border-[3px] p-6 flex flex-col h-full justify-between rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
                  <div>
                    <div className="flex justify-between items-start border-b-[3px] pb-5 mb-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                      <div>
                        <h3 className="font-khand text-xl font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS.primary }}>
                          PACE VS STLY
                        </h3>
                        <p className="text-xs font-medium tracking-wide uppercase" style={{ color: `${BRAND_COLORS.primary}99` }}>
                          HISTORICAL REVENUE COMPARISON
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 mt-1" style={{ color: BRAND_COLORS.cyan }} />
                    </div>
                    
                    <div className="space-y-4">
                      {displaySegments.map((seg, idx) => {
                        const isNegative = seg.variance < 0;

                        return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="w-full sm:w-1/3">
                              <span className="font-khand font-bold text-xs uppercase tracking-wider truncate block" style={{ color: BRAND_COLORS.primary }}>
                                {seg.name}
                              </span>
                            </div>

                            <div className="flex-1 flex items-center justify-between p-2 rounded-none border transition-colors" style={{ borderColor: `${BRAND_COLORS.primary}33`, backgroundColor: BRAND_COLORS.frost }}>
                              <span className="font-bold text-xs" style={{ color: BRAND_COLORS.primary }}>
                                {formatCurrency(seg.actual)}
                              </span>
                              
                              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-none" style={{ backgroundColor: isNegative ? `${BRAND_COLORS.red}1A` : `${BRAND_COLORS.cyan}1A`, color: isNegative ? BRAND_COLORS.red : BRAND_COLORS.teal }}>
                                {seg.variance >= 0 ? '+' : ''}{seg.variance.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {displaySegments.length === 0 && (
                        <p className="text-center py-8 text-xs font-khand font-bold uppercase tracking-wider opacity-60" style={{ color: BRAND_COLORS.primary }}>
                          No Segment Pacing Data Available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t-[3px] pt-4 mt-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: `${BRAND_COLORS.primary}1A`, color: `${BRAND_COLORS.primary}66` }}>
                    <span>STLY COMPARISON</span>
                    <span>{periodLabel}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Inlined Performance Summary and Segment Revenue Mix Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[3px] border-[3px] w-full shadow-md rounded-none" style={{ backgroundColor: BRAND_COLORS.primary, borderColor: BRAND_COLORS.primary }}>
              <div className="lg:col-span-2 bg-[#fafafa]">
                <div className="p-6 border-b-[3px] bg-[#fafafa] flex justify-between items-center" style={{ borderColor: BRAND_COLORS.primary }}>
                  <h3 className="font-khand uppercase font-bold tracking-wider text-lg">Performance Summary</h3>
                  <div className="text-xs font-bold text-white px-3 pt-[6px] pb-1 uppercase tracking-widest rounded-none font-khand" style={{ backgroundColor: BRAND_COLORS.cyan }}>{selectedYear} {scopeTitle}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[11px] font-khand uppercase tracking-widest border-b-[3px]" style={{ color: `${BRAND_COLORS.primary}99`, backgroundColor: `${BRAND_COLORS.frost}80`, borderColor: `${BRAND_COLORS.primary}1A` }}>
                      <tr>
                        <th className="px-6 py-4">Stay Month</th>
                        <th className="px-6 py-4">Revenue</th>
                        <th className="px-6 py-4">Occupancy</th>
                        <th className="px-6 py-4">Nights</th>
                        <th className="px-6 py-4">ADR</th>
                        <th className="px-6 py-4 text-right">ALOS</th>
                      </tr>
                    </thead>
                    <tbody className="font-roboto">
                      {monthlyTotals.filter(m => activeMonthsList.includes(m.month)).map((m, idx) => (
                        <tr key={idx} className="transition-colors group hover-bg-dynamic" style={{'--hover-bg-color': `${BRAND_COLORS.primary}0D`}}>
                          <td className="px-6 py-4 font-bold" style={{ color: BRAND_COLORS.primary }}>{m.month}</td>
                          <td className="px-6 py-4 font-medium">{formatCurrency(m.revenue)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center p-2 rounded-none text-xs font-bold" style={{ backgroundColor: BRAND_COLORS.primary, color: BRAND_COLORS.powder }}>
                              {(m.occupancy * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4" style={{ color: `${BRAND_COLORS.primary}CC` }}>{formatNumber(m.nights)}</td>
                          <td className="px-6 py-4 font-bold" style={{ color: BRAND_COLORS.cyan }}>{formatPreciseCurrency(m.adr)}</td>
                          <td className="px-6 py-4 text-right" style={{ color: `${BRAND_COLORS.primary}99` }}>{(m.alos || 0).toFixed(1)}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#fafafa] p-8 flex flex-col h-full border-l-[3px] lg:border-l-0" style={{ borderColor: BRAND_COLORS.primary }}>
                <h3 className="font-khand uppercase font-bold tracking-widest text-lg mb-8">Segment Revenue Mix</h3>
                <div className="space-y-6 flex-1">
                  {aggregatedSegments.slice(0, 7).map((s, i) => (
                    <div key={i} className="animate-in fade-in slide-in-from-right-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                        <span className="uppercase truncate pr-4" style={{ color: `${BRAND_COLORS.primary}CC` }}>{s.metric}</span>
                        <span className="font-khand text-sm" style={{ color: BRAND_COLORS.cyan }}>{formatCompact(s.revenue)}</span>
                      </div>
                      <div className="w-full h-2 overflow-hidden border rounded-none" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.aqua}1A` }}>
                        <div 
                          className="h-full transition-all duration-1000 ease-out rounded-none"
                          style={{ width: `${stats.totalRev > 0 ? (s.revenue / stats.totalRev) * 100 : 0}%`, backgroundColor: BRAND_COLORS.cyan }}
                        />
                      </div>
                    </div>
                  ))}
                  {aggregatedSegments.length === 0 && (
                    <p className="text-center py-12 text-sm" style={{ color: `${BRAND_COLORS.primary}66` }}>No segment data available for selection.</p>
                  )}
                </div>
                <button 
                  onClick={() => setActiveTab('segments')}
                  className="mt-12 w-full flex items-center justify-center gap-2 py-3.5 border-[3px] font-khand font-bold uppercase text-xs hover:text-white transition-all shadow-sm active:scale-95 rounded-none"
                  style={{ borderColor: BRAND_COLORS.primary, color: BRAND_COLORS.primary }}
                >
                  Segment Details <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* INLINED GUEST BEHAVIOR PROFILES MODULE */}
            <div className="bg-[#fafafa] border-[3px] p-8 md:p-10 w-full space-y-10 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-[3px] gap-4" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                <div>
                  <h3 className="font-khand text-2xl font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS.primary }}>
                    GUEST BEHAVIOR PROFILES
                  </h3>
                  <p className="text-xs font-medium tracking-wide uppercase" style={{ color: `${BRAND_COLORS.primary}99` }}>
                    LENGTH OF STAY AND BOOKING WINDOW DISTRIBUTIONS
                  </p>
                </div>
                
                <div className="flex items-center p-1.5 border rounded-none text-xs" style={{ backgroundColor: BRAND_COLORS.frost, borderColor: `${BRAND_COLORS.primary}33` }}>
                  <Layers size={14} className="ml-1" style={{ color: BRAND_COLORS.cyan }} />
                  <select
                    value={selectedBehaviorSegment}
                    onChange={(e) => setSelectedBehaviorSegment(e.target.value)}
                    className="bg-transparent border-none py-0.5 pl-2 pr-8 text-xs font-khand font-bold tracking-wider uppercase cursor-pointer focus:ring-0 rounded-none"
                    style={{ color: BRAND_COLORS.primary }}>
                    <option value="ALL">ALL SEGMENTS</option>
                    {behaviorProfileData.behaviorSegmentOptions.map(seg => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Length of Stay Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-3">
                  <h4 className="font-khand uppercase font-bold text-xl tracking-wider leading-none" style={{ color: BRAND_COLORS.primary }}>
                    LENGTH OF STAY
                  </h4>
                </div>
                <div className="lg:col-span-9 grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                  {behaviorProfileData.losConfig.map((item, idx) => (
                    <div key={idx} className="flex flex-col space-y-2">
                      <div className="aspect-square flex items-center justify-center font-khand font-bold text-3xl md:text-4xl shadow-sm rounded-none" style={item.style}>
                        {String(item.pct).padStart(2, '0')}%
                      </div>
                      <span className="text-[10px] font-khand uppercase font-bold text-center tracking-wider block" style={{ color: `${BRAND_COLORS.primary}99` }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Window Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-8 border-t" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                <div className="lg:col-span-3">
                  <h4 className="font-khand uppercase font-bold text-xl tracking-wider leading-none" style={{ color: BRAND_COLORS.primary }}>
                    LEAD WINDOW
                  </h4>
                </div>
                <div className="lg:col-span-9 grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                  {behaviorProfileData.leadConfig.map((item, idx) => (
                    <div key={idx} className="flex flex-col space-y-2">
                      <div className="aspect-square flex items-center justify-center font-khand font-bold text-3xl md:text-4xl shadow-sm rounded-none" style={item.style}>
                        {String(item.pct).padStart(2, '0')}%
                      </div>
                      <span className="text-[10px] font-khand font-bold uppercase text-center tracking-wider block leading-none" style={item.labelStyle}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* MONTHLY TRENDS TAB VIEW */}
        {activeTab === 'trends' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#fafafa] border-[3px] p-8 md:p-10 w-full flex flex-col md:flex-row md:justify-between md:items-center gap-8 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-5xl md:text-6xl font-khand font-bold uppercase tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>{scopeTitle}</h2>
                  {selectedSegment !== 'ALL' && (
                    <span className="text-sm font-khand font-bold uppercase tracking-widest px-3 py-1 bg-[#163666] text-[#B2D3DE] border" style={{ borderColor: BRAND_COLORS.cyan }}>
                      SEGMENT: {selectedSegment}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>Occupancy</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{`${(stats.occupancy * 100).toFixed(1)}%`}</p>
                    {renderVarianceTag(variances.occupancyDiff, 'percent')}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>Rooms Sold</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatNumber(stats.totalNights)}</p>
                    {renderVarianceTag(variances.nightsDiff, 'number')}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ADR</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(stats.avgADR)}</p>
                    {renderVarianceTag(variances.adrDiff, 'precise_currency')}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>RevPAR</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(stats.revpar)}</p>
                    {renderVarianceTag(variances.revparDiff, 'precise_currency')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end justify-center min-w-[240px] pt-4 md:pt-0 md:border-l-[3px] md:pl-10" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                <h3 className="text-2xl font-khand font-bold uppercase leading-none mb-2" style={{ color: BRAND_COLORS.primary }}>Revenue</h3>
                <p className="text-5xl md:text-6xl font-khand font-bold tracking-tight leading-none mb-2" style={{ color: BRAND_COLORS.primary }}>{formatCurrency(stats.totalRev)}</p>
                {renderVarianceTag(variances.revenueDiff, 'currency')}
              </div>
            </div>

            {/* Inlined Budget and Forecast Target Pacing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] border-[3px] w-full shadow-md rounded-none" style={{ backgroundColor: BRAND_COLORS.primary, borderColor: BRAND_COLORS.primary }}>
              
              {/* BUDGET PACING CARD */}
              <div className="bg-[#fafafa] p-8 flex flex-col justify-between transition-colors duration-200 rounded-none" style={{ color: BRAND_COLORS.primary }}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                  <div className="sm:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="flex gap-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>OCCP</p>
                        <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{`${(planningStats.budget.occupancy * 100).toFixed(1)}%`}</p>
                        {renderVarianceTag(targetVariances.budget.occupancyDiff, 'percent', 'to PY')}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ROOMS</p>
                        <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatNumber(planningStats.budget.rooms)}</p>
                        {renderVarianceTag(targetVariances.budget.roomsDiff, 'number', 'to PY')}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-5xl font-khand font-bold uppercase tracking-tight leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>Budget</h3>
                      <p className="text-3xl font-roboto font-bold tracking-tight leading-none mb-2" style={{ color: `${BRAND_COLORS.primary}E6` }}>{formatCurrency(planningStats.budget.revenue)}</p>
                      {renderVarianceTag(targetVariances.budget.revenueDiff, 'currency', 'to PY')}
                    </div>
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
                  <div className="sm:col-span-5 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                        <svg width={150} height={150} viewBox="0 0 150 150" className="transform -rotate-90">
                          <circle cx={75} cy={75} r={66} stroke={BRAND_COLORS.orange} strokeWidth={18} fill="transparent" />
                          <circle cx={75} cy={75} r={66} stroke={BRAND_COLORS.purple} strokeWidth={18} strokeDasharray={2 * Math.PI * 66} strokeDashoffset={(2 * Math.PI * 66) - (Math.min(100, targetVariances.budget.reachedPct) / 100) * (2 * Math.PI * 66)} fill="transparent" strokeLinecap="square" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute text-center flex flex-col font-roboto">
                          <span className="text-base font-bold leading-none" style={{ color: BRAND_COLORS.primary }}>{formatCompactUSD(stats.totalRev)}</span>
                          <span className="text-[8px] font-khand font-bold opacity-50 uppercase mt-1 tracking-wider">OTB REACH</span>
                          <span className="text-[10px] font-bold mt-0.5" style={{ color: BRAND_COLORS.purple }}>{targetVariances.budget.reachedPct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-roboto space-y-1 w-full max-w-[130px] border-t pt-2.5" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: BRAND_COLORS.purple }} /><span className="font-semibold" style={{ color: `${BRAND_COLORS.primary}CC` }}>OTB (Actuals)</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: BRAND_COLORS.orange }} /><span className="font-semibold truncate" style={{ color: `${BRAND_COLORS.primary}CC` }}>Budget Target</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t pt-6 mt-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ADR</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(planningStats.budget.adr)}</p>
                    {renderVarianceTag(targetVariances.budget.adrDiff, 'precise_currency', 'to PY')}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>REVPAR</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(planningStats.budget.revpar)}</p>
                    {renderVarianceTag(targetVariances.budget.revparDiff, 'precise_currency', 'to PY')}
                  </div>
                </div>
              </div>

              {/* FORECAST PACING CARD */}
              <div className="bg-[#fafafa] p-8 flex flex-col justify-between transition-colors duration-200 rounded-none" style={{ color: BRAND_COLORS.primary }}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                  <div className="sm:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="flex gap-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>OCCP</p>
                        <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{`${(planningStats.forecast.occupancy * 100).toFixed(1)}%`}</p>
                        {renderVarianceTag(targetVariances.forecast.occupancyDiff, 'percent', 'to PY')}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ROOMS</p>
                        <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatNumber(planningStats.forecast.rooms)}</p>
                        {renderVarianceTag(targetVariances.forecast.roomsDiff, 'number', 'to PY')}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-5xl font-khand font-bold uppercase tracking-tight leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>Forecast</h3>
                      <p className="text-3xl font-roboto font-bold tracking-tight leading-none mb-2" style={{ color: `${BRAND_COLORS.primary}E6` }}>{formatCurrency(planningStats.forecast.revenue)}</p>
                      {renderVarianceTag(targetVariances.forecast.revenueDiff, 'currency', 'to PY')}
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
                        <div className="absolute text-center flex flex-col font-roboto">
                          <span className="text-base font-bold leading-none" style={{ color: BRAND_COLORS.primary }}>{formatCompactUSD(stats.totalRev)}</span>
                          <span className="text-[8px] font-khand font-bold opacity-50 uppercase mt-1 tracking-wider">OTB REACH</span>
                          <span className="text-[10px] font-bold mt-0.5" style={{ color: BRAND_COLORS.purple }}>{targetVariances.forecast.reachedPct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-roboto space-y-1 w-full max-w-[130px] border-t pt-2.5" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: BRAND_COLORS.purple }} /><span className="font-semibold" style={{ color: `${BRAND_COLORS.primary}CC` }}>OTB (Actuals)</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: BRAND_COLORS.orange }} /><span className="font-semibold truncate" style={{ color: `${BRAND_COLORS.primary}CC` }}>Forecast Target</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t pt-6 mt-6" style={{ borderColor: `${BRAND_COLORS.primary}1A` }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>ADR</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(planningStats.forecast.adr)}</p>
                    {renderVarianceTag(targetVariances.forecast.adrDiff, 'precise_currency', 'to PY')}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: `${BRAND_COLORS.primary}80` }}>REVPAR</p>
                    <p className="text-2xl md:text-3xl font-khand font-bold leading-none mb-1" style={{ color: BRAND_COLORS.primary }}>{formatPreciseCurrency(planningStats.forecast.revpar)}</p>
                    {renderVarianceTag(targetVariances.forecast.revparDiff, 'precise_currency', 'to PY')}
                  </div>
                </div>
              </div>

            </div>

            {/* Inlined Monthly ADR and Rooms Sold Progression Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ADR Bar Chart */}
              <div className="bg-[#fafafa] p-6 border-[3px] w-full shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
                <h4 className="font-khand uppercase font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.primary }}>
                  <TrendingUp size={16} style={{ color: BRAND_COLORS.cyan }} /> Average Daily Rate (ADR) Progression {selectedSegment !== 'ALL' ? `(${selectedSegment})` : ''}
                </h4>
                <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
                  {[0, 0.25, 0.5, 0.75, 1].map(f => {
                    const maxVal = Math.max(...monthlyTotals.map(d => d.adr || 0), 1) * 1.15;
                    const y = 240 - 40 - ((maxVal * f / maxVal) * (240 - 25 - 40));
                    return (
                      <g key={f}>
                        <line x1={65} x2={580} y1={y} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                        <text x={55} y={y + 3} textAnchor="end" fontSize="10" className="font-bold font-roboto" fill={`${BRAND_COLORS.primary}80`}>
                          {formatCompact(maxVal * f)}
                        </text>
                      </g>
                    );
                  })}
                  {monthlyTotals.map((d, i) => {
                    const maxVal = Math.max(...monthlyTotals.map(item => item.adr || 0), 1) * 1.15;
                    const x = 65 + (i * (600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) + 5;
                    const bw = ((600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) * 0.7;
                    const bh = ((d.adr || 0) / maxVal) * (240 - 25 - 40);
                    const y = 240 - 40 - bh;
                    return (
                      <rect key={i} x={x} y={y} width={bw} height={Math.max(0, bh)} fill={BRAND_COLORS.cyan} className="transition-all duration-700 ease-out rounded-none" />
                    );
                  })}
                  {monthlyTotals.map((d, i) => {
                    const x = 65 + (i * (600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) + 5;
                    const bw = ((600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) * 0.7;
                    return (
                      <text key={i} x={x + bw / 2} y={216} textAnchor="middle" fontSize="10" className="font-khand font-bold" fill={BRAND_COLORS.primary}>{d.month}</text>
                    );
                  })}
                </svg>
              </div>

              {/* Rooms Sold Bar Chart */}
              <div className="bg-[#fafafa] p-6 border-[3px] w-full shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
                <h4 className="font-khand uppercase font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.primary }}>
                  <TrendingUp size={16} style={{ color: BRAND_COLORS.cyan }} /> Rooms Sold Progression {selectedSegment !== 'ALL' ? `(${selectedSegment})` : ''}
                </h4>
                <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
                  {[0, 0.25, 0.5, 0.75, 1].map(f => {
                    const maxVal = Math.max(...monthlyTotals.map(d => d.nights || 0), 1) * 1.15;
                    const y = 240 - 40 - ((maxVal * f / maxVal) * (240 - 25 - 40));
                    return (
                      <g key={f}>
                        <line x1={65} x2={580} y1={y} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                        <text x={55} y={y + 3} textAnchor="end" fontSize="10" className="font-bold font-roboto" fill={`${BRAND_COLORS.primary}80`}>
                          {formatNumber(maxVal * f)}
                        </text>
                      </g>
                    );
                  })}
                  {monthlyTotals.map((d, i) => {
                    const maxVal = Math.max(...monthlyTotals.map(item => item.nights || 0), 1) * 1.15;
                    const x = 65 + (i * (600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) + 5;
                    const bw = ((600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) * 0.7;
                    const bh = ((d.nights || 0) / maxVal) * (240 - 25 - 40);
                    const y = 240 - 40 - bh;
                    return (
                      <rect key={i} x={x} y={y} width={bw} height={Math.max(0, bh)} fill={BRAND_COLORS.primary} className="transition-all duration-700 ease-out rounded-none" />
                    );
                  })}
                  {monthlyTotals.map((d, i) => {
                    const x = 65 + (i * (600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) + 5;
                    const bw = ((600 - 65 - 20) / Math.max(monthlyTotals.length, 1)) * 0.7;
                    return (
                      <text key={i} x={x + bw / 2} y={216} textAnchor="middle" fontSize="10" className="font-khand font-bold" fill={BRAND_COLORS.primary}>{d.month}</text>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* SEGMENT ANALYSIS TAB VIEW */}
        {activeTab === 'segments' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-[#fafafa] border-[3px] p-8 shadow-sm rounded-none" style={{ borderColor: BRAND_COLORS.primary }}>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <div>
                   <h3 className="text-2xl font-khand uppercase font-bold" style={{ color: BRAND_COLORS.primary }}>Detailed Segment Breakdown</h3>
                   <p className="text-xs font-medium" style={{ color: `${BRAND_COLORS.primary}99` }}>Segment metrics for {selectedYear} {scopeTitle}</p>
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
                        <th className="px-6 py-5">Lead Window</th>
                     </tr>
                   </thead>
                   <tbody>
                     {aggregatedSegments.map((seg, idx) => (
                        <tr key={idx} className="transition-colors hover-bg-dynamic border-b" style={{'--hover-bg-color': `${BRAND_COLORS.primary}0D`, borderColor: `${BRAND_COLORS.primary}1A`}}>
                          <td className="px-6 py-5 font-bold text-sm" style={{ color: BRAND_COLORS.primary }}>{seg.metric}</td>
                          <td className="px-6 py-5 text-sm font-bold">{formatCurrency(seg.revenue)}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-2 border border-black/5 overflow-hidden rounded-none" style={{ backgroundColor: BRAND_COLORS.frost }}>
                                <div 
                                  className="h-full transition-all duration-1000 rounded-none" 
                                  style={{ width: `${stats.totalRev > 0 ? (seg.revenue / stats.totalRev) * 100 : 0}%`, backgroundColor: BRAND_COLORS.cyan }} 
                                />
                              </div>
                              <span className="text-[10px] font-bold" style={{ color: BRAND_COLORS.cyan }}>{stats.totalRev > 0 ? ((seg.revenue / stats.totalRev) * 100).toFixed(1) : 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm" style={{ color: `${BRAND_COLORS.primary}B3` }}>{formatNumber(seg.nights)}</td>
                          <td className="px-6 py-5 text-sm font-bold" style={{ color: BRAND_COLORS.cyan }}>{formatPreciseCurrency(seg.adr)}</td>
                          <td className="px-6 py-5 text-sm">
                            <div className="flex items-center gap-1.5 text-xs px-3 py-1 w-fit font-bold uppercase tracking-wider rounded-none" style={{ backgroundColor: BRAND_COLORS.frost, color: `${BRAND_COLORS.primary}99` }}>
                              <Clock size={12} /> {Math.round(seg.avgLead)}d
                            </div>
                          </td>
                        </tr>
                     ))}
                     {aggregatedSegments.length === 0 && (
                        <tr><td colSpan="6" className="text-center py-12 text-sm" style={{color: `${BRAND_COLORS.primary}66`}}>No segment data found for this selection.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}

        {/* PICKUP & PACE TAB VIEW */}
        {activeTab === 'pickup & pace' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
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
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.powder }}>
                      {paceTotals.paceVarPct.toFixed(1)}% YOY
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.teal }}>
                <span className="text-lg font-khand font-bold uppercase tracking-wider text-white/70">
                  ADR CHG
                </span>
                <div className="flex flex-col gap-0.5 -mt-6">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none text-white">
                    {stats.avgADR - stats.stlyADR >= 0 ? `+$${(stats.avgADR - stats.stlyADR).toFixed(2)}` : `-$${Math.abs(stats.avgADR - stats.stlyADR).toFixed(2)}`}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator(stats.avgADR - stats.stlyADR < 0, "#FFFFFF", BRAND_COLORS.teal)}
                    <span className="text-sm font-roboto font-medium tracking-normal text-white">
                      {stats.stlyADR > 0 ? `${(((stats.avgADR - stats.stlyADR) / stats.stlyADR) * 100).toFixed(1)}%` : '0.0%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.cyan }}>
                <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.yellow}B3` }}>
                  OTB Revenue
                </span>
                <div className="flex flex-col gap-0.5 -mt-6">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.yellow }}>
                    ${formatCompact(paceTotals.totalTY || stats.totalRev)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator(paceTotals.paceVar < 0, BRAND_COLORS.yellow, BRAND_COLORS.cyan)}
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.yellow }}>
                      (${formatCompact(Math.abs(paceTotals.paceVar))})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.aqua }}>
                <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: `${BRAND_COLORS.teal}B3` }}>
                  Avg LOS
                </span>
                <div className="flex flex-col gap-0.5 -mt-6">
                  <span className="text-4xl md:text-5xl font-khand font-bold uppercase tracking-normal leading-none" style={{ color: BRAND_COLORS.teal }}>
                    {(stats.avgALOS || 0).toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderIndicator(stats.avgALOS - 2.5 < 0, BRAND_COLORS.teal, BRAND_COLORS.aqua)}
                    <span className="text-sm font-roboto font-medium tracking-normal" style={{ color: BRAND_COLORS.teal }}>
                      Nights
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-center items-center text-center h-44 rounded-none shadow-md" style={{ backgroundColor: BRAND_COLORS.powder }}>
                <h3 className="text-6xl font-khand font-bold tracking-tight leading-none" style={{ color: BRAND_COLORS.primary }}>
                  {Math.round(stats.totalLead || 0)}
                </h3>
                <p className="text-xs sm:text-sm font-khand font-bold uppercase tracking-wider mt-1" style={{ color: BRAND_COLORS.primary }}>
                  LEAD DAYS
                </p>
              </div>

            </div>

            {/* Inlined Pace Comparison SVG Chart and Pickup Velocity SVG Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Pace Bar Comparison Chart */}
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
                            <text x={52} y={y + 4} textAnchor="end" className="font-roboto font-bold" fontSize="10" fill={`${BRAND_COLORS.primary}80`}>
                              {formatCompactUSD(val)}
                            </text>
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

                        const tyY = 20 + 220 - tyH;
                        const stlyY = 20 + 220 - stlyH;

                        return (
                          <g key={d.month || i}>
                            <rect x={groupX} y={tyY} width={barWidth} height={tyH} fill={BRAND_COLORS.cyan} />
                            <rect x={groupX + barWidth + 4} y={stlyY} width={barWidth} height={stlyH} fill={BRAND_COLORS.primary} />
                            <text
                              x={groupX + barWidth + 2}
                              y={268}
                              textAnchor="middle"
                              className="font-khand font-bold uppercase"
                              fontSize="11"
                              fill={BRAND_COLORS.primary}
                            >
                              {String(d.month).substring(0, 3).toUpperCase()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="flex items-center gap-2 text-xs font-khand font-bold uppercase" style={{ color: BRAND_COLORS.primary }}>
                        <div className="w-3 h-3" style={{ backgroundColor: BRAND_COLORS.cyan }}></div>
                        <span>TY OTB REVENUE</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-khand font-bold uppercase" style={{ color: BRAND_COLORS.primary }}>
                        <div className="w-3 h-3" style={{ backgroundColor: BRAND_COLORS.primary }}></div>
                        <span>STLY REVENUE</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm font-khand uppercase tracking-widest" style={{ color: `${BRAND_COLORS.primary}66` }}>
                    No Pace Data Found For Selection
                  </div>
                )}
              </div>

              {/* Pickup Velocity Logistic Curve Chart */}
              <div className="p-8 border-[3px] rounded-none" style={{ backgroundColor: BRAND_COLORS.white, borderColor: BRAND_COLORS.primary }}>
                <h3 className="font-khand uppercase font-bold tracking-wider text-xl mb-4" style={{ color: BRAND_COLORS.primary }}>
                  Occupancy Booking Window Pickup Velocity
                </h3>
                <div className="w-full overflow-x-auto select-none">
                  <svg viewBox="0 0 600 260" className="w-full h-auto select-none">
                    {[0, 25, 50, 75, 100].map((pct) => {
                      const y = 20 + 200 - (pct / 100) * 200;
                      return (
                        <g key={pct}>
                          <line x1={50} y1={y} x2={580} y2={y} stroke={BRAND_COLORS.frost} strokeWidth="2" strokeDasharray="3,3" />
                          <text x={42} y={y + 4} textAnchor="end" className="font-roboto font-bold" fontSize="10" fill={`${BRAND_COLORS.primary}80`}>
                            {`${pct}%`}
                          </text>
                        </g>
                      );
                    })}

                    {[90, 60, 30, 0].map((d) => {
                      const x = 50 + ((90 - d) / 90) * 530;
                      return (
                        <text key={d} x={x} y={248} textAnchor="middle" className="font-roboto font-bold" fontSize="10" fill={BRAND_COLORS.primary}>
                          {`${d}D`}
                        </text>
                      );
                    })}

                    {(() => {
                      const x0 = stats.totalLead || 15;
                      const k = 0.08;
                      const generatePickup = (d) => 100 / (1 + Math.exp(k * (d - x0)));

                      const points = [];
                      for (let d = 90; d >= 0; d -= 2) {
                        const pct = generatePickup(d);
                        const px = 50 + ((90 - d) / 90) * 530;
                        const py = 20 + 200 - (pct / 100) * 200;
                        points.push({ x: px, y: py });
                      }

                      const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
                      const markerX = 50 + ((90 - x0) / 90) * 530;
                      const markerPct = generatePickup(x0);
                      const markerY = 20 + 200 - (markerPct / 100) * 200;

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

            {/* Inlined Monthly Matrix Breakdown Table */}
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
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-xs font-khand uppercase tracking-widest opacity-60" style={{ color: BRAND_COLORS.primary }}>
                          No pacing entries found for selection
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Global Inlined Dashboard Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8 flex justify-between items-center text-[9px] font-khand font-bold uppercase tracking-widest" style={{ color: `${BRAND_COLORS.primary}80` }}>
        <span>METRICS BY REVREBEL</span>
        <span>BASED ON SELECTED PERIOD: {periodLabel}</span>
      </footer>
    </div>
  );
}