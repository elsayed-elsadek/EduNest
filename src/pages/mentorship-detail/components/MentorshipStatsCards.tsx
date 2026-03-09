import type { FC } from 'react';
import { Book, FileText, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MentorshipStatsCardsProps {
    totalLessons: string | number;
    totalQuizzes: string | number;
    totalAssignments: string | number;
    totalSessions: string | number;
    mentorshipId: string | number;
}

const MentorshipStatsCards: FC<MentorshipStatsCardsProps> = ({
    totalLessons,
    totalQuizzes,
    totalAssignments,
    totalSessions,
    mentorshipId,
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <Book className="text-blue-500" />
                </div>
                <div>
                    <p className=" text-gray-500">Total Lessons</p>
                    <p className="font-bold">{String(totalLessons)}</p>
                </div>
            </div>

            <Link to={`/mentor/mentorships/${mentorshipId}/quizzes`} className="bg-white rounded-lg p-4 shadow flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex items-center gap-3 w-full">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="text-blue-500" />
                    </div>
                    <div>
                        <p className=" text-gray-500">Total Quizzes</p>
                        <p className=" font-bold">{String(totalQuizzes)}</p>
                    </div>
                </div>
            </Link>

            <Link to={`/mentor/mentorships/${mentorshipId}/tasks`} className="bg-white rounded-lg p-4 shadow flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex items-center gap-3 w-full">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Activity className="text-blue-500" />
                    </div>
                    <div>
                        <p className=" text-gray-500">Total Assignments</p>
                        <p className=" font-bold">{String(totalAssignments)}</p>
                    </div>
                </div>
            </Link>

            <Link to={`/mentor/mentorships/${mentorshipId}/sessions`} className="bg-white rounded-lg p-4 shadow flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex items-center gap-3 w-full">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Users className="text-blue-500" />
                    </div>
                    <div>
                        <p className=" text-gray-500">Total Sessions</p>
                        <p className=" font-bold">{String(totalSessions)}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MentorshipStatsCards;



