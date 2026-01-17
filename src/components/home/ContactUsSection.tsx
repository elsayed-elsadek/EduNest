import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHome, faPhone } from '@fortawesome/free-solid-svg-icons';

const ContactUsSection: React.FC = () => {

  // يمكنك إضافة منطق التعامل مع إرسال النموذج هنا (مثل handleSubmit)

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 sm:gap-16 items-start">

          
          {/* Left Side: Content and Info */}
          <div className="order-2 lg:order-1 h-[100%] grid  content-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-base text-gray-600 mb-8 max-w-md">
              We are committed to processing the information in order to contact you and talk about your project.
            </p>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-600" />
                <a href="mailto:example@teamwebflow.com" className="text-base text-gray-800 hover:text-[#0f5e8b] transition-colors">
                  example@teamwebflow.com
                </a>
              </div>

              <div className="flex items-start space-x-4">
                <FontAwesomeIcon icon={faHome} className="w-5 h-5 text-gray-600 mt-1" />
                <address className="text-base text-gray-800 not-italic leading-relaxed">
                  4074 Ebert Summit Suite 375<br />
                  Lake Leonardchester
                </address>
              </div>

              <div className="flex items-center space-x-4">
                <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-gray-600" />
                <a href="tel:+441236547890" className="text-base text-gray-800 hover:text-[#0f5e8b] transition-colors">
                  +44 123 654 7890
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="order-1 lg:order-2 p-6 sm:p-8 rounded-2xl">
            <form className="space-y-6">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0f5e8b] focus:border-[#0f5e8b] outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0f5e8b] focus:border-[#0f5e8b] outline-none"
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0f5e8b] focus:border-[#0f5e8b] outline-none"
              />
              <textarea
                placeholder="Message"
                rows={5}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0f5e8b] focus:border-[#0f5e8b] outline-none resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full py-3  text-white font-semibold rounded-2xl bg-[#0f5e8b] "
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;




