

import type  { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  hasArrow?: boolean;
  onClick?: () => void;
}