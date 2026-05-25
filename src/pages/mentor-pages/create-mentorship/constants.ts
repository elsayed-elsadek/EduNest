import type { LevelValue } from './types';

export const levelOptions: { value: LevelValue; label: string }[] = [
    { value: 'ALL_LEVEL', label: 'All level' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'EXPERT', label: 'Expert' },
];

export const categoryOptions = [
    'Programming',
    'Design',
    'Marketing',
    'Business',
    'Data & AI',
    'Personal Development',
];
