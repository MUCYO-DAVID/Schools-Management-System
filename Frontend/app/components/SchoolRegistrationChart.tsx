'use client';

import { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface School {
  id: string;
  name: string;
  created_at?: string;
  type?: string;
}

interface SchoolRegistrationChartProps {
  schools: School[];
}

type TimePeriod = 'day' | 'week' | 'month';

export default function SchoolRegistrationChart({ schools }: SchoolRegistrationChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const palette = ['#38bdf8', '#8b5cf6', '#34d399'];

  const chartData = useMemo(() => {
    if (!schools || schools.length === 0) return [];

    const now = new Date();
    const dataMap = new Map<string, number>();

    // Initialize data points based on time period
    if (timePeriod === 'day') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        dataMap.set(key, 0);
      }
    } else if (timePeriod === 'week') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        dataMap.set(key, 0);
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        dataMap.set(key, 0);
      }
    }

    // Count schools by time period
    schools.forEach((school) => {
      if (!school.created_at) return;

      const schoolDate = new Date(school.created_at);
      let key: string;

      if (timePeriod === 'day') {
        key = schoolDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (timePeriod === 'week') {
        const weekStart = new Date(schoolDate);
        weekStart.setDate(schoolDate.getDate() - schoolDate.getDay());
        key = `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        key = schoolDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      if (dataMap.has(key)) {
        dataMap.set(key, (dataMap.get(key) || 0) + 1);
      }
    });

    return Array.from(dataMap.entries()).map(([name, value]) => ({
      name,
      'Schools Registered': value,
    }));
  }, [schools, timePeriod]);

  const totalRegistrations = chartData.reduce((sum, item) => sum + item['Schools Registered'], 0);
  const averageRegistrations = chartData.length > 0 ? (totalRegistrations / chartData.length).toFixed(1) : 0;
  const typeBreakdown = useMemo(() => {
    const publicCount = schools.filter((school) => school.type === 'Public').length;
    const privateCount = schools.filter((school) => school.type === 'Private').length;
    const otherCount = schools.filter((school) => school.type && school.type !== 'Public' && school.type !== 'Private').length;

    return [
      { name: 'Public', value: publicCount, color: '#38bdf8' },
      { name: 'Private', value: privateCount, color: '#8b5cf6' },
      { name: 'Other', value: otherCount, color: '#34d399' },
    ].filter((item) => item.value > 0);
  }, [schools]);

  const peakPeriod = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((best, current) =>
      current['Schools Registered'] > best['Schools Registered'] ? current : best
    );
  }, [chartData]);

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-300">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">School Registrations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track new school registrations over time</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/90 bg-white/80 p-1.5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          {(['day', 'week', 'month'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${timePeriod === period
                  ? 'bg-slate-900 text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.7)] dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-[18px] border border-white/80 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Registrations</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{totalRegistrations}</p>
        </div>
        <div className="rounded-[18px] border border-white/80 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Average per Period</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{averageRegistrations}</p>
        </div>
        <div className="rounded-[18px] border border-white/80 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <PieChartIcon className="h-4 w-4" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Peak Period</p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {peakPeriod ? peakPeriod.name : 'No data'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {peakPeriod ? `${peakPeriod['Schools Registered']} registrations` : 'Waiting for registration activity'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <div className="rounded-[20px] border border-white/90 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Registration Trend</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selected time range</p>
            </div>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="schoolRegistrationsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  height={56}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Schools', angle: -90, position: 'insideLeft', fill: isDark ? '#94a3b8' : '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px -32px rgba(15, 23, 42, 0.35)',
                    color: isDark ? '#e2e8f0' : '#0f172a',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', color: isDark ? '#cbd5e1' : '#334155' }} />
                <Bar
                  dataKey="Schools Registered"
                  fill="url(#schoolRegistrationsFill)"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={42}
                  name="Schools Registered"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[20px] border border-white/90 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">School Type Split</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Public vs private distribution</p>
          </div>

          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px -32px rgba(15, 23, 42, 0.35)',
                    color: isDark ? '#e2e8f0' : '#0f172a',
                  }}
                />
                <Pie
                  data={typeBreakdown.length ? typeBreakdown : [{ name: 'No data', value: 1, color: isDark ? '#334155' : '#cbd5e1' }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={4}
                >
                  {(typeBreakdown.length ? typeBreakdown : [{ name: 'No data', value: 1, color: isDark ? '#334155' : '#cbd5e1' }]).map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.color || palette[index % palette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {(typeBreakdown.length ? typeBreakdown : [{ name: 'No data', value: 0, color: isDark ? '#334155' : '#cbd5e1' }]).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
