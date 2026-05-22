import type { FC } from 'react';
import type { CredentialCardProps } from './CredentialCard.types';

const CredentialCard: FC<CredentialCardProps> = ({
  iconBg, icon, tagLabel, mainValue, description, actionLabel, onAction,
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
    {/* Mobile: Stack vertically, Desktop: Side by side */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left: Icon + Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            {tagLabel}
          </p>
          <p className="text-sm font-bold text-gray-900 truncate">{mainValue}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Right: Action Button */}
      <div className="flex-shrink-0 sm:ml-4">
        <button
          onClick={onAction}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-[#0c2d48] rounded-xl hover:bg-[#0a2438] transition-colors shadow-sm whitespace-nowrap"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  </div>
);

export default CredentialCard;