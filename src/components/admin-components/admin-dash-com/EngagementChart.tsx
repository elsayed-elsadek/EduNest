
import type { FC } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { EngagementChartProps } from '../../../types/admin-role-types/admin-dash.types';

export const CHART_RANGES = [
  { label: 'All',       months: 0  },
  { label: '3 Months',  months: 3  },
  { label: '6 Months',  months: 6  },
  { label: '12 Months', months: 12 },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f5e8b] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
      {label}: {payload[0].value} sessions
    </div>
  );
};

const EngagementChart: FC<EngagementChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full flex flex-col">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Engagement Metrics</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Active mentorship session density
        </p>
      </div>

      <div className="flex items-center gap-2">
        {CHART_RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => onRangeChange(r.label)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              selectedRange === r.label
                ? 'bg-[#0f5e8b] text-white border-[#0f5e8b]'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>

    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
      Sessions
    </p>

    <div className="flex-1 min-h-[240px]">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          No session data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#1D9E75" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#0f5e8b', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#1D9E75"
              strokeWidth={2.5}
              fill="url(#tealGrad)"
              dot={{ r: 4, fill: '#1D9E75', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#0f5e8b', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

export default EngagementChart;