import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { MentorshipLeaderboardPayload } from '../../../../../types/student-role-types/mentorshipLeaderboardTypes';

const { useLeaderboardMock } = vi.hoisted(() => ({ useLeaderboardMock: vi.fn() }));
vi.mock('../../../../../services/student-roleService/mentorshipLeaderboard.api', () => ({
  useMentorshipLeaderboard: useLeaderboardMock,
}));

import LeaderBoard from '../LeaderBoard';

const makePayload = (page: number): MentorshipLeaderboardPayload => ({
  leaderboard: {
    content: [
      { studentFullName: 'Alex Lee', totalPoints: 125 },
      { studentFullName: 'Alex Lee', totalPoints: 100 },
    ],
    page,
    size: 2,
    totalElements: 5,
    totalPages: 3,
  },
  totalStudents: 5,
  userRank: page === 1 ? 4 : 1,
});

const renderLeaderboard = () => render(
  <MemoryRouter initialEntries={['/mentorships/42/leaderboard']}>
    <Routes>
      <Route path="/mentorships/:mentorshipId/leaderboard" element={<LeaderBoard />} />
    </Routes>
  </MemoryRouter>,
);

describe('Leaderboard privacy-safe response', () => {
  beforeEach(() => {
    useLeaderboardMock.mockImplementation((_id: number, _enabled: boolean, page: number) => ({
      data: makePayload(page),
      isLoading: false,
    }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders minimal rows with global ranks, only highlights userRank on the displayed page, and uses unique keys', () => {
    renderLeaderboard();

    expect(useLeaderboardMock).toHaveBeenCalledWith(42, true, 0, 10);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1].textContent).toContain('01');
    expect(rows[2].textContent).toContain('02');
    expect(rows[1].className).toContain('bg-[var(--primary-500)]');
    expect(rows[2].className).not.toContain('bg-[var(--primary-500)]');
    // React reports duplicate keys through console.error during development renders.
    // eslint-disable-next-line no-console
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('same key'));
  });

  it('uses page * size + index + 1 and highlights the matching top-level userRank on another page', () => {
    useLeaderboardMock.mockImplementation((_id: number, _enabled: boolean, page: number) => ({
      data: makePayload(page),
      isLoading: false,
    }));
    renderLeaderboard();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(useLeaderboardMock).toHaveBeenLastCalledWith(42, true, 1, 10);
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('03');
    expect(rows[2].textContent).toContain('04');
    expect(rows[1].className).not.toContain('bg-[var(--primary-500)]');
    expect(rows[2].className).toContain('bg-[var(--primary-500)]');
  });

  it('does not highlight a row when userRank belongs to a different page', () => {
    useLeaderboardMock.mockImplementation((_id: number, _enabled: boolean, page: number) => ({
      data: { ...makePayload(page), userRank: 1 },
      isLoading: false,
    }));
    renderLeaderboard();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    const rows = screen.getAllByRole('row');
    expect(rows[1].className).not.toContain('bg-[var(--primary-500)]');
    expect(rows[2].className).not.toContain('bg-[var(--primary-500)]');
  });
});
