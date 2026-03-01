export type LevelValue = 'ALL_LEVEL' | 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
export type EntryPeriod = 'LIFETIME' | 'LIMITED';

export interface MentorshipFormData {
    title: string;
    description: string;
    level: LevelValue;
    category: string;
    price: number;
    whatWillLearn: string[];
    includes: string[];
    tags: string[];
    entryPeriod: EntryPeriod;
    duration: number; // number of months when LIMITED
}
