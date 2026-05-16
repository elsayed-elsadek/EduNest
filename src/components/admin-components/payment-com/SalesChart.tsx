import type { FC } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { SalesChartProps } from '../../../types/admin-role-types/admin-payment.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c2340] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
      {label}: ${payload[0].value}
    </div>
  );
};

const SalesChart: FC<SalesChartProps> = ({ data }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
    <h3 className="text-base font-bold text-gray-900 mb-4">
      Mentorship Sales Over Time (Last 30 Days)
    </h3>

    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#1D9E75" stopOpacity={0.30} />
              <stop offset="100%" stopColor="#1D9E75" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            tickFormatter={(v: number) => `$${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={45}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#0c2340', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0c2340"
            strokeWidth={2}
            fill="url(#salesGrad)"
            dot={{ r: 3.5, fill: '#0c2340', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#0f5e8b', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default SalesChart;