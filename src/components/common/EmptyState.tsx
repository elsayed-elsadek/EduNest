import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  fullSize?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  fullSize = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullSize ? 'min-h-[400px]' : 'py-12'}`}>
      {icon ? (
        <div className="w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
      <div className="text-center">
        <p className="text-gray-700 font-semibold">{title}</p>
        <p className="text-gray-500 text-sm mt-1">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
