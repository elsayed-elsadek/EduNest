
import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import MentorshipTable from '../../components/my-mentorships-com/MentorshipTable/MentorshipTable';
import Pagination from '../../components/common/Pagination/Pagination';
import { getMentorships, deleteMentorship } from '../../services/mentorDashboardService';
import { useAuthStore } from '../../store/authStore';
import type { Mentorship } from '../../types/mentorship.types';

/** تحويل عنصر API إلى Mentorship */
function mapApiMentorshipToUi(item: unknown): Mentorship {
  const m = item as Record<string, unknown>;
  const status = String(m.status ?? 'DRAFT').toUpperCase();
  
  // Map status: ACTIVE/PUBLISHED -> active, DRAFT -> draft, COMPLETED -> completed
  const uiStatus = 
    status === 'ACTIVE' || status === 'PUBLISHED' ? 'active' : 
    status === 'DRAFT' ? 'draft' : 
    status === 'COMPLETED' ? 'completed' : 
    'draft';
  
  // Try to get date from various possible fields
  const created = m.createdAt ?? m.createdDate ?? m.created_at ?? m.uploadDate ?? new Date().toISOString();
  const dateStr = typeof created === 'string'
    ? new Date(created).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  
  return {
    id: String(m.id ?? ''),
    title: String(m.title ?? 'Untitled'),
    icon: '📋',
    level: String(m.difficultyLevel ?? m.level ?? 'ALL_LEVEL'),
    rating: Number(m.rating ?? 0),
    totalEnrolled: Number(m.totalEnrolled ?? m.enrolledCount ?? m.students ?? 0),
    revenue: Number(m.price ?? m.revenue ?? 0),
    createdDate: dateStr,
    status: uiStatus,
  };
}

const MentorshipsList: FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    const pageIndex = currentPage - 1;
    getMentorships(pageIndex, itemsPerPage)
      .then((res) => {
        const mapped = (res.content ?? []).map(mapApiMentorshipToUi);
        setMentorships(mapped);
        setTotalElements(res.totalElements ?? 0);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch((err: unknown) => {
        const errObj = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = errObj?.response?.data?.message ?? errObj?.message ?? 'Failed to load mentorships';
        console.error('❌ Error Loading Mentorships:', msg);
        toast.error(msg);
        // keep error state for debugging if needed
        setError(String(msg));
      })
      .finally(() => setLoading(false));
  }, [token, navigate, currentPage, itemsPerPage]);

  const filteredMentorships = useMemo(() => {
    if (statusFilter === 'all') return mentorships;
    return mentorships.filter((item) => item.status === statusFilter);
  }, [statusFilter, mentorships]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  const confirmAndDeleteMentorship = (id: string) => {
    toast((t) => (
      <div className="">
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
              deleteMentorship(id)
                .then(() => {
                  setMentorships((prev) => prev.filter((m) => m.id !== String(id)));
                  setTotalElements((prev) => Math.max(0, prev - 1));
                  toast.dismiss(t.id);
                  toast.success('Mentorship deleted successfully');
                })
                .catch((err: unknown) => {
     const axiosErr = err as { response?: { data?: { errorMessages?: { error?: string } } } };
  const msg = axiosErr.response?.data?.errorMessages?.error ?? 'Failed to delete mentorship';
  console.error('❌ Error deleting mentorship:', msg);
  setError(msg);
  toast.error(msg);
                });
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
    });
  };

  return (
    <DashLayout pageTitle="Dashboard / My Mentorships">
    
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-screen px-0 md:px-8 md:pt-4 pb-8">
        
        {/* Header Section: Add button */}
        <div className="flex justify-end mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <button
            onClick={() => navigate('/mentor/mentorships/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] px-6 rounded-xl text-white text-sm font-bold btn-primary-gradient shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Table Header / Title */}
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 md:border-none">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Mentorships List</h1>
              <p className="text-sm text-gray-400 mt-1">
                Total <span className="text-gray-900 font-bold">{totalElements}</span>
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 capitalize"
              >
                <span>{statusFilter === 'all' ? 'Filter' : statusFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                  {['all', 'active', 'draft', 'completed'].map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-blue-50 capitalize text-gray-700"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => { setStatusFilter(s as any); setIsFilterOpen(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
    
          {loading ? (
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
          ) : filteredMentorships.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold">
                  {totalElements === 0
                    ? 'No Mentorships Yet'
                    : statusFilter === 'active'
                      ? 'No Active Mentorships'
                      : statusFilter === 'draft'
                        ? 'No Draft Mentorships'
                        : statusFilter === 'completed'
                          ? 'No Completed Mentorships'
                          : 'No Mentorships Yet'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {totalElements === 0
                    ? 'Create your first mentorship to get started'
                    : 'There are mentorships in other statuses. Try changing the filter.'}
                </p>
                <button
                  onClick={() => navigate('/mentor/mentorships/create')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Mentorship
                </button>
              </div>
            </div>
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

          {/* Footer / Pagination: Padding  */}
          {!loading && !error && totalElements > 0 && (
          <div className="p-4 md:p-6 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalElements}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => setItemsPerPage(Number(val))}
            />
          </div>
          )}
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipsList;


