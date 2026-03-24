import type { TaskSubmissionItem } from '../../../../services/mentorshipsContent/task';

export interface GradeModalProps {
    submission: TaskSubmissionItem;
    maxPoints: number;
    onClose: () => void;
    onGraded: () => void;
}

