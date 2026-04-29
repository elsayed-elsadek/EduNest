
import type { FC } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { theme } from '../../../../theme/colors';
import CourseCard from './CourseCard';
import type { Course } from '../../../../types/student-role-types/course.types';

interface ContinueLearningProps {
  courses: Course[];
  onResumeCourse: (courseId: string) => void;
}

const ContinueLearning: FC<ContinueLearningProps> = ({ courses, onResumeCourse }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Continue Learning</h2>
          <p className="text-xs text-gray-500 mt-0.5">Pick up where you left off.</p>
        </div>
        <Link
          to="/student/learning"
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: theme.primary[600] }}
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid for courses */}
      <div className="grid grid-cols-2 gap-4">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} onResume={onResumeCourse} />
        ))}
      </div>
    </div>
  );
};

export default ContinueLearning;