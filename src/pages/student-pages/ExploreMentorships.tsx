import { type FC, useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import MentorshipGrid from "../../components/student-components/mentorships/MentorshipGrid";
import Pagination from "../../components/student-components/mentorships/Pagination";
import MentorshipFilters from "../../components/student-components/mentorships/MentorshipFilters";
import { useMentorships } from '../../services/student-roleService/ExploreMentorships';
import { prefetchMentorshipDetails } from '../../services/student-roleService/mentorshipDetails.api';
import type { MentorshipFiltersType, MentorshipData } from '../../types/mentorship';
import Navbar from '../../components/student-components/common/Navbar/Navbar';
import Footer from '../../components/student-components/common/Footer/Footer';

const MAIN_CATEGORIES = ['Programming', 'Marketing', 'Business', 'Design', 'Data & AI', 'Personal Development'];

const normalizeCategory = (category: string | undefined): string => {
  return category?.trim().toLowerCase() || '';
};

const isMainCategory = (category: string | undefined): boolean => {
  if (!category) return false;
  const normalized = normalizeCategory(category);
  return MAIN_CATEGORIES.some(cat => normalizeCategory(cat) === normalized);
};


const ExploreMentorships: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<MentorshipFiltersType>({
    page: parseInt(searchParams.get('page') || '0'),
    size: 6,
    keyword: searchParams.get('keyword') || undefined,
    category: searchParams.get('category') || undefined,
  });

  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const nextFilters: MentorshipFiltersType = {
      page: parseInt(searchParams.get('page') || '0'),
      size: 6,
      keyword: searchParams.get('keyword') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    };

    const currentFiltersJson = JSON.stringify(filters);
    const nextFiltersJson = JSON.stringify(nextFilters);

    if (currentFiltersJson !== nextFiltersJson) {
      setFilters(nextFilters);
    }
  }, [searchParams, filters]);

  const apiFilters = useMemo(() => {
    const isOtherCategory = filters.category === 'Other';
    return {
      ...filters,
      
      size: isOtherCategory ? 100 : (filters.size || 6),
      page: isOtherCategory ? 0 : filters.page, 
      category: isOtherCategory ? undefined : filters.category, 
    };
  }, [filters]);

  const { data, isLoading, isError, error } = useMentorships(apiFilters);

  let mentorships = data?.apiResponse?.mentorShips?.content || [];
  let totalPages = data?.apiResponse?.mentorShips?.totalPages || 0;
  
  if (filters.category === 'Other') {
    const filteredMentorships = mentorships.filter((m: MentorshipData) =>
      !isMainCategory(m.category)
    );
    
    const pageSize = 6;
    const pageIndex = filters.page || 0;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    
    mentorships = filteredMentorships.slice(startIndex, endIndex);
    totalPages = Math.ceil(filteredMentorships.length / pageSize);
  }
  
  const currentPage = (filters.page || 0) + 1;

 
  const handleFiltersChange = useCallback((newFilters: MentorshipFiltersType) => {
    const updatedFilters = {
      page: newFilters.page ?? 0,
      size: 6,
      ...(newFilters.keyword && { keyword: newFilters.keyword }),
      ...(newFilters.category && { category: newFilters.category }),
      ...(newFilters.minPrice !== undefined && { minPrice: newFilters.minPrice }),
      ...(newFilters.maxPrice !== undefined && { maxPrice: newFilters.maxPrice }),
    };
    setFilters(updatedFilters);

    // Update URL search params
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set('keyword', newFilters.keyword);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.minPrice !== undefined && newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice !== undefined && newFilters.maxPrice < 2000) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.page && newFilters.page > 0) params.set('page', newFilters.page.toString());
    
    setSearchParams(params);
  }, [setSearchParams]);

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    const updatedFilters = {
      ...filters,
      page: newPage - 1, 
    };
    setFilters(updatedFilters);

    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.category) params.set('category', filters.category);
    if ((newPage - 1) > 0) params.set('page', (newPage - 1).toString());
    
    setSearchParams(params);

  };

useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}, [filters]);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Mobile Filter Drawer ── */}
      {/* Overlay backdrop */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Slide-in drawer from left */}
      <div
        className={`fixed top-13 left-0 h-[95vh] w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--primary-500)]" />
            Filters
          </h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer body – reuse the same MentorshipFilters */}
        <div className="overflow-y-auto h-[calc(100%-64px)] px-5 py-2">
          <MentorshipFilters
            initialFilters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8">
       {/* i will add this class name if back end says no max-w-7xl */}
        <div className=" mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">
            Discover Academic Mentorship
          </h1>
          <p className="text-gray-600 text-base max-w-3xl">
            Connect with world-class scholars and industry leaders. Professional guidance tailored
            for high-impact academic and career growth.
          </p>

       
        </div>
      </div>


      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">


        
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

   {/* Mobile Filter Button – visible only on small screens */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm w-[100px]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[var(--primary-500)]" />
            Filters
          </button>

          {/* Left Sidebar – visible only on large screens */}
          <div className="hidden lg:block lg:col-span-1">
            <MentorshipFilters initialFilters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Right Main Area - Grid */}
          <div className="lg:col-span-3">
            {/* Error State */}
            {isError && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-900 mb-1">Error loading mentorships</h3>
                  <p className="text-red-700 text-sm mb-3">
                    {error instanceof Error
                      ? error.message
                      : 'An error occurred while fetching mentorships.'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    🔄 Retry
                  </button>
                </div>
              </div>
            )}

            {/* Grid Section */}
            <MentorshipGrid
              mentorships={mentorships}
              isLoading={isLoading}
              onItemClick={(mentorship) => navigate(`/mentorships/${mentorship.id}`)}
              onItemHover={(mentorship) => prefetchMentorshipDetails(mentorship.id)}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}

            {/* No Results */}
            {!isLoading && mentorships.length === 0 && !isError && (
              <div className="mt-12 p-12 text-center">
                <p className="text-gray-500 text-lg">
                  No mentorships found. Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExploreMentorships;
