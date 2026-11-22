import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  post: vi.fn(),
  patch: vi.fn(),
  get: vi.fn(),
}));

vi.mock('../api', () => ({ default: apiMock }));

import { createLiveSession, updateLiveSession } from '../mentorshipsContent/liveSession';
import { updateMentorshipStatus } from '../mentorshipsContent/mentorship';
import { createProject as createMentorshipProject, updateProject as updateMentorshipProject } from '../mentorshipsContent/project';
import { createProject as createProjectService, updateProject as updateProjectService } from '../projectService';
import { getWeeksByMentorship } from '../mentorshipsContent/week';
import { getAllLiveSessionsForMentorship } from '../mentorshipsContent/liveSession';

beforeEach(() => {
  apiMock.post.mockResolvedValue({ data: {} });
  apiMock.patch.mockResolvedValue({ data: {} });
  apiMock.get.mockImplementation((url: string) => Promise.resolve({
    data: url.includes('/liveSession/')
      ? { apiResponse: { 'Sessions fetched successfully': { content: [], currentPage: 0, page: 0, size: 5, totalElements: 0, totalPages: 0 } } }
      : [],
  }));
});

describe('INT-07 request payload contracts', () => {
  it('creates live sessions with scheduledAt and create-only weekId', async () => {
    await createLiveSession({
      title: 'Planning',
      date: '2027-02-03',
      weekId: '7f2c9a10-4d61-4e8b-9a27-91c0d5a6b3e2',
      time: { hour: 9, minute: 5 },
    });

    expect(apiMock.post).toHaveBeenCalledWith('api/v1/liveSession/create', {
      title: 'Planning',
      scheduledAt: '2027-02-03T09:05:00',
      weekId: '7f2c9a10-4d61-4e8b-9a27-91c0d5a6b3e2',
    });
  });

  it('updates live sessions without separate date, time, or weekId properties', async () => {
    await updateLiveSession('session-uuid', {
      title: 'Updated session',
      date: '2027-02-03',
      time: { hour: 9, minute: 5, second: 7 },
    });

    expect(apiMock.patch).toHaveBeenCalledWith('api/v1/liveSession/update/session-uuid', {
      title: 'Updated session',
      scheduledAt: '2027-02-03T09:05:07',
    });
    expect(apiMock.patch.mock.calls[0][1]).not.toHaveProperty('weekId');
  });

  it('uses the dedicated mentorship status POST endpoint and status body', async () => {
    await updateMentorshipStatus('mentorship-uuid', 'DRAFT');

    expect(apiMock.post).toHaveBeenCalledWith(
      'api/v1/mentorship/update-status/mentorship-uuid',
      { status: 'DRAFT' },
    );
    expect(apiMock.patch).not.toHaveBeenCalled();
  });

  it('passes mentorship UUIDs unchanged to week and session lookups', async () => {
    const mentorshipId = '4e94db37-c724-4beb-a7a5-4136aa64b7d9';

    await getWeeksByMentorship(mentorshipId);
    await getAllLiveSessionsForMentorship(mentorshipId, 0, 5);

    expect(apiMock.get).toHaveBeenNthCalledWith(1, `api/v1/week/${mentorshipId}/weeks`);
    expect(apiMock.get).toHaveBeenNthCalledWith(2, 'api/v1/liveSession/mentorship', {
      params: { mentorshipId, page: 0, size: 5 },
    });
  });

  it('keeps project multipart names req and optional file in create/update builders', async () => {
    const file = new File(['brief'], 'brief.pdf', { type: 'application/pdf' });
    const createData = {
      weekId: 12,
      title: 'Project',
      goal: 'Build a useful feature',
      brief: 'A sufficiently detailed project brief.',
      startAt: '2027-02-03 09:00:00',
      endAt: '2027-02-04 09:00:00',
      points: 100,
    };

    await createMentorshipProject(createData, file);
    const [createUrl, createForm] = apiMock.post.mock.calls[0] as [string, FormData];
    expect(createUrl).toBe('api/v1/project');
    expect(Array.from(createForm.keys()).sort()).toEqual(['file', 'req']);
    expect(createForm.get('file')).toBe(file);
    expect(apiMock.post.mock.calls[0]).toHaveLength(2);

    await updateMentorshipProject(12, { title: 'Updated project' });
    const [updateUrl, updateForm] = apiMock.patch.mock.calls[0] as [string, FormData];
    expect(updateUrl).toBe('api/v1/project/12');
    expect(Array.from(updateForm.keys())).toEqual(['req']);
    expect(apiMock.patch.mock.calls[0]).toHaveLength(2);
  });

  it('passes existing project multipart req/file names without forcing Content-Type', async () => {
    const form = new FormData();
    form.append('req', JSON.stringify({ title: 'Project' }));
    form.append('file', new File(['brief'], 'brief.pdf'));

    await createProjectService(form);
    expect(apiMock.post.mock.calls.at(-1)).toEqual(['/api/v1/project', form]);

    await updateProjectService('project-uuid', form);
    expect(apiMock.patch.mock.calls.at(-1)).toEqual(['/api/v1/project/project-uuid', form]);
  });
});
