
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import DashLayout from '../../components/layout/Dash-layout';
import StudentSearch from '../../components/studentslist-com/StudentSearch/StudentSearch';
import StudentsTable from '../../components/studentslist-com/StudentsTable/StudentsTable';
import Pagination from '../../components/common/Pagination/Pagination';
import type { Student } from '../../types/Students.types';
import { getMentorStudents } from '../../services/Studentsservice';
import { extractStudentsData } from '../../services/Studentsservice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

// Helper 
function isApiErrorResponse(res: unknown): res is { error: string } {
  if (res == null || typeof res !== 'object') return false;
  const obj = res as Record<string, unknown>;
  return typeof obj.error === 'string' && obj.error.length > 0;
}

//  Component
const StudentsList: FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // API state
  const [students, setStudents] = useState<Student[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Auth guard 
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().token) navigate('/login');
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  //  Fetch from API
  useEffect(() => {
    if (!isHydrated || !token) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMentorStudents(currentPage - 1, itemsPerPage) // API is 0-indexed
      .then((res) => {
        if (cancelled) return;

        if (isApiErrorResponse(res)) {
          setError((res as { error: string }).error);
          return;
        }

        const extracted = extractStudentsData(res);
        console.log(`📚 Students: ${extracted.content.length} / ${extracted.totalElements} total`);

        // Map to the Student type already used in your components
        const mapped: Student[] = extracted.content.map((s) => ({
          id: String(s.id),
          name: s.name,
          email: s.email,
          avatar: s.avatar,
          activeMentorships: s.activeMentorships,
          completedMentorships: s.completedMentorships,
        }));

        setStudents(mapped);
        setTotalItems(extracted.totalElements);
        setTotalPages(extracted.totalPages || 1);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = (err as { message?: string })?.message ?? 'Failed to load students';
          setError(msg);
          console.error('❌ Students fetch error:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isHydrated, token, currentPage, itemsPerPage]);

  // Reset to page 1 on search 

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  // ── Client-side filter 
  const displayedStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  // Render 
  return (
    <DashLayout pageTitle="Dashboard / Students">
      <div className="bg-gray-50 min-h-screen p-3 md:p-8">
        <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Students List</h1>
            <div className="w-full sm:w-72">
              <StudentSearch value={searchQuery} onChange={handleSearch} />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => { setError(null); setCurrentPage(1); }}
                  className="mt-1 text-xs font-semibold underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm transition-all">
            <div className="w-full">

              {/* Loading Skeleton */}
              {loading ? (
                <div className="p-6 space-y-3 animate-pulse">
                  {[...Array(itemsPerPage)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-12" />
                      <div className="h-3 bg-gray-200 rounded w-12" />
                      <div className="h-8 bg-gray-200 rounded-xl w-24" />
                    </div>
                  ))}
                </div>

              ) : displayedStudents.length > 0 ? (
                <StudentsTable
                  students={displayedStudents}
                  onViewProfile={(id) => navigate(`/mentor/students/${id}`)}
                />
              ) : (
                <div className="p-12 md:p-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faSearch} className=''/>
                  </div>
                  <p className="text-gray-400 font-medium text-sm md:text-base">
                    {searchQuery ? 'No students found matching your search.' : 'No students yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && displayedStudents.length > 0 && (
              <div className="p-3 md:p-6 border-t border-gray-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </DashLayout>
  );
};

export default StudentsList;


