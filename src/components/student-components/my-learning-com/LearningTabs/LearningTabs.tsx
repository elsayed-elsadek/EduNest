import type { FC } from 'react';
import type { LearningTabsProps } from './LearningTabs.types';
import type { TabKey } from '../../../../types/student-role-types/learning.types';
import { theme } from '../../../../theme/colors';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'enrollment',    label: 'My Enrollment'  },
  { key: 'achievement',   label: 'Achievement'    },
  { key: 'certification', label: 'Certification'  },
];

const LearningTabs: FC<LearningTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`
            relative pb-3 px-1 mr-8 text-sm font-medium transition-colors duration-200
            ${activeTab === key
              ? 'text-primary-500'
              : 'text-gray-500 hover:text-gray-800'
            }
          `}
        >
          {label}
          {activeTab === key && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: theme.primary[500] }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default LearningTabs;