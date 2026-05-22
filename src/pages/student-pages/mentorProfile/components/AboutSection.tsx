import type { MentorProfile } from '../../../../services/student-roleService/mentorProfile.api';

interface AboutSectionProps {
  mentorProfile: MentorProfile | null;
}

// About Section
const AboutSection = ({ mentorProfile }: AboutSectionProps) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">About {mentorProfile?.mentorFirstName}</h2>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 leading-relaxed text-lg font-normal">
          {mentorProfile?.bio || 'No bio available yet.'}
        </p>
      </div>
    </section>
  );
};

export default AboutSection;

