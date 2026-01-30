
import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashLayout from '../../components/layout/Dash-layout';
import StudentSearch from '../../components/studentslist-com/StudentSearch/StudentSearch';
import StudentsTable from '../../components/studentslist-com/StudentsTable/StudentsTable';
import Pagination from '../../components/common/Pagination/Pagination';
import type { Student } from '../../types/Students.types';

const StudentsList: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Mock data 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allStudents: Student[] = [
    { id: '1', name: 'shahd walid', email: 'shahd@gmail.com', avatar: 'https://i.pravatar.cc/150?img=1', activeMentorships: 2, completedMentorships: 3 },
    { id: '2', name: 'elsayed elseedeek', email: 'elsayed@gmail.com', avatar: 'https://i.pravatar.cc/150?img=2', activeMentorships: 2, completedMentorships: 3 },
    { id: '3', name: 'rahma ismail', email: 'rahma@gmail.com', avatar: 'https://i.pravatar.cc/150?img=3', activeMentorships: 2, completedMentorships: 3 },
    { id: '4', name: 'toka nagy', email: 'toka@gmail.com', avatar: 'https://i.pravatar.cc/150?img=4', activeMentorships: 2, completedMentorships: 3 },
    { id: '5', name: 'shahd walid', email: 'shahd@gmail.com', avatar: 'https://i.pravatar.cc/150?img=5', activeMentorships: 2, completedMentorships: 3 },
    { id: '6', name: 'omar medhat', email: 'omar@gmail.com', avatar: 'https://i.pravatar.cc/150?img=6', activeMentorships: 2, completedMentorships: 3 },
    { id: '7', name: 'hazem saeed', email: 'hazem@gmail.com', avatar: 'https://i.pravatar.cc/150?img=7', activeMentorships: 2, completedMentorships: 3 },
    { id: '8', name: 'Albert flora', email: 'Albert@gmail.com', avatar: 'https://i.pravatar.cc/150?img=8', activeMentorships: 2, completedMentorships: 3 },
  ];

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return allStudents;
    return allStudents.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allStudents]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const currentStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  return (
    <DashLayout pageTitle="Dashboard / Students">
      <div className="bg-[#F7F7F8] min-h-screen p-4 md:px-8 md:pt-4 md:pb-8">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Header & Search */}
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold text-[#1A1C1E]">Students List</h1>
            <StudentSearch
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <StudentsTable
                  students={currentStudents}
                  onViewProfile={(id) => navigate(`/mentor/students/${id}`)}
                />
              </div>
            </div>

            {filteredStudents.length > 0 && (
              <div className="p-4 md:p-6 border-t border-gray-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredStudents.length}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(val) => setItemsPerPage(val)}
                />
              </div>
            )}

            {filteredStudents.length === 0 && (
              <div className="p-20 text-center text-gray-400 font-medium">
                No students found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default StudentsList;