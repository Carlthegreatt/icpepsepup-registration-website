'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationLayout } from './RegistrationLayout';
import { Step0 } from './Step0';
import { StepContinueWithEmail } from './StepContinueWithEmail';
import { LastStep } from './LastStep';
import { StepDynamic } from './StepDynamic';
import { INITIAL_DATA, RegistrationFormData } from './types';
import { Question } from '@/types/event';
import { createClient } from '@/lib/supabase/client';
import { createRegistrantAction } from '@/actions/registrantActions';
import { uploadRegistrationFile } from '@/lib/storage/file-upload';

export interface RegistrationFlowProps {
  eventSlug?: string;
  formQuestions?: Question[];
}

export function RegistrationFlow({
  eventSlug,
  formQuestions = []
}: RegistrationFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_DATA);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get logged-in user on mount and subscribe to auth changes (so already-logged-in users never see "Continue with email")
  useEffect(() => {
    const supabase = createClient();

    const syncUser = (user: { id: string } | null) => {
      setUserId(user?.id ?? null);
    };

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      syncUser(user);
      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEmailAuthSuccess = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  // Group questions into chunks of 3
  const questionSteps = useMemo(() => {
    const steps: Question[][] = [];
    for (let i = 0; i < formQuestions.length; i += 3) {
      steps.push(formQuestions.slice(i, i + 3));
    }
    return steps;
  }, [formQuestions]);

  // Calculate total steps: Step0 + Dynamic Question Steps + LastStep
  const totalSteps = 1 + questionSteps.length + 1;
  const maxStepIndex = totalSteps - 1;

  const updateData = (data: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, maxStepIndex));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!userId) {
      alert('You must be logged in to register');
      return;
    }

    const formAnswers: Record<string, string> = {};
    const supabase = createClient();
    
    if (formQuestions.length > 0) {
      // Upload files and build form answers
      for (let index = 0; index < formQuestions.length; index++) {
        const question = formQuestions[index];
        const answer = formData.dynamicAnswers[question.id.toString()];
        
        if (answer) {
          // If it's a File object, upload it first
          if (answer instanceof File) {
            try {
              const fileUrl = await uploadRegistrationFile(supabase, answer, eventSlug || '');
              formAnswers[question.text] = fileUrl;
            } catch (error) {
              console.error('File upload error:', error);
              alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
              throw error;
            }
          } else {
            // Regular string answer
            formAnswers[question.text] = answer;
          }
        }
      }
    }

    // Prepare data for registrants table
    const registrantData = {
      event_id: eventSlug,
      user_id: userId,
      terms_approval: formData.agreedToPrivacy,
      form_answers: formAnswers,
    };

    try {
      // Call server action
      const result = await createRegistrantAction(registrantData as any);

      if (!result.success) {
        alert(`Registration failed: ${result.error}`);
        throw new Error(result.error);
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during registration. Please try again.";
      alert(errorMessage);
      throw error; 
    }
  };

  if (isLoading) {
    return (
      <RegistrationLayout 
        currentStep={0}
        totalSteps={totalSteps}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-[rgba(197,213,213,0.8)] text-sm">Loading...</p>
        </div>
      </RegistrationLayout>
    );
  }

  // Only show "Continue with email" when user is not logged in; if already logged in, userId is set and we skip this
  if (!userId) {
    return (
      <RegistrationLayout 
        currentStep={0}
        totalSteps={totalSteps}
      >
        <StepContinueWithEmail 
          eventSlug={eventSlug ?? ''} 
          onSuccess={handleEmailAuthSuccess} 
        />
      </RegistrationLayout>
    );
  }

  if (isSuccess) {
     return (
        <RegistrationLayout 
            currentStep={maxStepIndex}
            totalSteps={totalSteps}
        >
            <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[rgba(93,216,216,0.15)] rounded-full flex items-center justify-center mb-6 border border-[#5da5a5]">
                    <div className="w-16 h-16 bg-[#5dd8d8] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(93,216,216,0.5)]">
                         <svg className="w-8 h-8 text-[#f5f5f5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight mb-2">Registration successful!</h2>
                <p className="text-[rgba(197,213,213,0.9)] max-w-sm mb-6 text-sm">
                    Your spot has been secured.
                </p>
                <button
                    type="button"
                    onClick={() => { 
                      router.refresh();
                      router.push(eventSlug ? `/event/${eventSlug}?refresh=${Date.now()}` : "/");
                    }}
                    className="px-6 py-3 bg-[rgba(35,60,60,0.6)] hover:bg-[rgba(35,60,60,0.7)] text-[#95b5b5] font-semibold rounded-xl transition-all duration-200 text-sm"
                >
                    {eventSlug ? "Go Back to Event Page" : "Go to Home"}
                </button>
            </div>
        </RegistrationLayout>
     )
  }

  return (
    <RegistrationLayout 
        currentStep={currentStep}
        totalSteps={totalSteps}
    >
      {currentStep === 0 && (
        <Step0 
            onNext={nextStep} 
        />
      )}
      
      {/* Dynamic question steps */}
      {questionSteps.map((questions, index) => {
        const stepIndex = 1 + index;
        return currentStep === stepIndex && (
          <StepDynamic
            key={stepIndex}
            questions={questions}
            formData={formData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            eventSlug={eventSlug || ''}
          />
        );
      })}
      
      {/* Final confirmation step */}
      {currentStep === maxStepIndex && (
        <LastStep 
            eventSlug={eventSlug}
            onSubmit={handleSubmit}
        />
      )}
    </RegistrationLayout>
  );
}
