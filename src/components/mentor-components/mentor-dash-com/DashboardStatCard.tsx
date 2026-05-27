import type { FC } from 'react';

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type IconType = FC<{ className?: string }>;

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  icon: IconType;
  to?: string;
};

const DashboardStatCard: FC<DashboardStatCardProps> = ({ title, value, icon: Icon, to }) => {
  const isClickable = !!to;

  if (isClickable) {
    return (
      <Link
        to={to!}
        className="group block outline-none ring-offset-2 focus-visible:ring-2 ring-[var(--primary-from)] rounded-2xl"
      >
        <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--primary-500)] dark:border-zinc-800 shadow-sm h-[8rem] transition-colors ">
          <div className="flex items-center gap-4 md:flex-wrap ">
            <div className="p-3 rounded-xl flex-shrink-0 bg-blue-50 text-[var(--primary-500)]  group-hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 ">
              <Icon className="w-6 h-6 " />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>

          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-400 group-hover:bg-blue-50 group-hover:text-[var(--primary-500)] dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-all duration-300">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--primary-500)] dark:border-zinc-800 shadow-sm h-[8rem] transition-colors ">
      <div className="flex items-center gap-4 md:flex-wrap">
        <div className="p-3 rounded-xl flex-shrink-0 bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatCard;


