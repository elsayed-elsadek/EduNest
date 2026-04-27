export interface MentorshipData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  mentorName: string;
  price: number;
  discountPercentage: number;
  priceAfterDiscount: number;
  duration: number;
  coverImageUrl: string | null;

}

export interface MentorshipResponse {
  apiResponse: {
    mentorShips: {
      content: MentorshipData[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      empty: boolean;
    };
  };
}

export interface MentorshipFiltersType {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}
