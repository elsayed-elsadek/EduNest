import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BadgeCheck, Calendar } from 'lucide-react';

import type { MentorProfileMentorship } from '../../../../services/student-roleService/mentorProfile.api';
import { API_BASE_URL } from '../../../../services/api';
import NoCover from '../../../../components/student-components/common/Nocover/Nocover';
import Pagination from '../../../../components/student-components/mentorships/Pagination';

interface MentorshipsSectionProps {
  mentorships: MentorProfileMentorship[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const CourseThumb = ({ url, title }: { url?: string; title?: string }) => {
  const [err, setErr] = useState(false);

  if (url && !err) {
    return (
      <img
        src={url}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        alt={title}
        onError={() => setErr(true)}
      />
    );
  }

  return <NoCover title={title || 'Mentorship'} />;
};

const MentorshipsSection = ({
  mentorships,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: MentorshipsSectionProps) => {
  const displayPagination = totalPages > 1;

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold text-slate-900">My Mentorships</h2>
      </div>

      {mentorships.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">No mentorships were found for this mentor yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentorships.map((course) => {
              return (
              <Link
                key={course.id}
                to={`/mentorships/${course.id}`}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                {/* Image Container */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <CourseThumb url={course.coverImageUrl ? `${API_BASE_URL}${course.coverImageUrl}` : undefined} title={course.mentorshipTitle} />

                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-[var(--primary-500)] text-white text-[10px] font-semibold px-3 py-1 rounded-lg uppercase tracking-wider z-10">
                    {course.category || 'Mentorship'}
                  </span>
                </div>

                {/* Content Container */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 text-xl leading-tight line-clamp-2">{course.mentorshipTitle}</h3>
                    <div className="flex gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-[var(--primary-500)]" /> {course.difficultyLevel}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[var(--primary-500)]" /> {course.duration} Months
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-5 border-t border-slate-50 mt-2">
                    <span className="text-xl font-bold text-slate-900">${course.price}</span>
                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-all">
                      Show Details
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>

          {displayPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </>
  );
};

export default MentorshipsSection;