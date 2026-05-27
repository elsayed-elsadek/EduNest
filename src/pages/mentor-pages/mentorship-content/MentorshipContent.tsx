import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  PenLine,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashLayout from '../../../components/layout/Dash-layout';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  createWeek,
  getWeeksByMentorship,
  getWeekContents,
  deleteQuiz,
  deleteLecture,
  deleteTask,
  deleteLiveSession,
  deleteProject,
  deleteWeek,
  updateWeekTitle,
  type WeekResponse,
  type WeekContentItem,
} from '../../../services/mentorshipsContent';
import { useAuthStore } from '../../../store/authStore';

import type { ContentType, ContentItem, ModuleState } from './types';
import ContentIcon from './components/ContentIcon';
import {
  AddLectureModal,
  AddQuizModal,
  AddProjectModal,
  ScheduleSessionModal,
  AddAssignmentModal,
} from './components';

// نقل الزرار برة الكومبوننت عشان ميتعرّفش من جديد مع كل ريندر
const CONTENT_BUTTONS = [
  { type: "lecture", label: "Add Lecture" },
  { type: "quiz", label: "Add Quiz" },
  { type: "assignment", label: "Add Assignment" },
  { type: "session", label: "Schedule Session" },
  { type: "project", label: "Add Project" },
] as const;

const MentorshipContent: FC = () => {
  const { id: mentorshipIdParam } = useParams<{ id: string }>();
  const mentorshipId = mentorshipIdParam ? Number(mentorshipIdParam) : 0;
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [modules, setModules] = useState<ModuleState[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals management
  const [modal, setModal] = useState<ContentType | null>(null);
  const [moduleIndexForModal, setModuleIndexForModal] = useState<number>(0);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'module' | 'item';
    name: string;
    moduleIdx?: number;
    itemIdx?: number;
  } | null>(null);

  // دالة ديناميكية ذكية لاستخراج رسالة الخطأ من السيرفر مهما كان شكل الـ Response
  const parseServerError = (err: unknown): string => {
    if (err && typeof err === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      
      if (errorObj.errorMessages?.error) return errorObj.errorMessages.error;
      if (errorObj.errorMessages?.message) return errorObj.errorMessages.message;
      
      if (errorObj.response?.data?.errorMessages?.error) return errorObj.response.data.errorMessages.error;
      if (errorObj.response?.data?.message) return errorObj.response.data.message;
      
      if (errorObj.message) return errorObj.message;
    }
    return 'Failed to process request. Please try again.';
  };

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Load existing weeks and content
  useEffect(() => {
    if (!mentorshipId || mentorshipId <= 0) return;

    const fetchWeeksAndContent = async () => {
      setLoading(true);
      try {
        const weeks = await getWeeksByMentorship(mentorshipId);
        const mappedModules: ModuleState[] = await Promise.all(
          weeks.map(async (week, index) => {
            let items: ContentItem[] = [];
            try {
              const contents = await getWeekContents(week.id);
              items = mapWeekContentsToItems(contents, week.id);
            } catch {
              items = [];
            }
            return {
              id: week.id,
              title: week.title ?? `Module ${index + 1}`,
              items,
              expanded: false,
            };
          })
        );
        setModules(mappedModules);
      } catch (err) {
        toast.error(parseServerError(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchWeeksAndContent();
  }, [mentorshipId]);

  const resolveContentType = (c: WeekContentItem): ContentType => {
    const raw = (c.type ?? '').toUpperCase().trim();
    if (['LIVE_SESSION', 'SESSION', 'LIVESESSION', 'LIVE'].includes(raw)) return 'session';
    if (['QUIZ', 'QUIZZES'].includes(raw)) return 'quiz';
    if (['PROJECT', 'PROJECTS'].includes(raw)) return 'project';
    if (['ASSIGNMENT', 'TASK', 'ASSIGNMENTS', 'TASKS'].includes(raw)) return 'assignment';
    if (['LECTURE', 'LECTURES', 'VIDEO'].includes(raw)) return 'lecture';

    if ('lectureUrl' in c) return 'lecture';
    if ('durationMinutes' in c) return 'quiz';
    if ('goal' in c || 'brief' in c) return 'project';
    if ('date' in c || 'time' in c) return 'session';

    return 'lecture';
  };

  const resolveItemId = (c: WeekContentItem, type: ContentType): number | string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const get = (k: string) => (c as any)[k];
    const defined = (v: unknown) => v !== undefined && v !== null;

    const typeSpecific: Record<ContentType, string[]> = {
      session:    ['sessionId', 'liveSessionId', 'live_session_id'],
      quiz:       ['quizId', 'quiz_id'],
      assignment: ['taskId', 'task_id', 'assignmentId'],
      project:    ['projectId', 'project_id'],
      lecture:    ['lectureId', 'lecture_id'],
    };
    
    for (const k of typeSpecific[type]) {
      if (k in c && defined(get(k))) return get(k) as number | string;
    }
    for (const k of ['id', '_id', 'contentId']) {
      if (k in c && defined(get(k))) return get(k) as number | string;
    }
    return undefined;
  };

  const buildItemKey = (weekId: number | null, type: ContentType, id?: number | string, fallbackIdx?: number): string =>
    `${weekId ?? 'new'}-${type}-${id ?? fallbackIdx ?? 'noid'}`;

  const mapWeekContentsToItems = (contents: WeekContentItem[], weekId: number | null): ContentItem[] =>
    contents.map((c) => ({
      id: resolveItemId(c, resolveContentType(c)),
      title: (c.title as string | undefined) ?? 'Untitled',
      type: resolveContentType(c),
      weekId: weekId ?? undefined,
    }));

  const openModal = (type: ContentType, moduleIdx: number) => {
    setEditingItem(null);
    setModal(type);
    setModuleIndexForModal(moduleIdx);
  };

  const openEditModal = (type: ContentType, moduleIdx: number, item: ContentItem) => {
    setEditingItem(item);
    setModal(type);
    setModuleIndexForModal(moduleIdx);
  };

  const closeModal = () => {
    setModal(null);
    setEditingItem(null);
  };

  const handleDeleteItem = (moduleIdx: number, itemIdx: number, item: ContentItem) => {
    setDeleteTarget({
      type: 'item',
      name: item.title,
      moduleIdx,
      itemIdx,
    });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'item') {
        const moduleIdx = deleteTarget.moduleIdx!;
        const itemIdx = deleteTarget.itemIdx!;
        const item = modules[moduleIdx]?.items[itemIdx];

        if (!item || !item.id) {
          toast.error(`Invalid item: ${item?.title ?? 'Unknown'}`);
          return;
        }

        const numericId = Number(item.id);
        if (!Number.isFinite(numericId) || numericId <= 0) {
          toast.error('Invalid item ID');
          return;
        }

        switch (item.type) {
          case 'lecture': await deleteLecture(numericId); break;
          case 'quiz': await deleteQuiz(numericId); break;
          case 'assignment': await deleteTask(numericId); break;
          case 'session': await deleteLiveSession(numericId); break;
          case 'project': await deleteProject(numericId); break;
        }

        setModules((prev) => {
          const next = [...prev];
          if (next[moduleIdx]) {
            next[moduleIdx] = {
              ...next[moduleIdx],
              items: next[moduleIdx].items.filter((_, idx) => idx !== itemIdx),
            };
          }
          return next;
        });
        toast.success(`"${item.title}" deleted successfully`);
      } else if (deleteTarget.type === 'module') {
        const module = modules[deleteTarget.moduleIdx!];
        if (!module || !module.id) {
          toast.error('Invalid module');
          return;
        }

        await deleteWeek(module.id);
        setModules((prev) => prev.filter((_, idx) => idx !== deleteTarget.moduleIdx));
        toast.success('Module deleted successfully');
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(parseServerError(err));
    }
  };

  const handleEditModule = (index: number) => {
    const module = modules[index];
    if (module) {
      setEditingModuleIndex(index);
      setEditingModuleTitle(module.title);
    }
  };

  const handleSaveModuleTitle = async (index: number) => {
    const module = modules[index];
    if (!module || !editingModuleTitle.trim() || !module.id) {
      toast.error('Module title cannot be empty');
      return;
    }

    if (editingModuleTitle === module.title) {
      setEditingModuleIndex(null);
      return;
    }

    try {
      await updateWeekTitle(module.id, editingModuleTitle.trim());
      setModules((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], title: editingModuleTitle.trim() };
        }
        return next;
      });
      toast.success('Module title updated');
      setEditingModuleIndex(null);
    } catch (err) {
      toast.error(parseServerError(err));
    }
  };

  const handleDeleteModule = (index: number) => {
    const module = modules[index];
    if (!module) return;
    setDeleteTarget({
      type: 'module',
      name: module.title,
      moduleIdx: index,
    });
    setShowDeleteConfirm(true);
  };

  const handleAddModule = async () => {
    if (!mentorshipId || mentorshipId <= 0) {
      toast.error('Invalid mentorship ID');
      return;
    }
    setLoading(true);
    try {
      const title = `Module ${modules.length + 1}`;
      const res = await createWeek({ mentorshipId, title });
      const weekId = (res as WeekResponse)?.id ?? res?.id;
      setModules((prev) => [
        ...prev,
        {
          id: weekId,
          title,
          items: [],
          expanded: true,
        },
      ]);
      toast.success('Module added successfully');
    } catch (err) {
      toast.error(parseServerError(err));
    } finally {
      setLoading(false);
    }
  };

  // دالة موحدة ومحمية من التكرار (Prevents Duplication Bug)
  const handleModalSuccess = useCallback((title: string, id: number | string | undefined, type: ContentType) => {
    setModules((prev) => {
      const next = [...prev];
      const mod = next[moduleIndexForModal];
      if (!mod) return prev;

      if (editingItem) {
        // تحديث العنصر الحالي
        mod.items = mod.items.map((it) =>
          it.id === editingItem.id && it.type === editingItem.type ? { ...it, title } : it
        );
      } else {
        // التحقق منعاً للتكرار: لو الأي دي موجود بالفعل متضيفوش تاني
        const isAlreadyAdded = mod.items.some((it) => it.id === id && it.type === type);
        if (!isAlreadyAdded) {
          mod.items = [...mod.items, { id, type, title, weekId: mod.id ?? undefined }];
        }
      }
      return next;
    });
    closeModal();
  }, [moduleIndexForModal, editingItem]);

  const toggleModule = (idx: number) => {
    setModules((prev) => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], expanded: !next[idx].expanded };
      return next;
    });
  };

  if (!mentorshipId || mentorshipId <= 0) {
    return (
      <DashLayout pageTitle="Create Content">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">Invalid mentorship ID.</div>
      </DashLayout>
    );
  }

  return (
    <DashLayout pageTitle="My Mentorships / Create Content">
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Create Mentorship Content</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Add modules (weeks), lectures, quizzes, projects, and sessions.</p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner 
                message="Loading Content..." 
                submessage="Loading modules and lessons"
                size="lg"
              />
            </div>
          ) : (
            <>
              {/* Modules list */}
              <div className="space-y-3">
                {modules.map((mod, idx) => (
                  <div
                    key={mod.id ?? `new-${idx}`}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-4 justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition">
                      <button
                        type="button"
                        onClick={() => toggleModule(idx)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        {mod.expanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                        )}
                        {editingModuleIndex === idx ? (
                          <input
                            type="text"
                            value={editingModuleTitle}
                            onChange={(e) => setEditingModuleTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-2 py-1 rounded border border-[var(--primary-from)] focus:ring-2 focus:ring-[var(--primary-from)] font-semibold text-gray-900 dark:text-white dark:bg-zinc-800"
                            autoFocus
                            maxLength={25}
                          />
                        ) : (
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {mod.title || `Module ${idx + 1}`}
                          </span>
                        )}
                      </button>
                      <div className="flex gap-2">
                        {editingModuleIndex === idx ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingModuleIndex(null)}
                              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveModuleTitle(idx)}
                              className="px-2 py-1 text-xs font-medium text-white bg-primary rounded hover:bg-[var(--primary-dark)]"
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditModule(idx)}
                              className="p-1.5 text-gray-400 hover:text-primary"
                              aria-label="Edit module"
                            >
                              <PenLine className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteModule(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-600"
                              aria-label="Delete module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {mod.expanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
                        {/* Items list */}
                        <div className="space-y-2 mb-4">
                          {mod.items.map((item, itemIdx) => (
                            <div
                              key={buildItemKey(mod.id, item.type, item.id, itemIdx)}
                              className="flex items-center gap-3 py-2 pl-6 border-l-2 border-dotted border-gray-200 dark:border-zinc-700"
                            >
                              <ContentIcon type={item.type} />
                              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.title}</span>
                              {item.isDraft && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Draft</span>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditModal(item.type, idx, item)}
                                className="p-1.5 text-gray-400 hover:text-primary"
                                aria-label="Edit"
                              >
                                <PenLine className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(idx, itemIdx, item)}
                                className="p-1.5 text-gray-400 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add content buttons */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center sm:justify-start">
                          {CONTENT_BUTTONS.map((btn) => (
                            <button
                              key={btn.type}
                              type="button"
                              onClick={() => openModal(btn.type, idx)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--primary-from)] text-white text-sm font-medium hover:bg-[var(--primary-dark)]"
                            >
                              <Plus className="w-4 h-4" />
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Module button */}
              <button
                type="button"
                onClick={handleAddModule}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-[var(--primary-from)] hover:text-primary hover:bg-[var(--primary-from)]/5 transition disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {loading ? 'Adding...' : 'Add Module'}
              </button>

              {/* Bottom actions */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/mentor/mentorships/${mentorshipId}`)}
                  className="shrink-0 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-primary hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Back to Details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals Mounting */}
      {modal === 'lecture' && (
        <AddLectureModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => handleModalSuccess(title, id, 'lecture')}
        />
      )}
      {modal === 'quiz' && (
        <AddQuizModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => handleModalSuccess(title, id, 'quiz')}
        />
      )}
      {modal === 'project' && (
        <AddProjectModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => handleModalSuccess(title, id, 'project')}
        />
      )}
      {modal === 'session' && (
        <ScheduleSessionModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => handleModalSuccess(title, id, 'session')}
        />
      )}
      {modal === 'assignment' && (
        <AddAssignmentModal
          weekId={modules[moduleIndexForModal]?.id ?? null}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(item) => handleModalSuccess(item.title, item.id, 'assignment')}
        />
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-lg border border-gray-200 dark:border-zinc-800 mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete {deleteTarget.type === 'module' ? 'Module' : 'Content'}?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {deleteTarget.type === 'module'
                ? `This action cannot be undone. Are you sure you want to continue?`
                : `Are you sure you want to delete "${deleteTarget.name}"?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashLayout>
  );
};

export default MentorshipContent;