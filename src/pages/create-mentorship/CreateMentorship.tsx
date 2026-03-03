import type { FC } from 'react';
import DashLayout from '../../components/layout/Dash-layout';
import { useMentorshipForm } from './hooks/useMentorshipForm';
import { MentorshipHeader } from './components/MentorshipHeader';
import { BasicInfoFields } from './components/BasicInfoFields';
import { DynamicListInput } from './components/DynamicListInput';
import { TagsInput } from './components/TagsInput';
import { EntryPeriodFields } from './components/EntryPeriodFields';

const CreateMentorship: FC = () => {
  const {
    formData,
    handleBasicChange,
    setFieldValue,
    submitting,
    fieldErrors,
    handleSubmit,
    navigate,
  } = useMentorshipForm();

  return (
    <DashLayout pageTitle="My Mentorships / Create New">
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4 pb-8 sm:pb-10">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
          <MentorshipHeader onBack={() => navigate(-1)} />

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 space-y-6 sm:space-y-8"
          >
            <BasicInfoFields
              formData={formData}
              onChange={handleBasicChange}
              setFieldValue={setFieldValue}
              fieldErrors={fieldErrors}
            />

            <DynamicListInput
              title="WHAT STUDENTS WILL LEARN"
              items={formData.whatWillLearn}
              onChange={(items) => setFieldValue('whatWillLearn', items)}
              placeholder="How to create X, master Y..."
              error={fieldErrors.whatWillLearn}
              colorScheme="blue"
            />

            <DynamicListInput
              title="MENTORSHIP INCLUDES"
              items={formData.includes}
              onChange={(items) => setFieldValue('includes', items)}
              placeholder="e.g. Certificate, Projects, Live sessions..."
              colorScheme="emerald"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-6">
              <TagsInput
                tags={formData.tags}
                onChange={(tags) => setFieldValue('tags', tags)}
                error={fieldErrors.tags}
              />

              <EntryPeriodFields
                formData={formData}
                onChange={handleBasicChange}
                setFieldValue={setFieldValue}
                fieldErrors={fieldErrors}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/mentor/mentorships')}
                className="w-full sm:w-auto min-h-[44px] sm:h-11 px-6 py-2.5 rounded-xl sm:rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-[0.98] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-h-[44px] sm:h-11 px-8 py-2.5 rounded-xl sm:rounded-2xl bg-primary text-white text-sm font-semibold shadow-md hover:bg-[var(--primary-dark)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashLayout>
  );
};

export default CreateMentorship;



