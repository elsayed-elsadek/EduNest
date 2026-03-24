import type { FC } from 'react';
import { useState, useEffect } from 'react';
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
  updateMentorshipStatus,
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


const MentorshipContent: FC = () => {
  const { id: mentorshipIdParam } = useParams<{ id: string }>();
  const mentorshipId = mentorshipIdParam ? Number(mentorshipIdParam) : 0;
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [modules, setModules] = useState<ModuleState[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'draft' | 'publish' | null>(null);

  // Modals: which one is open and for which module index
  const [modal, setModal] = useState<'lecture' | 'quiz' | 'project' | 'session' | 'assignment' | null>(null);
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

  const contentButtons = [
  { type: "lecture", label: "Add Lecture" },
  { type: "quiz", label: "Add Quiz" },
  { type: "assignment", label: "Add Assignment" },
  { type: "session", label: "Schedule Session" },
  { type: "project", label: "Add Project" },
];

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Load existing weeks (modules) and their contents for this mentorship
  useEffect(() => {
    if (!mentorshipId || mentorshipId <= 0) return;

    const fetchWeeksAndContent = async () => {
      setLoading(true);
      try {
        console.log("📝 Fetching weeks for mentorshipId:", mentorshipId);
        const weeks = await getWeeksByMentorship(mentorshipId);
        console.log("📝 Received weeks:", weeks);

        const mappedModules: ModuleState[] = await Promise.all(
          weeks.map(async (week, index) => {
            let items: ContentItem[] = [];
            try {
              const contents = await getWeekContents(week.id);
              items = mapWeekContentsToItems(contents);
            } catch {
              // If content loading fails, we still show the week itself
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
        toast.error(
          err instanceof Error ? err.message : 'Failed to load mentorship modules.'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchWeeksAndContent();
  }, [mentorshipId]);

  // Try to infer content type from backend week contents
  const mapWeekContentsToItems = (contents: WeekContentItem[]): ContentItem[] =>
    contents.map((c) => {
      const title = (c.title as string | undefined) ?? 'Untitled';

      let type: ContentType = 'lecture';
      if ('lectureUrl' in c) type = 'lecture';
      else if ('durationMinutes' in c || c.type === 'QUIZ') type = 'quiz';
      else if ('goal' in c || 'brief' in c || c.type === 'PROJECT') type = 'project';
      else if ('date' in c || 'time' in c || c.type === 'LIVE_SESSION') type = 'session';
      else if (c.type === 'ASSIGNMENT') type = 'assignment';

      // debugging: show what type deduced
      console.log('mapped content item', { raw: c, type });

      // Try common id keys if backend uses different names
      const possibleIdKeys = ['id', '_id', 'quizId', 'taskId', 'projectId', 'lectureId', 'contentId'];
      let foundId: number | string | undefined = undefined;
      for (const k of possibleIdKeys) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (k in c && (c as any)[k] !== undefined && (c as any)[k] !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          foundId = (c as any)[k] as number | string;
          break;
        }
      }

      return {
        id: foundId,
        title,
        type,
      };
    });

  const openModal = (type: 'lecture' | 'quiz' | 'project' | 'session' | 'assignment', moduleIdx: number) => {
    setEditingItem(null);
    setModal(type);
    setModuleIndexForModal(moduleIdx);
  };

  const openEditModal = (
    type: 'lecture' | 'quiz' | 'project' | 'session' | 'assignment',
    moduleIdx: number,
    item: ContentItem
  ) => {
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
          console.error('Attempted to delete item without id', { moduleIdx, itemIdx, item });
          toast.error(`Invalid item: ${item?.title ?? 'Unknown'}`);
          return;
        }

        // Validate numeric id and log for debugging
        const numericId = Number(item.id);
        console.log('Deleting item', { moduleIdx, itemIdx, item, numericId });
        if (!Number.isFinite(numericId) || numericId <= 0) {
          toast.error('Invalid item id');
          return;
        }

        // Delete based on content type (use validated numeric id)
        switch (item.type) {
          case 'lecture':
            await deleteLecture(numericId);
            break;
          case 'quiz':
            await deleteQuiz(numericId);
            break;
          case 'assignment':
            await deleteTask(numericId);
            break;
          case 'session':
            await deleteLiveSession(numericId);
            break;
          case 'project':
            await deleteProject(numericId);
            break;
        }

        // Remove from UI
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

        await deleteWeek(module.id as number);
        setModules((prev) => prev.filter((_, idx) => idx !== deleteTarget.moduleIdx));
        toast.success('Module deleted successfully');
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
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
      await updateWeekTitle(module.id as number, editingModuleTitle.trim());
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
      toast.error(err instanceof Error ? err.message : 'Failed to update module title');
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
    const title = `Module ${modules.length + 1}`;
    if (!mentorshipId || mentorshipId <= 0) {
      toast.error('Invalid mentorship ID');
      return;
    }
    setLoading(true);
    try {
      const res = await createWeek({ mentorshipId, title });
      const weekId = (res as WeekResponse)?.id ?? res?.id;
      setModules((prev) => [
        ...prev,
        {
          id: weekId as number,
          title,
          items: [],
          expanded: true,
        },
      ]);
      toast.success('Module added successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create module';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const addItemToModule = (moduleIdx: number, item: ContentItem) => {
    setModules((prev) => {
      const next = [...prev];
      if (next[moduleIdx]) next[moduleIdx] = { ...next[moduleIdx], items: [...next[moduleIdx].items, item] };
      return next;
    });
  };

  const toggleModule = (idx: number) => {
    setModules((prev) => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], expanded: !next[idx].expanded };
      return next;
    });
  };

  const handleSaveAsDraft = async () => {
    if (!mentorshipId || mentorshipId <= 0) return;
    setActionLoading('draft');
    try {
      await updateMentorshipStatus(mentorshipId, 'DRAFT');
      toast.success('Content saved as draft.');
      navigate(`/mentor/mentorships/${mentorshipId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save as draft.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async () => {
    if (!mentorshipId || mentorshipId <= 0) return;
    setActionLoading('publish');
    try {
      await updateMentorshipStatus(mentorshipId, 'ACTIVE');
      toast.success('Mentorship published. Content is now visible.');
      navigate(`/mentor/mentorships/${mentorshipId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!mentorshipId || mentorshipId <= 0) {
    return (
      <DashLayout pageTitle="Create Content">
        <div className="p-6 text-center text-gray-500">Invalid mentorship ID.</div>
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create Mentorship Content</h1>
              <p className="text-sm text-gray-500 mt-0.5">Add modules (weeks), lectures, quizzes, projects, and sessions.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/mentor/mentorships/${mentorshipId}`)}
              className="shrink-0 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-primary hover:bg-gray-50"
            >
              Back to Details
            </button>
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-4 justify-between hover:bg-gray-50/50 transition">
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
                        className="flex-1 px-2 py-1 rounded border border-[var(--primary-from)] focus:ring-2 focus:ring-[var(--primary-from)] font-semibold text-gray-900"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
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
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
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
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    {/* Items list */}
                    <div className="space-y-2 mb-4">
                      {mod.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-3 py-2 pl-6 border-l-2 border-dotted border-gray-200"
                        >
                          <ContentIcon type={item.type} />
                          <span className="flex-1 text-sm text-gray-700">{item.title}</span>
                          {item.isDraft && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Draft</span>
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
  {contentButtons.map((btn) => (
    <button
      key={btn.type}
      type="button"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={() => openModal(btn.type as any, idx)}
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
            className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-600 hover:border-[var(--primary-from)] hover:text-primary hover:bg-[var(--primary-from)]/5 transition disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Adding...' : 'Add Module'}
          </button>

          {/* Bottom actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={!!actionLoading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading === 'draft' ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!!actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-[var(--primary-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading === 'publish' ? 'Publishing...' : 'Publish'}
            </button>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Modals - rendered by separate components for clarity */}
      {modal === 'lecture' && (
        <AddLectureModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => {
            if (editingItem) {
              // Update mode - update the item
              setModules((prev) => {
                const next = [...prev];
                const itemIdx = next[moduleIndexForModal]?.items.indexOf(editingItem);
                if (itemIdx !== undefined && itemIdx >= 0 && next[moduleIndexForModal]) {
                  next[moduleIndexForModal].items[itemIdx] = { ...editingItem, title };
                }
                return next;
              });
            } else {
              // Add mode
              addItemToModule(moduleIndexForModal, { id, type: 'lecture', title });
            }
            closeModal();
          }}
        />
      )}
      {modal === 'quiz' && (
        <AddQuizModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => {
            if (editingItem) {
              setModules((prev) => {
                const next = [...prev];
                const itemIdx = next[moduleIndexForModal]?.items.indexOf(editingItem);
                if (itemIdx !== undefined && itemIdx >= 0 && next[moduleIndexForModal]) {
                  next[moduleIndexForModal].items[itemIdx] = { ...editingItem, title };
                }
                return next;
              });
            } else {
              addItemToModule(moduleIndexForModal, { id, type: 'quiz', title });
            }
            closeModal();
          }}
        />
      )}
      {modal === 'project' && (
        <AddProjectModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => {
            if (editingItem) {
              setModules((prev) => {
                const next = [...prev];
                const itemIdx = next[moduleIndexForModal]?.items.indexOf(editingItem);
                if (itemIdx !== undefined && itemIdx >= 0 && next[moduleIndexForModal]) {
                  next[moduleIndexForModal].items[itemIdx] = { ...editingItem, title };
                }
                return next;
              });
            } else {
              addItemToModule(moduleIndexForModal, { id, type: 'project', title });
            }
            closeModal();
          }}
        />
      )}
      {modal === 'session' && (
        <ScheduleSessionModal
          weekId={modules[moduleIndexForModal]?.id ?? 0}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(title, id) => {
            if (editingItem) {
              setModules((prev) => {
                const next = [...prev];
                const itemIdx = next[moduleIndexForModal]?.items.indexOf(editingItem);
                if (itemIdx !== undefined && itemIdx >= 0 && next[moduleIndexForModal]) {
                  next[moduleIndexForModal].items[itemIdx] = { ...editingItem, title };
                }
                return next;
              });
            } else {
              addItemToModule(moduleIndexForModal, { id, type: 'session', title });
            }
            closeModal();
          }}
        />
      )}
      {modal === 'assignment' && (
        <AddAssignmentModal
          weekId={modules[moduleIndexForModal]?.id ?? null}
          editingItem={editingItem}
          onClose={closeModal}
          onSuccess={(item) => {
            if (editingItem) {
              setModules((prev) => {
                const next = [...prev];
                const itemIdx = next[moduleIndexForModal]?.items.indexOf(editingItem);
                if (itemIdx !== undefined && itemIdx >= 0 && next[moduleIndexForModal]) {
                  next[moduleIndexForModal].items[itemIdx] = item;
                }
                return next;
              });
            } else {
              addItemToModule(moduleIndexForModal, item);
            }
            closeModal();
          }}
        />
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border border-gray-200 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {deleteTarget.type === 'module' ? 'Module' : 'Content'}?</h3>
            <p className="text-sm text-gray-600 mb-6">
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
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
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



