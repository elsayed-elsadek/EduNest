
import type { FC } from 'react';
import type { SettingItemProps } from './SettingItem.types';

const SettingItem: FC<SettingItemProps> = ({
  label,
  description,
  value,
  icon,
  actionButton,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-100 last:border-b-0 gap-4">
      {/* Left Side */}
      <div className="flex items-start gap-4 flex-1">
        {icon && (
          <div className="flex-shrink-0 text-gray-500 mt-0.5 md:mt-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {label}
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-4">
        {value && (
          <span className="text-xs md:text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md sm:bg-transparent sm:p-0">
            {value}
          </span>
        )}
        <div className="flex-shrink-0">
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default SettingItem;


