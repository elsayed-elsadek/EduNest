import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock('../../api', () => ({ default: { get: getMock } }));

import {
  fetchMentorshipDetails,
  fetchMentorshipOverview,
} from '../mentorshipDetails.api';

const mentorshipId = '4e94db37-c724-4beb-a7a5-4136aa64b7d9';
const relatedMentorshipId = '26a24c4a-f2f5-4cb1-92af-111ac540ddc2';

describe('mentorship UUID flow', () => {
  beforeEach(() => getMock.mockReset());

  it('preserves UUIDs in detail and related mentorship response mappers', async () => {
    getMock.mockResolvedValue({
      data: {
        apiResponse: {
          mentorship: {
            beforeEnroll: {
              id: mentorshipId,
              topMentorMentorships: [{ id: relatedMentorshipId }],
            },
          },
        },
      },
    });

    const details = await fetchMentorshipDetails(mentorshipId);

    expect(details.id).toBe(mentorshipId);
    expect(details.topMentorMentorships[0].id).toBe(relatedMentorshipId);
  });

  it('uses the UUID unchanged in the overview request URL', async () => {
    getMock.mockResolvedValue({
      data: { apiResponse: { mentorship: { beforeEnroll: null, afterEnroll: null } } },
    });

    await fetchMentorshipOverview(mentorshipId);

    expect(getMock).toHaveBeenCalledWith(
      `/api/v1/student/mentorships/${mentorshipId}/overview`,
      {
        params: { topMentorshipsLimit: 3, UpcomingPage: 0, UpcomingSize: 5 },
        signal: undefined,
      },
    );
  });
});
