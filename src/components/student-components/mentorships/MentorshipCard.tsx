import { type FC, memo, useState } from 'react';
import { Clock, User } from 'lucide-react';
import type { MentorshipData } from '../../../types/mentorship';
import { API_BASE_URL } from '../../../services/api';
import NoCover from '../../student-components/common/Nocover/Nocover';

interface MentorshipCardProps {
  mentorship: MentorshipData;
  onClick?: () => void;
  onHover?: () => void;
}

/**
 * Reusable MentorshipCard component
 * Displays individual mentorship program with image, details, pricing, and duration
 * Memoized to prevent unnecessary re-renders
 */
const MentorshipCard: FC<MentorshipCardProps> = memo(({ mentorship, onClick, onHover }) => {

  // Debug: Log mentorship data
  console.log('Mentorship data:', mentorship);

  // Format price with thousand separators
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Handle image loading error / show placeholder
  const [imgError, setImgError] = useState(false);
  const handleImageError = () => {
    console.warn('Image failed to load for mentorship:', mentorship.id, mentorship.title);
    setImgError(true);
  };



  return (
    <div className="group min-h-[480px] rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onHover}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {mentorship.coverImageUrl && !imgError ? (
          <img
            src={`${API_BASE_URL}${mentorship.coverImageUrl}`}
            alt={mentorship.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <NoCover title={mentorship.title} />
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full uppercase tracking-wide shadow-md">
            {mentorship.category}
          </span>
        </div>

        {/* Discount Badge */}
        {mentorship.discountPercentage > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-md">
              -{mentorship.discountPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col h-full">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1 hover:text-[var(--primary-500)] transition-colors">
          {mentorship.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 line-clamp-1 mb-3">
          {mentorship.subtitle}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-4 flex-grow">
          {mentorship.description}
        </p>

        {/* Mentor Info */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
          <User className="w-4 h-4 text-primary" />
          <span className="font-medium">by {mentorship.mentorName}</span>
        </div>

      

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-4" />

        {/* Pricing Section */}
        <div className="grid items-baseline flex-wrap gap-2  ">
          <div className="flex items-start  gap-2">
            {mentorship.discountPercentage > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(mentorship.priceAfterDiscount)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(mentorship.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(mentorship.price)}
              </span>
            )}
          </div>
            {/* Duration Info */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs text-gray-600 font-semibold">
            DURATION
          </span>
          <span className="font-medium">{mentorship.duration} months</span>
        </div>
        </div>
      </div>
    </div>
  );
});

MentorshipCard.displayName = 'MentorshipCard';

export default MentorshipCard;
