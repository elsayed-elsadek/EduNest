import React, { memo } from 'react';
import { useHomeImages } from '../hooks/useHomeImages';
import LogoStrip from '../components/common/LogoStrip';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import MentorshipsSection from '../components/home/MentorshipsSection';
import AboutSection from '../components/home/AboutSection';
import { ABOUT_IMAGES, ABOUT_STATS, MENTORSHIPS , dummyBlogs} from '../utils/constants';
import Blog from '../components/home/Blog';
import Testimonials from '../components/home/Testimonials';
import ContactUsSection from '../components/home/ContactUsSection';
import FooterSection from '../components/home/FooterSection';
import { Link } from 'react-router-dom';

// Memoized Hero section for better performance
const HeroSection = memo(({ img }: { img: ReturnType<typeof useHomeImages> }) => (
  <section id="home" className="relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-16 py-10 lg:py-24 grid grid-cols-1 lg:grid-cols-2 md:gap-10 items-center justify-items-center">
      {/* Left content */}
      <div className="z-10 mb-10 md:mb-0 ">
        <h1 className="blueTextColor text-3xl md:text-5xl font-extrabold leading-tight text-center md:text-left">
          Learn.Mentor. Grow
          <br />
          <span className="block">All in one place.</span>
        </h1>

        <p className="mt-6 text-gray-500 max-w-xl text-center md:text-left">
          Join a community where mentors share experience and students grow with real-world guidance
        </p>

        <div className="mt-8 flex items-center gap-4 flex-wrap">
          <Link to="/register" className="px-5 py-2 blueBGColor text-white rounded-full font-medium">Become a mentor</Link>
          <Link to="/register" className="px-5 py-2 border border-blue-200 rounded-full text-gray-500 font-medium">Join now</Link>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="-space-x-2 flex items-center">
            {img.persons.map((personImg, index) => (
              <img 
                key={index} 
                src={personImg} 
                alt={`avatar-${index}`} 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                loading="lazy"
                width="360" 
  height="400" 
              />
            ))}
          </div>
          <span className="text-gray-400 text-sm">Join 1,000 mentors and students</span>
        </div>
      </div>

      {/* Right composition */}
      <div className="relative flex justify-center lg:justify-end">
        <div className="sm:w-[90%] md:w-[540px] h-[480px] rounded-[40px] bg-gradient-to-br from-orange-50/75 via-white/40 to-blue-50/60 backdrop-blur-sm relative flex items-center justify-center">
          {/* decorative floating cards */}
          <div className="absolute left-10 z-10 md:-top-20 -top-14 ">
            <img 
              src={img.book || ''} 
              alt="book" 
              className="lg:w-32 w-24 lg:h-40 rounded-lg" 
              loading="lazy"
              width={128}
              height={160}
            />
          </div>

          <div className="absolute lg:-left-5 z-10 lg:top-20 top-[60%] left-2 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
            <img 
              src={img.person3 || ''} 
              alt="mentor" 
              className="w-10 h-10 rounded-full"
              loading="lazy"
               width={128}
              height={160}
            />
            <div>
              <div className="text-sm font-semibold">100+</div>
              <div className="text-xs text-gray-400">mentors</div>
            </div>
          </div>

          <div className="absolute z-10 lg:-left-12 lg:top-[65%] left-2 top-[75%] bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center">⭐</div>
            <div>
              <div className="text-sm font-semibold">4.9/5.00</div>
              <div className="text-xs text-gray-400">Trusted by student</div>
            </div>
          </div>

          <div className="absolute -right-4 z-10 top-10 hidden lg:block">
            <img 
              src={img.stars || ''} 
              alt="stars" 
              className="w-25 h-20 rounded-lg opacity-75"
              loading="lazy"
              width={100}
              height={80}
            />
          </div>

          {/* main image - PRIORITY loading for LCP */}
          <div className="relative lg:w-[360px] w-[90%] h-[400px]">
            {img.img1 ? (
              <img 
                src={img.img1} 
                alt="students" 
                className="w-full h-full object-cover rounded-[30px] shadow-2xl"
                // Priority loading for LCP optimization
                fetchPriority="high"
                width={380}
                height={400}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-[30px]" />
            )}
          </div>
        </div>
      </div>
      
    </div>

    {/* bottom logo strip */}
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
        <MentorshipsSection mentorships={MENTORSHIPS} />
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

