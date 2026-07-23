import React, { useState, useMemo } from 'react';

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const BRAND_COLORS = { primary: "#163666", teal: "#047C97", cyan: "#00A6B6", aqua: "#71C9C5", powder: "#B2D3DE", yellow: "#FACA78", red: "#E05047", frost: "#EFF5F6" };

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Khand:wght@600;700&family=Roboto:wght@400;500;700&display=swap');
  .font-khand { font-family: 'Khand', sans-serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }
`;

const safeString = (val) => (val !== null && val !== undefined) ? String(val).trim() : '';
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
const formatCompact = (val) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val || 0);

export default function PickupPaceTab({ data = [] }) {
  const [selectedYear, setSelectedYear] = useState('2026');

  const paceRows = useMemo(() => {
    if (!data || !data.length) return [];
    const headers = data[0]?.row || [];
    const yrCol = headers.findIndex(h => safeString(h).toLowerCase() === 'pace_year');
    const mCol = headers.findIndex(h => safeString(h).toLowerCase() === 'pace_stay_month');
    const tyCol = headers.findIndex(h => safeString(h).toLowerCase() === 'pace_ty_revenue');
    const stlyCol = headers.findIndex(h => safeString(h).toLowerCase() === 'pace_stly_revenue');

    const result = [];
    data.forEach((item, idx) => {
      if (idx <= 1) return;
      const r = item.row;
      if (r && String(r[yrCol]) === selectedYear) {
        result.push({
          month: safeString(r[mCol]).toUpperCase(),
          ty: Number(r[tyCol]) || 0,
          stly: Number(r[stlyCol]) || 0
        });
      }
    });

    return result.sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
  }, [data, selectedYear]);

  const paceTotals = useMemo(() => {
    const totalTY = paceRows.reduce((sum, d) => sum + d.ty, 0);
    const totalSTLY = paceRows.reduce((sum, d) => sum + d.stly, 0);
    return { totalTY, totalSTLY, paceVar: totalTY - totalSTLY };
  }, [paceRows]);

  return (
    <div className="min-h-screen font-roboto pb-12" style={{ backgroundColor: BRAND_COLORS.frost, color: BRAND_COLORS.primary }}>
      <style>{fontStyles}</style>

      <header className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-khand font-bold uppercase">PICKUP & PACE</h1>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border p-2 font-khand text-xs font-bold uppercase">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white border-[3px]" style={{ borderColor: BRAND_COLORS.primary }}>
            <span className="text-sm font-khand font-bold uppercase opacity-60">OTB Pace Variance</span>
            <h3 className="text-5xl font-khand font-bold" style={{ color: paceTotals.paceVar >= 0 ? BRAND_COLORS.cyan : BRAND_COLORS.red }}>
              {paceTotals.paceVar >= 0 ? `+$${formatCompact(paceTotals.paceVar)}` : `-$${formatCompact(Math.abs(paceTotals.paceVar))}`}
            </h3>
          </div>
          <div className="p-6 bg-white border-[3px]" style={{ borderColor: BRAND_COLORS.primary }}>
            <span className="text-sm font-khand font-bold uppercase opacity-60">Total OTB Revenue</span>
            <h3 className="text-5xl font-khand font-bold" style={{ color: BRAND_COLORS.primary }}>
              ${formatCompact(paceTotals.totalTY)}
            </h3>
          </div>
        </div>

        <div className="bg-white border-[3px] p-6" style={{ borderColor: BRAND_COLORS.primary }}>
          <h3 className="font-khand uppercase font-bold text-lg mb-4">Monthly Breakdown</h3>
          <table className="w-full text-left">
            <thead className="text-[11px] font-khand uppercase border-b">
              <tr>
                <th className="px-4 py-2">Stay Month</th>
                <th className="px-4 py-2 text-right">TY OTB Revenue</th>
                <th className="px-4 py-2 text-right">STLY Revenue</th>
                <th className="px-4 py-2 text-right">Variance</th>
              </tr>
            </thead>
            <tbody>
              {paceRows.map((m, i) => {
                const diff = m.ty - m.stly;
                return (
                  <tr key={i} className="border-b text-sm">
                    <td className="px-4 py-3 font-bold">{m.month}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(m.ty)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(m.stly)}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: diff >= 0 ? BRAND_COLORS.cyan : BRAND_COLORS.red }}>
                      {diff >= 0 ? `+${formatCurrency(diff)}` : `(${formatCurrency(Math.abs(diff))})`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}