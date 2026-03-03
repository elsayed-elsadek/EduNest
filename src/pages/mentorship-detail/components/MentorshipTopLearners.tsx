import type { FC } from 'react';
import type { Learner } from '../types';

interface MentorshipTopLearnersProps {
    topLearners: Learner[];
}

const MentorshipTopLearners: FC<MentorshipTopLearnersProps> = ({ topLearners }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top learner</h3>
                <button className="text-xs text-blue-500">View all</button>
            </div>
            <div className="space-y-3">
                {topLearners.length === 0 ? (
                    <p className="text-sm text-gray-500">No learners data</p>
                ) : (
                    topLearners.slice(0, 3).map((t, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                    {(t.name || 'T').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{t.name ?? t.userName}</p>
                                    <p className="text-xs text-gray-400">Progress: {t.progress ?? '—'}</p>
                                </div>
                            </div>
                            <div className="text-xs text-yellow-500">{t.points ?? ''}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MentorshipTopLearners;



