

import  type{ FC } from 'react';
import ActivityItem from './ActivityItem';
import type { RecentActivityListProps } from './RecentActivity.types';

const RecentActivityList: FC<RecentActivityListProps> = ({ 
  activities = [
    {
      id: '1',
      studentName: 'Maria Garcia',
      action: 'Submitted final project',
      mentorshipTitle: 'figma Basic',
      timestamp: '30 minutes ago',
      type: 'submission',
    },
    {
      id: '2',
      studentName: 'David Kim',
      action: 'Asked a question in chat',
      mentorshipTitle: 'figma Basic',
      timestamp: '30 minutes ago',
      type: 'question',
    },
    {
      id: '3',
      studentName: 'Alex Johnson',
      action: 'Completed React module1',
      mentorshipTitle: 'figma Basic',
      timestamp: '30 minutes ago',
      type: 'completion',
    },
  ],
  maxDisplay = 5,
  title = 'Recent Students Activity',
}) => {
  const displayedActivities = activities.slice(0, maxDisplay);

  const handleView = (id: string) => {
    console.log('View activity:', id);
    // TODO: Navigate to activity detail
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200">
      {/* Header */}
      <h2 className="text-base font-bold text-primary dark:text-blue-400 mb-4">
        {title}
      </h2>

      {/* Activities List */}
      <div className="max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {displayedActivities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">You don't have any recent notifications.</p>
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity}
              onView={handleView}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivityList;


