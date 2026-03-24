
import { useState, useEffect, useRef, type FC } from 'react';
import { useBadges } from '../../../hooks/Usebadges';
import type { BadgeCategory, CreateBadgeInput } from '../../../services/Badgesservice';

const MAX_BADGES = 10;

const CATEGORIES: { value: BadgeCategory; label: string; emoji: string; color: string }[] = [
  { value: 'ACHIEVEMENT',         label: 'Achievement',         emoji: '🏆', color: '#F59E0B' },
  { value: 'PERFORMANCE',         label: 'Performance',         emoji: '⚡', color: '#3B82F6' },
  { value: 'CONSISTENCY',         label: 'Consistency',         emoji: '🔥', color: '#EF4444' },
  { value: 'PROBLEM_SOLVING',     label: 'Problem Solving',     emoji: '🧩', color: '#8B5CF6' },
  { value: 'CREATIVITY',          label: 'Creativity',          emoji: '🎨', color: '#EC4899' },
  { value: 'LEADERSHIP',          label: 'Leadership',          emoji: '👑', color: '#F59E0B' },
  { value: 'COMMUNITY',           label: 'Community',           emoji: '🤝', color: '#10B981' },
  { value: 'SPECIAL_RECOGNITION', label: 'Special Recognition', emoji: '⭐', color: '#6366F1' },
];

const getCat = (v: BadgeCategory) => CATEGORIES.find(c => c.value === v) ?? CATEGORIES[0];

interface MentorshipInfo { id: string; name: string; emoji?: string; }
interface Props {
  studentName:     string;
  studentId:       number;    // ← needed for award API
  mentorships:     MentorshipInfo[];
  earnedBadgeIds?: number[];
  onClose:         () => void;
  onAwarded?:      () => void; // ← optional callback to refresh parent after award
}

const emptyForm = (): CreateBadgeInput => ({ title: '', category: 'ACHIEVEMENT', description: '', points: 50 });

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastStack: FC<{ toasts: { id: number; message: string; type: 'success'|'error' }[] }> = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs
          ${t.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        style={{ animation: 'slideIn .3s ease' }}>
        <span className="flex-shrink-0">{t.type === 'success' ? '✓' : '✕'}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// ── Badge Form Modal (Create & Edit) ─────────────────────────────────────────
const BadgeFormModal: FC<{
  mode:           'create' | 'edit';
  mentorshipName: string;
  initial?:       CreateBadgeInput;
  saving:         boolean;
  onCancel:       () => void;
  onSave:         (data: CreateBadgeInput) => void;
}> = ({ mode, mentorshipName, initial, saving, onCancel, onSave }) => {
  const [form,       setForm      ] = useState<CreateBadgeInput>(initial ?? emptyForm());
  const [formError,  setFormError ] = useState<string | null>(null);
  const cat = getCat(form.category);

  const handleSave = () => {
    if (!form.title.trim()) { setFormError('Badge title is required'); return; }
    if (!form.category)     { setFormError('Please select a category'); return; }
    if (!form.points || form.points < 1) { setFormError('Points must be greater than 0'); return; }
    setFormError(null);
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: 'fadeUp .2s ease' }}>

        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {mode === 'edit' ? '✏️ Edit Badge' : '✨ Create New Badge'}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {mode === 'edit' ? 'Update badge details' : `Creating inside: ${mentorshipName}`}
              </p>
            </div>
            <button onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">✕</button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Validation error */}
          {formError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
              <span>⚠️</span> {formError}
            </div>
          )}
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
            <div className="relative">
              <select value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as BadgeCategory }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer">
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
            </div>
          </div>

          {/* Title + Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Badge Title</label>
              <input type="text" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Fast Learner"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Points Value</label>
              <input type="number" value={form.points} min={50} max={1000} step={50}
                onChange={e => setForm(p => ({ ...p, points: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
            <textarea value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe what this badge represents..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>

          {/* Icon preview */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Badge Icon — Based on Category</label>
            <div className="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${cat.color}18` }}>
                {cat.emoji}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{form.title || 'Badge Title'}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: cat.color }}>{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">⭐ {form.points} pts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onCancel} disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition disabled:opacity-40 flex items-center gap-2 shadow-sm">
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : '✓'} {mode === 'edit' ? 'Save Changes' : 'Create Badge'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteConfirmModal: FC<{
  badgeTitle: string;
  deleting:   boolean;
  onConfirm:  () => void;
  onCancel:   () => void;
}> = ({ badgeTitle, deleting, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      style={{ animation: 'fadeUp .2s ease' }}>
      <div className="px-6 py-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Badge?</h3>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete <span className="font-semibold text-gray-700">"{badgeTitle}"</span>?
        </p>
        <p className="text-xs text-red-400 mt-1">Cannot delete if already awarded to a student.</p>
      </div>
      <div className="px-6 pb-5 flex gap-3">
        <button onClick={onCancel} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {deleting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : '🗑️ Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const AwardBadgesModal: FC<Props> = ({
  studentName, studentId, mentorships, earnedBadgeIds = [], onClose, onAwarded,
}) => {
  const [activeMid,  setActiveMid ] = useState(mentorships[0]?.id ?? '');
  const hook = useBadges(activeMid);

  const [search,     setSearch    ] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note,       setNote      ] = useState('');
  const [awarding,   setAwarding  ] = useState(false);
  const [showNote,   setShowNote  ] = useState(false);
  const [formMode,   setFormMode  ] = useState<null | 'create' | 'edit'>(null);
  const [editBadge,  setEditBadge ] = useState<{ id: number; data: CreateBadgeInput } | null>(null);
  const [deleteId,   setDeleteId  ] = useState<number | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { hook.fetchBadges(); setSelectedId(null); setSearch(''); }, [activeMid]);

  const filtered = hook.badges.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeName    = mentorships.find(m => m.id === activeMid)?.name ?? '';
  const selectedBadge = hook.badges.find(b => b.id === selectedId);
  const deleteBadge   = hook.badges.find(b => b.id === deleteId);
  const remaining     = MAX_BADGES - hook.badges.length;

  const handleCreate = async (data: CreateBadgeInput) => {
    const ok = await hook.create(data);
    if (ok) setFormMode(null);
  };

  const handleEdit = async (data: CreateBadgeInput) => {
    if (!editBadge) return;
    const ok = await hook.update(editBadge.id, data);
    if (ok) { setFormMode(null); setEditBadge(null); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await hook.remove(deleteId);
    if (ok) {
      setDeleteId(null);
      if (selectedId === deleteId) setSelectedId(null);
    }
    // If failed (badge already awarded), modal closes but error toast shows
    else setDeleteId(null);
  };

  const handleAward = async () => {
    if (!selectedId) return;
    setAwarding(true);
    const ok = await hook.award(selectedId, { studentId, note: note.trim() || undefined });
    setAwarding(false);
    if (ok) {
      setSelectedId(null);
      setNote('');
      setShowNote(false);
      onAwarded?.();  // refresh parent badge list
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeUp  { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      <ToastStack toasts={hook.toasts} />

      <div ref={backdropRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={e => { if (e.target === backdropRef.current) onClose(); }}>

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{ animation: 'fadeUp .25s ease' }}>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">🏅 Award Badge to {studentName}</h2>
                <p className="text-sm text-gray-400 mt-0.5">Select a mentorship, then pick a badge to award</p>
              </div>
              <button onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition flex-shrink-0">✕</button>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Choose Mentorship</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {mentorships.map((m, i) => {
                  const emojis = ['⚙️','💻','⚡','📚','🎨'];
                  return (
                    <button key={m.id} onClick={() => { setActiveMid(m.id); setSelectedId(null); }}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        activeMid === m.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600 bg-white'
                      }`}>
                      <span>{m.emoji ?? emojis[i % emojis.length]}</span>
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search + counter */}
          <div className="px-6 pb-3 flex-shrink-0">
            <div className="relative mb-3">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search badges..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-600">
                {hook.badges.length} / {MAX_BADGES} badges in this mentorship
              </span>
              <div className="flex gap-1">
                {Array.from({ length: MAX_BADGES }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < hook.badges.length ? 'bg-amber-400' : 'bg-gray-200'
                  }`} />
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 flex-shrink-0" />

          {/* Badge list */}
          <div className="flex-1 overflow-y-auto px-6 py-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>

            {hook.loading && (
              <div className="flex items-center justify-center h-40">
                <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!hook.loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map(badge => {
                  const cat      = getCat(badge.category);
                  const isSelected = selectedId === badge.id;
                  const isEarned   = earnedBadgeIds.includes(badge.id);

                  return (
                    <div key={badge.id}
                      onClick={() => setSelectedId(isSelected ? null : badge.id)}
                      className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all group overflow-hidden ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                      }`}>

                      <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ background: cat.color }} />

                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ml-1"
                        style={{ background: `${cat.color}18` }}>
                        {cat.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                          {/* ── Earned tag — shown when student already has this badge ── */}
                          {isEarned && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              ✓ Earned
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium mt-0.5" style={{ color: cat.color }}>{cat.label}</p>
                        <p className="text-xs text-amber-500 font-semibold mt-1">⭐ {badge.points} pts</p>
                      </div>

                      {/* Radio + actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0"
                        onClick={e => e.stopPropagation()}>
                        {/* Radio: filled amber if selected, grey checkmark if earned */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500'
                            : isEarned
                              ? 'border-gray-300 bg-gray-100'
                              : 'border-gray-300 group-hover:border-amber-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          {!isSelected && isEarned && <span className="text-[9px] text-gray-500">✓</span>}
                        </div>

                        {/* Edit + Delete on hover */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditBadge({
                                id:   badge.id,
                                data: { title: badge.title, category: badge.category, description: badge.description, points: badge.points },
                              });
                              setFormMode('edit');
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 text-xs transition">
                            ✏️
                          </button>
                          <button onClick={() => setDeleteId(badge.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 text-xs transition">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* ── Create new badge card — full width at bottom ── */}
                {!search && hook.badges.length < MAX_BADGES && (
                  <button
                    onClick={() => { setFormMode('create'); setEditBadge(null); }}
                    className="col-span-1 sm:col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-lg transition flex-shrink-0">
                      ✨
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-amber-700">Create a new badge in this mentorship</p>
                      <p className="text-xs text-amber-500">{remaining} slot{remaining !== 1 ? 's' : ''} remaining</p>
                    </div>
                  </button>
                )}

                {/* Empty state when no badges and no search */}
                {!search && hook.badges.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-3xl mb-2">🏅</div>
                    <p className="text-sm font-semibold text-gray-500">No badges created yet for {activeName}</p>
                  </div>
                )}

                {/* No search results */}
                {search && filtered.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm text-gray-400">No badges match "{search}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 space-y-3">
            {/* Optional note — shows when a badge is selected */}
            {selectedId && (
              <div>
                {!showNote ? (
                  <button onClick={() => setShowNote(true)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">
                    + Add a note (optional)
                  </button>
                ) : (
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="e.g. Excellent performance this month!"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                    autoFocus
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedBadge ? (
                  <span>
                    Selected: {getCat(selectedBadge.category).emoji}{' '}
                    <span className="font-semibold text-gray-700">{selectedBadge.title} </span>
                  </span>
                ) : 'No badge selected'}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={handleAward}
                  disabled={!selectedId || awarding}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition disabled:opacity-40 shadow-sm flex items-center gap-2">
                  {awarding
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : '🏅 Award Badge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {formMode && (
        <BadgeFormModal
          mode={formMode}
          mentorshipName={activeName}
          initial={formMode === 'edit' ? editBadge?.data : undefined}
          saving={hook.saving}
          onCancel={() => { setFormMode(null); setEditBadge(null); }}
          onSave={formMode === 'edit' ? handleEdit : handleCreate}
        />
      )}

      {deleteId && deleteBadge && (
        <DeleteConfirmModal
          badgeTitle={deleteBadge.title}
          deleting={hook.saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
};

export default AwardBadgesModal;