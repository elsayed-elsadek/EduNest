import type { FC } from 'react';
import { Star } from 'lucide-react';
import type { Review } from './Reviews.types';

interface ReviewCardProps {
  review: Review;
  onDelete?: (id: string) => void;
}

const ReviewCard: FC<ReviewCardProps> = ({ review }) => {
  // تنسيق التاريخ
  const formattedDate = new Date(review.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors group">
      {/* 1. قسم الصورة الشخصية (Avatar) */}
      <div className="flex-shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200">
          {review.studentAvatar ? (
            <img
              src={review.studentAvatar}
              alt={review.studentName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {review.studentName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. قسم المحتوى الرئيسي */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          {/* اسم الطالب والكورس */}
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-gray-900 truncate">
              {review.studentName}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              Course - <span className="text-gray-700">{review.courseTitle}</span>
            </p>
          </div>

          {/* التقييم والتاريخ (في نفس الصف) */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[13px] font-bold text-gray-900">
                {review.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* نص التعليق */}
        <p className="text-[11px] text-gray-600 leading-relaxed mt-2 line-clamp-2 text-center">
          "{review.comment}"
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;