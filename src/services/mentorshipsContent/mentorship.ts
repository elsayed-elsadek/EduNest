import api from '../api';
import { handleRequest } from './utils';

export type MentorshipStatus = 'ACTIVE' | 'DRAFT';

export interface UpdateMentorshipStatusPayload {
    status: MentorshipStatus;
}

export interface UpdateMentorshipStatusResponse {
    apiResponse: {
        status: string;
    };
}

/**
 * Update mentorship status (ACTIVE or DRAFT)
 * Uses the endpoint: POST /api/v1/mentorship/update-status/{id}
 */
export const updateMentorshipStatus = async (
    mentorshipId: number,
    status: MentorshipStatus
): Promise<UpdateMentorshipStatusResponse> => {
    const body: UpdateMentorshipStatusPayload = { status };
    
    const raw = await handleRequest(
        api.post<UpdateMentorshipStatusResponse>(`api/v1/mentorship/update-status/${mentorshipId}`, body)
    );
    
    return raw;
};

