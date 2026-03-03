

import  type { FC } from 'react';
import { ChevronRight } from 'lucide-react';
import type { StatCardProps } from './StatCard.types';
const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  icon,
  hasArrow = true,
  onClick 
}) => {
  return (
    
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        group w-full bg-white rounded-[20px] p-5 md:p-6
        border border-blue-800 shadow-sm
        transition-all duration-300 flex flex-col
        ${onClick 
          ? 'hover:shadow-md hover:border-blue-400 cursor-pointer' 
          : 'cursor-default'
        }
      `}>
    {/* <! -- Title and Arrow --> */}
      <div className="flex items-center justify-between  mb-4 md:mb-6 w-full">
        <h3 className="text-[12px] md:text-[14px] font-medium text-gray-500 truncate">
          {title}
        </h3>
        {hasArrow && (
          <ChevronRight 
            className="w-4 h-4 flex-shrink-0 mr-16 text-gray-400 transition-transform group-hover:translate-x-1" 
            strokeWidth={2.5} 
          />
        )}
      </div>
 {/* <! -- Value and Icon --> */}
      <div className="flex items-center justify-between gap-2 w-full mt-auto">
  
  <div className="text-[24px] sm:text-[30px] md:text-[36px] font-bold text-gray-900 leading-none truncate">
    {value}
  </div>

  <div className="text-primary dark:text-blue-400 flex-shrink-0 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg transition-all group-hover:scale-110">
    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">
       {icon}
    </div>
  </div>
</div>
    </button>
  );
};



export default StatCard;


