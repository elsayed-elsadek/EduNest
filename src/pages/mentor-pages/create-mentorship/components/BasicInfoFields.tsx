import { useState, useEffect, type FC } from 'react';
import type { MentorshipFormData } from '../types';
import { levelOptions, categoryOptions } from '../constants';

interface Props {
  formData: MentorshipFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFieldValue: (field: keyof MentorshipFormData, value: MentorshipFormData[keyof MentorshipFormData]) => void;
  fieldErrors: Record<string, string>;
}

export const BasicInfoFields: FC<Props> = ({ formData, onChange, setFieldValue, fieldErrors }) => {
  // حالة محلية للـ input الخاص بـ Other لمنع التداخل أثناء الكتابة
  const [otherValue, setOtherValue] = useState<string>('');

  // مزامنة الحالة المحلية إذا تغيرت القيمة من الخارج (مثلاً عند تحميل بيانات سابقة)
  useEffect(() => {
    if (formData.category && !categoryOptions.includes(formData.category) && formData.category !== 'Other') {
      setOtherValue(formData.category);
    } else {
      setOtherValue('');
    }
  }, [formData.category]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Other') {
      setFieldValue('category', 'Other');
    } else {
      setFieldValue('category', value);
      setOtherValue(''); // تفريغ الـ Other عند اختيار تصنيف جاهز
    }
  };

  const handleOtherInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOtherValue(val);
    setFieldValue('category', val); // تحديث الـ state الرئيسي
  };

  return (
    <>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">MENTORSHIP TITLE</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className={`w-full h-12 px-4 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#154d71] ${fieldErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            placeholder="Enter title here..."
            maxLength={30}
          />
          {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">SUBTITLE</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={onChange}
            className={`w-full h-12 px-4 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#154d71] ${fieldErrors.subtitle ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            placeholder="Enter subtitle here..."
            maxLength={50}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">DESCRIPTION</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#154d71] resize-none ${fieldErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            placeholder="Enter description here..."
            maxLength={250}
          />
        </div>
      </div>

      {/* Level & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 tracking-wide mb-2">LEVEL</p>
          <div className="flex flex-wrap gap-2">
            {levelOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFieldValue('level', option.value)}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                  formData.level === option.value
                    ? 'bg-[#154d71] text-white border-[#154d71]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#154d71]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 tracking-wide mb-2">CATEGORY</p>
          <select
            name="category"
            value={categoryOptions.includes(formData.category) ? formData.category : (formData.category === '' ? '' : 'Other')}
            onChange={handleSelectChange}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#154d71]"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Other">Other</option>
          </select>

          {(formData.category === 'Other' || (!categoryOptions.includes(formData.category) && formData.category !== '')) && (
            <input
              type="text"
              name="category"
              value={otherValue}
              onChange={handleOtherInput}
              placeholder="Write your category..."
              maxLength={25}
              className="w-full h-12 px-4 mt-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#154d71]"
            />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">MENTORSHIP PRICE ($)</p>
        <div className="relative max-w-xs">
          <input
            type="string"
            name="price"
            value={formData.price}
            onChange={onChange}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#154d71]"
            placeholder="0.00"
            maxLength={10}
            
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-gray-400 text-sm">USD</span>
        </div>
      </div>
    </>
  );
};