
import type { FC } from 'react';
import { useState } from 'react';
import type { Project, ProjectTab } from '../../types/viewStudent.types';

interface ProjectsListProps {
  projects: Project[];
  badgesCount?: number;
}

//  Status helpers 
const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  SUBMITTED:      { label: 'Pending Review', classes: 'bg-yellow-100 text-yellow-700' },
  'Pending Review':{ label: 'Pending Review', classes: 'bg-yellow-100 text-yellow-700' },
  GRADED:         { label: 'Approved',       classes: 'bg-green-100  text-green-700'  },
  Approved:       { label: 'Approved',       classes: 'bg-green-100  text-green-700'  },
  REJECTED:       { label: 'Rejected',       classes: 'bg-red-100    text-red-700'    },
  Rejected:       { label: 'Rejected',       classes: 'bg-red-100    text-red-700'    },
};

const getStatus = (raw: string) =>
  STATUS_MAP[raw] ?? { label: raw, classes: 'bg-gray-100 text-gray-700' };

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Component 
const ProjectsList: FC<ProjectsListProps> = ({ projects, badgesCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('projects');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200">
        {(['projects', 'badges'] as ProjectTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative capitalize ${
              activeTab === tab ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'projects' ? 'Projects' : 'Badges & Achievements'}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {tab === 'projects' ? projects.length : badgesCount}
            </span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="p-6">
        {activeTab === 'projects' ? (

          projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm text-gray-500">No projects submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const { label, classes } = getStatus(project.status);
                const hasScore = project.finalScore != null || project.rawScore != null;

                return (
                  <div
                    key={project.projectSubmissionId}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {project.projectTitle}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${classes}`}>
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Mentorship — {project.mentorshipTitle}
                        </p>
                      </div>

                      {/* Score badge */}
                      {hasScore && (
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">Score</p>
                          <p className="text-sm font-bold text-gray-800">
                            {project.finalScore ?? project.rawScore}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500 mb-3">
                      {/* Submitted at */}
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Submitted: {formatDate(project.submittedAt)}</span>
                      </div>

                      {/* Submission link OR files count */}
                      {project.submissionLink ? (
                        <a
                          href={project.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          View Submission
                        </a>
                      ) : project.filesCount ? (
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {project.filesCount} {project.filesCount === 1 ? 'file' : 'files'}
                        </div>
                      ) : null}
                    </div>

                    {/* Feedback */}
                    {project.feedback && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <span className="font-semibold">Feedback: </span>
                          {project.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )

        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-sm text-gray-500">No badges yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;