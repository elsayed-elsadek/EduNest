import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MentorProfile } from '../../../../../services/student-roleService/mentorProfile.api';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('../../../../../config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../config/env')>();
  return {
    ...actual,
    getAssetUrl: (path: string | null | undefined) => path ?? undefined,
  };
});

import ProfileHeader from '../ProfileHeader';
import ContactSidebar from '../ContactSidebar';

const ROUTE_EMAIL = 'mentor@example.com';

const profile = {
  mentorEmail: '',
  mentorFirstName: 'Test',
  mentorLastName: 'Mentor',
  mentorProfileImageUrl: null,
  yearsOfExperience: 5,
  totalLearners: 1,
  totalReviews: 0,
  avgReviewRate: null,
  bio: 'Test bio',
  socialMediaLinks: [],
} as unknown as MentorProfile;

beforeEach(() => {
  navigateMock.mockClear();
});

describe('mentor profile route email fallback', () => {
  it('uses the route email when the profile response omits it', () => {
    render(
      <ProfileHeader
        mentorProfile={profile}
        fullName="Test Mentor"
        isLoading={false}
        routeEmail={ROUTE_EMAIL}
      />
    );
    render(<ContactSidebar mentorProfile={profile} routeEmail={ROUTE_EMAIL} />);

    expect(screen.getByText(ROUTE_EMAIL)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /chat/i }));
    expect(navigateMock).toHaveBeenCalledWith('/student/messages', {
      state: {
        openDirectChatWith: {
          email: ROUTE_EMAIL,
          name: 'Test Mentor',
          avatar: undefined,
        },
      },
    });
  });
});
