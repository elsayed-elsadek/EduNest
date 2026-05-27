import type { FC } from 'react';
import type { Student } from '../types';

interface MentorshipStudentsTableProps {
    students: Student[];
}

const MentorshipStudentsTable: FC<MentorshipStudentsTableProps> = ({ students }) => {
    return (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">Students on This Mentorship</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-xs text-gray-400">
                        <tr>
                            <th className="py-3 text-center">Rank</th>
                            <th className="py-3">Student</th>
                            <th className="py-3">Email</th>
                            <th className="py-3 text-center">Points</th>
                            {/* <th className="py-3">Status</th> */}
                            {/* <th className="py-3">Progress</th> */}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {Array.isArray(students) && students.length > 0 ? (
                            students.map((s, idx) => (
                                <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <td className="py-3 text-center font-medium">#{s.rank ?? idx + 1}</td>
                                    <td className="py-3 font-semibold">{s.studentName ?? 'Student'}</td>
                                    <td className="py-3 text-gray-500">{s.studentEmail ?? '—'}</td>
                                    <td className="py-3 text-center text-yellow-600 font-bold">{s.totalPoints ?? 0}</td>
                                   
                                   {/* i will add this section if the backend handel it */}
                                    {/* <td className="py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs ${s.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : s.status === 'in_progress'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {s.status ?? 'In progress'}
                                        </span>
                                    </td> */}
                                    {/* <td className="py-3">{s.progress ? `${s.progress} %` : '—'}</td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-sm text-gray-500">
                                    No students enrolled
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MentorshipStudentsTable;



