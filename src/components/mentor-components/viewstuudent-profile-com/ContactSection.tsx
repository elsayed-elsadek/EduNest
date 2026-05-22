
import { Mail } from 'lucide-react';
import type { FC } from 'react';

interface ContactSectionProps {
  email: string;
}

const ContactSection: FC<ContactSectionProps> = ({ email }) => {
  return (
    <div className="px-6 py-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</h3>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#0f5e8b15] text-[#0f5e8b]">
          <Mail className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
          <a
            href={`mailto:${email}`}
            className="text-sm font-medium text-[#0f5e8b] transition-colors truncate block hover:text-[#0c4a6d]"
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;

