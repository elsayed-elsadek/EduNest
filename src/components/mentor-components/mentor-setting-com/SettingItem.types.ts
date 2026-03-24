
export interface SettingItemProps {
  label: string;
  description: string;
  value: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
  onClick?: () => void;
}