
import type { FC } from 'react';
import StudentTableRow from './StudentTableRow';
import type { Student } from '../../../types/Students.types';

interface StudentsTableProps {
  students: Student[];
  onViewProfile: (id: string) => void;
}

const StudentsTable: FC<StudentsTableProps> = ({ students, onViewProfile }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[400px] border-collapse text-left">
          <thead className="bg-[#F9FAFB] border-b border-gray-100">
            <tr>
              <th className="py-4 px-4 md:px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Student Name
              </th>
              <th className="hidden md:table-cell py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="py-4 px-3 md:px-6 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Active
              </th>
              <th className="hidden sm:table-cell py-4 px-6 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Completed
              </th>
              <th className="py-4 px-4 md:px-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 bg-white">
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
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No students found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;