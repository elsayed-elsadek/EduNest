import type { FC } from 'react';
import { User } from 'lucide-react';
import type { LeaderboardStudent } from '../../../../../types/student-role-types/mentorshipLeaderboardTypes';

type LeaderboardRowProps = {
  student: LeaderboardStudent;
  rank: number;
  highlight?: boolean;
};

const LeaderboardRow: FC<LeaderboardRowProps> = ({ student, rank, highlight = false }) => (
  <tr className={`transition-all duration-200 hover:bg-slate-50 ${highlight ? 'bg-[var(--primary-500)]/[0.08] border-l-4 border-[var(--primary-500)]' : ''}`}>
    <td className="px-4 sm:px-6 py-4">
      <div className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-600">
        {rank < 10 ? `0${rank}` : rank}
      </div>
    </td>
    <td className="px-4 sm:px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-100 shrink-0">
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
            <User className="w-5 h-5" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">{student.studentFullName}</p>
        </div>
      </div>
    </td>
    <td className="px-4 sm:px-10 py-4 text-right">
      <p className="text-sm sm:text-lg font-bold text-slate-900">{student.totalPoints.toLocaleString()}</p>
    </td>
  </tr>
);

export default LeaderboardRow;
