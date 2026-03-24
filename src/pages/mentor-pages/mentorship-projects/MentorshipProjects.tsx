import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import { getProjectDashboard, type FullProjectDashboard, type ProjectListItem } from '../../../services/projectService';
import { Briefcase, CheckCircle, Clock, BarChart2, Search, Plus, Eye, MoreVertical, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { type ProjectResponse } from '../../../services/projectService';
import { EditProjectModal, DeleteProjectModal } from './components/ProjectModals';

const MentorshipProjects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<FullProjectDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset page on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<ProjectResponse | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const fetchDashboard = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getProjectDashboard(id, { 
        page, 
        size: 10,
        projectName: debouncedSearch || undefined,
        status: statusFilter || undefined
      });
      setDashboard(res.fullDashboard);
    } catch (err: any) {
      setError(err.message || 'Failed to load project dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [id, page, debouncedSearch, statusFilter]);

  // Navigate back to mentorship overview
  const handleBackToMentorship = () => {
    navigate(`/mentor/mentorships/${id}`);
  };

  if (loading && !dashboard) {
    return (
      <DashLayout pageTitle={`Dashboard / My Mentorships / Projects`}>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout pageTitle={`Dashboard / My Mentorships / Projects`}>
        <div className="flex h-[50vh] items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      </DashLayout>
    );
  }

  const stats = dashboard?.projectDashboardDTO;
  const projectsPage = dashboard?.projectResponsePageResponse;
  const projectsList = projectsPage?.content || [];

  return (
    <DashLayout pageTitle={`Dashboard / My Mentorships / Projects`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-baseline gap-2 cursor-pointer text-gray-600 hover:text-gray-900" onClick={handleBackToMentorship}>
              {/* <span className="text-xl">{'<'}</span> */}
              <ArrowLeft size={20} />
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Manage and review all projects</p>
          </div>
          
          {/* <button 
            className="flex items-center gap-2 bg-primary hover:bg-[var(--primary-dark)] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Project <Plus size={18} />
          </button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Projects</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.totalProjects || 0}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Briefcase size={20} />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Published</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">
                {(stats?.publishedCount || 0).toString().padStart(2, '0')}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Draft</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">
                {(stats?.draftCount || 0).toString().padStart(2, '0')}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Score</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.averageScore || 0} %</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
              <BarChart2 size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project..." 
            className="w-full bg-transparent border-none outline-none text-gray-700"
          />
        </div>

        {/* Projects List Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Projects</h2>
              <p className="text-sm text-gray-500">Total {projectsPage?.totalElements || 0}</p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Project Title</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Submissions</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectsList.length > 0 ? projectsList.map((item: ProjectListItem) => (
                  <tr key={item.project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded text-blue-500">
                          <Briefcase size={16} />
                        </div>
                        <span className="font-semibold text-gray-900">{item.project.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.project.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          <CheckCircle size={12} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Clock size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      <span className="text-blue-600">{item.submissionsCount}/{item.totalStudents}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {item.project.createdAt ? new Date(item.project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/mentor/mentorships/${id}/projects/${item.project.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={16} /> Details
                        </Link>
                        <div className="relative">
                          {activeDropdown === item.project.id && (
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveDropdown(null)}
                            ></div>
                          )}
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === item.project.id ? null : item.project.id)}
                            className="relative z-50 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg border border-gray-200"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === item.project.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-32 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1">
                              <button 
                                onClick={() => { setProjectToEdit(item.project); setActiveDropdown(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button 
                                onClick={() => { setProjectToDelete(item.project.id); setActiveDropdown(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {projectsPage && projectsPage.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <p>Showing <select className="border-gray-200 rounded p-1 mx-1"><option>10</option></select> items in one page</p>
              <div className="flex gap-1">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center px-2">
                  <span className="text-gray-900 font-medium">{page + 1}</span>
                  <span className="mx-1">of</span>
                  <span>{projectsPage.totalPages}</span>
                </div>
                <button 
                  disabled={page >= projectsPage.totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <EditProjectModal 
        project={projectToEdit} 
        isOpen={!!projectToEdit} 
        onClose={() => setProjectToEdit(null)} 
        onSuccess={fetchDashboard} 
      />
      <DeleteProjectModal 
        projectId={projectToDelete} 
        isOpen={!!projectToDelete} 
        onClose={() => setProjectToDelete(null)} 
        onSuccess={fetchDashboard} 
      />
    </DashLayout>
  );
};

export default MentorshipProjects;
