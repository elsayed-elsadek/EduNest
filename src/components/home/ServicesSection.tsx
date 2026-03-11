import React, { memo } from 'react';
import ServiceCard from './ServiceCard';
import { SERVICES } from '../../utils/constants';

// Memoized ServiceCard component
const ServiceCardMemo = memo(ServiceCard);
ServiceCardMemo.displayName = 'ServiceCardMemo';

const ServicesSection: React.FC = memo(() => {
  return (
    <section className="py-12 bg-[var(--primary-from)] dark:bg-gray-900 text-white max-h-full lg:max-h-[700px]">
      <div className="flex items-center justify-center mb-6">
        <span className="px-5 py-2 bg-yellow-100 dark:bg-yellow-900/30 font-bold text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
          Our Services
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-2 lg:px-16">
        <div className="text-center mb-10">
          <h3 className="text-white text-lg md:text-2xl font-bold m-auto md:w-2/3">
            We provide tailored solutions for students and mentors to make the most out of their learning journey
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Mentors column */}
          <div>
            <div className="flex items-center justify-start mb-6 flex-col">
              <span className="mentor px-5 py-2 bg-yellow-100 dark:bg-yellow-900/30 font-bold text-yellow-700 dark:text-yellow-400 rounded-full text-sm">For Mentors</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICES.mentors.map((s, idx) => (
                <ServiceCardMemo key={idx} title={s.title} description={s.desc} icon={s.icon as never} />
              ))}
            </div>
          </div>

          {/* Students column */}
          <div>
            <div className="flex items-center justify-end mb-6 flex-col">
              <span className="px-5 py-2 mentor bg-yellow-100 dark:bg-yellow-900/30 font-bold text-yellow-700 dark:text-yellow-400 rounded-full text-sm">For Students</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICES.students.map((s, idx) => (
                <ServiceCardMemo key={idx} title={s.title} description={s.desc} icon={s.icon as never} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection;

