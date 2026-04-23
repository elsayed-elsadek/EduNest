
import  type { FC } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import type { Course } from '../../../../types/student-role-types/course.types';
const DEFAULT_COURSE_THUMBNAIL = 'https://images.unsplash.com/photo-1514996937319-344454492b37?w=800&q=80';

interface RecommendedCourseCardProps {
  course: Course;
  onAddToCart: (courseId: string) => void;
}

const RecommendedCourseCard: FC<RecommendedCourseCardProps> = ({ 
  course, 
  onAddToCart 
}) => {
  const discountPercentage = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

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
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
          {course.category}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {course.title}
        </h3>

        {/* Description - Mock */}
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Price */}
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

          {/* Add to Cart Button */}
          <button
            onClick={() => onAddToCart(course.id)}
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCourseCard;