
import type { FC } from 'react';
import type { SettingToggleProps } from './SettingToggle.types';

const SettingToggle: FC<SettingToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  icon,
}) => {
  return (
    <div className="flex items-start justify-between py-5 border-b border-gray-100 last:border-b-0 gap-4">
      {/* Left Side - Icon, Label, Description */}
      <div className="flex items-start gap-4 flex-1">
        {icon && (
          <div className="flex-shrink-0 text-gray-500 mt-0.5">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#1A1C1E]">
            {label}
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Right Side - Toggle Switch */}
      <div className="flex-shrink-0 pt-0.5">
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-5 w-10 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${checked ? 'bg-[#33A1E0]' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default SettingToggle;