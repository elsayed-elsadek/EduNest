import {  useState, useMemo, useRef, useEffect } from 'react';
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

// تعريف الأنواع (يمكنك نقلها لملف Types المستقل)
interface SalesData {
  month: string;
  value: number;
}

interface SalesChartProps {
  title?: string;
  data?: SalesData[];
}

// البيانات الافتراضية
const MOCK_DATA: Record<string, SalesData[]> = {
  '1month': [{ month: 'W1', value: 20000 }, { month: 'W2', value: 25000 }, { month: 'W3', value: 30000 }, { month: 'W4', value: 28000 }],
  '3months': [{ month: 'Jan', value: 60000 }, { month: 'Feb', value: 45000 }, { month: 'Mar', value: 80000 }],
  '6months': [{ month: 'Jan', value: 60000 }, { month: 'Feb', value: 45000 }, { month: 'Mar', value: 80000 }, { month: 'Apr', value: 65000 }, { month: 'May', value: 55000 }, { month: 'Jun', value: 70000 }],
  '1year': [{ month: 'Jan', value: 60000 }, { month: 'Feb', value: 45000 }, { month: 'Mar', value: 80000 }, { month: 'Apr', value: 65000 }, { month: 'May', value: 55000 }, { month: 'Jun', value: 70000 }, { month: 'Jul', value: 75000 }, { month: 'Aug', value: 68000 }, { month: 'Sep', value: 72000 }, { month: 'Oct', value: 78000 }, { month: 'Nov', value: 82000 }, { month: 'Dec', value: 85000 }],
};

const SalesChart: FC<SalesChartProps> = ({ title = 'Sales', data: externalData = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const periods = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 months' },
    { value: '1year', label: 'Last Year' },
  ];

  // دمج ذكي للبيانات باستخدام useMemo لضمان الأداء
  const currentData = useMemo(() => {
    const base = MOCK_DATA[selectedPeriod] || [];
    if (!externalData.length) return base;
    return base.map((b) => {
      const match = externalData.find((e) => e.month.toLowerCase() === b.month.toLowerCase());
      return match ? { ...b, value: match.value } : b;
    });
  }, [selectedPeriod, externalData]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition">
            <Calendar className="w-4 h-4 text-gray-500" />
            {periods.find(p => p.value === selectedPeriod)?.label}
            <ChevronDown className={`w-4 h-4 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {periods.map((p) => (
                <button key={p.value} onClick={() => { setSelectedPeriod(p.value); setIsDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition">
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={currentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip 
            cursor={{ fill: '#f9fafb' }} 
            content={({ active, payload, label }) => active && payload ? (
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
                <p className="opacity-70 mb-1">{label}</p>
                <p className="font-bold">{formatCurrency(payload[0].value as number)}</p>
              </div>
            ) : null} 
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
            {currentData.map((_, i) => <Cell key={i} fill="#154d71" />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;