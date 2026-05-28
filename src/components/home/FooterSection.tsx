import React, { memo } from "react";
import { Mail, Phone, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { name: "Home", id: "home" },
  { name: "Programs", id: "mentorships" },
  { name: "About Us", id: "about" },
  { name: "Contact", id: "contactUs" },
];

const supportLinks = [
  { name: "Help Center", id: "help" },
  { name: "FAQ", id: "faq" },
  { name: "Privacy Policy", id: "privacy" },
  { name: "Terms & Conditions", id: "terms" },
];

const FooterSection: React.FC = memo(() => {
  return (
    <footer className="bg-[var(--primary-dark)] dark:bg-gray-900 pt-40 pb-6 text-white relative">

      <div className="absolute inset-x-0 top-[-5%] sm:-top-20  max-w-4xl mx-auto px-4">
        <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-10 text-center relative overflow-hidden">

          <svg
            className="absolute top-0 left-0 w-48 h-48 opacity-30 text-primary dark:text-blue-400"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <path d="M43.4,-75C56.5,-65.1,67.7,-56.1,75.8,-44.1C83.9,-32.1,88.8,-17.1,86.9,-3.1C85,10.9,76.3,21.9,68.1,33.2C59.9,44.6,52.2,56.3,41.2,65.6C30.1,74.9,15.1,81.9,1.2,79.8C-12.7,77.8,-25.5,66.7,-34.7,55.2C-43.8,43.6,-49.3,31.6,-56.5,18.5C-63.8,5.4,-72.8,-8.8,-74.7,-24.4C-76.7,-40,-71.7,-57,-60.4,-68.5C-49.1,-80,-31.6,-86,-14.3,-87.5C3,-88.9,30.2,-85,43.4,-75Z" />
          </svg>

          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl lg:text-2xl font-bold mb-4">
              Start Your Learning Journey Today.
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The future belongs to the curious. Let's build yours together.
            </p>

            <Link
              to="/register"
              className="py-3 px-10 inline-block bg-primary hover:bg-[var(--primary-dark)] text-white rounded-2xl font-semibold"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 cursor-pointer ">
              <div className="w-10 h-10 bg-primary dark:bg-[var(--primary-500)] rounded-full flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="font-semibold text-lg">EduNest</span>
            </div>

            <p className="text-sm text-gray-400 mt-2 mb-4">
              Your Learning Journey Begins
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-gray-300" />
                <a href="mailto:EduNest123@gmail.com" className="hover:text-blue-400 transition">
                  EduNest123@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-gray-300" />
                <a href="tel:+4588435849" className="hover:text-blue-400 transition">
01061965771
                </a>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-[var(--primary-500)] rounded-full transition"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-[var(--primary-500)] rounded-full transition"
              >
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-[var(--primary-500)] rounded-full transition"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-[var(--primary-500)] rounded-full transition"
              >
                <Twitter className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((item, i) => (
                <li key={i}>
                  <a
                    href={`#${item.id}`}
                    className="text-gray-400 hover:text-blue-400 text-sm transition duration-500"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((item, i) => (
                <li key={i}>
                  <a
                    href={`#${item.id}`}
                    className="text-gray-400 hover:text-[#147fb8] text-sm transition"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            © 2025 EduNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default FooterSection;



