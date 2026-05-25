# TODO: ScheduledSessions UI updates

- [x] Update `ScheduledSessions.types.ts` to match API fields: `mentorshipTitle` and `sessionStartDate`.
- [x] Update `ScheduledSessionCard.tsx` to display:
  - `mentorshipTitle`
  - formatted `sessionStartDate` (clear date/time)
  - remove reliance on `startTime/endTime` for this UI.
- [ ] Update `ScheduledSessions.tsx` only if needed for type compatibility.
- [ ] Run TypeScript build/lint to ensure no errors.
