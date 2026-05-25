import type { FC } from "react";
import { Book, FileText, Activity, Users, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface MentorshipStatsCardsProps {
  totalLessons: string | number;
  totalQuizzes: string | number;
  totalAssignments: string | number;
  totalSessions: string | number;
  totalProjects?: string | number;
  mentorshipId: string | number;
}

const MentorshipStatsCards: FC<MentorshipStatsCardsProps> = ({
  totalLessons,
  totalQuizzes,
  totalAssignments,
  totalSessions,
  totalProjects = 0,
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
    {
      title: "Total Projects",
      value: totalProjects,
      icon: Briefcase,
      link: `/mentor/mentorships/${mentorshipId}/projects`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        const content = (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg shrink-0">
                <Icon className="text-blue-500 w-5 h-5" />
              </div>

              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-lg font-bold text-gray-900">{String(card.value)}</p>
              </div>
            </div>

            {/* الأيقونة الجديدة مع الـ Hover States */}
            {card.link && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-300 shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            )}
          </div>
        );

        if (card.link) {
          return (
            <Link
              key={index}
              to={card.link}
              // ضفنا group هنا عشان نتحكم في الـ hover بتاع العناصر اللي جواها
              className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-transparent hover:border-blue-100 transition-all"
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