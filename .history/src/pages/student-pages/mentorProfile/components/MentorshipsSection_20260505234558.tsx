import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Calendar } from 'lucide-react';

import type { MentorProfileMentorship } from '../../../../services/student-roleService/mentorProfile.api';

interface MentorshipsSectionProps {
  mentorships: MentorProfileMentorship[];
}

const MentorshipsSection = ({ mentorships }: MentorshipsSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const displayedMentorships = showAll ? mentorships : mentorships.slice(0, 2);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold text-slate-900">My Mentorships</h2>
        {mentorships.length > 1 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[var(--primary-600)] font-medium text-sm hover:underline hover:text-[var(--primary-500)]"
          >
            {showAll ? 'Show Less' : 'View all'}
          </button>
        )}
      </div>

      {mentorships.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">No mentorships were found for this mentor yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedMentorships.map((course) => (
            <Link
              key={course.id}
              to={`/mentorships/${course.id}`}
              className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              {/* Image Container */}
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {course.coverImageUrl ? (
                  <img
                    src={`course.coverImageUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={course.mentorshipTitle}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center p-4">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xs text-gray-500 font-medium">No Image Available</p>
                    </div>
                  </div>
                )}

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
                    Enroll Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default MentorshipsSection;