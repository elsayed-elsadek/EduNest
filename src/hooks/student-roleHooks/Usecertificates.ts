import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { getCertificates } from '../../services/student-roleService/Mylearningservice';
import type { CertificateApi, Certificate } from '../../types/student-role-types/Certificate.types';

// mapper
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

function generateCredentialId(title: string, rank: number, iso: string): string {
  const year  = new Date(iso).getFullYear();
  const abbr  = title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const padded = String(rank).padStart(5, '0');
  return `EN-${abbr}-${year}-${padded}`;
}

function mapCertificate(c: CertificateApi, idx: number): Certificate {
  return {
    id:                 String(idx),
    studentFullName:    c.studentFullName,
    mentorFullName:     c.mentorFullName,
    mentorshipTitle:    c.mentorshipTitle,
    mentorshipSubtitle: c.mentorshipSubtitle ?? '',
    issuedAt:           formatDate(c.issuedAt),
    rank:               c.rank,
    credentialId:       generateCredentialId(c.mentorshipTitle, c.rank, c.issuedAt),
  };
}

// query key 
export const CERT_KEY = (email: string, page: number, size: number) =>
  ['certificates', email, page, size] as const;

// hook
export const useCertificates = (page = 0, size = 10) => {
  const userEmail = useAuthStore(s => s.userEmail) ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey:  CERT_KEY(userEmail, page, size),
    queryFn:   () => getCertificates(page, size),
    staleTime: 10 * 60 * 1000,   // 10 min — certificates rarely change
    gcTime:    30 * 60 * 1000,
    enabled:   !!userEmail,
    select: (res) => {
      const d = res.apiResponse.data;
      return {
        certificates: d.content.map(mapCertificate),
        totalPages:   d.totalPages,
        totalElements: d.totalElements,
      };
    },
  });

  return {
    certificates:  data?.certificates  ?? [],
    totalPages:    data?.totalPages    ?? 1,
    totalElements: data?.totalElements ?? 0,
    loading:       isLoading,
    isError,
  };
};