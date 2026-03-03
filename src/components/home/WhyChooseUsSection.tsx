import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WHY_CHOOSE_US_FEATURES } from '../../utils/constants';
const WhyChooseUsSection = () => {

  // بيانات الأقسام
 const features = WHY_CHOOSE_US_FEATURES;

  return (
    <div className="flex justify-center px-4 py-12 sm:px-6 lg:px-8 lg:mt-40 mt-10">
      {/* الـ Div الرئيسي الأزرق الداكن */}
      <div className="flex sm:w-full md:w-[80%] lg:w-[90%] max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-[var(--primary-from)] dark:bg-gray-900 text-white flex-col lg:flex-row">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex-1 px-6 py-8 md:py-8 md:px-7 text-center lg:text-left flex flex-col gap-3 items-center lg:items-start justify-center min-h-[180px] lg:min-h-[220px]
                        ${index < features.length - 1 ? 'lg:border-r lg:border-white/20' : ''} border-b border-white/10 last:border-b-0 lg:border-b-0`}
          >
            {feature.icon && (
              <div className="text-2xl lg:text-3xl text-amber-400">
                <FontAwesomeIcon icon={feature.icon}  />
              </div>
            )}

            <div className="space-y-1">
              {/* العنوان */}
              <h3 className="text-lg lg:text-[19px] font-bold tracking-wide">
                {feature.title}
              </h3>

              {/* الوصف */}
              <p className="text-xs lg:text-sm opacity-80 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUsSection;


