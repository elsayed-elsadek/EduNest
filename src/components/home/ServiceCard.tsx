import React from 'react';
import { Lightbulb, BookOpen, Users, GraduationCap, Award, Globe, MessageCircle, Video, Zap, Calendar, ArrowRightLeft, Route, TrendingUp, Briefcase, Check, Star, Laptop, Trophy } from 'lucide-react';

// Icon mapping from string icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Users': Users,
  'BookOpen': BookOpen,
  'Calendar': Calendar,
  'ArrowRightLeft': ArrowRightLeft,
  'Route': Route,
  'TrendingUp': TrendingUp,
  'Briefcase': Briefcase,
  'Check': Check,
  'Star': Star,
  'Laptop': Laptop,
  'Trophy': Trophy,
  'GraduationCap': GraduationCap,
  'Award': Award,
  'Globe': Globe,
  'MessageCircle': MessageCircle,
  'Video': Video,
  'Zap': Zap,
  'Lightbulb': Lightbulb,
};

type Props = {
  icon: string;
  title: string;
  description: string;
};

const ServiceCard: React.FC<Props> = ({ title, description, icon }) => {
  // Get the icon component from the map, default to Lightbulb
  const IconComponent = iconMap[icon] || Lightbulb;

  return (
    <div 
    className="bg-white rounded-2xl w-full shadow-lg p-6 
    lg:h-[230px]

    grid  gap-4 relative items-center">
      {/* small icon box */}
      <div className="flex-shrink-0 w-12 h-12 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary dark:text-blue-400 text-lg shadow-sm">
      <IconComponent className='text-2xl' />
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



