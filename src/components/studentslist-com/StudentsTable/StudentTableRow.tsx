

import  type { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Student } from '../../../types/Students.types';

interface StudentTableRowProps {
  student: Student;
  onViewProfile: (id: string) => void;
}

const StudentTableRow: FC<StudentTableRowProps> = ({ 
  student, 
  onViewProfile 
}) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Student Name Column */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {student.avatar ? (
              <img 
                src={student.avatar} 
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Name */}
          <span className="text-sm font-semibold text-gray-900">
            {student.name}
          </span>
        </div>
      </td>

      {/* Email Column */}
      <td className="py-4 px-6">
        <span className="text-sm text-gray-600">
          {student.email}
        </span>
      </td>

      {/* Active Mentorship Column */}
      <td className="py-4 px-6 text-center">
        <span className="text-sm font-semibold text-gray-900">
          {student.activeMentorships}
        </span>
      </td>

      {/* Completed Mentorship Column */}
      <td className="py-4 px-6 text-center">
        <span className="text-sm font-semibold text-gray-900">
          {student.completedMentorships}
        </span>
      </td>

      {/* Action Column */}
      <td className="py-4 px-6">
        <button
          onClick={() => onViewProfile(student.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-[#33A1E0] hover:bg-blue-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm font-medium">View Profile</span>
        </button>
      </td>
    </tr>
  );
};

export default StudentTableRow;