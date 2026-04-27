import { type FC, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { MentorshipFiltersType } from '../../../types/mentorship';

interface MentorshipFiltersProps {
  onFiltersChange: (filters: MentorshipFiltersType) => void;
  categories?: string[];
}

const CATEGORIES = [
  'All Mentors',
  'Academic Writing',
  'Tech & Engineering',
  'Business Strategy',
  'Design & Creative',
  'Other',
];

/**
 * MentorshipFilters component
 * Sidebar filter interface matching the design exactly
 */
const MentorshipFilters: FC<MentorshipFiltersProps> = ({
  onFiltersChange,
  categories = CATEGORIES,
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['All Mentors']));
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const debounceTimer = useRef<number | null>(null);

  // Handle keyword change with debounce
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      triggerFilterUpdate({ keyword: value });
    }, 500);
  };

  // Handle category checkbox
  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(selectedCategories);
    
    if (category === 'All Mentors') {
      if (newCategories.has('All Mentors')) {
        newCategories.delete('All Mentors');
      } else {
        newCategories.clear();
        newCategories.add('All Mentors');
      }
    } else {
      newCategories.delete('All Mentors');
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
    }

    setSelectedCategories(newCategories);
    triggerFilterUpdate({ 
      category: Array.from(newCategories).filter(c => c !== 'All Mentors')[0] || undefined 
    });
  };

  // Handle price range change
  const handleMinPriceChange = (value: number) => {
    setMinPrice(Math.min(value, maxPrice));
    triggerFilterUpdate({ minPrice: Math.min(value, maxPrice) });
  };

  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(Math.max(value, minPrice));
    triggerFilterUpdate({ maxPrice: Math.max(value, minPrice) });
  };

  // Trigger filter update
  const triggerFilterUpdate = (overrides: Partial<MentorshipFiltersType> = {}) => {
    const filters: MentorshipFiltersType = {
      page: 0,
      ...(keyword && { keyword }),
      ...(selectedCategories.size > 0 && !selectedCategories.has('All Mentors') && {
        category: Array.from(selectedCategories)[0],
      }),
      ...(minPrice > 0 && { minPrice }),
      ...(maxPrice < 2000 && { maxPrice }),
      ...overrides,
    };
    onFiltersChange(filters);
  };

  // Handle reset
  const handleReset = () => {
    setKeyword('');
    setSelectedCategories(new Set(['All Mentors']));
    setMinPrice(0);
    setMaxPrice(2000);
    onFiltersChange({});
  };

  return (
    <div className="sticky top-4 space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Keyword</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter mentor or skill..."
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            style={{ outline: 'none' }}
            onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px var(--primary-500)')}
            onBlur={(e) => (e.target.style.boxShadow = 'none')}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Category</label>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.has(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:[color:var(--primary-500)] transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-4">Price Range</label>
        <div className="space-y-4">
          {/* Min Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">MIN ($)</span>
              <span className="text-sm font-semibold text-gray-900">{minPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(minPrice / 2000) * 100}%, #E5E7EB ${(minPrice / 2000) * 100}%, #E5E7EB 100%)`,
              }}
            />
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">MAX ($)</span>
              <span className="text-sm font-semibold text-gray-900">{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(maxPrice / 2000) * 100}%, #E5E7EB ${(maxPrice / 2000) * 100}%, #E5E7EB 100%)`,
              }}
            />
          </div>

          {/* Price Display */}
          <div className="pt-2 px-3 py-2 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">${minPrice}</span>
              {' - '}
              <span className="font-semibold text-gray-900">${maxPrice}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm"
      >
        <X className="w-4 h-4" />
        Reset All
      </button>
    </div>
  );
};

export default MentorshipFilters;
