

import type{ FC } from 'react';
import { Star, Trash2 } from 'lucide-react';
import type { Review } from './Reviews.types';

interface ReviewCardProps {
  review: Review;
  onDelete?: (id: string) => void;
}

const ReviewCard: FC<ReviewCardProps> = ({ review, onDelete }) => {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors group">
      {/* Avatar */}
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Student Name & Rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h4 className="text-[13px] font-semibold text-gray-900">
              {review.studentName}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Course - <span className="text-gray-700">{review.courseTitle}</span>
            </p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            <span className="text-[13px] font-bold text-gray-900">{review.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Comment */}
        <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 mb-1">
          {review.comment}
        </p>
      </div>

      {/* Date & Delete */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-gray-400">
          {review.date}
        </span>
        
        {onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;


