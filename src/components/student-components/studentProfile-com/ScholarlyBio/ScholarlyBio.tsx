import type { FC } from 'react';
import { BookOpen } from 'lucide-react';
import type { ScholarlyBioProps } from './ScholarlyBio.types';

const ScholarlyBio: FC<ScholarlyBioProps> = ({ bio }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full">
    <div className="flex items-center gap-2 mb-4">
      <BookOpen className="w-5 h-5 text-[#0c2d48]" />
      <h2 className="text-base font-bold text-gray-900">Scholarly Bio</h2>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">
      {bio || 'No bio added yet.'}
    </p>
  </div>
);

export default ScholarlyBio;