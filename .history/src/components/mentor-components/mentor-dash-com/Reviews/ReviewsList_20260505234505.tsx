

import  type { FC } from 'react';
import ReviewCard from './ReviewCard';
import type { ReviewsListProps } from './Reviews.types';

const ReviewsList: FC<ReviewsListProps> = ({ 
  reviews = [
    {
      id: '1',
      studentName: 'Toqa nagy',
      studentAvatar: 'https://i.pravatar.cc/150?img=1',
      courseTitle: 'figma basic',
      rating: 5.0,
      comment: 'this is wonderful course. for beginner, i recommended',
      date: '26 Oct, 2026',
    },
    {
      id: '2',
      studentName: 'Toqa nagy',
      studentAvatar: 'https://i.pravatar.cc/150?img=2',
      courseTitle: 'figma basic',
      rating: 5.0,
      comment: 'this is wonderful course. for beginner, i recommended',
      date: '26 Oct, 2026',
    },
    {
      id: '3',
      studentName: 'Toqa nagy',
      studentAvatar: 'https://i.pravatar.cc/150?img=3',
      courseTitle: 'figma basic',
      rating: 5.0,
      comment: 'this is wonderful course. for beginner, i recommended',
      date: '26 Oct, 2026',
    },
    {
      id: '4',
      studentName: 'Toqa nagy',
      studentAvatar: 'https://i.pravatar.cc/150?img=4',
      courseTitle: 'figma basic',
      rating: 5.0,
      comment: 'this is wonderful course. for beginner, i recommended',
      date: '26 Oct, 2026',
    },
    {
      id: '5',
      studentName: 'Toqa nagy',
      studentAvatar: 'https://i.pravatar.cc/150?img=5',
      courseTitle: 'figma basic',
      rating: 5.0,
      comment: 'this is wonderful course. for beginner, i recommended',
      date: '26 Oct, 2026',
    },
    {
      id: '6',
      studentName: 'Toqa nagy',
      studentAvatar: 'https://i.pravatar.cc/150?img=6',
      courseTitle: 'figma basic',
      rating: 5.0,
      comment: 'this is wonderful course. for beginner, i recommended',
      date: '26 Oct, 2026',
    },
  ],
  maxDisplay = 6,
  onViewAll
}) => {
  const displayedReviews = reviews.slice(0, maxDisplay);

  const handleDelete = (id: string) => {
    console.log('Delete review:', id);
    // TODO: Implement delete functionality
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-primary dark:text-blue-400">
          Reviews from Students6
        </h2>
        
        <button
          onClick={onViewAll}
          className="text-[11px] text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
        >
          View All
        </button>
      </div>

      {/* Reviews List */}
      <div className="max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {displayedReviews.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm mt-1">You have not received any student reviews.</p>
          </div>
        ) : (
          displayedReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;


