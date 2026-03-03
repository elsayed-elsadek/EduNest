import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashLayout from '../../components/layout/Dash-layout';
import {
  getMentorshipDetail,
  updateMentorship,
  type MentorshipApiResponse,
} from '../../services/mentorDashboardService';
import { useAuthStore } from '../../store/authStore';
import type { MentorshipFormData } from './types';
import EditMentorshipHeader from './components/EditMentorshipHeader';
import EditMentorshipForm from './components/EditMentorshipForm';

const EditMentorship: FC = () => {
  const params = useParams<{ mentorshipId?: string; id?: string }>();
  const mentorshipId = params.mentorshipId ?? params.id;
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [formData, setFormData] = useState<MentorshipFormData>({
    title: '',
    description: '',
    level: 'All Levels',
    price: 0,
    status: 'draft',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!mentorshipId) {
      setError('Mentorship ID not provided');
      setLoading(false);
      return;
    }

    const loadMentorshipDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const mentorship = (await getMentorshipDetail(mentorshipId)) as MentorshipApiResponse | null;

        if (!mentorship) {
          setError('Mentorship not found');
          return;
        }

        setFormData({
          title: mentorship.title ?? '',
          description: mentorship.description ?? '',
          level: (mentorship.difficultyLevel as string) ?? 'ALL_LEVEL',
          price: Number(mentorship.price ?? 0),
          status: (mentorship.status as string) ?? 'draft',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load mentorship';
        setError(message);
        console.error('Error loading mentorship:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMentorshipDetail();
  }, [mentorshipId, token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentorshipId) {
      toast.error('Mentorship ID not provided');
      return;
    }

    try {
      setSubmitting(true);

      const payload: Partial<MentorshipApiResponse> = {
        title: formData.title,
        description: formData.description,
        difficultyLevel: formData.level as MentorshipApiResponse['difficultyLevel'],
        price: formData.price,
        status: formData.status as MentorshipApiResponse['status'],
      };

      await updateMentorship(mentorshipId, payload);

      toast.success('Mentorship updated successfully');
      navigate(`/mentor/mentorships/${mentorshipId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update mentorship';
      toast.error(message);
      console.error('Error updating mentorship:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <DashLayout pageTitle="Edit Mentorship">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout pageTitle="Edit Mentorship">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout pageTitle="Edit Mentorship">
      <div className="max-w-2xl mx-auto p-6">
        <EditMentorshipHeader />
        <EditMentorshipForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          submitting={submitting}
          onCancel={handleCancel}
        />
      </div>
    </DashLayout>
  );
};

export default EditMentorship;



