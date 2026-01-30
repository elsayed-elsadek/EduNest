

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  experience: string;
  avatar?: string;
  bio?: string;
  links?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
}