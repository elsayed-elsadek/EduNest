
import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import type { SalesChartProps, SalesData } from './SalesChart.types';

const SalesChart: FC<SalesChartProps> = ({ 
  title = 'Sales',
  data: externalData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Period options
  const periods = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 months' },
    { value: '1year', label: 'Last Year' },
  ];

  // Data based on selected period (used as a base structure)
  const dataByPeriod: Record<string, SalesData[]> = {
    '1month': [
      { month: 'Week 1', value: 20000 },
      { month: 'Week 2', value: 25000 },
      { month: 'Week 3', value: 30000 },
      { month: 'Week 4', value: 28000 },
    ],
    '3months': [
      { month: 'Jan', value: 60000 },
      { month: 'Feb', value: 45000 },
      { month: 'Mar', value: 80000 },
    ],
    '6months': [
      { month: 'Jan', value: 60000 },
      { month: 'Feb', value: 45000 },
      { month: 'Mar', value: 80000 },
      { month: 'Apr', value: 65000 },
      { month: 'May', value: 55000 },
      { month: 'Jun', value: 70000 },
    ],
    '1year': [
      { month: 'Jan', value: 60000 },
      { month: 'Feb', value: 45000 },
      { month: 'Mar', value: 80000 },
      { month: 'Apr', value: 65000 },
      { month: 'May', value: 55000 },
      { month: 'Jun', value: 70000 },
      { month: 'Jul', value: 75000 },
      { month: 'Aug', value: 68000 },
      { month: 'Sep', value: 72000 },
      { month: 'Oct', value: 78000 },
      { month: 'Nov', value: 82000 },
      { month: 'Dec', value: 85000 },
    ],
  };

  const baseData = dataByPeriod[selectedPeriod as keyof typeof dataByPeriod] ?? [];

  const normalizeMonth = (month: string) =>
    month.toString().trim().slice(0, 3).toLowerCase();

  let currentData: SalesData[];

  if (externalData && externalData.length > 0 && baseData.length > 0) {
    // استخدم بيانات الـ API فوق الهيكل الافتراضي لنفس الشهور
    const externalMap = new Map<string, SalesData>();
    externalData.forEach((item) => {
      externalMap.set(normalizeMonth(item.month), item);
    });

    currentData = baseData.map((item) => {
      const key = normalizeMonth(item.month);
      const match = externalMap.get(key);

      return {
        month: item.month,
        value: match ? match.value : 0,
      };
    });
  } else if (externalData && externalData.length > 0) {
    // لا يوجد هيكل افتراضي مناسب، استخدم بيانات الـ API كما هي
    currentData = externalData;
  } else {
    // لا توجد بيانات من الـ API (أو رجعت مصفوفة فاضية):
    // نستخدم نفس الهيكل الزمني لكن بقيم = 0 عشان الأعمدة تبان فاضية
    currentData = baseData.map((item) => ({
      month: item.month,
      value: 0,
    }));
  }

  const maxValue = currentData.length
    ? Math.max(...currentData.map((d) => d.value))
    : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maxValue < 1000 ? 2 : 0,
    }).format(value);

  // Custom Tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
          <p className="text-[10px] text-gray-300">{label}</p>
          <p className="text-sm font-bold">
            {formatCurrency(payload[0].value as number)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        
        {/* Period Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {periods.find(p => p.value === selectedPeriod)?.label}
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => {
                    setSelectedPeriod(period.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    ${selectedPeriod === period.value 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={currentData}
          margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value as number)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar 
            dataKey="value" 
            radius={[8, 8, 0, 0]}
            maxBarSize={50}
            background={{ fill: '#E5E7EB', radius: [8, 8, 0, 0] }}
          >
            {currentData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill="#154d71"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;


