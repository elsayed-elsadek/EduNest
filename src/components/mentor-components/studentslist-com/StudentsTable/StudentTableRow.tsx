
import type { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Student } from '../../../../types/Students.types';

interface StudentTableRowProps {
  student: Student;
  onViewProfile: (id: string) => void;
}

const StudentTableRow: FC<StudentTableRowProps> = ({ student, onViewProfile }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      {/* Student Info */}
      <td className="py-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0f5e8b 0%, #0d4a6f 100%)' }}
              >
                <span className="text-white font-bold text-xs">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 truncate">
              {student.name}
            </span>
            <span className="text-[10px] text-gray-400 md:hidden truncate max-w-[120px]">
              {student.email}
            </span>
          </div>
        </div>
      </td>

      {/* Email - Desktop only */}
      <td className="hidden md:table-cell py-4 px-6 text-sm text-gray-500 font-medium">
        {student.email}
      </td>

      {/* Active Count */}
      <td className="py-4 px-3 md:px-6 text-center">
        <div className="flex flex-col md:block items-center">
          <span className="text-[9px] font-bold text-gray-400 md:hidden uppercase leading-none mb-1">Active</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{student.activeMentorships}</span>
        </div>
      </td>

      {/* Completed Count - Hidden on Mobile */}
      <td className="hidden sm:table-cell py-4 px-6 text-center">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{student.completedMentorships}</span>
      </td>

      {/* Action Button */}
      <td className="py-4 px-4 md:px-6 text-right">
        <button
          onClick={() => onViewProfile(student.id)}
          className="inline-flex items-center justify-center p-2 md:px-4 md:py-2 rounded-lg transition-all group/btn"
          style={{
            border: '1px solid #0f5e8b33',
            backgroundColor: '#0f5e8b0f',
            color: '#0f5e8b',
          }}
        >
          <ExternalLink className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline text-xs font-bold">View Profile</span>
        </button>
      </td>
    </tr>
  );
};

export default StudentTableRow;


