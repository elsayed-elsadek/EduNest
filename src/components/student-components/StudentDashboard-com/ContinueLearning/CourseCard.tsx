
import  type { FC } from 'react';
import { Play, User, ArrowRight } from 'lucide-react';
import type { Course } from '../../../../types/student-role-types/course.types';
const DEFAULT_COURSE_THUMBNAIL = 'https://images.unsplash.com/photo-1514996937319-344454492b37?w=800&q=80';

interface CourseCardProps {
  course: Course;
  onResume: (courseId: string) => void;
}

const CourseCard: FC<CourseCardProps> = ({ course, onResume }) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_COURSE_THUMBNAIL;
          }}
        />
        
        {/* Progress Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
          IN PROGRESS
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onResume(course.id)}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <User className="w-4 h-4 text-gray-500" />
          <span>{course.instructor}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Course Progress</span>
            <span className="font-bold text-gray-900">{course.progress}%</span>
          </div>
          
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary-500)] rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Resume Button */}
        <button
          onClick={() => onResume(course.id)}
          className="w-full mt-4 py-2.5 text-sm font-semibold text-[var(--primary-500)] border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          Resume Mentorship
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;