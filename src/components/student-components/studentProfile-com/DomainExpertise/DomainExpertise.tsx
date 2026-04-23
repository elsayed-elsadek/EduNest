import type { FC } from 'react';
import type { DomainExpertiseProps } from './DomainExpertise.types';

const DomainExpertise: FC<DomainExpertiseProps> = ({ skills }) => (
  <div className="bg-[#0c2d48] rounded-2xl p-6 h-full relative overflow-hidden">
    {/* Decorative circle */}
    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border-[16px] border-white/5" />
    <div className="absolute -right-2 top-8 w-16 h-16 rounded-full border-[10px] border-white/5" />

    <h2 className="text-base font-bold text-white mb-4 relative z-10">Domain Expertise</h2>

    {/* Skill Tags */}
    <div className="flex flex-wrap gap-2 mb-4 relative z-10">
      {skills.map((skill) => (
        <span
          key={skill}
          className="px-3 py-1 text-xs font-semibold text-white border border-white/30 rounded-full bg-white/10 uppercase tracking-wide"
        >
          {skill}
        </span>
      ))}
    </div>

    {/* Validation Note */}
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 relative z-10">
      <p className="text-xs text-white/80 leading-relaxed">
        These skills have been validated through peer-reviewed projects and technical assessments.
      </p>
    </div>
  </div>
);

export default DomainExpertise;