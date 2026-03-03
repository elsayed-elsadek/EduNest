import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpotify,
  faSlack,
  faAirbnb,
  faLinkedin,
  faGoogle,
  faYoutube,
  faStripe,
  faTwitch,
} from '@fortawesome/free-brands-svg-icons';

const logos = [
  { name: 'Spotify', icon: faSpotify, siteUrl: 'https://www.spotify.com' },
  { name: 'Slack', icon: faSlack, siteUrl: 'https://www.slack.com' },
  { name: 'Airbnb', icon: faAirbnb, siteUrl: 'https://www.airbnb.com' },
  { name: 'LinkedIn', icon: faLinkedin, siteUrl: 'https://www.linkedin.com' },
  { name: 'Google', icon: faGoogle, siteUrl: 'https://www.google.com' },
  { name: 'YouTube', icon: faYoutube, siteUrl: 'https://www.youtube.com' },
  { name: 'Stripe', icon: faStripe, siteUrl: 'https://www.stripe.com' },
  { name: 'Twitch', icon: faTwitch, siteUrl: 'https://www.twitch.tv' },
];

const LogoStrip: React.FC = () => {
  const repeatedLogos = [...logos, ...logos];

  return (
    <div className="py-4 bg-transparent">
      <div className="marquee-container">
  
        <div className="marquee-content gap-8 md:gap-12 lg:gap-16">
          {repeatedLogos.map((logo, index) => (
            <a
              key={`${logo.name}-${index}`}
              href={logo.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center flex-shrink-0 h-12 w-12 text-gray-400 hover:text-gray-800 transition-all duration-300 hover:scale-110"
              title={logo.name}
            >
              <FontAwesomeIcon icon={logo.icon} className="text-2xl md:text-3xl" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoStrip;


