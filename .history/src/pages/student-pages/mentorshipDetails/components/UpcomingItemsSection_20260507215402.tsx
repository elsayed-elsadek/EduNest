import type { FC } from 'react';
import type { PaginatedUpcomingItems } from '../../../../types/student-role-types/studentMentorshipTypes';

interface UpcomingItemsSectionProps {
  upcomingItems?: PaginatedUpcomingItems;
}

const UpcomingItemsSection: FC<UpcomingItemsSectionProps> = ({ upcomingItems }) => {
  // Filter out items with missing essential values
  const validItems = upcomingItems?.content?.filter(item => 
    item && 
    item.id && 
    item.title && 
    item.type && 
    item.dueDate
  ) ?? [];

  if (!validItems || validItems.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Deadlines</h2>

      <div className="space-y-4">
        {upcomingItems.content.map((item) => {
          const dueDate = new Date(item.dueDate);
          const isOverdue = dueDate < new Date();

          return (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-6 rounded-xl border transition-all ${
                isOverdue 
                  ? 'border-red-200 bg-red-50 hover:border-red-300' 
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                isOverdue ? 'bg-red-500' : 'bg-[var(--primary-500)]'
              }`} />
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                <p className="text-sm text-slate-600 mt-1">{item.weekTitle}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                  isOverdue
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-[var(--primary-500)]'
                }`}>
                  {item.type}
                </span>
                <p className={`text-xs mt-1 font-medium ${
                  isOverdue ? 'text-red-600' : 'text-slate-700'
                }`}>
                  {dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {upcomingItems.totalPages > 1 && (
        <div className="mt-8 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Showing {upcomingItems.content.length} of {upcomingItems.totalElements} items
          </p>
        </div>
      )}
    </section>
  );
};

export default UpcomingItemsSection;
