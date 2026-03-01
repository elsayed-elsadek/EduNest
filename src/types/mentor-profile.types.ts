
export interface MentorProfileApiData {
  firstName:       string;
  lastName:        string;
  fullName:        string;
  email:           string;
  jobTitle:        string | null;
  bio:             string | null;
  yearsOfExperience: number;
  linkedInLink:    string | null;
  githubLink:      string | null;
  profileImageUrl: string | null;
}

//  Update Request Body 
export interface UpdateMentorProfileRequest {
  firstName:         string;
  lastName:          string;
  email:             string;
  bio:               string;
  jobTitle:          string;
  yearsOfExperience: number;
  linkedInLink:      string;
  githubLink:        string;
}

export interface UserProfile {
  id:         string;
  firstName:  string;
  lastName:   string;
  email:      string;
  title:      string;       
  experience: string;       
  avatar?:    string;       
  bio?:       string;
  links?: {
    linkedin?: string;
    github?:   string;
  };
}