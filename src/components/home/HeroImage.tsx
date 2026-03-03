import React from 'react';
import ImageWithPlaceholder from '../common/ImageWithPlaceholder';

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

const HeroImage: React.FC<Props> = ({ src, alt = 'Hero image showing students', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="hero-image">
        <ImageWithPlaceholder src={src} alt={alt} />
      </div>
    </div>
  );
};

export default React.memo(HeroImage);



