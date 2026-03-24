export interface MentorshipFormData {
    title: string;
    description: string;
    category: string;
    difficultyLevel: string;
    price: number;
    whatWillLearn: string[];
    tags: string[];
    duration: number;
    coverImageUrl?: string;
    coverImageFile?: File | null;
}
