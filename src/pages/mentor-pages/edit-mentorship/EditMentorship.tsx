import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashLayout from '../../../components/layout/Dash-layout';
import {
  getMentorshipDetail,
  updateMentorship,
  changeMentorshipCoverImage,
  type MentorshipApiResponse,
} from '../../../services/mentorDashboardService';
import { useAuthStore } from '../../../store/authStore';
import type { MentorshipFormData } from './types';
import EditMentorshipForm from './components/EditMentorshipForm';

const EditMentorship: FC = () => {
  const params = useParams<{ mentorshipId?: string; id?: string }>();
  const mentorshipId = params.mentorshipId ?? params.id;
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [formData, setFormData] = useState<MentorshipFormData>({
    title: '',
    description: '',
    category: '',
    difficultyLevel: 'ALL_LEVEL',
    price: 0,
    whatWillLearn: [],
    tags: [],
    duration: 0,
    coverImageUrl: undefined,
    coverImageFile: null,
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
          title: (mentorship.title && mentorship.title !== 'string') ? mentorship.title : '',
          description: (mentorship.description && mentorship.description !== 'string') ? mentorship.description : '',
          category: (mentorship.category && mentorship.category !== 'string') ? mentorship.category : '',
          difficultyLevel: (mentorship.difficultyLevel as string) ?? 'ALL_LEVEL',
          price: Number(mentorship.price ?? 0),
          whatWillLearn: Array.isArray(mentorship.whatWillLearn) ? mentorship.whatWillLearn.filter((item) => item !== 'string') : [],
          tags: Array.isArray(mentorship.tags) ? mentorship.tags.filter((item) => item !== 'string') : [],
          duration: Number(mentorship.duration ?? 0),
          coverImageUrl: (mentorship.Image_URL as string) || (mentorship.imageUrl as string) || (mentorship.coverImage as string) || undefined,
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
    setFormData((prev) => {
      if (name === 'price' || name === 'duration') {
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddArrayItem = (arrayName: 'whatWillLearn' | 'tags', value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], value.trim()],
    }));
  };

  const handleRemoveArrayItem = (arrayName: 'whatWillLearn' | 'tags', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      coverImageFile: file,
      // Create a temporary URL to preview the newly selected image
      ...(file ? { coverImageUrl: URL.createObjectURL(file) } : {})
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
        category: formData.category,
        difficultyLevel: formData.difficultyLevel as MentorshipApiResponse['difficultyLevel'],
        price: formData.price,
        whatWillLearn: formData.whatWillLearn,
        tags: formData.tags,
        duration: formData.duration,
      };

      await updateMentorship(mentorshipId, payload);

      if (formData.coverImageFile) {
        await changeMentorshipCoverImage(mentorshipId, formData.coverImageFile);
      }

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-50">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading mentorship details...</p>
          </div>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout pageTitle="Edit Mentorship">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-50">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout pageTitle="Edit Mentorship">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* <EditMentorshipHeader /> */}
          <EditMentorshipForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleAddArrayItem={handleAddArrayItem}
            handleRemoveArrayItem={handleRemoveArrayItem}
            handleImageChange={handleImageChange}
            handleSubmit={handleSubmit}
            submitting={submitting}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashLayout>
  );
};

export default EditMentorship;



