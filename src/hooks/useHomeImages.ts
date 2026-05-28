import { useMemo } from 'react';

// Import images directly for reliable production build
import person1Img from '../assets/homePage/person1.webp';
import person2Img from '../assets/homePage/person2.webp';
import person3Img from '../assets/homePage/person3.webp';
import person4Img from '../assets/homePage/person4.webp';
import person5Img from '../assets/homePage/person5.webp';
import aboutus1Img from '../assets/homePage/aboutus1.webp';
import aboutus2Img from '../assets/homePage/aboutus2.webp';
import aboutus3Img from '../assets/homePage/aboutus3.webp';
import blog1Img from '../assets/homePage/blog1.webp';
import img1Img from '../assets/homePage/Remote meeting-rafiki.svg';
import bookImg from '../assets/homePage/book.webp';
import starsImg from '../assets/homePage/stars.webp';
import explore1Img from '../assets/homePage/explore1.webp';
import askImg from '../assets/homePage/Questions-pana.svg';

// Image map using direct imports
const imageMap: Record<string, string> = {
  person1: person1Img,
  person2: person2Img,
  person3: person3Img,
  person4: person4Img,
  person5: person5Img,
  aboutus1: aboutus1Img,
  aboutus2: aboutus2Img,
  aboutus3: aboutus3Img,
  blog1: blog1Img,
  img1: img1Img,
  book: bookImg,
  stars: starsImg,
  explore1: explore1Img,
  ask: askImg,
};

export const useHomeImages = () => {
  // Memoize to avoid recalculating on every render
  return useMemo(() => {
    return {
      // Get single image by name
      get: (name: string) => imageMap[name] || '',

      // Predefined collections - memoized arrays
      persons: [person1Img, person2Img, person3Img, person4Img, person5Img],

      aboutUs: [aboutus1Img, aboutus2Img, aboutus3Img],

      // Quick access to commonly used images
      person1: person1Img,
      person2: person2Img,
      person3: person3Img,
      blog1: blog1Img,
      explore1: explore1Img,
      ask: askImg,
      img1: img1Img,
      book: bookImg,
      stars: starsImg
    };
  }, []);
};

