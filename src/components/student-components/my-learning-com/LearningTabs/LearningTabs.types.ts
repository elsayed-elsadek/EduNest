import type { TabKey } from '../../../../types/student-role-types/learning.types';

export interface LearningTabsProps {
  activeTab:    TabKey;
  onTabChange:  (tab: TabKey) => void;
}