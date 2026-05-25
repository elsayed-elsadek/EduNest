export type PeriodKey = '1month' | '3months' | '6months' | '1year';

export interface SalesData {
  month: string;
  value: number;
  fillColor?: string;
}

export interface SalesChartProps {
  title?: string;
  data?: SalesData[];
  defaultPeriod?: PeriodKey;
  onPeriodChange?: (period: PeriodKey) => void;
}