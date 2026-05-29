import { type FC, useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { MentorshipFiltersType } from '../../../types/mentorship';

interface MentorshipFiltersProps {
  onFiltersChange: (filters: MentorshipFiltersType) => void;
  categories?: string[];
  initialFilters?: MentorshipFiltersType;
}

const CATEGORIES = [
  'All Mentors',
  'Programming',
  'Marketing',
  'Business',
  'Design',
  'Data & AI',
  'Personal Development',
  'Other',
];

/**
 * MentorshipFilters component
 * Sidebar filter interface matching the design exactly
 */
const MentorshipFilters: FC<MentorshipFiltersProps> = ({
  onFiltersChange,
  categories = CATEGORIES,
  initialFilters,
}) => {
  const [keyword, setKeyword] = useState(initialFilters?.keyword ?? '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category ?? 'All Mentors');
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice ?? 2000);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    setKeyword(initialFilters?.keyword ?? '');
    setSelectedCategory(initialFilters?.category ?? 'All Mentors');
    setMinPrice(initialFilters?.minPrice ?? 0);
    setMaxPrice(initialFilters?.maxPrice ?? 2000);
  }, [initialFilters]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const clearPendingDebounce = () => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  };

  const buildFilters = (overrides: Partial<MentorshipFiltersType> = {}) => {
    const nextKeyword = overrides.keyword !== undefined ? overrides.keyword : keyword;
    const nextCategory = overrides.category !== undefined ? overrides.category : selectedCategory;
    const nextMinPrice = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const nextMaxPrice = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;

    return {
      page: 0,
      ...(nextKeyword ? { keyword: nextKeyword } : {}),
      ...(nextCategory && nextCategory !== 'All Mentors' ? { category: nextCategory } : {}),
      ...(nextMinPrice > 0 ? { minPrice: nextMinPrice } : {}),
      ...(nextMaxPrice < 2000 ? { maxPrice: nextMaxPrice } : {}),
    };
  };

  const scheduleFilterUpdate = (overrides: Partial<MentorshipFiltersType> = {}) => {
    clearPendingDebounce();
    debounceTimer.current = window.setTimeout(() => {
      onFiltersChange(buildFilters(overrides));
      debounceTimer.current = null;
    }, 350);
  };

  const applyFiltersNow = (overrides: Partial<MentorshipFiltersType> = {}) => {
    clearPendingDebounce();
    onFiltersChange(buildFilters(overrides));
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    scheduleFilterUpdate({ keyword: value });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    applyFiltersNow({ category });
  };

  const handleMinPriceChange = (value: number) => {
    const nextMin = Math.min(value, maxPrice);
    setMinPrice(nextMin);
    scheduleFilterUpdate({ minPrice: nextMin });
  };

  const handleMaxPriceChange = (value: number) => {
    const nextMax = Math.max(value, minPrice);
    setMaxPrice(nextMax);
    scheduleFilterUpdate({ maxPrice: nextMax });
  };

  const flushPriceFilters = () => {
    if (debounceTimer.current) {
      applyFiltersNow();
    }
  };

  // Handle reset
  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('All Mentors');
    setMinPrice(0);
    setMaxPrice(2000);
    onFiltersChange({
      keyword: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 0,
    });
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
            placeholder="Search by mentorship,mentor name or others"
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
                type="radio"
                name="mentorship-category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => handleCategorySelect(category)}
                className="w-4 h-4 rounded-full border-gray-300 text-primary focus:ring-blue-500 cursor-pointer"
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
              step="10"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              onMouseUp={flushPriceFilters}
              onTouchEnd={flushPriceFilters}
              onPointerUp={flushPriceFilters}
              className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer transition-colors duration-200"
              style={{
                outline: 'none',
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(minPrice / 2000) * 100}%, #E5E7EB ${(minPrice / 2000) * 100}%, #E5E7EB 100%)`,
                boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.3)'
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
              step="10"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              onMouseUp={flushPriceFilters}
              onTouchEnd={flushPriceFilters}
              onPointerUp={flushPriceFilters}
              className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer transition-colors duration-200"
              style={{
                outline: 'none',
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(maxPrice / 2000) * 100}%, #E5E7EB ${(maxPrice / 2000) * 100}%, #E5E7EB 100%)`,
                boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.3)'
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
