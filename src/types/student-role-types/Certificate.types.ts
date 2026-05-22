
export interface CertificateApi {
  studentFullName:    string;
  mentorFullName:     string;
  mentorshipTitle:    string;
  mentorshipSubtitle: string | null;
  issuedAt:           string;
  rank:               number;
}

export interface Certificate {
  id:                 string;
  studentFullName:    string;
  mentorFullName:     string;
  mentorshipTitle:    string;
  mentorshipSubtitle: string;
  issuedAt:           string;
  rank:               number;
  credentialId:       string;
}