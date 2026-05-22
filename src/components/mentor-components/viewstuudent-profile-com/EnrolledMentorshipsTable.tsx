
import type { FC } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Mentorship } from '../../../types/viewStudent.types';

const PRIMARY = '#0f5e8b';

interface EnrolledMentorshipsTableProps {
  mentorships:  Mentorship[];
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

// ── Mentorship avatar: real image or emoji fallback ───────────────────────────
const MentorshipAvatar: FC<{ m: Mentorship; size?: string }> = ({ m, size = 'w-10 h-10' }) => {
  if (m.imageUrl) {
    return (
      <div className={`${size} rounded-xl overflow-hidden flex-shrink-0 border border-gray-100`}>
        <img
          src={m.imageUrl}
          alt={m.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  }

  const FallbackIcon = m.iconComponent ?? BookOpen;

  return (
    <div
      className={`${size} rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0`}
      style={{ backgroundColor: m.iconColor }}
    >
      <FallbackIcon size={18} className="text-white" />
    </div>
  );
};

// ── Progress badge with tooltip ───────────────────────────────────────────────
const ProgressBadge: FC<{ submitted: number; total: number; label: string }> = ({
  submitted, total, label,
}) => {
  const pct    = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const isDone = submitted >= total && total > 0;

  return (
    <div className="relative group inline-block">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold cursor-default select-none ${
        isDone
          ? 'bg-emerald-50 text-emerald-700'
          : submitted > 0
          ? 'text-white'
          : 'bg-gray-100 text-gray-400'
      }`}
        style={submitted > 0 && !isDone ? { backgroundColor: `${PRIMARY}18`, color: PRIMARY } : undefined}
      >
        {submitted}<span className="font-normal opacity-50">/</span>{total}
      </span>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
        <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isDone ? '#10b981' : PRIMARY,
                }}
              />
            </div>
            <span className="font-semibold">{pct}%</span>
          </div>
          <p className="text-gray-300">{submitted} of {total} {label} submitted</p>
        </div>
        <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-1.5 rounded-sm" />
      </div>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination: FC<{ current: number; total: number; onChange: (p: number) => void }> = ({
  current, total, onChange,
}) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
      ><ChevronLeft size={16} /></button>

      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition"
          style={
            i === current
              ? { backgroundColor: PRIMARY, color: '#fff' }
              : { border: '1px solid #e5e7eb', color: '#6b7280' }
          }
        >{i + 1}</button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total - 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
      ><ChevronRight size={16} /></button>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const EnrolledMentorshipsTable: FC<EnrolledMentorshipsTableProps> = ({
  mentorships, currentPage, totalPages, onPageChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Enrolled Mentorships</h3>
        {totalPages > 1 && (
          <span className="text-xs text-gray-400">Page {currentPage + 1} / {totalPages}</span>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {mentorships.map((m) => (
          <div key={m.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <MentorshipAvatar m={m} size="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{m.name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                m.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-orange-50 text-orange-600'
              }`}>{m.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-50 pt-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Points</p>
                <p className="text-sm font-bold text-gray-800">{m.totalPoints}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Quizzes</p>
                <ProgressBadge submitted={m.submittedQuizzes} total={m.quizzes} label="quizzes" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Tasks</p>
                <ProgressBadge submitted={m.submittedTasks} total={m.assignments} label="tasks" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Mentorship', 'Points', 'Quizzes', 'Assignments', 'Status'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mentorships.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <MentorshipAvatar m={m} size="w-10 h-10" />
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{m.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-gray-700">{m.totalPoints}</span>
                </td>
                <td className="px-5 py-4">
                  <ProgressBadge submitted={m.submittedQuizzes} total={m.quizzes} label="quizzes" />
                </td>
                <td className="px-5 py-4">
                  <ProgressBadge submitted={m.submittedTasks} total={m.assignments} label="tasks" />
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    m.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-orange-50 text-orange-600'
                  }`}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mentorships.length > 0 && (
        <div className="border-t border-gray-50 px-5">
          <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
        </div>
      )}

      {mentorships.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-400">No enrolled mentorships found.</div>
      )}
    </div>
  );
};

export default EnrolledMentorshipsTable;
