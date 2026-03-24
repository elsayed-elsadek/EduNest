export type LevelValue = 'ALL_LEVEL' | 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export interface MentorshipFormData {
    title: string;
    subtitle: string;
    description: string;
    level: LevelValue;
    category: string;
    price: number;
    whatWillLearn: string[];
    includes: string[];
    tags: string[];
    duration: number; // number of months
}
