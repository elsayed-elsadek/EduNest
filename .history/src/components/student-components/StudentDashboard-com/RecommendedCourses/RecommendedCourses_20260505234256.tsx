import type { FC } from 'react';
import { useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import type { Course } from '../../../../types/student-role-types/course.types';
import NoCover from '../../common/Nocover/Nocover';
import { Link } from 'react-router-dom';

interface RecommendedCourseCardProps {
  course: Course;
  onAddToCart: (courseId: string) => void;
}

const RecommendedCourseCard: FC<RecommendedCourseCardProps> = ({ course, onAddToCart }) => {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !course.thumbnail || imgError;

  const discountPct = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div className="flex justify-center w-full">
      <Link to={`/mentorships/${course.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 w-full max-w-lg">
        
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {showPlaceholder ? (
            <NoCover title={course.title} />
          ) : (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          )}

          {discountPct > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {discountPct}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="text-xs font-semibold text-[var(--primary-500,#1d4ed8)] mb-2 uppercase tracking-wide">
            {course.category}
          </div>

          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {course.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            Learn {course.title.toLowerCase()} with hands-on projects and real-world applications.
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(course.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {course.rating.toFixed(1)}
            </span>
          </div>

          {/* Price + Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${course.price.toFixed(2)}
              </span>
              {course.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${course.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={() => onAddToCart(course.id)}
              className="p-2.5 bg-[var(--primary-500,#1d4ed8)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecommendedCourseCard;