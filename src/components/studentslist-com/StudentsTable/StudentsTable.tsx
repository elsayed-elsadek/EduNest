

import type  { FC } from 'react';
import StudentTableRow from './StudentTableRow';
import type { Student } from '../../../types/Students.types';

interface StudentsTableProps {
  students: Student[];
  onViewProfile: (id: string) => void;
}

const StudentsTable: FC<StudentsTableProps> = ({ 
  students, 
  onViewProfile 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        {/* Table Header */}
        <thead className="bg-white border-b border-gray-200">
          <tr>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Mentorship
            </th>
            <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Completed Mentorship
            </th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <StudentTableRow
                key={student.id}
                student={student}
                onViewProfile={onViewProfile}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-gray-500 text-sm">No students found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;