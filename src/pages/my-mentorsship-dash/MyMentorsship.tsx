
import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import MentorshipTable from '../../components/my-mentorships-com/MentorshipTable/MentorshipTable';
import Pagination from '../../components/common/Pagination/Pagination';
import type { Mentorship } from '../../types/mentorship.types';

const MentorshipsList: FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allMentorships: Mentorship[] = [
    { id: '1', title: 'Design Systems Bootcamp', icon: '📋', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '2', title: 'Design Systems Bootcamp', icon: '🖥️', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '3', title: 'Design Systems Bootcamp', icon: '📊', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '4', title: 'Design Systems Bootcamp', icon: '👥', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '5', title: 'Design Systems Bootcamp', icon: '📋', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '6', title: 'Design Systems Bootcamp', icon: '📋', level: 'All Level', rating: 0, totalEnrolled: 0, revenue: 0, createdDate: '28 Oct, 2026', status: 'draft' },
  ];

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return allMentorships;
    return allMentorships.filter(item => item.status === statusFilter);
  }, [statusFilter, allMentorships]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentMentorships = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  return (
    <DashLayout pageTitle="Dashboard / My Mentorships">
    
      <div className="bg-[#F7F7F8] min-h-screen px-0 md:px-8 md:pt-4 pb-8">
        
        {/* Header Section: Add button */}
        <div className="flex justify-end mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <button
            onClick={() => navigate('/mentor/mentorships/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] px-6 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-[#154d71] via-[#2a7fa8] to-[#33a1e0] shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Table Header / Title */}
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 md:border-none">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#1A1C1E]">Mentorships List</h1>
              <p className="text-sm text-gray-400 mt-1">
                Total <span className="text-[#1A1C1E] font-bold">{filteredData.length}</span>
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 capitalize"
              >
                <span>{statusFilter === 'all' ? 'Filter' : statusFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                  {['all', 'active', 'draft'].map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-blue-50 capitalize text-gray-700"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => { setStatusFilter(s as any); setIsFilterOpen(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <MentorshipTable
            mentorships={currentMentorships}
            onDetails={(id) => navigate(`/mentor/mentorships/${id}`)}
            onAction={(type, id) => console.log(type, id)}
          />

          {/* Footer / Pagination: Padding  */}
          <div className="p-4 md:p-6 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => setItemsPerPage(Number(val))}
            />
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipsList;