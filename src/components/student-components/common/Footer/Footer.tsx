
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, Mail, Phone } from 'lucide-react';

const NAV = [
  {
    heading: 'Platform',
    links: [
      { label: 'Home',        path: '/student/dashboard'    },
      { label: 'Mentorships', path: '/explore-mentorships'  },
      { label: 'My Learning', path: '/student/learning'     },
      { label: 'Messages',    path: '/student/messages'     },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Profile',       path: '/student/profile'       },
      { label: 'Settings',      path: '/student/settings'      },
      { label: 'Notifications', path: '/student/notifications' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center',        path: '/help'    },
      { label: 'FAQ',                path: '/faq'     },
      { label: 'Privacy Policy',     path: '/privacy' },
      { label: 'Terms & Conditions', path: '/terms'   },
    ],
  },
];

const SOCIALS = [
  { Icon: Facebook,  href: '#', label: 'Facebook',  hover: 'hover:bg-blue-600' },
  { Icon: Youtube,   href: '#', label: 'YouTube',   hover: 'hover:bg-red-600'  },
  { Icon: Instagram, href: '#', label: 'Instagram', hover: 'hover:bg-pink-600' },
];

const Footer: FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0c2d48] text-gray-400 mt-auto">

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              
              <span className="text-white text-xl font-bold tracking-tight">EduNest</span>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-[220px]">
              Connecting learners with expert mentors to build real skills, faster.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-6">
              <a
                href="mailto:EduNest123@gmail.com"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="group-hover:underline underline-offset-2">EduNest123@gmail.com</span>
              </a>
              <a
                href="tel:+4588435849"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+458 843 5849</span>
              </a>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label, hover }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center ${hover} transition-colors`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className="text-sm hover:text-white transition-colors inline-block duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {year} EduNest Academic Systems, LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: 'Privacy', path: '/privacy' },
              { label: 'Terms',   path: '/terms'   },
            ].map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;