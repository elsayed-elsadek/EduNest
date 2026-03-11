import { useState, useMemo, useRef, useEffect, type FC, memo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';

// Define types
interface SalesData {
  month: string;
  value: number;
}

interface SalesChartProps {
  title?: string;
  data?: SalesData[];
}

// Default mock data
const MOCK_DATA: Record<string, SalesData[]> = {
  '1month': [{ month: 'W1', value: 20000 }, { month: 'W2', value: 25000 }, { month: 'W3', value: 30000 }, { month: 'W4', value: 28000 }],
  '3months': [{ month: 'Jan', value: 60000 }, { month: 'Feb', value: 45000 }, { month: 'Mar', value: 80000 }],
  '6months': [{ month: 'Jan', value: 60000 }, { month: 'Feb', value: 45000 }, { month: 'Mar', value: 80000 }, { month: 'Apr', value: 65000 }, { month: 'May', value: 55000 }, { month: 'Jun', value: 70000 }],
  '1year': [{ month: 'Jan', value: 60000 }, { month: 'Feb', value: 45000 }, { month: 'Mar', value: 80000 }, { month: 'Apr', value: 65000 }, { month: 'May', value: 55000 }, { month: 'Jun', value: 70000 }, { month: 'Jul', value: 75000 }, { month: 'Aug', value: 68000 }, { month: 'Sep', value: 72000 }, { month: 'Oct', value: 78000 }, { month: 'Nov', value: 82000 }, { month: 'Dec', value: 85000 }],
};

const periods = [
  { value: '1month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 months' },
  { value: '1year', label: 'Last Year' },
];

// Memoized Tooltip component to avoid re-renders
const CustomTooltip = memo(({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { isEmpty: boolean } }>; label?: string }) => {
  if (active && payload && payload.length > 0) {
    const isEmpty = payload[0].payload.isEmpty;
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
        <p className="opacity-70 mb-1">{label}</p>
        <p className="font-bold">
          {isEmpty ? '$0' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// Memoized SalesChart component
const SalesChart: FC<SalesChartProps> = memo(({ title = 'Sales', data: externalData = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize chart data processing
  const chartData = useMemo(() => {
    const base = MOCK_DATA[selectedPeriod] || [];
    const data = externalData.length > 0 
      ? base.map((b) => {
          const match = externalData.find((e) => e.month.toLowerCase() === b.month.toLowerCase());
          return match ? { ...b, value: match.value } : b;
        })
      : base;
    
    return data.map(item => ({
      ...item,
      displayValue: item.value === 0 || item.value === null || item.value === undefined ? 1 : item.value,
      isEmpty: item.value === 0 || item.value === null || item.value === undefined
    }));
  }, [selectedPeriod, externalData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Memoize callback functions
  const handlePeriodChange = useMemo(() => (period: string) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  }, []);

  const toggleDropdown = useMemo(() => () => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const selectedLabel = periods.find(p => p.value === selectedPeriod)?.label;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            {selectedLabel}
            <ChevronDown className={`w-4 h-4 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {periods.map((p) => (
                <button 
                  key={p.value} 
                  onClick={() => handlePeriodChange(p.value)} 
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
          <Bar dataKey="displayValue" radius={[6, 6, 0, 0]} maxBarSize={45}>
            {chartData.map((entry, i) => (
              <Cell 
                key={i} 
                fill={entry.isEmpty ? "#e5e7eb" : "#154d71"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if data changes
  return (
    prevProps.title === nextProps.title &&
    prevProps.data === nextProps.data
  );
});

SalesChart.displayName = 'SalesChart';

export default SalesChart;

