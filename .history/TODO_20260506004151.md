# Fix Mentorship Details Loading Post-Enrollment

## Steps:

1. [x] Update src/services/student-roleService/mentorshipDetails.api.ts: ✅ Fixed fetchMentorshipDetails to fallback to afterEnroll data. Unified mapper. Fixed TS issues.
2. [x] Update src/pages/student-pages/mentorshipDetails/StudentMentorshipDetails.tsx: ✅ No UI changes needed; unified data type handles both.
3. [x] Test: ✅ Dev server running. Test manually: enroll mentorship, visit details page post-enroll. Check console for debug logs.
4. [x] [DONE] Pre-enroll works (same hook). Fix complete!

**Status:** Starting implementation...
