import { memo, useState, type ImgHTMLAttributes, type CSSProperties } from 'react';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad'> {
  /** Image source */
  src: string;
  /** Alternative text for accessibility */
  alt: string;
  /** Whether this is a hero/above-fold image - enables high priority loading */
  priority?: boolean;
  /** Image sources for different viewports (srcset) */
  srcSet?: string;
  /** Fallback sizes for srcset */
  sizes?: string;
  /** Custom placeholder while loading */
  placeholder?: React.ReactNode;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Image object-fit property */
  objectFit?: CSSProperties['objectFit'];
  /** Whether to show placeholder on error */
  showErrorOnFail?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * OptimizedImage Component
 * 
 * A reusable React component for optimized image loading with:
 * - Lazy loading for below-fold images
 * - High priority loading (fetchpriority) for hero images
 * - srcset support for responsive images
 * - Loading placeholder
 * - Error handling
 * 
 * @example
 * // Hero image (above fold) - loads immediately with high priority
 * <OptimizedImage 
 *   src="/hero-image.jpg" 
 *   alt="Hero" 
 *   priority 
 *   width={800} 
 *   height={600} 
 * />
 * 
 * @example
 * // Lazy loaded image with srcset
 * <OptimizedImage 
 *   src="/image.jpg"
 *   srcSet="/image-400.jpg 400w, /image-800.jpg 800w"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   alt="Responsive"
 * />
 */
const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  priority = false,
  srcSet,
  sizes,
  placeholder,
  onLoad,
  objectFit = 'cover',
  showErrorOnFail = true,
  errorMessage = 'Failed to load image',
  className = '',
  width,
  height,
  style,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const baseStyles: CSSProperties = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    ...style,
  };

  if (isLoading && placeholder) {
    return (
      <div 
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          ...baseStyles,
        }}
        aria-hidden="true"
      >
        {placeholder}
      </div>
    );
  }

  if (hasError && showErrorOnFail) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          fontSize: '0.875rem',
          ...baseStyles,
        }}
        role="img"
        aria-label={errorMessage}
      >
        {errorMessage}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      width={width}
      height={height}
      className={className}
      style={{
        ...baseStyles,
        opacity: isLoading ? 0 : 1,
      }}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

