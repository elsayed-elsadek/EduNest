import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { id: 'overview', label: 'Overview', to: '' },
  { id: 'content', label: 'Content', to: 'content' },
  { id: 'reviews', label: 'Reviews', to: 'reviews' },
  { id: 'leaderboard', label: 'Leaderboard', to: 'leaderboard' },
] as const;

const MentorshipTabsNav: FC = () => {
  return (
    <nav className="border-b border-gray-200 bg-white sticky rounded-2xl top-0 z-20 backdop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mb-px flex space-x-8  overflow-x-auto sm:justify-center lg:justify-start">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.to}
              end={tab.id === 'overview'}
              className={({ isActive }) => `
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${isActive
                  ? 'border-[var(--primary-500)] text-[var(--primary-500)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MentorshipTabsNav;

