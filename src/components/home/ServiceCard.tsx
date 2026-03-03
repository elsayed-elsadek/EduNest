import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

type Props = {
  icon: never ,
  title: string;
  description: string;
};

const ServiceCard: React.FC<Props> = ({ title, description, icon }) => {
  return (
    <div 
    className="bg-white rounded-2xl w-full shadow-lg p-6 
    lg:h-[230px]

    grid  gap-4 relative items-center">
      {/* small icon box */}
      <div className="flex-shrink-0 w-12 h-12 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary dark:text-blue-400 text-lg shadow-sm">
      <FontAwesomeIcon icon={icon} className='text-2xl'/>
      </div>

      <div>
        <h4 className="text-base font-semibold text-gray-800 leading-tight">{title}</h4>
        <p className="text-sm text-gray-400 mt-2 max-w-[320px]">{description}</p>
      </div>

      {/* subtle bottom drop shadow to emulate lifted card edge */}
      <div className="pointer-events-none absolute left-6 right-6 bottom-2 h-3 rounded-b-2xl bg-gradient-to-b from-transparent to-black/5 opacity-40" />
    </div>
  );
};

export default React.memo(ServiceCard);



