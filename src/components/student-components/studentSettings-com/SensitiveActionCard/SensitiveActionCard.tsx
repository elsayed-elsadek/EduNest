import type { FC } from 'react';
import type { SensitiveActionCardProps } from './SensitiveActionCard.types';

const STYLES = {
  deactivate: {
    wrapper:  'bg-white border border-gray-200',
    title:    'text-yellow-600',
    desc:     'text-yellow-600',
    btn:      'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
  },
  delete: {
    wrapper:  'bg-white border border-gray-200',
    title:    'text-gray-900',
    desc:     'text-gray-600',
    btn:      'bg-red-500 hover:bg-red-600 text-white',
  },
} as const;

const SensitiveActionCard: FC<SensitiveActionCardProps> = ({
  variant, title, description, actionLabel, onAction,
}) => {
  const s = STYLES[variant];

  return (
    <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${s.wrapper}`}>
      <div className="flex-1 min-w-0">
        <h3 className={`text-base font-bold ${s.title}`}>{title}</h3>
        <p className={`text-sm mt-1 leading-relaxed ${s.desc}`}>{description}</p>
      </div>
      <button
        onClick={onAction}
        className={`flex-shrink-0 w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${s.btn}`}
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default SensitiveActionCard;