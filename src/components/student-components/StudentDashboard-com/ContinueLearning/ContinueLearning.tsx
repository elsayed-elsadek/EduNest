
import type { FC } from 'react';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { theme } from '../../../../theme/colors';
import CourseCard from './CourseCard';
import type { Course } from '../../../../types/student-role-types/course.types';

interface ContinueLearningProps {
  courses: Course[];
  onResumeCourse: (courseId: string) => void;
}

const ContinueLearning: FC<ContinueLearningProps> = ({ courses, onResumeCourse }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft ] = useState(false);
  const [canRight, setCanRight] = useState(courses.length > 2);

  const CARD_W = 320; 

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -CARD_W : CARD_W, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Continue Learning</h2>
          <p className="text-xs text-gray-500 mt-0.5">Pick up where you left off.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Arrows */}
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500
                       hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500
                       hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link
            to="/student/learning"
            className="text-xs font-semibold ml-1 flex items-center gap-1"
            style={{ color: theme.primary[600] }}
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {courses.map(course => (
          <div key={course.id} className="flex-shrink-0 w-72">
            <CourseCard course={course} onResume={onResumeCourse} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContinueLearning;