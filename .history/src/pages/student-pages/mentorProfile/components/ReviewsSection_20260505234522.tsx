import { Star, MessageCircleWarning, User } from 'lucide-react';
import { getImageUrl } from '../../../../utils/imageUtils';
import type { MentorProfileReview } from '../../../../services/student-roleService/mentorProfile.api';

interface ReviewsSectionProps {
  reviews: MentorProfileReview[];
}

// Reviews Section
const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  return (
    <section className="space-y-8">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Student Reviews</h2>
          <button className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all">Write a Review</button>
       </div>
       
{reviews.length > 0 && (
          <div className="flex items-center gap-2 text-xl font-bold border-b border-slate-100 pb-6 mb-8">
             <Star className="w-6 h-6 fill-[var(--primary-500)] text-[var(--primary-500)]" />
             <span>{(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}</span>
             <span className="text-slate-400 font-medium text-sm">based on {reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
          </div>
       )}

       <div className="space-y-4">
         {reviews.length === 0 ? (
            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center gap-4">
               <MessageCircleWarning className="w-12 h-12 text-slate-300" />
               <p className="text-lg font-medium text-slate-900">No reviews yet</p>
               <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
                  This mentor has not received any student feedback yet. Students who have engaged with this mentor will see their reviews here.
               </p>
            </div>
         ) : reviews.map((rev) => {
            const reviewerImageUrl = getImageUrl(rev.reviewerImageUrl ?? undefined);
            return (
            <div key={rev.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition hover:border-[var(--primary-500)]/10">
               <div className="flex justify-between mb-4 flex-wrap gap-4">
                  <div className="flex gap-4 items-center">
                     <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                       {reviewerImageUrl ? (
                         <img 
                           src={reviewerImageUrl} 
                           alt={rev.reviewerName} 
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             (e.target as HTMLImageElement).style.display = 'none';
                           }}
                         />
                       ) : (
                         <User className="w-6 h-6 text-slate-400" />
                       )}
                     </div>
                     <div>
                        <h4 className="font-semibold text-slate-900">{rev.reviewerName}</h4>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{rev.reviewerTitle}</p>
                     </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                     <div className="flex gap-0.5 mb-1.5">
                        {[...Array(5)].map((_, i) => {
                          const isFilled = i < Math.round(rev.rating);
                          return (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${isFilled ? 'fill-[var(--primary-500)] text-[var(--primary-500)]' : 'text-slate-300'}`}
                            />
                          );
                        })}
                     </div>
                     <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">2 Days Ago</p>
                  </div>
               </div>
               <p className="text-slate-600 italic leading-relaxed font-normal text-center">"{rev.comment}"</p>
            </div>
            );
         })}
       </div>
    </section>
  );
};

export default ReviewsSection;


