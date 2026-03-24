import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  type FC,
  memo,
} from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';

/* =======================
   Types
======================= */
interface SalesData {
  month: string;
  value: number;
  fillColor?: string;
}

interface SalesChartProps {
  title?: string;
  data?: SalesData[];
  defaultPeriod?: PeriodKey;
}

type PeriodKey = '1month' | '3months' | '6months' | '1year';

/* =======================
   Constants
======================= */
const PERIODS: { value: PeriodKey; label: string }[] = [
  { value: '1month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' },
];

const MOCK_DATA: Record<PeriodKey, SalesData[]> = {
  '1month': [
    { month: 'W1', value: 20000 },
    { month: 'W2', value: 25000 },
    { month: 'W3', value: 30000 },
    { month: 'W4', value: 28000 },
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

/* =======================
   Utils
======================= */
const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const formatYAxis = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return value.toString();
};

const normalizeChartData = (data: SalesData[]) => {
  if (!data || !Array.isArray(data)) return [];
  return data
    .map((item) => ({
      month: String(item.month || ''),
      value: Number(item.value) || 0,
      fillColor: item.fillColor,
    }))
    .filter((item) => item.month);
};

/* =======================
   Tooltip (Memoized)
======================= */
const CustomTooltip = memo(
  ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
        <p className="opacity-70 mb-1 font-medium">{label}</p>
        <p className="font-bold text-gray-300">
          {formatNumber(payload[0].value)}
        </p>
      </div>
    );
  }
);

CustomTooltip.displayName = 'CustomTooltip';

/* =======================
   Main Component
======================= */
const SalesChart: FC<SalesChartProps> = ({
  title = 'Sales',
  data,
  defaultPeriod = '6months',
}) => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodKey>(defaultPeriod);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =======================
     Derived Data
  ======================= */
  const chartData = useMemo(() => {
    let sourceData = data;

    if (sourceData === undefined) {
      // If no data prop is passed at all, show mock data
      sourceData = MOCK_DATA[selectedPeriod];
    } else if (sourceData.length === 0) {
      // If data is provided but it's an empty array (Sales = 0),
      // we generate empty columns based on the current selected period's months
      sourceData = MOCK_DATA[selectedPeriod].map((item) => ({
        ...item,
        value: 0,
      }));
    }

    return normalizeChartData(sourceData);
  }, [selectedPeriod, data]);

  const selectedLabel = useMemo(
    () => PERIODS.find((p) => p.value === selectedPeriod)?.label,
    [selectedPeriod]
  );

  /* =======================
     Handlers (Stable)
  ======================= */
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((period: PeriodKey) => {
    setSelectedPeriod(period);
    setIsOpen(false);
  }, []);

  /* =======================
     Outside Click
  ======================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* =======================
     Render
  ======================= */
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            {selectedLabel}
            <ChevronDown
              className={`w-4 h-4 transition ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handleSelect(p.value)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!chartData.length ? (
        <div className="flex flex-col items-center justify-center h-[280px] bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Calendar className="w-12 h-12 mb-3 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Sales Data Available
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs text-center">
            There is currently no revenue data to display for the selected period. Let's make some sales!
          </p>
        </div>
      ) : (
        /* Chart */
        <div className="w-full h-[280px]">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: -5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                width={50}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#0f5e8b"
                barSize={40}
                animationDuration={1500}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.fillColor ?? '#0f5e8b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

/* =======================
   Memo Export (Smart Compare)
======================= */
export default memo(SalesChart, (prev, next) => {
  return (
    prev.title === next.title &&
    JSON.stringify(prev.data) === JSON.stringify(next.data) &&
    prev.defaultPeriod === next.defaultPeriod
  );
});