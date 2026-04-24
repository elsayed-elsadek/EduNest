

import  type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, Mail, Phone } from 'lucide-react';
import { theme } from '../../../../theme/colors';
import logo from '../../../../assets/edunestlogo.png'
const Footer: FC = () => {
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Mentorships', path: '/mentorships' },
    { label: 'Learning', path: '/learning' },
    { label: 'Messages', path: '/messages' },
    { label: 'Profile', path: '/profile' },
    { label: 'Setting', path: '/settings' },
    { label: 'Notification', path: '/notifications' },
  ];

  const supportLinks = [
    { label: 'Support', path: '/support' },
    { label: 'Help Center', path: '/help' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
  ];

  return (
    <footer className="text-gray-300 pt-12 pb-6" style={{ backgroundColor: theme.primary[500] }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            {/* Logo and Title */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logo} 
                alt="EduNest Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <h3 className="text-white text-2xl font-bold">EduNest</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-6">
              Your Learning Journey Begins
            </p>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <a 
                  href="mailto:EduNest123@gmail.com"
                  className="text-sm hover:text-white transition-colors"
                >
                  EduNest123@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400" />
                <a 
                  href="tel:+4588435849"
                  className="text-sm hover:text-white transition-colors"
                >
                  +458 843 5849
                </a>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} EduNest Academic Systems, LLC. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;