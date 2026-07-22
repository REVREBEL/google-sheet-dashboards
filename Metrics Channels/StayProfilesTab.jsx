import React, { useState, useMemo, useEffect } from 'react';

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

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Khand:wght@600;700&family=Roboto:wght@400;500;700&display=swap');
  .font-khand { font-family: 'Khand', sans-serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }
`;

const factorial = (n) => {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';

function IconChevronDown({ size = 16, className = "", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function StayProfilesTab({ data = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('YTD');
  const [selectedYear, setSelectedYear] = useState('');
  const [profileMetricType, setProfileMetricType] = useState('CHANNEL');
  const [selectedChannelProfile, setSelectedChannelProfile] = useState('ALL');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const parsedData = useMemo(() => {
    const result = { years: [], channelRows: [], sourceRows: [], subsourceRows: [] };
    if (!data || !data.length) return result;

    /*
      ROW INDEX STRATEGY FOR GOOGLE SHEETS / BIGQUERY DATA:
      - Row 1 (idx 0): Identifier headers / clean column names
      - Row 2 (idx 1): Raw BigQuery source output headers (strictly bypassed)
      - Row 3+ (idx 2+): Primary data payload rows
    */
    const headers = data[0]?.row || [];
    const findCol = (str) => headers.findIndex(h => safeString(h).toLowerCase() === str.toLowerCase());

    const map = {
      channelYear: findCol("channel_year"),
      channelMonth: findCol("channel_stay_month"),
      channelMetric: findCol("channel_metric"),
      channelNights: findCol("channel_nights"),
      channelResn: findCol("channel_no_resn"),
      channelLead: findCol("channel_lead_days"),
      sourceMetric: findCol("source_metric"),
      sourceNights: findCol("source_nights"),
      sourceResn: findCol("source_no_resn"),
      sourceLead: findCol("source_lead_days")
    };

    data.forEach((item, idx) => {
      if (idx <= 1) return;
      const r = item.row;
      if (!r) return;

      if (map.channelYear !== -1 && r[map.channelYear]) {
        result.channelRows.push({
          year: Number(r[map.channelYear]),
          month: safeString(r[map.channelMonth]).toUpperCase(),
          metric: safeString(r[map.channelMetric]),
          nights: Number(r[map.channelNights]) || 0,
          resn: Number(r[map.channelResn]) || 0,
          lead: Number(r[map.channelLead]) || 0
        });
      }
    });

    const yrSet = new Set(result.channelRows.map(r => String(r.year)));
    result.years = yrSet.size > 0 ? Array.from(yrSet).sort().reverse() : ["2026", "2025"];
    return result;
  }, [data]);

  const { years, channelRows, sourceRows, subsourceRows } = parsedData;

  useEffect(() => {
    if (years.length > 0 && (!selectedYear || !years.includes(selectedYear))) setSelectedYear(years[0]);
  }, [years, selectedYear]);

  const activeMonthsList = useMemo(() => {
    if (selectedMonth === 'YEAR') return MONTH_ORDER;
    if (selectedMonth === 'YTD') return MONTH_ORDER.slice(0, 7);
    return [selectedMonth];
  }, [selectedMonth]);

  const currentMetricOptions = useMemo(() => {
    const list = Array.from(new Set(channelRows.map(d => safeString(d.metric)))).filter(Boolean);
    return list;
  }, [channelRows]);

  const stayProfilesMetrics = useMemo(() => {
    let activeSet = channelRows;
    const yrNum = Number(selectedYear) || 2026;
    let filtered = activeSet.filter(d => d.year === yrNum && activeMonthsList.includes(d.month));

    if (selectedChannelProfile !== 'ALL') {
      filtered = filtered.filter(d => safeString(d.metric).toUpperCase() === safeString(selectedChannelProfile).toUpperCase());
    }

    const totalNights = filtered.reduce((sum, d) => sum + (d.nights || 0), 0);
    const totalRes = filtered.reduce((sum, d) => sum + (d.resn || 0), 0);
    const leadSum = filtered.reduce((sum, d) => sum + (d.lead || 0), 0);
    const leadCount = filtered.length || 1;

    let targetALOS = totalRes > 0 ? totalNights / totalRes : 2.5;
    let targetLead = leadCount > 0 ? leadSum / leadCount : 15;

    const poisson = (lambda, k) => (Math.pow(Math.max(0.1, lambda), k) * Math.exp(-Math.max(0.1, lambda))) / factorial(k);

    const rawStay = Array.from({ length: 7 }, (_, i) => poisson(Math.max(0.5, targetALOS - 0.5), i + 1));
    const sumStay = rawStay.reduce((a, b) => a + b, 0) || 1;
    const stayNights = rawStay.map(v => Math.round((v / sumStay) * 100));

    const rawLead = Array.from({ length: 7 }, (_, i) => poisson(Math.max(0.1, targetLead / 10), i));
    const sumLead = rawLead.reduce((a, b) => a + b, 0) || 1;
    const leadTimes = rawLead.map(v => Math.round((v / sumLead) * 100));

    return { stayNights, leadTimes };
  }, [channelRows, selectedChannelProfile, selectedYear, activeMonthsList]);

  return (
    <div className="min-h-screen font-roboto select-none" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />

      <header className="bg-white border-b sticky top-0 z-40 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-khand font-bold tracking-wider">STAY PROFILES & DEMOGRAPHICS</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white p-6 border-[3px] rounded-none flex justify-between items-center" style={{ borderColor: BRAND_COLORS.primary }}>
          <div className="relative">
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="border-[2px] bg-white px-4 py-2 font-khand font-bold text-sm flex items-center justify-between gap-2 w-[280px]" style={{ borderColor: BRAND_COLORS.primary }}>
              <span>{profileMetricType}: {selectedChannelProfile}</span>
              <IconChevronDown size={16} />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border-[2px] shadow-xl z-50 w-full" style={{ borderColor: BRAND_COLORS.primary }}>
                <div onClick={() => { setSelectedChannelProfile('ALL'); setIsProfileDropdownOpen(false); }} className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-xs font-khand font-bold">ALL METRICS</div>
                {currentMetricOptions.map(m => (
                  <div key={m} onClick={() => { setSelectedChannelProfile(m); setIsProfileDropdownOpen(false); }} className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-xs font-khand font-bold">{m}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-[3px] p-10 rounded-none shadow-md space-y-12" style={{ borderColor: BRAND_COLORS.primary }}>
          <div className="flex flex-col lg:flex-row justify-between gap-6 border-b pb-10">
            <h4 className="font-khand uppercase font-bold text-xl lg:max-w-xs">LENGTH OF STAY</h4>
            <div className="flex-1 grid grid-cols-4 md:grid-cols-7 gap-2">
              {stayProfilesMetrics.stayNights.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs font-bold font-khand mb-1">{idx + 1} {idx === 0 ? 'NIGHT' : 'NIGHTS'}</span>
                  <div className="w-full aspect-square flex justify-center items-center font-khand font-bold text-2xl" style={{ backgroundColor: BRAND_COLORS.teal, color: '#fff' }}>
                    {val}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <h4 className="font-khand uppercase font-bold text-xl lg:max-w-xs">BOOKING LEAD TIME</h4>
            <div className="flex-1 grid grid-cols-4 md:grid-cols-7 gap-2">
              {stayProfilesMetrics.leadTimes.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs font-bold font-khand mb-1">BUCKET {idx + 1}</span>
                  <div className="w-full aspect-square flex justify-center items-center font-khand font-bold text-2xl" style={{ backgroundColor: BRAND_COLORS.orange, color: '#fff' }}>
                    {val}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}