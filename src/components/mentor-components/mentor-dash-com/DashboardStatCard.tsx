import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type IconType = FC<{ className?: string }>;

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  to?: string;
}

const DashboardStatCard: FC<DashboardStatCardProps> = ({
  title,
  value,
  icon: Icon,
  to,
}) => {
  const cardContent = (
    <div className="group flex items-center gap-4 rounded-xl border border-[var(--primary-500)] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Stat Icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--primary-500)] dark:bg-[var(--primary-500)]/10">
        <Icon className="h-5 w-5" />
      </div>

      {/* Stat Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <p className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          {value}
        </p>
      </div>

      {/* Navigation Arrow */}
      {to && (
        <div className="flex-shrink-0">
          <ArrowRight className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--primary-500)]" />
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default DashboardStatCard;