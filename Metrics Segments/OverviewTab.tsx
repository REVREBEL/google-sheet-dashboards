import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, Filter, ChevronRight, Calendar, Layers } from 'lucide-react';

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const BRAND_COLORS = { primary: "#163666", teal: "#047C97", cyan: "#00A6B6", aqua: "#71C9C5", powder: "#B2D3DE", yellow: "#FACA78", red: "#E05047", frost: "#EFF5F6", white: "#fafafa" };

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val || 0));
const formatPreciseCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatCompact = (val) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);
const formatCompactUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(val || 0);
const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';

export default function OverviewApp({ data = [] }) {
  // Everything must be kept in a single monolithic App component with all logic and JSX inlined directly inside App's top-level block and return statement.[cite: 1]
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('YEAR');
  const [selectedSegment, setSelectedSegment] = useState('ALL');
  const [dowSegmentFilter, setDowSegmentFilter] = useState('TOTAL');
  const [dowMonthFilter, setDowMonthFilter] = useState('YEAR');

  const parsedData = useMemo(() => {
    // Isolated data parsing for Overview
    const result = { rows: [], segmentRows: [], years: ['2026', '2025'], roomsConfig: 188, propertyName: "REBEL HOTEL", parsedDOW: [], paceRows: [] };
    if (!data || !Array.isArray(data) || data.length === 0) return result;

    const headers = data[0]?.row || [];
    const findCol = (str) => headers.findIndex(h => safeString(h).toLowerCase() === str.toLowerCase());
    const map = { property: findCol("PROPERTY"), rooms: findCol("ROOMS"), segmentYear: findCol("segment_year"), segmentMonth: findCol("segment_stay_month"), segmentMetric: findCol("segment_metric"), segmentNights: findCol("segment_nights"), segmentRev: findCol("segment_revenue"), segmentADR: findCol("segment_adr"), segmentALOS: findCol("segment_alos"), segmentLead: findCol("segment_lead_days"), dowYear: findCol("dow_year"), dowMonth: findCol("dow_stay_month"), dowMetric: findCol("dow_metric"), dowSun: findCol("dow_sun"), dowMon: findCol("dow_mon"), dowTue: findCol("dow_tue"), dowWed: findCol("dow_wed"), dowThu: findCol("dow_thu"), dowFri: findCol("dow_fri"), dowSat: findCol("dow_sat") };

    if (data[2]?.row) {
      if (map.rooms !== -1 && !isNaN(Number(data[2].row[map.rooms]))) result.roomsConfig = Number(data[2].row[map.rooms]);
      if (map.property !== -1) result.propertyName = safeString(data[2].row[map.property]) || result.propertyName;
    }

    data.forEach((item, idx) => {
      if (idx <= 1) return;
      const r = item.row;
      if (!r) return;
      
      if (map.segmentYear !== -1 && r[map.segmentYear]) {
        const entry = { year: Number(r[map.segmentYear]), month: safeString(r[map.segmentMonth]).toUpperCase(), metric: safeString(r[map.segmentMetric]).toUpperCase() || 'TOTAL', nights: Number(r[map.segmentNights]) || 0, revenue: Number(r[map.segmentRev]) || 0, adr: Number(r[map.segmentADR]) || 0, alos: Number(r[map.segmentALOS]) || 0, lead: Number(r[map.segmentLead]) || 0 };
        result.rows.push(entry);
        result.segmentRows.push(entry);
      }
      if (map.dowYear !== -1 && r[map.dowYear]) {
        result.parsedDOW.push({ year: Number(r[map.dowYear]), month: safeString(r[map.dowMonth]).toUpperCase(), metric: safeString(r[map.dowMetric]).toUpperCase(), sun: Number(r[map.dowSun]) || 0, mon: Number(r[map.dowMon]) || 0, tue: Number(r[map.dowTue]) || 0, wed: Number(r[map.dowWed]) || 0, thu: Number(r[map.dowThu]) || 0, fri: Number(r[map.dowFri]) || 0, sat: Number(r[map.dowSat]) || 0 });
      }
    });
    return result;
  }, [data]);

  const { rows, segmentRows, years, roomsConfig, propertyName, parsedDOW } = parsedData;
  const activeMonthsList = selectedMonth === 'YEAR' ? MONTH_ORDER : (selectedMonth === 'YTD' ? MONTH_ORDER.slice(0, 6) : [selectedMonth]);

  const monthlyTotals = useMemo(() => rows.filter(r => String(r.year) === selectedYear && (selectedSegment === 'ALL' ? r.metric === 'TOTAL' : r.metric.includes(selectedSegment.toUpperCase()))).map(r => ({ ...r, occupancy: r.nights / (30 * roomsConfig) })), [rows, selectedYear, selectedSegment, roomsConfig]);
  const stlyData = useMemo(() => rows.filter(r => String(r.year) === String(Number(selectedYear) - 1) && (selectedSegment === 'ALL' ? r.metric === 'TOTAL' : r.metric.includes(selectedSegment.toUpperCase()))).map(r => ({ ...r, occupancy: r.nights / (30 * roomsConfig) })), [rows, selectedYear, selectedSegment, roomsConfig]);
  
  const stats = useMemo(() => {
    const activeData = monthlyTotals.filter(m => activeMonthsList.includes(m.month));
    const activeStlyData = stlyData.filter(m => activeMonthsList.includes(m.month));
    const totalRev = activeData.reduce((acc, d) => acc + d.revenue, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.nights, 0);
    const stlyRev = activeStlyData.reduce((acc, d) => acc + d.revenue, 0);
    return { 
      totalRev, stlyRev, totalNights, stlyNights: activeStlyData.reduce((acc, d) => acc + d.nights, 0),
      avgADR: totalNights > 0 ? totalRev / totalNights : 0,
      stlyADR: activeStlyData.reduce((acc, d) => acc + d.nights, 0) > 0 ? stlyRev / activeStlyData.reduce((acc, d) => acc + d.nights, 0) : 0,
      occupancy: (totalNights / (activeMonthsList.length * 30 * roomsConfig)) || 0,
      stlyOccupancy: (activeStlyData.reduce((acc, d) => acc + d.nights, 0) / (activeMonthsList.length * 30 * roomsConfig)) || 0,
      totalLead: activeData.length > 0 ? activeData.reduce((acc, d) => acc + d.lead, 0) / activeData.length : 0
    };
  }, [monthlyTotals, stlyData, activeMonthsList, roomsConfig]);

  const aggregatedSegments = useMemo(() => Object.values(rows.filter(r => String(r.year) === selectedYear && r.metric !== 'TOTAL' && r.metric !== 'COMPLIMENTARY' && activeMonthsList.includes(r.month)).reduce((map, row) => {
    if (!map[row.metric]) map[row.metric] = { metric: row.metric, revenue: 0, nights: 0 };
    map[row.metric].revenue += row.revenue; map[row.metric].nights += row.nights;
    return map;
  }, {})).sort((a, b) => b.revenue - a.revenue), [rows, selectedYear, activeMonthsList]);

  return (
    <div className="min-h-screen font-roboto pb-12" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm p-6 flex flex-col gap-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">{propertyName} | OVERVIEW</h1>
        <div className="flex gap-4">
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border p-2">{years.map(y => <option key={y}>{y}</option>)}</select>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border p-2"><option value="YEAR">FULL YEAR</option></select>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* KPI Row Inlined */}
        <div className="grid grid-cols-5 gap-3">
          {/* Revenue KPI */}
          <div className="p-5 flex flex-col h-44 shadow-md text-white" style={{ backgroundColor: BRAND_COLORS.primary }}>
            <span className="text-lg font-bold">REVENUE</span>
            <span className="text-4xl mt-2">{formatCompactUSD(stats.totalRev)}</span>
          </div>
          {/* Occupancy KPI */}
          <div className="p-5 flex flex-col h-44 shadow-md text-white" style={{ backgroundColor: BRAND_COLORS.teal }}>
            <span className="text-lg font-bold">OCCUPANCY</span>
            <span className="text-4xl mt-2">{(stats.occupancy * 100).toFixed(1)}%</span>
          </div>
          {/* Lead Days KPI */}
          <div className="p-5 flex flex-col h-44 shadow-md justify-center items-center" style={{ backgroundColor: BRAND_COLORS.powder }}>
            <span className="text-6xl font-bold">{Math.round(stats.totalLead)}</span>
            <span className="text-sm font-bold">LEAD DAYS</span>
          </div>
        </div>

        {/* Data Tables Inlined */}
        <div className="grid grid-cols-3 gap-[3px] bg-white border-[3px]" style={{ borderColor: BRAND_COLORS.primary }}>
           <div className="col-span-2 p-6">
              <h3 className="font-bold text-lg mb-4">Performance Summary</h3>
              <table className="w-full text-left">
                  <thead><tr><th>Month</th><th>Revenue</th><th>Occupancy</th></tr></thead>
                  <tbody>
                      {monthlyTotals.map((m, i) => (
                          <tr key={i}><td>{m.month}</td><td>{formatCurrency(m.revenue)}</td><td>{(m.occupancy * 100).toFixed(1)}%</td></tr>
                      ))}
                  </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}