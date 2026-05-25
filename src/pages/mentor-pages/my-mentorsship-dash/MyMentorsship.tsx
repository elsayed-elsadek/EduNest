import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import DashLayout from '../../../components/layout/Dash-layout';
import MentorshipTable from '../../../components/mentor-components/my-mentorships-com/MentorshipTable/MentorshipTable';
import Pagination from '../../../components/common/Pagination/Pagination';
import { useMentorshipsWithTransform, useDeleteMentorship } from '../../../hooks/useMentorships';
import { useAuthStore } from '../../../store/authStore';
import type { Mentorship } from '../../../types/mentorship.types';

type FilterStatus = 'all' | 'active' | 'draft' | 'completed';

const MentorshipsList: FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // جعلناها 6 لتتطابق مع طلبك في الـ API
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const pageIndex = currentPage - 1;

  // Data Fetching
  const { data, isLoading, error, refetch } = useMentorshipsWithTransform(pageIndex, itemsPerPage);
  const deleteMutation = useDeleteMentorship();

  // Extract variables from data
  const mentorships: Mentorship[] = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // الفلترة محلياً (Client-side Filtering)
  const filteredMentorships = useMemo(() => {
    if (statusFilter === 'all') return mentorships;
    return mentorships.filter((item) => item.status === statusFilter);
  }, [statusFilter, mentorships]);

  // Handlers
  const handleFilterChange = (filter: FilterStatus) => {
    setStatusFilter(filter);
    setIsFilterOpen(false);
  };

  const handleItemsPerPageChange = (val: number | string) => {
    setItemsPerPage(Number(val));
    setCurrentPage(1); 
  };

  const handleDeleteSuccess = (toastId: string) => {
    toast.dismiss(toastId);
    toast.success('Mentorship deleted successfully');
  };

  const handleDeleteError = (err: unknown) => {
    const axiosErr = err as { response?: { data?: { errorMessages?: { error?: string } } } };
    const msg = axiosErr.response?.data?.errorMessages?.error ?? 'Failed to delete mentorship';
    console.error('❌ Error deleting mentorship:', msg);
    toast.error(msg);
  };

  const confirmAndDeleteMentorship = (id: string) => {
    toast((t) => (
      <div>
        <p className="text-sm font-semibold text-gray-900">Delete mentorship?</p>
        <p className="text-xs text-gray-500 mt-1">
          This action cannot be undone. Are you sure you want to continue?
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteMutation.mutate(id, {
                onSuccess: () => handleDeleteSuccess(t.id),
                onError: handleDeleteError,
              });
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  // Render Helpers
  const renderLoadingState = () => (
    <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-gray-700 font-semibold">Loading...</p>
        <p className="text-gray-500 text-sm mt-1">Fetching your mentorships</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-gray-700 font-semibold">Error Loading Mentorships</p>
        <p className="text-gray-500 text-sm mt-1">Please try again later</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => {
    const isTotallyEmpty = totalElements === 0;
    
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-700 font-semibold">
            {isTotallyEmpty ? 'No Mentorships Yet' : `No ${statusFilter} Mentorships on this page`}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {isTotallyEmpty
              ? 'Create your first mentorship to get started'
              : 'Try changing the filter or moving to another page.'}
          </p>
          {isTotallyEmpty && (
            <button
              onClick={() => navigate('/mentor/mentorships/create')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-dark)] transition-colors"
            >
              Create Mentorship
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashLayout pageTitle="Dashboard / My Mentorships">
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-screen px-0 md:px-8 md:pt-4 pb-8">
        
        {/* Header Section: Add button */}
        <div className="flex justify-end mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <button
            onClick={() => navigate('/mentor/mentorships/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] px-6 rounded-xl text-white text-sm font-bold bg-primary shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Table Header / Title & Filter */}
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 md:border-none">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Mentorships List</h1>
              <p className="text-sm text-gray-500 mt-1">
                Total <span className="text-gray-900 font-bold">{totalElements}</span>
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-label="Filter mentorships"
                className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 capitalize"
              >
                <span>{statusFilter === 'all' ? 'Filter' : statusFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                  {(['all', 'active', 'draft', 'completed'] as FilterStatus[]).map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-blue-50 capitalize text-gray-700"
                      onClick={() => handleFilterChange(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : filteredMentorships.length === 0 ? (
            renderEmptyState()
          ) : (
            <MentorshipTable
              mentorships={filteredMentorships}
              onDetails={(id) => navigate(`/mentor/mentorships/${id}`)}
              onAction={(type, id) => {
                if (type === 'edit') {
                  navigate(`/mentor/mentorships/${id}/edit`);
                } else if (type === 'delete') {
                  confirmAndDeleteMentorship(String(id));
                }
              }}
            />
          )}

          {/* Footer / Pagination */}
          {!isLoading && !error && totalElements > 0 && (
            <div className="p-4 md:p-6 border-t border-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalElements}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipsList;