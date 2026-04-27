import type { FC } from 'react';
import { User } from 'lucide-react';
// import { getImageUrl } from '../../../../../../../utils/imageUtils';
import type { LeaderboardStudent } from '../../../../../types/student-role-types/mentorshipLeaderboardTypes';

type LeaderboardRowProps = {
  student: LeaderboardStudent;
  highlight?: boolean;
};

const LeaderboardRow: FC<LeaderboardRowProps> = ({ student, highlight = false }) => (
  <tr className={`transition-all duration-200 hover:bg-slate-50 ${highlight ? 'bg-[var(--primary-500)]/[0.08] border-l-4 border-[var(--primary-500)]' : ''}`}>
    <td className="px-6 py-4">
      <div className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-600">
        {student.rank < 10 ? `0${student.rank}` : student.rank}
      </div>
    </td>
    <td className="py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-100">
          {student.studentProfileImageUrl ? (
            <img src={student.studentProfileImageUrl!.startsWith('http') ? student.studentProfileImageUrl : `http://localhost:8080${student.studentProfileImageUrl}`} alt={student.studentFullName} className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">{student.studentFullName}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">{student.studentLevel || 'Scholar'}</p>
        </div>
      </div>
    </td>
    <td className="px-10 py-4 text-sm font-bold text-slate-700">
      {student.completedSessions ?? 0}
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-1.5">
        <div className="p-2 bg-[var(--primary-500)]/10 rounded-xl text-[var(--primary-500)] flex items-center justify-center">
          {student.lastBadgeTitle }
        </div>
        <div className="p-2 bg-slate-100 rounded-xl text-slate-400 flex items-center justify-center">
          {student.lastBadgeCategory ? student.lastBadgeCategory : 'Null'}
        </div>
      </div>
    </td>
    <td className="px-10 py-4 text-right">
      <p className="text-lg font-bold text-slate-900">{student.totalPoints.toLocaleString()}</p>
    </td>
  </tr>
);

export default LeaderboardRow;

