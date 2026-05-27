import { useEffect, useState } from 'react';
import type { FC } from 'react';
import type { Student } from '../types';
import { useAuthStore } from '../../../../store/authStore';

interface MentorshipStudentsTableProps {
  mentorshipId: string | number;
  initialStudents?: Student[];
  initialPage?: number; // 0-based
  initialSize?: number;
}

const MentorshipStudentsTable: FC<MentorshipStudentsTableProps> = ({ 
  mentorshipId, 
  initialStudents = [], 
  initialPage = 0, 
  initialSize = 10 
}) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialSize);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(initialStudents.length ?? 0);
  const [loading, setLoading] = useState<boolean>(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (mentorshipId === undefined || mentorshipId === null) return;

    const controller = new AbortController();
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('studentPage', String(currentPage));
        params.set('studentSize', String(pageSize));

        const url = `/api/v1/dashboard/mentorship/${mentorshipId}?${params.toString()}`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, { signal: controller.signal, headers });
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();

        const ranks = data?.studentsRanks ?? null;
        if (ranks) {
          setStudents(Array.isArray(ranks.content) ? ranks.content : []);
          setTotalPages(typeof ranks.totalPages === 'number' ? ranks.totalPages : 1);
          setTotalElements(typeof ranks.totalElements === 'number' ? ranks.totalElements : (Array.isArray(ranks.content) ? ranks.content.length : 0));
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        const e = err as { name?: string };
        if (e.name === 'AbortError') return;
        console.warn('Mentorship students fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    return () => controller.abort();
  }, [mentorshipId, currentPage, pageSize, token]);

  const goToPage = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const prev = () => goToPage(currentPage - 1);
  const next = () => goToPage(currentPage + 1);

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
      {/* Header section with page size option */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg">Students on This Mentorship</h3>
        {totalElements > 5 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs sm:text-sm text-gray-400 font-medium">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs sm:text-sm bg-gray-50 text-gray-700 font-medium focus:outline-none focus:border-[var(--primary-500)] transition"
            >
              {[5, 10, 20, 50].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table container with optimized text sizing for responsive layouts */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <table className="w-full text-left border-collapse">
            <thead className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 text-center font-semibold w-16">Rank</th>
                <th className="py-3 px-3 font-semibold">Student</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 text-center font-semibold w-20">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Loading students data...</td>
                </tr>
              ) : Array.isArray(students) && students.length > 0 ? (
                students.map((s, idx) => (
                  <tr key={s.studentEmail ?? idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 text-center font-bold text-gray-500">
                      #{s.rank ?? idx + 1 + currentPage * pageSize}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-900 max-w-[140px] sm:max-w-none truncate">
                      {s.studentName ?? 'Student'}
                    </td>
                    <td className="py-3.5 px-3 text-gray-500 max-w-[160px] sm:max-w-none truncate">
                      {s.studentEmail ?? '—'}
                    </td>
                    <td className="py-3.5 text-center text-yellow-600 font-bold">
                      {s.totalPoints ?? 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">No students enrolled</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modernized pagination buttons */}
      {totalElements > 5 && (
        <div className="mt-5 flex items-center justify-between sm:justify-end gap-4 border-t border-gray-50 pt-4">
          <div className="flex items-center justify-between sm:justify-end w-full gap-2">
            <button
              onClick={prev}
              disabled={loading || currentPage <= 0}
              className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                loading || currentPage <= 0 
                  ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' 
                  : 'text-gray-700 bg-white hover:bg-gray-50 active:scale-95'
              }`}
            >
              Previous
            </button>

            {/* Custom page numbers styled to match system active color */}
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  disabled={loading}
                  className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    i === currentPage 
                      ? 'bg-[var(--primary-500)] text-white shadow-sm shadow-[var(--primary-500)]/20' 
                      : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              disabled={loading || currentPage >= totalPages - 1}
              className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                loading || currentPage >= totalPages - 1 
                  ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' 
                  : 'text-gray-700 bg-white hover:bg-gray-50 active:scale-95'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipStudentsTable;