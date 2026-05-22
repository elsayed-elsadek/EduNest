
import { useState } from 'react';
import type { FC } from 'react';
import {
  FolderOpen, CheckCircle2, Clock, XCircle,
  ExternalLink, Paperclip, Star, Award,
  ChevronLeft, ChevronRight,
  Trophy, Zap, Flame, Lightbulb, Palette, Crown, Users, Medal,
} from 'lucide-react';
import type { Project, ProjectTab, AwardedBadge } from '../../../types/viewStudent.types';

const PRIMARY = '#0f5e8b';

interface ProjectsListProps {
  projects:             Project[];
  projectsPage:         number;
  projectsTotalPages:   number;
  projectsTotalCount?:  number;
  onProjectsPageChange: (page: number) => void;
  awardedBadges?:       AwardedBadge[];
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, {
  label: string; bg: string; text: string; border: string;
  stripe: string; Icon: FC<{ size?: number; className?: string; color?: string }>;
}> = {
  SUBMITTED: {
    label: 'Pending Review', bg: '#fffbeb', text: '#92400e',
    border: '#fde68a', stripe: '#f59e0b',
    Icon: ({ size = 16, className }) => <Clock size={size} className={className} />,
  },
  'Pending Review': {
    label: 'Pending Review', bg: '#fffbeb', text: '#92400e',
    border: '#fde68a', stripe: '#f59e0b',
    Icon: ({ size = 16, className }) => <Clock size={size} className={className} />,
  },
  GRADED: {
    label: 'Approved', bg: '#f0fdf4', text: '#166534',
    border: '#bbf7d0', stripe: '#22c55e',
    Icon: ({ size = 16, className }) => <CheckCircle2 size={size} className={className} />,
  },
  Approved: {
    label: 'Approved', bg: '#f0fdf4', text: '#166534',
    border: '#bbf7d0', stripe: '#22c55e',
    Icon: ({ size = 16, className }) => <CheckCircle2 size={size} className={className} />,
  },
  REJECTED: {
    label: 'Rejected', bg: '#fff1f2', text: '#9f1239',
    border: '#fecdd3', stripe: '#f43f5e',
    Icon: ({ size = 16, className }) => <XCircle size={size} className={className} />,
  },
  Rejected: {
    label: 'Rejected', bg: '#fff1f2', text: '#9f1239',
    border: '#fecdd3', stripe: '#f43f5e',
    Icon: ({ size = 16, className }) => <XCircle size={size} className={className} />,
  },
};

const getStatusCfg = (raw: string) =>
  STATUS_CFG[raw] ?? {
    label: raw, bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb', stripe: '#9ca3af',
    Icon: ({ size = 16, className }: { size?: number; className?: string }) =>
      <FolderOpen size={size} className={className} />,
  };

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};

// ── Badge category cycle (for Badges tab) ────────────────────────────────────
const BADGE_CATS = [
  { Icon: Trophy,     color: '#d97706', bg: '#fef3c7', border: '#fcd34d', label: 'Achievement'    },
  { Icon: Zap,        color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Performance'    },
  { Icon: Flame,      color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Consistency'    },
  { Icon: Lightbulb,  color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', label: 'Problem Solving' },
  { Icon: Palette,    color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4', label: 'Creativity'     },
  { Icon: Crown,      color: '#b45309', bg: '#fffbeb', border: '#fde68a', label: 'Leadership'     },
  { Icon: Users,      color: '#059669', bg: '#f0fdf4', border: '#6ee7b7', label: 'Community'      },
  { Icon: Medal,      color: '#4f46e5', bg: '#eef2ff', border: '#a5b4fc', label: 'Recognition'    },
];
const getCat = (idx: number) => BADGE_CATS[idx % BADGE_CATS.length];

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination: FC<{ current: number; total: number; onChange: (p: number) => void }> = ({
  current, total, onChange,
}) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pt-5">
      <button
        onClick={() => onChange(current - 1)} disabled={current === 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={14} />
      </button>

      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i} onClick={() => onChange(i)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition"
          style={i === current
            ? { backgroundColor: PRIMARY, color: '#fff' }
            : { border: '1px solid #e5e7eb', color: '#6b7280' }}
        >{i + 1}</button>
      ))}

      <button
        onClick={() => onChange(current + 1)} disabled={current === total - 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

const BADGES_PER_PAGE = 2;

// ── Main ──────────────────────────────────────────────────────────────────────
const ProjectsList: FC<ProjectsListProps> = ({
  projects,
  projectsPage, projectsTotalPages = 1, projectsTotalCount, onProjectsPageChange,
  awardedBadges = [],
}) => {
  const [activeTab,  setActiveTab ] = useState<ProjectTab>('projects');
  const [badgesPage, setBadgesPage] = useState(0);

  const badgesTotalPages = Math.max(1, Math.ceil(awardedBadges.length / BADGES_PER_PAGE));
  const visibleBadges    = awardedBadges.slice(
    badgesPage * BADGES_PER_PAGE,
    (badgesPage + 1) * BADGES_PER_PAGE,
  );

  // Use projectsTotalCount if provided, otherwise fall back to projects.length
  const projectsCount = projectsTotalCount ?? projects.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-100">
        {(['projects', 'badges'] as ProjectTab[]).map((tab) => {
          const count  = tab === 'projects' ? projectsCount : awardedBadges.length;
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 px-5 py-4 text-sm font-semibold transition-colors relative flex items-center justify-center gap-2 ${
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'projects'
                ? <FolderOpen size={15} className={active ? 'text-gray-700' : 'text-gray-400'} />
                : <Award      size={15} className={active ? 'text-gray-700' : 'text-gray-400'} />}
              {tab === 'projects' ? 'Projects' : 'Badges'}
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={active
                  ? { backgroundColor: PRIMARY, color: '#fff' }
                  : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
              >{count}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ backgroundColor: PRIMARY }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-5">

        {/* ── Projects Tab ── */}
        {activeTab === 'projects' && (
          projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                <FolderOpen size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">No projects submitted yet.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {projects.map((project) => {
                  const cfg = getStatusCfg(project.status);
                  const { Icon } = cfg;
                  const hasScore = project.finalScore != null || project.rawScore != null;
                  const hasLink  = !!project.submissionLink;
                  const hasFiles = (project.filesCount ?? 0) > 0;

                  // ── A project is "submitted" if status signals it was received
                  // even when submissionLink is null (= file was uploaded via form)
                  const wasSubmitted = ['SUBMITTED', 'GRADED', 'Approved', 'Rejected', 'REJECTED']
                    .includes(project.status);

                  return (
                    <div
                      key={project.projectSubmissionId}
                      className="flex items-stretch gap-0 rounded-xl border overflow-hidden hover:shadow-sm transition-all duration-150 bg-white"
                      style={{ borderColor: cfg.border }}
                    >
                      {/* Left status stripe */}
                      <div className="w-1 flex-shrink-0" style={{ backgroundColor: cfg.stripe }} />

                      {/* Card body */}
                      <div className="flex-1 p-4">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Status icon bubble */}
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: cfg.bg }}
                            >
                              <Icon size={16} color={cfg.stripe} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{project.projectTitle}</h4>
                                {/* Status pill */}
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                                  style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: cfg.stripe }} />
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                <span className="font-medium text-gray-500">{project.mentorshipTitle}</span>
                                {' · '}Submitted {formatDate(project.submittedAt)}
                              </p>
                            </div>
                          </div>

                          {/* Score badge */}
                          {hasScore && (
                            <div
                              className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border font-bold"
                              style={{ borderColor: `${PRIMARY}30`, background: `${PRIMARY}08` }}
                            >
                              <Star size={13} style={{ color: PRIMARY }} />
                              <span className="text-lg font-black leading-tight" style={{ color: PRIMARY }}>
                                {project.finalScore ?? project.rawScore}
                              </span>
                              <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: PRIMARY }}>
                                score
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ── Submission info ── */}
                        <div className="flex flex-wrap gap-2 mb-0">
                          {hasLink && (
                            <a
                              href={project.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-85"
                              style={{ backgroundColor: PRIMARY }}
                            >
                              <ExternalLink size={12} />
                              View Submission Link
                            </a>
                          )}

                          {hasFiles && !hasLink && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border text-gray-600"
                              style={{ background: `${PRIMARY}06`, borderColor: `${PRIMARY}25` }}>
                              <Paperclip size={12} style={{ color: PRIMARY }} />
                              <span style={{ color: PRIMARY }}>File submitted</span>
                            </div>
                          )}

                          {/* Only show "no submission" for truly empty non-submitted projects */}
                          {!hasLink && !hasFiles && !wasSubmitted && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-dashed border-gray-200 bg-gray-50">
                              <Paperclip size={12} />
                              No submission yet
                            </div>
                          )}
                        </div>

                        {/* Feedback  */}
                        {project.feedback && (
                          <div
                            className="mt-3 px-3 py-2.5 rounded-lg border-l-4 text-xs"
                            style={{
                              background:   `${PRIMARY}08`,
                              borderColor:  PRIMARY,
                              color:        PRIMARY,
                            }}
                          >
                            <span className="font-bold">Feedback: </span>{project.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination current={projectsPage} total={projectsTotalPages} onChange={onProjectsPageChange} />
            </>
          )
        )}

        {/* ── Badges Tab ── */}
        {activeTab === 'badges' && (
          awardedBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Award size={24} className="text-amber-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">No badges awarded yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleBadges.map((badge, idx) => {
                  const globalIdx = badgesPage * BADGES_PER_PAGE + idx;
                  const cat       = getCat(globalIdx);

                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl border bg-white hover:shadow-sm transition-all duration-150"
                      style={{
                        borderColor:     cat.border,
                        borderLeftWidth: '3px',
                        borderLeftColor: cat.color,
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                        style={{ background: cat.bg, borderColor: cat.border }}
                      >
                        <cat.Icon size={20} style={{ color: cat.color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate leading-tight">{badge.badgeTitle}</p>
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: cat.color }}>{cat.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(badge.awardedAt)}</p>
                        {badge.note && (
                          <p className="text-[11px] text-gray-500 mt-0.5 italic truncate">"{badge.note}"</p>
                        )}
                      </div>

                      {/* Points */}
                      <div
                        className="shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-xl border"
                        style={{ background: cat.bg, borderColor: cat.border, color: cat.color }}
                      >
                        <Star size={13} fill="currentColor" />
                        <span className="text-[11px] font-bold leading-tight mt-0.5">{badge.badgePoints}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination current={badgesPage} total={badgesTotalPages} onChange={setBadgesPage} />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectsList;