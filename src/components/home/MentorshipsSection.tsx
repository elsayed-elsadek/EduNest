import React, { useState } from 'react';

type Mentorship = {
  title: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  instructor: string;
  avatar: string;
  category: string;
};

type Props = {
  mentorships: Mentorship[];
};

const MentorshipsCarousel: React.FC<Props> = ({ mentorships }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const tags = ['All', 'Full Stack', 'Frontend', 'UI/UX', 'AI', 'Machine Learning'];

  const filteredMentorships =
    selectedTag === 'All'
      ? mentorships
      : mentorships.filter((m) => m.category === selectedTag);

  const visibleCards = 4;
  const showControls = filteredMentorships.length > visibleCards;
  const maxIndex = showControls ? filteredMentorships.length - visibleCards : 0;

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const displayedMentorships =
    filteredMentorships.length === 0
      ? []
      : filteredMentorships.slice(currentIndex, currentIndex + visibleCards);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="text-center mb-12 ">
          <h2 className="mentorships-header text-xl md:text-3xl font-bold text-gray-800 ">
            Explore our <span className="text-primary">Mentorships</span>
          </h2>
          <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setCurrentIndex(0);
                }}
                className={`px-4 py-2 text-sm rounded-full border transition ${selectedTag === tag
                  ? 'bg-[#0f5e8b] text-white border-[#0f5e8b] shadow-sm'
                  : 'text-gray-600 border-gray-200 hover:border-[#0f5e8b] hover:text-[#0f5e8b]'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 sm:gap-4">
          {showControls && (
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className={`hidden md:flex absolute -left-6 z-10 w-8 h-8 rounded-full text-lg items-center justify-center shadow transition ${currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            {displayedMentorships.length === 0 ? (
              <div className="col-span-full">
                <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500 bg-gray-50">
                  No mentorships found for this category.
                </div>
              </div>
            ) : (
              displayedMentorships.map((m, idx) => (
                <div
                  key={idx}
                  className="relative rounded-[26px] h-[340px] sm:h-[380px] md:h-[400px] overflow-hidden shadow-xl hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1 bg-black"
                >
                  <div className="relative h-full">
                    <img
                      src={m.image}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />

                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* content on image */}
                    <div className="absolute inset-x-0 bottom-0 px-3 sm:px-4 pb-5 sm:pb-6 pt-14 sm:pt-16 text-white text-left">
                      {/* rating row */}
                      <div className="flex items-center text-sm mb-2 gap-1">
                        <div className="flex text-yellow-400 text-[18px]">
                          {'★★★★★'}
                        </div>
                        <span className="ml-2 text-[18px] font-semibold">
                          {m.rating.toFixed(1)}
                        </span>
                        <span className="text-[14px] text-gray-300">
                          ({m.reviews} review{m.reviews > 1 ? 's' : ''})
                        </span>
                      </div>

                      {/* title */}
                      <h3 className="text-base font-semibold leading-snug mb-3 line-clamp-2">
                        {m.title}
                      </h3>

                      {/* bottom row */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/15 text-sm">
                        <div className="flex items-center gap-2">
                          <img
                            src={m.avatar}
                            alt={m.instructor}
                            className="w-7 h-7 rounded-full border border-white/40"
                          />
                          <span>{m.instructor}</span>
                        </div>
                        <span className="text-sm font-semibold">
                          ${m.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {showControls && (
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className={`hidden md:flex absolute -right-6 z-10 w-8 h-8 rounded-full text-lg items-center justify-center shadow transition ${currentIndex >= maxIndex
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default MentorshipsCarousel;



