import React from 'react';

interface BlogProps {
  dummyBlogs: Array<{
    imageSrc: string;
    title: string;
    date: string;
    comments: number;
    description: string;
  }>;
}

const Blog: React.FC<BlogProps> = ({ dummyBlogs }) => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
             <span className="text-[var(--primary-500)]">Blogs</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Stay updated with the latest insights, tutorials, and trends from our expert mentors.
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {dummyBlogs.map((blog, index) => (
            <article 
              key={index} 
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              {/* 📸 Image Container - تم تكبير أبعاد الصورة إلى aspect-[4/3] لتصبح أكبر وأوضح */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-100/50">
                <img
                  src={blog.imageSrc}
                  alt={blog.title}
                  loading="lazy"
                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Content Container */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Meta Tags */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>{blog.comments} Comments</span>
                  </div>
                </div>

                {/* Title - تم إلغاء تحديد السطور ليظهر بالكامل مهما كان طوله */}
                <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-[#0f5e8b] transition-colors duration-200">
                  {blog.title}
                </h3>
                
                {/* Description - تم إلغاء الـ line-clamp ليظهر النص كاملاً بدون أي اقتطاع */}
                <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                  {blog.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;