import { useState, useCallback } from 'react';
import { EventFormData, Question, QuestionFieldValue } from '@/types/event';

interface UseEventFormReturn {
  formData: EventFormData;
  updateField: <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => void;
  addQuestion: () => void;
  removeQuestion: (id: number | string) => void;
  updateQuestion: (id: number | string, field: keyof Question, value: QuestionFieldValue) => void;
}

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
  questions: [],
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
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
  }, []);

  const updateQuestion = useCallback((
    id: number | string,
    field: keyof Question,
    value: QuestionFieldValue
  ) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
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
