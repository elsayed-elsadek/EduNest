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
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 mb-10 ">
          Blogs
        </h2>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dummyBlogs.map((blog, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={blog.imageSrc}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="p-5">
                {/* Meta */}
                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>{blog.date}</span>
                  <span>{blog.comments} Comments</span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {blog.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;