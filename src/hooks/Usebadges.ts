
import { useState, useCallback } from 'react';
import {
  getBadgesByMentorship, createBadge, updateBadge, deleteBadge, awardBadge,
  type BadgeDto, type CreateBadgeInput, type AwardInput,
} from '../services/Badgesservice';

export interface BadgeToast {
  id:      number;
  message: string;
  type:    'success' | 'error';
}

export const useBadges = (mentorshipId: string) => {
  const [badges,  setBadges ] = useState<BadgeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving ] = useState(false);
  const [toasts,  setToasts ] = useState<BadgeToast[]>([]);

  // ── handleRequest now throws a string — just catch and display it ─────────
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchBadges = useCallback(async () => {
    if (!mentorshipId) return;
    setLoading(true);
    try {
      const res = await getBadgesByMentorship(mentorshipId);
      setBadges(res.apiResponse?.badges ?? []);
    } catch (e) {
      addToast(String(e), 'error');
    } finally { setLoading(false); }
  }, [mentorshipId, addToast]);

  const create = useCallback(async (data: CreateBadgeInput): Promise<boolean> => {
    setSaving(true);
    try {
      const res   = await createBadge(mentorshipId, data);
      const badge = res.apiResponse?.badge;
      const msg   = res.apiResponse?.message ?? 'Badge created successfully';
      if (badge) setBadges(prev => [...prev, badge]);
      addToast(msg, 'success');
      return true;
    } catch (e) { addToast(String(e), 'error'); return false; }
    finally { setSaving(false); }
  }, [mentorshipId, addToast]);

  const update = useCallback(async (badgeId: number, data: Partial<CreateBadgeInput>): Promise<boolean> => {
    setSaving(true);
    try {
      const res     = await updateBadge(badgeId, data);
      const updated = res.apiResponse?.badge;
      const msg     = res.apiResponse?.message ?? 'Badge updated successfully';
      if (updated) setBadges(prev => prev.map(b => b.id === badgeId ? updated : b));
      addToast(msg, 'success');
      return true;
    } catch (e) { addToast(String(e), 'error'); return false; }
    finally { setSaving(false); }
  }, [addToast]);

  const remove = useCallback(async (badgeId: number): Promise<boolean> => {
    setSaving(true);
    try {
      await deleteBadge(badgeId);
      setBadges(prev => prev.filter(b => b.id !== badgeId));
      addToast('Badge deleted successfully', 'success');
      return true;
    } catch (e) {
      // e is already the string from backend e.g. "Badge has already been awarded and cannot be deleted"
      addToast(String(e), 'error');
      return false;
    } finally { setSaving(false); }
  }, [addToast]);

  const award = useCallback(async (badgeId: number, input: AwardInput): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await awardBadge(badgeId, input);
      const msg = res.apiResponse?.message ?? `Badge "${res.apiResponse?.award?.badgeTitle}" awarded successfully!`;
      addToast(msg, 'success');
      return true;
    } catch (e) {
      addToast(String(e), 'error');
      return false;
    } finally { setSaving(false); }
  }, [addToast]);

  return { badges, loading, saving, toasts, fetchBadges, create, update, remove, award, addToast };
};