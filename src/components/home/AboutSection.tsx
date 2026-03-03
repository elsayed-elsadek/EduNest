import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

type StatCard = {
  icon: any;
  value: string;
  label: string;
};

type Props = {
  images: string[];
  stats: StatCard[];
};

const AboutSection: React.FC<Props> = ({ images, stats }) => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        {/* Right: Content - order-1 on mobile, order-2 on desktop */}
        <div className="w-full order-1 lg:order-2">
          <h3 className="text-[#0f5e8b] font-semibold mb-2 text-sm sm:text-base md:text-lg">About Us</h3>
          <h4 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 leading-tight">
            Empowering Students & Mentors<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>to Grow Together
          </h4>

          <p className="text-sm sm:text-base md:text-md text-gray-600 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
            EduNest was created to connect passionate IT students with experienced mentors, who can guide them toward real-world success. Our mission is to make learning more practical, personal, and inspiring.
          </p>

          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 sm:p-4 md:p-5 rounded mb-5 sm:mb-6 md:mb-8">
            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
              <strong>With personalized mentorship and hands-on learning,</strong> EduNest helps learners gain real-world experience and grow with confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-start gap-2 ">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#0f5e8b] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  <FontAwesomeIcon 
                    icon={stat.icon} 
                    className="text-base sm:text-lg md:text-xl"
                  />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] sm:text-[18px] md:text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left: Images collage - order-2 on mobile, order-1 on desktop */}
        <div className="relative rounded-2xl sm:rounded-3xl md:rounded-[32px] lg:rounded-[36px] bg-gradient-to-br from-[#fff6e9] via-white to-[#e0f0ff] p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 order-2 lg:order-1">
          {/* primary image */}
          <div className="flex-1 min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[280px] xl:min-h-[320px]">
            {images[0] ? (
              <img
                src={images[0]}
                alt="about-primary"
                className="w-full h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[280px] xl:h-[300px] object-cover rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              />
            ) : (
              <div className="w-full h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[280px] xl:h-[300px] rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[32px] bg-gray-200" />
            )}
          </div>

          {/* stacked images */}
          <div className="flex-1 flex flex-col ">
            <div className="flex-1 lg:flex items-center justify-center hidden">
              {images[1] ? (
                <div className="rounded-full border-2 sm:border-[3px] border-dashed border-[#e4a918] flex items-center justify-center overflow-hidden aspect-square">
                  <img
                    src={images[1]}
                    alt="about-secondary"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-full h-full max-w-[200px] sm:max-w-none max-h-[200px] sm:max-h-none rounded-full border-2 sm:border-[3px] md:border-4 border-dashed border-[#e4a918] bg-white aspect-square" />
              )}
            </div>

            <div className="flex-1 min-h-[120px] sm:min-h-[130px] md:min-h-[200px] lg:min-h-[150px] md:mt-0 lg:mt-3 hidden sm:flex">
              {images[2] ? (
                <img
                  src={images[2]}
                  alt="about-tertiary"
                  className="w-full h-full min-h-[120px] sm:min-h-[130px] md:min-h-[200px] lg:min-h-[150px] xl:h-[18rem] object-cover rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[24px]"
                />
              ) : (
                <div className="w-full h-full min-h-[120px] sm:min-h-[130px] md:min-h-[200px] lg:min-h-[150px] xl:h-[18rem] rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[24px] bg-gray-200" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;


