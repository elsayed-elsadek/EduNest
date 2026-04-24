import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { SectionHeadingProps } from './SectionHeading.types';

const SectionHeading: FC<SectionHeadingProps> = ({ label, variant = 'default' }) => {
  if (variant === 'danger') {
    return (
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold text-red-500">{label}</h2>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 bg-[#0c2d48] rounded-full" />
      <h2 className="text-xl font-bold text-gray-900">{label}</h2>
    </div>
  );
};

export default SectionHeading;