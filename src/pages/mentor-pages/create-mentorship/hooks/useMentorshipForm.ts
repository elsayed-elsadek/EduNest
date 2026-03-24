import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { MentorshipFormData } from '../types';
import { createMentorship, ApiValidationError } from '../../../../services/mentorDashboardService';
import { useAuthStore } from '../../../../store/authStore';

export const useMentorshipForm = () => {
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);

    const [formData, setFormData] = useState<MentorshipFormData>({
        title: '',
        subtitle: '',
        description: '',
        level: 'ALL_LEVEL',
        category: '',
        price: 0,
        whatWillLearn: [],
        includes: [],
        tags: [],
        duration: 0,
    });

    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleBasicChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'price' || name === 'duration'
                    ? parseFloat(value) || 0
                    : value,
        }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const setFieldValue = <K extends keyof MentorshipFormData>(field: K, value: MentorshipFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setFieldErrors({});

            const payload = {
                title: formData.title,
                subtitle: formData.subtitle,
                description: formData.description,
                category: formData.category || 'General',
                difficultyLevel: formData.level,
                price: formData.price,
                whatWillLearn: [...formData.whatWillLearn, ...formData.includes],
                tags: formData.tags,
                duration: formData.duration || 0,
            };

            const { mentorship, message } = await createMentorship(payload);

            toast.success(message || 'Mentorship created successfully');

            const newId = mentorship?.id;
            navigate(newId ? `/mentor/mentorships/${newId}` : '/mentor/mentorships');
        } catch (err) {
            if (err instanceof ApiValidationError) {
                setFieldErrors(err.fieldErrors);
                const firstMsg = Object.values(err.fieldErrors)[0];
                toast.error(firstMsg ?? 'Please fix the errors below');
            } else {
                const message = err instanceof Error ? err.message : 'Failed to create mentorship';
                toast.error(message);
            }
            console.error('Error creating mentorship:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        formData,
        handleBasicChange,
        setFieldValue,
        submitting,
        fieldErrors,
        handleSubmit,
        navigate,
    };
};
