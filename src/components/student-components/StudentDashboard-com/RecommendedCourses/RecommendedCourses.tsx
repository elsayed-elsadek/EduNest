
import type { FC } from 'react';
import { useRef } from 'react';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import type { Course } from '../../../../types/student-role-types/course.types';
import NoCover from '../../common/Nocover/Nocover';
import { Link } from 'react-router-dom';

interface RecommendedCoursesProps {
  courses: Course[];
  onAddToCart: (courseId: string) => void;
  limit?: number;
}

const RecommendedCourses: FC<RecommendedCoursesProps> = ({ courses, onAddToCart, limit }) => {
  const visible = courses.slice(0, limit ?? courses.length);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hand-picked mentorships based on your interests</p>
        </div>
        <Link
          to="/explore-mentorships"
          className="text-xs font-semibold transition-colors"
          style={{ color: '#0f5e8b' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          View all →
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Left arrow */}
        <button
          aria-label="Previous"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                     bg-white border border-gray-200 shadow-md rounded-full p-1.5
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hidden sm:flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Cards scroller wrapper - hides scrollbar */}
        <div className="overflow-hidden">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`div[style*='scrollbarWidth'] { scrollbar-width: none; } div[style*='scrollbarWidth']::-webkit-scrollbar { display: none; }`}</style>
          {visible.map(course => {
            const courseEx = course as unknown as Record<string, unknown>;
            const discount = typeof courseEx.discountPercentage === 'number'
              ? (courseEx.discountPercentage as number)
              : (course.originalPrice
                ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
                : 0);
            const mentorName = course.instructor || '';
            const duration = typeof courseEx.duration === 'number' ? (courseEx.duration as number) : undefined;

            return (
              <Link
                key={course.id}
                to={`/mentorships/${course.id}`}
                className="group/card flex-none snap-start
                             bg-white rounded-2xl border border-gray-100 overflow-hidden
                             hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                             min-w-[30%] sm:min-w-[30%] md:min-w-[30%] lg:min-w-[30%]"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-50">
                  <NoCover title={course.title} />
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover
                                 group-hover/card:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5
                                     bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Category badge */}
                  <span className="text-[10px] font-bold tracking-widest uppercase w-fit px-2 py-0.5 rounded-full"
                        style={{ color: '#0f5e8b', backgroundColor: '#e6f2f8' }}>
                    {course.category ?? (typeof courseEx.difficultyLevel === 'string' ? (courseEx.difficultyLevel as string) : undefined)}
                  </span>

                  {/* Mentor name - prominent display */}
                  {mentorName && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0f5e8b' }} />
                      <span className="truncate">{mentorName}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Duration - if available */}
                  {duration != null && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{duration} weeks</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-gray-100" />

                  {/* Rating + Price + Cart */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(course.rating ?? 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200 fill-gray-200'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {(course.rating ?? 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        ${(course.price ?? 0).toFixed(2)}
                      </span>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          onAddToCart(String(course.id));
                        }}
                        className="p-1.5 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#0f5e8b' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0a4169')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0f5e8b')}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );          })}        </div>
        </div>

        {/* Right arrow */}
        <button
          aria-label="Next"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                     bg-white border border-gray-200 shadow-md rounded-full p-1.5
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hidden sm:flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedCourses;