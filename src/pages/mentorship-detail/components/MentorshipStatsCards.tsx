import type { FC } from "react";
import { Book, FileText, Activity, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

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
  const cards = [
    {
      title: "Total Lessons",
      value: totalLessons,
      icon: Book,
    },
    {
      title: "Total Quizzes",
      value: totalQuizzes,
      icon: FileText,
      link: `/mentor/mentorships/${mentorshipId}/quizzes`,
    },
    {
      title: "Total Assignments",
      value: totalAssignments,
      icon: Activity,
      link: `/mentor/mentorships/${mentorshipId}/tasks`,
    },
    {
      title: "Total Sessions",
      value: totalSessions,
      icon: Users,
      link: `/mentor/mentorships/${mentorshipId}/sessions`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        const content = (
          <div className="flex items-center gap-3 w-full">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon className="text-blue-500 w-5 h-5" />
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-lg font-bold">{String(card.value)}</p>
            </div>

            {card.link && (
              <ChevronRight className="text-gray-400 w-5 h-5" />
            )}
          </div>
        );

        if (card.link) {
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default MentorshipStatsCards;