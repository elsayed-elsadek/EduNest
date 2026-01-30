
export interface SalesData {
  month: string;
  value: number;
  label?: string;
}

export interface SalesChartProps {
  data?: SalesData[];
  title?: string;
}