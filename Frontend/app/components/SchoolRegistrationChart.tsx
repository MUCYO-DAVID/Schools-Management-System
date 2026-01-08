'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface School {
  id: string;
  name: string;
  created_at?: string;
}

interface SchoolRegistrationChartProps {
  schools: School[];
}

type TimePeriod = 'day' | 'week' | 'month';

export default function SchoolRegistrationChart({ schools }: SchoolRegistrationChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">School Registrations</h3>
            <p className="text-sm text-gray-500">Track new school registrations over time</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['day', 'week', 'month'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timePeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Registrations</p>
          <p className="text-2xl font-bold text-blue-700">{totalRegistrations}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Average per Period</p>
          <p className="text-2xl font-bold text-green-700">{averageRegistrations}</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Schools', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar
              dataKey="Schools Registered"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Schools Registered"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
