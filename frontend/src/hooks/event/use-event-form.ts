import { useState, useCallback } from 'react';
import { EventFormData, Question, QuestionFieldValue } from '@/types/event';

interface UseEventFormReturn {
  formData: EventFormData;
  updateField: <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => void;
  addQuestion: () => void;
  removeQuestion: (id: number | string) => void;
  updateQuestion: (id: number | string, field: keyof Question, value: QuestionFieldValue) => void;
}

const LOCKED_QUESTION_IDS = {
  firstName: "system-first-name",
  middleName: "system-middle-name",
  lastName: "system-last-name",
  suffix: "system-suffix",
} as const;

const DEFAULT_LOCKED_QUESTIONS: Question[] = [
  {
    id: LOCKED_QUESTION_IDS.firstName,
    text: "First Name",
    required: true,
    type: "text",
    locked: true,
  },
  {
    id: LOCKED_QUESTION_IDS.middleName,
    text: "Middle Name",
    required: false,
    type: "text",
    locked: true,
  },
  {
    id: LOCKED_QUESTION_IDS.lastName,
    text: "Last Name",
    required: true,
    type: "text",
    locked: true,
  },
  {
    id: LOCKED_QUESTION_IDS.suffix,
    text: "Suffix",
    required: false,
    type: "text",
    locked: true,
  },
];

const initialFormData: EventFormData = {
  title: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  location: '',
  description: '',
  coverImage: '',
  theme: 'Minimal Dark',
  ticketPrice: 'Free',
  capacity: '',
  requireApproval: false,
  questions: DEFAULT_LOCKED_QUESTIONS.map((question) => ({ ...question })),
};

export function useEventForm(): UseEventFormReturn {
  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  const updateField = useCallback(<K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addQuestion = useCallback(() => {
    setFormData(prev => {
      // Generate sequential ID based on current questions length
      const nextId = prev.questions.length > 0 
        ? Math.max(...prev.questions.map(q => typeof q.id === 'number' ? q.id : parseInt(String(q.id), 10) || 0)) + 1 
        : 1;
      return {
        ...prev,
        questions: [...prev.questions, { id: nextId, text: '', required: false, type: 'text' }],
      };
    });
  }, []);

  const removeQuestion = useCallback((id: number | string) => {
    setFormData(prev => {
      const targetQuestion = prev.questions.find(q => q.id === id);
      if (targetQuestion?.locked) {
        return prev;
      }

      return {
        ...prev,
        questions: prev.questions.filter(q => q.id !== id),
      };
    });
  }, []);

  const updateQuestion = useCallback((
    id: number | string,
    field: keyof Question,
    value: QuestionFieldValue
  ) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id
          ? { ...q, [field]: value }
          : q
      ),
    }));
  }, []);

  return {
    formData,
    updateField,
    addQuestion,
    removeQuestion,
    updateQuestion,
  };
}
