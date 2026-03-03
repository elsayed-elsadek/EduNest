import React, { useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholderClass?: string;
};

const ImageWithPlaceholder: React.FC<Props> = ({ src, alt = '', className = '', placeholderClass = 'bg-gray-200 animate-pulse', ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} aria-busy={!loaded} aria-label={alt}>
      {!loaded && (
        <div className={`absolute inset-0 ${placeholderClass}`} />
      )}
      {/* lazy loading + onLoad to toggle placeholder */}
      <img
        src={typeof src === 'string' ? src : ''}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        {...rest}
      />
    </div>
  );
};

export default ImageWithPlaceholder;



