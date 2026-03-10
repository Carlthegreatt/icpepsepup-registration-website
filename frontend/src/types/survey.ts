export type SurveyQuestionType =
  | "text"
  | "rating"
  | "yes_no"
  | "multiple_choice";

export interface SurveyQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType;
  required: boolean;
  options?: string[]; // For multiple_choice questions
}

export interface SurveyConfig {
  isEnabled: boolean;
  title?: string; // Optional custom title for the survey
  description?: string; // Optional instructions
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  id: string;
  eventId: string;
  userId: string; // Replaces attendeeEmail
  answers: Record<string, string | number | boolean>; // Key is questionId, value is the answer
  createdAt: string;
}
