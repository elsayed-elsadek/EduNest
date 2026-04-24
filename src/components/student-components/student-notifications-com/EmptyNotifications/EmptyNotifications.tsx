import type { FC } from 'react';
import { Bell } from 'lucide-react';

const EmptyNotifications: FC = () => {
  return (
    <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-100">
      <div className="p-4 rounded-full bg-gray-100 w-fit mx-auto mb-4">
        <Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        You're all caught up! We'll notify you when there's something new.
      </p>
    </div>
  );
};

export default EmptyNotifications;