import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { detailsMock, mutateMock } = vi.hoisted(() => ({
  detailsMock: vi.fn(),
  mutateMock: vi.fn(),
}));

vi.mock('../../../../services/student-roleService/mentorshipDetails.api', () => ({
  useMentorshipDetails: (...args: unknown[]) => detailsMock(...args),
}));

vi.mock('../../../../services/student-roleService/enrollMentorship', () => ({
  useJoinMentorship: () => ({
    mutate: mutateMock,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

vi.mock('../../../../components/student-components/common/Navbar/Navbar', () => ({
  default: () => null,
}));

vi.mock('../../../../components/student-components/common/Footer/Footer', () => ({
  default: () => null,
}));

vi.mock('../../../../components/common/LoadingSpinner', () => ({
  default: () => null,
}));

import EnrollMentorship from '../EnrollMentorship';

const MENTORSHIP_ID = '88bef39c-b25c-4089-af25-49dcaaa18711';

const renderEnrollPage = () =>
  render(
    <MemoryRouter initialEntries={[`/mentorships/${MENTORSHIP_ID}/enroll`]}>
      <Routes>
        <Route path="/mentorships/:mentorshipId/enroll" element={<EnrollMentorship />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
  detailsMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  });
});

describe('EnrollMentorship UUID route', () => {
  it('accepts a UUID route param and enrolls with the unchanged id', () => {
    renderEnrollPage();

    expect(detailsMock).toHaveBeenCalledWith(MENTORSHIP_ID, true);
    expect(screen.queryByText('Invalid mentorship ID')).not.toBeInTheDocument();

    const confirm = screen.getByRole('button', { name: /confirm enrollment/i });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);

    expect(mutateMock).toHaveBeenCalledWith(MENTORSHIP_ID);
  });
});
