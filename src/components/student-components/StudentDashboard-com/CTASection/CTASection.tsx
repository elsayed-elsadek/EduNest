import type { FC } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { theme } from '../../../../theme/colors';
import { Link } from 'react-router-dom';

const CTASection: FC = () => {



  return (
    <div className="rounded-3xl p-8 md:p-12 relative overflow-hidden" style={{ background: theme.gradients.studentHero }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Elevate Your Learning Journey
        </h2>
        
        <p className="text-gray-300 text-lg mb-8">
          Unlock full access to our premium mentorship programs and industry-leading resources. Expert-led, community-backed.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
          to="/explore-mentorships"
            className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-300 transition-colors shadow-lg"
          >
            Explore All Programs
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <button className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
            <MessageCircle className="w-5 h-5" />
            Talk to an Advisor
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;