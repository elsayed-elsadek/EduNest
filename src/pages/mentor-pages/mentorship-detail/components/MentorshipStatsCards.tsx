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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mt-6 w-full">
      {cards.map((card, index) => {
        const Icon = card.icon;

        const content = (
          <div className="flex flex-col items-center text-center w-full relative pt-1 sm:pt-2">
            {card.link && (
              <div className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50/80 text-slate-400 border border-slate-100/50 shadow-sm transition-all duration-300 shrink-0">
                <div className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--primary-500)] group-hover:text-white">
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            )}

            <div className="p-2 sm:p-3 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl shrink-0 transition-colors duration-300 group-hover:bg-primary/5 group-hover:border-primary/10 mb-2 sm:mb-4">
              <Icon className="text-[var(--primary-500)] w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 group-hover:text-primary" />
            </div>

            <div className="flex flex-col min-w-0 w-full">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block truncate">
                {card.title}
              </span>
              <span className="text-base sm:text-2xl font-bold text-slate-800 mt-0.5 sm:mt-1 block truncate">
                {String(card.value)}
              </span>
            </div>
          </div>
        );

        if (card.link) {
          return (
            <Link
              key={index}
              to={card.link}
              className="group bg-white rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:border-primary/20 transition-all duration-300 flex w-full justify-center items-center"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={index}
            className="group bg-white rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex w-full justify-center items-center"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default MentorshipStatsCards;