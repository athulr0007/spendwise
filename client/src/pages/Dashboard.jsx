import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, IndianRupee, TrendingUp, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORY_COLORS_HEX = {
  Food: '#10B981',        // Emerald-500
  Transport: '#0EA5E9',   // Sky-500
  Shopping: '#A855F7',    // Purple-500
  Bills: '#F59E0B',       // Amber-500
  Entertainment: '#EC4899',// Pink-500
  Other: '#64748B'        // Slate-500
};

export const Dashboard = ({ summary, rawExpenses, activeMonth, loading }) => {
  const currentTotal = summary.total || 0;
  const currentCount = summary.count || 0;
  const previousTotal = summary.previousMonth?.total || 0;

  // Calculate daily average based on days elapsed in the month
  const calculateDailyAverage = () => {
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
    const [y, m] = activeMonth.split('-').map(Number);
    
    let days;
    if (activeMonth === currentMonthStr) {
      days = now.getDate(); // days elapsed in current month
    } else {
      days = new Date(y, m, 0).getDate(); // total days in that month
    }
    
    return days > 0 ? currentTotal / days : 0;
  };

  const dailyAverage = calculateDailyAverage();

  // Calculate percentage difference vs previous month
  const calculatePercentageDiff = () => {
    if (previousTotal === 0) {
      return { text: 'New Tracker', isIncrease: true };
    }
    const diff = ((currentTotal - previousTotal) / previousTotal) * 100;
    const isIncrease = diff >= 0;
    return {
      text: `${isIncrease ? '↑' : '↓'} ${Math.abs(diff).toFixed(0)}%`,
      isIncrease
    };
  };

  const percentageDiff = calculatePercentageDiff();

  // Prepare Donut Chart Data
  const donutData = Object.entries(summary.categories || {})
    .map(([category, amount]) => ({
      name: category,
      value: amount
    }))
    .filter((item) => item.value > 0);

  // Prepare Daily Spend Bar Chart Data
  const getDailySpendData = () => {
    const [y, m] = activeMonth.split('-').map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    
    const daysArray = Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      amount: 0
    }));

    // Aggregate spend per day
    rawExpenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      if (expDate.getFullYear() === y && (expDate.getMonth() + 1) === m) {
        const dayNum = expDate.getDate();
        if (daysArray[dayNum - 1]) {
          daysArray[dayNum - 1].amount += exp.amount;
        }
      }
    });

    return daysArray.map((d) => ({
      day: d.day,
      amount: parseFloat(d.amount.toFixed(2))
    }));
  };

  const dailySpendData = getDailySpendData();

  // Render donut empty state or content
  const isDonutEmpty = donutData.length === 0;
  const dummyDonutData = [{ name: 'No Data', value: 1 }];

  return (
    <div className="space-y-6">
      {/* 1. Stat Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Spend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden animate-fade-in-up">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month Total</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">
                {loading ? '...' : formatCurrency(currentTotal)}
              </h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-700">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Aggregated over</span>
            <span className="text-slate-700">{loading ? 0 : currentCount} transactions</span>
          </div>
        </div>

        {/* Card 2: Daily Average */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Average</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">
                {loading ? '...' : formatCurrency(dailyAverage)}
              </h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Active month:</span>
            <span className="text-slate-700">{activeMonth}</span>
          </div>
        </div>

        {/* Card 3: Comparison vs Last Month */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">vs Last Month</p>
              <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${
                loading ? 'text-slate-800' :
                percentageDiff.isIncrease ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {loading ? '...' : percentageDiff.text}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${
              percentageDiff.isIncrease ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {percentageDiff.isIncrease ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Prior Month:</span>
            <span className="text-slate-700">{formatCurrency(previousTotal)}</span>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Donut Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm lg:col-span-1 flex flex-col min-h-[380px] animate-fade-in-up">
          <h3 className="font-bold text-slate-800 text-base mb-4">Category Breakdown</h3>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin" />
            </div>
          ) : isDonutEmpty ? (
            /* Donut Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-32 h-32 relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dummyDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={65}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#F1F5F9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empty</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600">No expenses this month</p>
              <p className="text-xs text-slate-400 mt-1">Record a transaction to see slices</p>
            </div>
          ) : (
            /* Active Donut Content */
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS_HEX[entry.name] || '#64748B'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Label in the center hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">TOTAL</span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-1">
                    {formatCurrency(currentTotal).split('.')[0]}
                  </span>
                </div>
              </div>

              {/* Categorized Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium text-slate-500">
                {donutData.map((entry, i) => {
                  const pct = ((entry.value / currentTotal) * 100).toFixed(0);
                  const color = CATEGORY_COLORS_HEX[entry.name];
                  return (
                    <div key={entry.name} className="flex items-center gap-1.5 py-0.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate text-slate-700">{entry.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Daily Spend Bar Chart Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm lg:col-span-2 flex flex-col min-h-[380px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Daily Spending Trend</h3>
            <span className="text-xs font-semibold text-slate-400">Values in ₹ (INR)</span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
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
                    cursor={{ fill: '#F8FAFC' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs">
                            <p className="font-bold text-slate-400">Day {payload[0].payload.day} of {activeMonth}</p>
                            <p className="font-extrabold text-white mt-1 text-sm">{formatCurrency(payload[0].value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#475569" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
