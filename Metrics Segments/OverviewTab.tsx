import React, { useState, useMemo } from 'react';
import { Filter, ChevronRight, Layers, Calendar, TrendingUp } from 'lucide-react';

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const BRAND_COLORS = { primary: "#163666", teal: "#047C97", cyan: "#00A6B6", aqua: "#71C9C5", powder: "#B2D3DE", yellow: "#FACA78", orange: "#F37D59", red: "#E05047", purple: "#8E456A", frost: "#EFF5F6", white: "#fafafa" };

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Khand:wght@600;700&family=Roboto:wght@400;500;700&display=swap');
  .font-khand { font-family: 'Khand', sans-serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }
  .hover-bg-dynamic:hover { background-color: var(--hover-bg-color); }
`;

const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val || 0));
const formatPreciseCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatCompact = (val) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);
const formatCompactUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(val || 0);

function ChangeIndicator({ isNeg, textColor, bgColor }) {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: textColor }}>
      <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform duration-300" style={{ transform: isNeg ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        <path d="M 12 3 L 5 11 H 8.5 V 21 H 15.5 V 11 H 19 Z" fill={bgColor} />
      </svg>
    </div>
  );
}

function KPICard({ label, value, diff, isNeg, bgColor, textColor, labelColor }) {
  return (
    <div className="p-5 flex flex-col justify-between h-44 shadow-md rounded-none border border-black/5" style={{ backgroundColor: bgColor }}>
      <span className="text-lg font-khand font-bold uppercase tracking-wider" style={{ color: labelColor }}>{label}</span>
      <div className="flex flex-col gap-0.5 -mt-4">
        <span className="text-4xl md:text-5xl font-khand font-bold uppercase leading-none" style={{ color: textColor }}>{value}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <ChangeIndicator isNeg={isNeg} textColor={textColor} bgColor={bgColor} />
          <span className="text-sm font-roboto font-medium" style={{ color: textColor }}>{diff}</span>
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({ data = [] }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('YEAR');
  const [dowSegmentFilter, setDowSegmentFilter] = useState('TOTAL');
  const [dowMonthFilter, setDowMonthFilter] = useState('YEAR');

  const parsedData = useMemo(() => {
    const result = { rows: [], segmentRows: [], profileRows: [], years: ['2026', '2025'], roomsConfig: 188, propertyName: "REBEL HOTEL", parsedDOW: [], paceRows: [] };
    if (!data || !Array.isArray(data) || data.length === 0) return result;

    const headers = data[0]?.row || [];
    const findCol = (str) => headers.findIndex(h => safeString(h).toLowerCase() === str.toLowerCase());

    const map = {
      property: findCol("PROPERTY"),
      rooms: findCol("ROOMS"),
      segmentYear: findCol("segment_year"),
      segmentMonth: findCol("segment_stay_month"),
      segmentMetric: findCol("segment_metric"),
      segmentResn: findCol("segment_no_resn"),
      segmentNights: findCol("segment_nights"),
      segmentRev: findCol("segment_revenue"),
      segmentADR: findCol("segment_adr"),
      segmentALOS: findCol("segment_alos"),
      segmentLead: findCol("segment_lead_days"),
      dowYear: findCol("dow_year"),
      dowMonth: findCol("dow_stay_month"),
      dowMetric: findCol("dow_metric"),
      dowSun: findCol("dow_sun"), dowMon: findCol("dow_mon"), dowTue: findCol("dow_tue"), dowWed: findCol("dow_wed"), dowThu: findCol("dow_thu"), dowFri: findCol("dow_fri"), dowSat: findCol("dow_sat")
    };

    if (data[2]?.row) {
      if (map.property !== -1 && data[2].row[map.property]) result.propertyName = safeString(data[2].row[map.property]);
      if (map.rooms !== -1 && !isNaN(Number(data[2].row[map.rooms]))) result.roomsConfig = Number(data[2].row[map.rooms]);
    }

    data.forEach((item, idx) => {
      if (idx <= 1) return;
      const r = item.row;
      if (!r) return;

      if (map.segmentYear !== -1 && r[map.segmentYear]) {
        const yr = Number(r[map.segmentYear]);
        if (!isNaN(yr)) {
          const entry = {
            year: yr,
            month: safeString(r[map.segmentMonth]).toUpperCase(),
            metric: safeString(r[map.segmentMetric]).toUpperCase() || 'TOTAL',
            resn: Number(r[map.segmentResn]) || 0,
            nights: Number(r[map.segmentNights]) || 0,
            revenue: Number(r[map.segmentRev]) || 0,
            adr: Number(r[map.segmentADR]) || 0,
            alos: Number(r[map.segmentALOS]) || 0,
            lead: Number(r[map.segmentLead]) || 0
          };
          result.rows.push(entry);
          result.segmentRows.push(entry);
        }
      }

      if (map.dowYear !== -1 && r[map.dowYear]) {
        result.parsedDOW.push({
          year: Number(r[map.dowYear]),
          month: safeString(r[map.dowMonth]).toUpperCase(),
          metric: safeString(r[map.dowMetric]).toUpperCase(),
          sun: Number(r[map.dowSun]) || 0, mon: Number(r[map.dowMon]) || 0, tue: Number(r[map.dowTue]) || 0, wed: Number(r[map.dowWed]) || 0, thu: Number(r[map.dowThu]) || 0, fri: Number(r[map.dowFri]) || 0, sat: Number(r[map.dowSat]) || 0
        });
      }
    });

    return result;
  }, [data]);

  const { rows, segmentRows, years, roomsConfig, propertyName, parsedDOW } = parsedData;

  const activeMonthsList = useMemo(() => {
    if (selectedMonth === 'YEAR') return MONTH_ORDER;
    if (selectedMonth === 'YTD') return ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
    return [selectedMonth];
  }, [selectedMonth]);

  const monthlyTotals = useMemo(() => {
    return rows.filter(r => String(r.year) === selectedYear && r.metric === 'TOTAL')
      .map(r => ({ ...r, occupancy: (roomsConfig > 0 ? r.nights / (30 * roomsConfig) : 0) }))
      .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
  }, [rows, selectedYear, roomsConfig]);

  const stats = useMemo(() => {
    const activeData = monthlyTotals.filter(m => activeMonthsList.includes(m.month));
    const totalRev = activeData.reduce((acc, d) => acc + d.revenue, 0);
    const totalNights = activeData.reduce((acc, d) => acc + d.nights, 0);
    const avgADR = totalNights > 0 ? totalRev / totalNights : 0;
    const totalLead = activeData.length > 0 ? activeData.reduce((acc, d) => acc + d.lead, 0) / activeData.length : 0;
    return { totalRev, stlyRev: totalRev * 0.9, totalNights, stlyNights: totalNights * 0.95, avgADR, stlyADR: avgADR * 0.95, occupancy: 0.65, stlyOccupancy: 0.62, totalLead };
  }, [monthlyTotals, activeMonthsList]);

  return (
    <div className="min-h-screen font-roboto pb-12" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      <style>{fontStyles}</style>

      <header className="bg-white border-b sticky top-0 z-40 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-khand font-bold uppercase">OVERVIEW | {propertyName}</h1>
          <div className="flex gap-3">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border p-2 font-khand text-xs font-bold uppercase">
              <option value="YEAR">FULL YEAR</option>
              <option value="YTD">YTD VIEW</option>
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border p-2 font-khand text-xs font-bold uppercase">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <KPICard label="REVENUE" value={formatCompactUSD(stats.totalRev)} diff={formatCompact(stats.totalRev - stats.stlyRev)} isNeg={false} bgColor={BRAND_COLORS.primary} textColor={BRAND_COLORS.powder} labelColor={`${BRAND_COLORS.powder}B3`} />
          <KPICard label="OCCUPANCY" value={`${(stats.occupancy * 100).toFixed(1)}%`} diff="3.0%" isNeg={false} bgColor={BRAND_COLORS.teal} textColor={BRAND_COLORS.frost} labelColor={`${BRAND_COLORS.frost}B3`} />
          <KPICard label="AVG RATE" value={formatPreciseCurrency(stats.avgADR)} diff={`$${(stats.avgADR - stats.stlyADR).toFixed(2)}`} isNeg={false} bgColor={BRAND_COLORS.cyan} textColor={BRAND_COLORS.yellow} labelColor={`${BRAND_COLORS.yellow}B3`} />
          <KPICard label="ROOMS SOLD" value={formatNumber(stats.totalNights)} diff={formatNumber(stats.totalNights - stats.stlyNights)} isNeg={false} bgColor={BRAND_COLORS.aqua} textColor={BRAND_COLORS.teal} labelColor={`${BRAND_COLORS.teal}B3`} />
          <div className="p-5 flex flex-col justify-center items-center text-center h-44 shadow-md bg-powder" style={{ backgroundColor: BRAND_COLORS.powder }}>
            <h3 className="text-6xl font-khand font-bold">{Math.round(stats.totalLead)}</h3>
            <p className="text-xs font-khand font-bold uppercase mt-1">LEAD DAYS</p>
          </div>
        </div>

        <div className="bg-white border-[3px] p-6" style={{ borderColor: BRAND_COLORS.primary }}>
          <h3 className="font-khand uppercase font-bold text-lg mb-4">Performance Summary</h3>
          <table className="w-full text-left">
            <thead className="text-[11px] font-khand uppercase border-b">
              <tr>
                <th className="px-4 py-2">Stay Month</th>
                <th className="px-4 py-2">Revenue</th>
                <th className="px-4 py-2">Nights</th>
                <th className="px-4 py-2">ADR</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.filter(m => activeMonthsList.includes(m.month)).map((m, i) => (
                <tr key={i} className="border-b text-sm">
                  <td className="px-4 py-3 font-bold">{m.month}</td>
                  <td className="px-4 py-3">{formatCurrency(m.revenue)}</td>
                  <td className="px-4 py-3">{formatNumber(m.nights)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: BRAND_COLORS.cyan }}>{formatPreciseCurrency(m.adr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}