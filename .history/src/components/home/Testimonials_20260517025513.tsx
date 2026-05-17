import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { TESTIMONIALS_DATA, FAQ_ITEMS } from '../../utils/constants'; 
import askedImg from '../../assets/homePage/ask.webp'; 

const CombinedClientAndFAQSections: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };
  
  // 1. قسم آراء العملاء (Testimonials Section)
  const renderTestimonialsSection = () => (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 inline-block relative pb-2">
            What our Clients Say
          </h2>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {TESTIMONIALS_DATA.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 flex flex-col justify-between min-h-[250px] relative"
            >
              
              {/* Quote Content */}
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center mt-auto border-t border-gray-100 pt-4">
                {/* Author Image */}
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
                
                {/* Name and Role */}
                <div>
                  <div className="font-semibold text-sm text-gray-900">{testimonial.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{testimonial.role}</div>
                </div>
              </div>

              {/* Dots Decoration */}
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <span className="block w-2 h-2 bg-green-300 rounded-full mb-1"></span>
                <span className="block w-2 h-2 bg-green-300 rounded-full mb-1 opacity-70"></span>
                <span className="block w-2 h-2 bg-green-300 rounded-full opacity-40"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // 2. قسم الأسئلة المتكررة (FAQ Section)
  const renderAccordionItem = (item: typeof FAQ_ITEMS[0]) => {
    const isOpen = openId === item.id;
    return (
      <div key={item.id} className="border border-gray-200 rounded-lg mb-4 last:mb-0 bg-white">
        <button
          className="flex justify-between items-center w-full p-4 text-left font-medium text-base text-gray-700 transition-colors"
          onClick={() => toggleAccordion(item.id)}
          aria-expanded={isOpen}
        >
          <span>{item.question}</span>
          <FontAwesomeIcon 
            icon={isOpen ? faChevronUp : faChevronDown} 
            className={`w-3 h-3 text-gray-400 transition-transform`} 
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ maxHeight: isOpen ? '999px' : '0' }}
        >
          <p className="text-sm text-gray-600 px-4 pb-4">{item.answer}</p>
        </div>
      </div>
    );
  };
  
  const renderFAQSection = () => (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Header and Question Mark Icon */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h2 className="text-3xl sm:text-[29px] font-bold text-gray-900 mb-6 leading-tight mt-10">
            Frequently asked questions
          </h2>
          {/* Question Mark Image Placeholder */}
          <div className="w-56 h-56 mt-8">
            <div className="w-full h-full flex items-center justify-center relative">
              <img src={askedImg } alt="askedImg" />
        
            </div>
          </div>
        </div>

        {/* Right Side: Accordion List */}
        <div className="lg:col-span-8 w-full mt-10 lg:mt-0">
          {FAQ_ITEMS.map(renderAccordionItem)}
        </div>
        
      </div>
    </section>
  );
  
  return (
    <div className="CombinedSectionsContainer">
      {renderTestimonialsSection()}
      {renderFAQSection()}
    </div>
  );
};

export default CombinedClientAndFAQSections;


