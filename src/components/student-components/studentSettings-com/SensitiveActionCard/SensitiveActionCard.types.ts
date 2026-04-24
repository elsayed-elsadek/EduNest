export type SensitiveVariant = 'deactivate' | 'delete';

export interface SensitiveActionCardProps {
  variant:     SensitiveVariant;
  title:       string;
  description: React.ReactNode;
  actionLabel: string;
  onAction:    () => void;
}