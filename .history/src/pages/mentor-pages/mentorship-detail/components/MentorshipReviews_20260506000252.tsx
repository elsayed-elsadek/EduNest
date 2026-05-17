import type { FC } from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../types';

interface MentorshipReviewsProps {
    reviews: Review[];
}

const MentorshipReviews: FC<MentorshipReviewsProps> = ({ reviews }) => {
    return (
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Reviews on this Mentorship</h3>
            <div className="divide-y divide-gray-100 max-h-44 md:max-h-56 overflow-y-auto pr-2">
                {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews yet</p>
                ) : (
                    reviews.map((r, idx) => (
                        <div key={idx} className="py-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    {(r.useremail || 'U').charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{r.userName ?? r.name ?? 'Anonymous'}</p>
                                        <div className="text-xs text-yellow-500 flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            {r.rating ?? 5}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{r.comment ?? r.message ?? ''}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MentorshipReviews;



