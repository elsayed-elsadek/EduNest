

import  type { FC } from 'react';
import type { SettingToggleProps } from './SettingToggle.types';

const SettingToggle: FC<SettingToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  icon,
}) => {
  return (
    <div className="flex items-center justify-between py-5 border-b border-gray-100 last:border-b-0">
      {/* Left Side - Icon, Label, Description */}
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex-shrink-0 text-gray-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {label}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* Right Side - Toggle Switch */}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

export default SettingToggle;