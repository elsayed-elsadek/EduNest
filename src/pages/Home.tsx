import React, { memo } from 'react';
import { useHomeImages } from '../hooks/useHomeImages';
import LogoStrip from '../components/common/LogoStrip';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import MentorshipsSection from '../components/home/MentorshipsSection';
import AboutSection from '../components/home/AboutSection';
import { ABOUT_IMAGES, ABOUT_STATS, dummyBlogs } from '../utils/constants';
import Blog from '../components/home/Blog';
import Testimonials from '../components/home/Testimonials';
import ContactUsSection from '../components/home/ContactUsSection';
import FooterSection from '../components/home/FooterSection';
import { Link } from 'react-router-dom';

// Memoized Hero section for better performance
const HeroSection = memo(({ img }: { img: ReturnType<typeof useHomeImages> }) => (
  <section id="home" className="relative overflow-hidden bg-white">
    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 xl:px-16 py-10 xl:py-24 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

      {/* Left content */}
     <div className="z-10 w-full text-center grid items-center justify-center lg:justify-start">
  <h1 className="blueTextColor text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
    Learn.Mentor. Grow. 
    <br />
    <span className="block">All in one place.</span>
  </h1>
  
  <p className="mt-6 text-gray-500 text-sm sm:text-base max-w-xl mx-auto xl:mx-0">
    Join a community where mentors share experience and students grow with real-world guidance
  </p>

  <div className="mt-8 flex items-center justify-center xl:justify-center gap-4 flex-wrap">
    <Link to="/register" className="px-5 py-2 blueBGColor text-white rounded-full font-medium transition-transform hover:scale-105 text-sm sm:text-base">
      Become a mentor
    </Link>
    <Link to="/register" className="px-5 py-2 border border-blue-200 rounded-full text-gray-500 font-medium transition-colors hover:bg-gray-50 text-sm sm:text-base">
      Join now
    </Link>
  </div>

  <div className="mt-6 flex items-center justify-center xl:justify-center gap-3">
    <div className="-space-x-2 flex items-center">
      {img.persons.map((personImg, index) => (
        <img 
          key={index} 
          src={personImg} 
          alt={`avatar-${index}`} 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm object-cover"
          loading="lazy"
          width={40} 
          height={40} 
        />
      ))}
    </div>
    <span className="text-gray-400 text-xs sm:text-sm">Join 1,000 mentors and students</span>
  </div>
</div>

      {/* Right composition */}
      <div className="relative w-full flex justify-center lg:justify-end mt-6 lg:mt-0">
        <div className="w-full sm:w-[90%] md:w-full max-w-[620px] h-[480px] sm:h-[520px] lg:h-[550px] rounded-[40px] bg-gradient-to-br from-orange-50/75 via-white/40 to-blue-50/60 backdrop-blur-sm relative flex items-center justify-center">

          {/* Book */}
          <div className="absolute left-10 z-10 md:-top-20 -top-14 hidden lg:block">
            <img
              src={img.book || ""}
              alt="book"
              className="lg:w-32 w-24 lg:h-40 rounded-lg"
              loading="lazy"
              width={128}
              height={160}
            />
          </div>

          {/* Mentors Card */}
          <div className="absolute z-10 lg:-left-8 lg:top-20 top-[60%] left-2 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
            <img
              src={img.person3 || ""}
              alt="mentor"
              className="w-10 h-10 rounded-full object-cover"
              loading="lazy"
              width={40}
              height={40}
            />

            <div>
              <div className="text-sm font-semibold">100+</div>
              <div className="text-xs text-gray-400">mentors</div>
            </div>
          </div>

          {/* Rating Card */}
          <div className="absolute z-10 lg:-left-16 lg:top-[65%] left-2 top-[75%] bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center">
              ⭐
            </div>

            <div>
              <div className="text-sm font-semibold">4.9/5.00</div>
              <div className="text-xs text-gray-400">Trusted by students</div>
            </div>
          </div>

          {/* Main image */}
          <div className="relative w-full max-w-[550px] h-[320px] sm:h-[380px] lg:h-[400px] px-4">
            {img.img1 ? (
              <img
                src={img.img1}
                alt="students"
                className="w-full h-full object-cover rounded-[30px] shadow-sm"
                fetchPriority="high"
                width={550}
                height={400}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-[30px]" />
            )}
          </div>
        </div>
      </div>

    </div>

    {/* Bottom logo strip */}
    <LogoStrip />
  </section>
));

HeroSection.displayName = 'HeroSection';

const Home: React.FC = () => {
  const img = useHomeImages();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Critical for LCP */}
      <HeroSection img={img} />

      {/* Services section */}
      <section id="services">
        <ServicesSection />
      </section>

      {/* why choose us section */}
      <section id="why-us">
        <WhyChooseUsSection />
      </section>

      {/* Mentorships section */}
      <section id="mentorships">
        <MentorshipsSection />
      </section>

      {/* About section */}
      <section id="about">
        <AboutSection images={ABOUT_IMAGES} stats={ABOUT_STATS} />
      </section>

      {/* Blog section */}
      <section id="blogs">
        <Blog dummyBlogs={dummyBlogs}/>
      </section>

      {/* Testimonials section */}
      <section id="testimonials">
        <Testimonials />
      </section>

      {/* ContactUs section */}
      <section id="contactUs">
        <ContactUsSection />
      </section>

      {/* FooterSection section */}
      <section id="footerSection" className="mt-20">
        <FooterSection />
      </section>
    </div>
  );
};

export default memo(Home);