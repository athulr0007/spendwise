import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { CalendarRange, Info, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORY_COLORS_HEX = {
  Food: '#10B981',        // Emerald-500
  Transport: '#0EA5E9',   // Sky-500
  Shopping: '#A855F7',    // Purple-500
  Bills: '#F59E0B',       // Amber-500
  Entertainment: '#EC4899',// Pink-500
  Other: '#64748B'        // Slate-500
};

export const Analytics = ({ trends, loading }) => {
  // Toggle states for category visibility in the charts
  const [activeLines, setActiveLines] = useState({
    Food: true,
    Transport: true,
    Shopping: true,
    Bills: true,
    Entertainment: true,
    Other: true,
    total: true
  });

  const toggleLine = (category) => {
    setActiveLines((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate monthly average spending across 6 months
  const validMonths = trends.length;
  const sumTotal = trends.reduce((acc, curr) => acc + curr.total, 0);
  const monthlyAverage = validMonths > 0 ? sumTotal / validMonths : 0;

  // Check if we have only single non-zero data point
  const nonZeroMonths = trends.filter((t) => t.total > 0).length;
  const isSingleDataPoint = nonZeroMonths <= 1;

  return (
    <div className="space-y-6">
      {/* Informative banner for single data point edge cases */}
      {isSingleDataPoint && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3 animate-fade-in-up">
          <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Trend analysis requires more data</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Currently displaying only one month of tracked records. Add expenses across different months (or use the seed script) to generate full historical curve comparisons.
            </p>
          </div>
        </div>
      )}

      {/* Unified Legend Bar for Interactive Toggle */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fade-in-up">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Toggle Chart Series visibility:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {Object.keys(CATEGORY_COLORS_HEX).map((cat) => {
            const isActive = activeLines[cat];
            const color = CATEGORY_COLORS_HEX[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleLine(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? color : '#CBD5E1' }}
                />
                {cat}
                {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            );
          })}
          <button
            onClick={() => toggleLine('total')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              activeLines.total
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeLines.total ? '#6366F1' : '#CBD5E1' }}
            />
            Bold Total
            {activeLines.total ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 6-Month Trend Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[420px] animate-fade-in-up">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Monthly Expenditure Curve</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rolling 6-month historical spending curves</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">Line Chart</span>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-slate-400">{payload[0].payload.month} {payload[0].payload.year}</p>
                          {payload.map((p) => (
                            <p key={p.name} className="flex justify-between gap-4">
                              <span style={{ color: p.color }}>{p.name}:</span>
                              <span className="font-bold">{formatCurrency(p.value)}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* Horizontal reference line showing spending average */}
                {monthlyAverage > 0 && (
                  <ReferenceLine
                    y={monthlyAverage}
                    stroke="#F43F5E"
                    strokeDasharray="4 4"
                    label={{
                      value: `Avg Spend: ₹${monthlyAverage.toFixed(0)}`,
                      position: 'top',
                      fill: '#F43F5E',
                      fontSize: 9,
                      fontWeight: 700
                    }}
                  />
                )}

                {/* Render categories lines depending on toggled state */}
                {Object.entries(CATEGORY_COLORS_HEX).map(([cat, color]) => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    name={cat}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: isSingleDataPoint ? 4 : 2 }}
                    activeDot={{ r: 6 }}
                    hide={!activeLines[cat]}
                  />
                ))}

                {/* Total sum line */}
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  strokeDasharray={isSingleDataPoint ? undefined : "3 3"}
                  dot={{ r: isSingleDataPoint ? 5 : 3 }}
                  activeDot={{ r: 7 }}
                  hide={!activeLines.total}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stacked Category Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[420px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Spending Composition Shift</h3>
              <p className="text-xs text-slate-400 mt-0.5">Month-by-month stacked comparison</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">Stacked Bar</span>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-slate-400">{payload[0].payload.month} {payload[0].payload.year}</p>
                          {payload.filter(p => p.name !== 'Total').map((p) => (
                            <p key={p.name} className="flex justify-between gap-4">
                              <span style={{ color: p.color }}>{p.name}:</span>
                              <span className="font-bold">{formatCurrency(p.value)}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Render categories stacked inside standard stackId */}
                {Object.entries(CATEGORY_COLORS_HEX).map(([cat, color]) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    name={cat}
                    fill={color}
                    stackId="a"
                    hide={!activeLines[cat]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
