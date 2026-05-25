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
import { getDashboardRevenueChart } from '../../../../services/mentorDashboardService';
import { type SalesChartProps, type PeriodKey, type SalesData } from './SalesChart.types';

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
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodKey>(defaultPeriod);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const periodToMonths: Record<PeriodKey, number> = useMemo(
    () => ({
      '1month': 1,
      '3months': 3,
      '6months': 6,
      '1year': 12,
    }),
    []
  );

  const [remoteData, setRemoteData] = useState<SalesData[]>(() => {
    if (data && data.length > 0) return data;
    return MOCK_DATA['6months'];
  });

  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const abortRef = useRef<AbortController | null>(null);


  const chartData = useMemo(() => {
    if (isLoadingChart) return [];
    return remoteData;
  }, [remoteData, isLoadingChart]);

  const fetchChart = useCallback(
    async (period: PeriodKey) => {
      const months = periodToMonths[period];
      setIsLoadingChart(true);


      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await getDashboardRevenueChart(months);
        const raw = (res as { apiResponse?: { 'sales-chart'?: unknown } })
          ?.apiResponse?.['sales-chart'];

        const mapped: SalesData[] = Array.isArray(raw)
          ? raw
              .map((item) => {
                const obj = item as Record<string, unknown>;
                return {
                  month: String(obj.month ?? ''),
                  value: Number(obj.totalRevenue ?? 0),
                } satisfies SalesData;
              })
              .filter((d) => d.month)
          : [];

        setRemoteData(mapped.length ? mapped : MOCK_DATA[period]);
      } catch (e: unknown) {
        if ((e as { name?: string }).name === 'CanceledError') return;

      } finally {
        setIsLoadingChart(false);
      }
    },
    [periodToMonths]
  );


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

  useEffect(() => {
    // initial mount: if initial `data` came from parent, keep it until
    // user changes period. Otherwise fetch immediately.
    const shouldFetch = !(data && data.length > 0);
    if (shouldFetch) {
      void fetchChart(selectedPeriod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchChart(selectedPeriod);
  }, [selectedPeriod, fetchChart]);

  const handleSelect = useCallback(
    (period: PeriodKey) => {
      setSelectedPeriod(period);
      setIsOpen(false);
      if (onPeriodChange) {
        onPeriodChange(period);
      }
    },
    [onPeriodChange]
  );

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

export default memo(SalesChart, (prev, next) => {
  return (
    prev.title === next.title &&
    JSON.stringify(prev.data) === JSON.stringify(next.data) &&
    prev.defaultPeriod === next.defaultPeriod
  );
});