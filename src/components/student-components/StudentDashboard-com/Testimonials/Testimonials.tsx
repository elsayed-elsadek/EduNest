
import type  { FC } from 'react';
import TestimonialCard from './TestimonialCard';
import type { Testimonial } from '../../../../types/student-role-types/testimonial.types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What our Scholars Say
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of students who have transformed their careers through the EduNest academic experience.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;