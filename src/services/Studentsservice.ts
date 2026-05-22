
import api, { API_BASE_URL } from './api';

const BASE = 'api/v1/dashboard';

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

//Types

export interface Student {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  activeMentorships: number;
  completedMentorships: number;
  [key: string]: unknown;
}

export interface StudentsPage {
  content: Student[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

//  API call

/** GET /api/v1/dashboard/students?page=&size= */
export const getMentorStudents = (page = 0, size = 6) =>
  handleRequest(api.get(`${BASE}/students`, { params: { page, size } }));

//  Extractors


export const extractStudentsData = (response: unknown): StudentsPage => {
  const empty: StudentsPage = { content: [], page: 0, size: 6, totalElements: 0, totalPages: 0 };

  if (!response || typeof response !== 'object') return empty;

  const res = response as Record<string, unknown>;

  //  { apiResponse: { students: { content: [] } } }
  if (res.apiResponse && typeof res.apiResponse === 'object') {
    const apiRes = res.apiResponse as Record<string, unknown>;
    if (apiRes.students && typeof apiRes.students === 'object') {
      return mapStudentsPage(apiRes.students as Record<string, unknown>);
    }
  }

  //  { students: { content: [] } }
  if (res.students && typeof res.students === 'object') {
    return mapStudentsPage(res.students as Record<string, unknown>);
  }

  // بديل: { content: [] }
  if (Array.isArray(res.content)) {
    return mapStudentsPage(res);
  }

  // بديل: مصفوفة مباشرة
  if (Array.isArray(response)) {
    return {
      content: mapStudentsList(response as Record<string, unknown>[]),
      page: 0,
      size: (response as unknown[]).length,
      totalElements: (response as unknown[]).length,
      totalPages: 1,
    };
  }

  return empty;
};

function mapStudentsPage(raw: Record<string, unknown>): StudentsPage {
  const content = Array.isArray(raw.content)
    ? mapStudentsList(raw.content as Record<string, unknown>[])
    : [];

  return {
    content,
    page: Number(raw.page ?? 0),
    size: Number(raw.size ?? 6),
    totalElements: Number(raw.totalElements ?? content.length),
    totalPages: Number(raw.totalPages ?? 1),
  };
}

function mapStudentsList(arr: Record<string, unknown>[]): Student[] {
  return arr.map((item) => {
    // ✅ دعم firstName + lastName (الشكل الفعلي من الـ API)
    const firstName = String(item.firstName ?? '');
    const lastName  = String(item.lastName  ?? '');
    const name = [firstName, lastName].filter(Boolean).join(' ')
      || String(item.name ?? item.studentName ?? item.fullName ?? 'Unknown');

    //  studentId
    const id = String(item.studentId ?? item.id ?? '');

    //  activeMentorshipCount و completedMentorshipCount
    const activeMentorships = Number(
      item.activeMentorshipCount ?? item.activeMentorships ?? item.active ?? 0
    );
    const completedMentorships = Number(
      item.completedMentorshipCount ?? item.completedMentorships ?? item.completed ?? 0
    );

    const email  = String(item.email ?? item.studentEmail ?? '');
    // Support multiple possible image fields and resolve to absolute URL
    const rawAvatar = item.profileImageUrl ?? item.profileImage ?? item.profileImagePath ?? item.avatar ?? item.profileImageUrl;
    let avatar: string | undefined = undefined;
    if (rawAvatar) {
      const raw = String(rawAvatar);
      try {
        // new URL handles absolute and relative paths; base API URL ensures correct origin
        avatar = new URL(raw, API_BASE_URL).toString();
      } catch {
        avatar = raw;
      }
    }

    return { id, name, email, avatar, activeMentorships, completedMentorships };
  });
}