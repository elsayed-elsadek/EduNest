export interface SalesChartApi {
  month:        string;
  year:         number;
  totalRevenue: number;
}

export interface EnrollmentPaymentApi {
  studentFullName:        string;
  studentEmail:           string;
  studentProfileImageUrl: string | null;
  joinedDate:             string;   // ISO
  price:                  number;
  mentorName:             string;
  mentorshipTitle:        string;
  platformProfit:         number;
}

export interface PaymentsFullApiResponse {
  apiResponse: {
    data: {
      salesChart:          SalesChartApi[];
      enrollmentPayments: {
        content:       EnrollmentPaymentApi[];
        page:          number;
        size:          number;
        totalElements: number;
        totalPages:    number;
      };
    };
    message: string;
  };
}

export interface SalesChartPoint {
  date:   string;   
  amount: number;
}

export interface LedgerRecord {
  id:               number;   
  userName:         string;
  userAvatar?:      string;
  email:            string;
  mentorName:       string;
  mentorshipTitle:  string;
  date:             string;
  time:             string;
  amount:           string;
  platformProfit:   string;
}

// Component Props 

export interface FinancialHeaderProps {
  dateRange: string;
}

export interface SalesChartProps {
  data: SalesChartPoint[];
}

export interface LedgerFiltersProps {
  search:        string;
  onSearch:      (v: string) => void;
  onOpenFilters: () => void;
}

export interface LedgerRowProps {
  record: LedgerRecord;
}

export interface LedgerPaginationProps {
  currentPage:  number;
  totalPages:   number;
  totalRecords: number;
  perPage:      number;
  onPageChange: (page: number) => void;
}

export interface HistoricalLedgerProps {
  records:      LedgerRecord[];
  totalRecords: number;
  currentPage:  number;
  totalPages:   number;
  perPage:      number;
  search:       string;
  onSearch:     (v: string) => void;
  onPageChange: (page: number) => void;
}