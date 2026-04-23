export interface CredentialCardProps {
  iconBg:      string;           // e.g. 'bg-blue-100'
  icon:        React.ReactNode;
  tagLabel:    string;           // e.g. 'INSTITUTIONAL EMAIL'
  mainValue:   string;           // e.g. 'user@email.edu'
  description: string;
  actionLabel: string;
  onAction:    () => void;
}