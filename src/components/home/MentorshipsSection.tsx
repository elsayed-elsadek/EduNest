import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useMentorships } from '../../services/student-roleService/ExploreMentorships';
import type { MentorshipData, MentorshipFiltersType } from '../../types/mentorship';
import { MentorshipGrid, Pagination } from '../student-components/mentorships';

type Props = {
  mentorships?: never;
};

// ==========================================
// 1. Role Check Modal Component
// ==========================================
const RoleCheckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}> = memo(({ isOpen, onClose, onRegisterClick }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0f5e8b]/20 to-[#0f5e8b]/5 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#0f5e8b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
          Student Account Required
        </h2>
        
        <p className="text-gray-600 text-center mb-2">
          It looks like you haven't created a student account yet.
        </p>
        
        <p className="text-gray-500 text-center text-sm mb-6">
          To be able to enroll in this mentorship, you must create a student account first.
        </p>

        <div className="space-y-3">
          <button
            onClick={onRegisterClick}
            className="w-full bg-gradient-to-r from-[#0f5e8b] to-[#0d4a6e] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
             Create Student Account Now
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Already have an account? 
          <button 
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="text-[#0f5e8b] hover:underline ml-1"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
});

RoleCheckModal.displayName = 'RoleCheckModal';

// ==========================================
// 2. Main Mentorships Component
// ==========================================
const MentorshipsCarousel: React.FC<Props> = memo(() => {
  const navigate = useNavigate();
  
  // Auth & State Hooks
  const { userRole, userEmail, isAuthenticated } = useAuthStore();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  


  const tags = ['All', 'Programming', 'Marketing', 'Business', 'Design', 'Data & AI', 'Personal Development' , 'Other' ];

  // Memoized Account Validation
  const hasStudentAccount = useMemo(
    () => isAuthenticated && !!userEmail &&
      (userRole === 'ROLE_STUDENT' || userRole?.toLowerCase().includes('student')),
    [isAuthenticated, userEmail, userRole]
  );

  // Memoized Filters for API Query (Page is 0-indexed in backend)
  const filters: MentorshipFiltersType = useMemo(() => ({
    category: selectedTag === 'All' ? undefined : selectedTag,
    size: 3, 
    page: currentPage - 1, 
  }), [selectedTag, currentPage]);

  // Data Fetching
  const { data, isLoading, error } = useMentorships(filters);
  
  // Memoized Selectors
  const mentorships = useMemo(
    () => data?.apiResponse?.mentorShips?.content ?? [],
    [data]
  );

  const totalPages = useMemo(
    () => data?.apiResponse?.mentorShips?.totalPages ?? 1,
    [data]
  );

  // Callbacks
  const handleMentorshipClick = useCallback((mentorship: MentorshipData) => {
    if (hasStudentAccount) {
      navigate(`/mentorships/${mentorship.id}`);
    } else {
      setShowRoleModal(true);
    }
  }, [hasStudentAccount, navigate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTagChange = useCallback((tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1); // Reset to first page on category change
  }, []);

  return (
    <section className="py-16 bg-white">
      <RoleCheckModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRegisterClick={() => {
          setShowRoleModal(false);
          navigate('/register');
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="mentorships-header text-xl md:text-3xl font-bold text-gray-800">
            Explore our <span className="text-primary">Mentorships</span>
          </h2>
          
          {/* Category Filter Tags */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-4 py-2 text-sm rounded-full border transition ${
                  selectedTag === tag
                    ? 'bg-[#0f5e8b] text-white border-[#0f5e8b] shadow-sm'
                    : 'text-gray-600 border-gray-200 hover:border-[#0f5e8b] hover:text-[#0f5e8b]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0f5e8b] rounded-full"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
            An error occurred while loading mentorships. Please try again later.
          </div>
        )}

        {/* Content Section */}
        {!isLoading && !error && (
          <div className="w-full mb-10">
            {mentorships.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500 bg-gray-50">
                No mentorships found for this category.
              </div>
            ) : (
              <div className="w-full md:overflow-x-auto md:pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                <MentorshipGrid
                  mentorships={mentorships} 
                  isLoading={isLoading} 
                  onItemClick={handleMentorshipClick}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-flow-col md:auto-cols-[280px] lg:grid-cols-4 gap-6"
                />
              </div>
            )}
            
            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
});

MentorshipsCarousel.displayName = 'MentorshipsCarousel';

export default MentorshipsCarousel;