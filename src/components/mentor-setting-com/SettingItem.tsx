

import  type { FC } from 'react';
import type { SettingItemProps } from './SettingItem.types';

const SettingItem: FC<SettingItemProps> = ({
  label,
  description,
  value,
  icon,
  actionButton,
//   onClick,
}) => {
  return (
    <div className="flex items-center justify-between py-5 border-b border-gray-100 last:border-b-0">
      {/* Left Side */}
      <div className="flex items-center gap-4 flex-1">
        {icon && (
          <div className="flex-shrink-0 text-gray-600">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {label}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-red-600">
          {value}
        </span>
        {actionButton}
      </div>
    </div>
  );
};

export default SettingItem;