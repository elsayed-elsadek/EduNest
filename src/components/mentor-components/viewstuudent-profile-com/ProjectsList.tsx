
import type { FC } from 'react';
import { useState } from 'react';
import type { Project, ProjectTab, AwardedBadge } from '../../../types/viewStudent.types';

interface ProjectsListProps {
  projects:       Project[];
  badgesCount?:   number;
  awardedBadges?: AwardedBadge[];   // ← NEW
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  SUBMITTED:       { label: 'Pending Review', classes: 'bg-yellow-100 text-yellow-700' },
  'Pending Review':{ label: 'Pending Review', classes: 'bg-yellow-100 text-yellow-700' },
  GRADED:          { label: 'Approved',       classes: 'bg-green-100  text-green-700'  },
  Approved:        { label: 'Approved',       classes: 'bg-green-100  text-green-700'  },
  REJECTED:        { label: 'Rejected',       classes: 'bg-red-100    text-red-700'    },
  Rejected:        { label: 'Rejected',       classes: 'bg-red-100    text-red-700'    },
};

const getStatus = (raw: string) =>
  STATUS_MAP[raw] ?? { label: raw, classes: 'bg-gray-100 text-gray-700' };

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
};

// Badge category colors/emojis (for display — badgeId maps to badge definition)
const BADGE_COLORS = [
  '#F59E0B','#3B82F6','#EF4444','#8B5CF6','#EC4899','#10B981','#6366F1','#F59E0B',
];
const BADGE_EMOJIS = ['🏆','⚡','🔥','🧩','🎨','👑','🤝','⭐'];

const ProjectsList: FC<ProjectsListProps> = ({
  projects, badgesCount = 0, awardedBadges = [],
}) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('projects');

  const count = awardedBadges.length > 0 ? awardedBadges.length : badgesCount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['projects', 'badges'] as ProjectTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative capitalize ${
              activeTab === tab ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}>
            {tab === 'projects' ? 'Projects' : 'Badges & Achievements'}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {tab === 'projects' ? projects.length : count}
            </span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">

        {/* ── Projects Tab ── */}
        {activeTab === 'projects' && (
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
                    className="border border-gray-100 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 bg-white cursor-default"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{project.projectTitle}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${classes}`}>{label}</span>
                        </div>
                        <p className="text-xs text-gray-500">Mentorship — {project.mentorshipTitle}</p>
                      </div>
                      {hasScore && (
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">Score</p>
                          <p className="text-sm font-bold text-gray-800">{project.finalScore ?? project.rawScore}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Submitted: {formatDate(project.submittedAt)}
                      </div>
                      {project.submissionLink ? (
                        <a href={project.submissionLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          View Submission
                        </a>
                      ) : project.filesCount ? (
                        <span>{project.filesCount} {project.filesCount === 1 ? 'file' : 'files'}</span>
                      ) : null}
                    </div>

                    {project.feedback && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <span className="font-semibold">Feedback: </span>{project.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Badges Tab ── */}
        {activeTab === 'badges' && (
          awardedBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-sm text-gray-500">No badges yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {awardedBadges.map((badge, idx) => {
                const color = BADGE_COLORS[idx % BADGE_COLORS.length];
                const emoji = BADGE_EMOJIS[idx % BADGE_EMOJIS.length];

                return (
                  <div key={badge.id}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 overflow-hidden relative">
                    {/* Color strip */}
                    <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
                      style={{ background: color }} />

                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ml-1"
                      style={{ background: `${color}18` }}>
                      {emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{badge.badgeTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Awarded {formatDate(badge.awardedAt)}
                      </p>
                      {badge.note && (
                        <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{badge.note}"</p>
                      )}
                    </div>

                    {/* Points */}
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ background: `${color}18`, color }}>
                        ⭐ {badge.badgePoints} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectsList;