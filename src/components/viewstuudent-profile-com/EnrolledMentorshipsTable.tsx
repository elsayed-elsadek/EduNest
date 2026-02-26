
import type { FC } from 'react';
import type { Mentorship } from '../../types/viewStudent.types';

interface EnrolledMentorshipsTableProps {
  mentorships: Mentorship[];
}

// Progress Badge with Tooltip
interface ProgressBadgeProps {
  submitted: number;
  total: number;
  label: string;
}

const ProgressBadge: FC<ProgressBadgeProps> = ({ submitted, total, label }) => {
  const pct   = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const isDone = submitted >= total && total > 0;

  return (
    <div className="relative group inline-block">
      {/* ── Badge ── */}
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold cursor-default select-none transition-colors ${
          isDone
            ? 'bg-green-100 text-green-700'
            : submitted > 0
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {submitted}
        <span className="font-normal opacity-60">/</span>
        {total}
      </span>

      {/* ── Tooltip ── */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-150">
        <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-lg">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isDone ? 'bg-green-400' : 'bg-blue-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-semibold">{pct}%</span>
          </div>
          <p className="text-gray-300">
            {submitted} of {total} {label} submitted
          </p>
        </div>
        {/* Arrow */}
        <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-1.5 rounded-sm" />
      </div>
    </div>
  );
};

//  Main Component 
const EnrolledMentorshipsTable: FC<EnrolledMentorshipsTableProps> = ({ mentorships }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Enrolled Mentorships</h3>
      </div>

      {/* ── Mobile View ── */}
      <div className="md:hidden divide-y divide-gray-100">
        {mentorships.map((mentorship) => (
          <div key={mentorship.id} className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl shrink-0"
                style={{ backgroundColor: mentorship.iconColor }}
              >
                {mentorship.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{mentorship.name}</p>
                <p className="text-xs text-gray-500">{mentorship.startDate}</p>
              </div>
              <span
                className={`ml-auto px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  mentorship.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {mentorship.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Points</p>
                <p className="text-sm font-bold text-gray-900">{mentorship.totalPoints}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Quizzes</p>
                <ProgressBadge
                  submitted={mentorship.submittedQuizzes}
                  total={mentorship.quizzes}
                  label="quizzes"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Assign.</p>
                <ProgressBadge
                  submitted={mentorship.submittedTasks}
                  total={mentorship.assignments}
                  label="assignments"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop View ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100 text-[#7E8299]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Mentorship Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Total Points
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Quiz
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Assignment
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mentorships.map((mentorship) => (
              <tr key={mentorship.id} className="hover:bg-gray-50/50 transition-colors">

                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl shrink-0"
                      style={{ backgroundColor: mentorship.iconColor }}
                    >
                      {mentorship.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{mentorship.name}</p>
                      {mentorship.startDate && (
                        <p className="text-xs text-gray-400 mt-1">{mentorship.startDate}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-700">{mentorship.totalPoints}</span>
                </td>

                {/* Quiz progress */}
                <td className="px-6 py-4">
                  <ProgressBadge
                    submitted={mentorship.submittedQuizzes}
                    total={mentorship.quizzes}
                    label="quizzes"
                  />
                </td>

                {/* Assignment progress */}
                <td className="px-6 py-4">
                  <ProgressBadge
                    submitted={mentorship.submittedTasks}
                    total={mentorship.assignments}
                    label="assignments"
                  />
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      mentorship.status === 'Completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {mentorship.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {mentorships.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-sm">
          No enrolled mentorships found.
        </div>
      )}
    </div>
  );
};

export default EnrolledMentorshipsTable;