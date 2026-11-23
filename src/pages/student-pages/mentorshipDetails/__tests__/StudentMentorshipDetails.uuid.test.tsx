import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const { detailsMock, overviewMock, heroMock } = vi.hoisted(() => ({
  detailsMock: vi.fn(),
  overviewMock: vi.fn(),
  heroMock: vi.fn(),
}));

vi.mock('../../../../services/student-roleService/mentorshipDetails.api', () => ({
  useMentorshipDetails: detailsMock,
  useMentorshipOverview: overviewMock,
}));
vi.mock('../components/HeroSection', () => ({ default: (props: { mentorshipId?: string }) => {
  heroMock(props.mentorshipId);
  return <div>mentorship hero</div>;
} }));
vi.mock('../components/MentorshipTabsNav', () => ({ default: () => <div>tabs</div> }));
vi.mock('../ProgressSection', () => ({ default: () => null }));
vi.mock('../UpcomingItemsSection', () => ({ default: () => null }));
vi.mock('../../../../components/student-components/common/Navbar/Navbar', () => ({ default: () => null }));
vi.mock('../../../../components/student-components/common/Footer/Footer', () => ({ default: () => null }));

import StudentMentorshipDetails from '../StudentMentorshipDetails';

const mentorshipId = '4e94db37-c724-4beb-a7a5-4136aa64b7d9';

describe('StudentMentorshipDetails UUID route parameter', () => {
  afterEach(() => cleanup());

  it('passes the UUID route parameter unchanged to detail and overview hooks', () => {
    detailsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    overviewMock.mockReturnValue({ data: undefined });

    render(
      <MemoryRouter initialEntries={[`/mentorships/${mentorshipId}`]}>
        <Routes>
          <Route path="/mentorships/:mentorshipId" element={<StudentMentorshipDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(detailsMock).toHaveBeenCalledWith(mentorshipId, true);
    expect(overviewMock).toHaveBeenCalledWith(mentorshipId, 0, 5, true);
    expect(heroMock).toHaveBeenCalledWith(mentorshipId);
    expect(screen.getByText('mentorship hero')).toBeInTheDocument();
  });
});
