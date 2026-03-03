import type { FC } from 'react';
import { Book, FileText, Activity, Users } from 'lucide-react';

interface MentorshipStatsCardsProps {
    totalLessons: string | number;
    totalQuizzes: string | number;
    totalAssignments: string | number;
    totalSessions: string | number;
}

const MentorshipStatsCards: FC<MentorshipStatsCardsProps> = ({
    totalLessons,
    totalQuizzes,
    totalAssignments,
    totalSessions,
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <Book className="text-blue-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Lessons</p>
                    <p className="text-xl font-bold">{String(totalLessons)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="text-blue-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Quizes</p>
                    <p className="text-xl font-bold">{String(totalQuizzes)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <Activity className="text-blue-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Assignments</p>
                    <p className="text-xl font-bold">{String(totalAssignments)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="text-blue-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Sessions</p>
                    <p className="text-xl font-bold">{String(totalSessions)}</p>
                </div>
            </div>
        </div>
    );
};

export default MentorshipStatsCards;



