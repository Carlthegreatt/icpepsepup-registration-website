import { Question } from "@/types/event";
import { RegistrationFormData } from "./types";
import { useState } from "react";

interface StepDynamicProps {
  questions: Question[];
  formData: RegistrationFormData;
  updateData: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  eventSlug: string;
}

export function StepDynamic({ 
  questions, 
  formData, 
  updateData, 
  onNext, 
  onBack,
  eventSlug
}: StepDynamicProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    const errors: Record<string, string> = {};
    
    // Validate required questions and patterns
    questions.forEach(q => {
      const answer = formData.dynamicAnswers[q.id.toString()];
      
      if (q.required && !answer) {
        errors[q.id.toString()] = 'This field is required';
      } else if (answer && typeof answer === 'string' && q.type === 'text' && q.validationPattern) {
        const regex = new RegExp(q.validationPattern);
        if (!regex.test(answer)) {
          errors[q.id.toString()] = q.validationMessage || 'Invalid format';
        }
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    onNext();
  };

  const updateAnswer = (questionId: number | string, value: string | File) => {
    updateData({
      dynamicAnswers: {
        ...formData.dynamicAnswers,
        [questionId.toString()]: value
      }
    });
    // Clear validation error when user types
    if (validationErrors[questionId.toString()]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId.toString()];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full animate-in fade-in duration-500 slide-in-from-right-4">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] tracking-tight mb-2 leading-tight">
              Additional Information
            </h2>
            <p className="text-[rgba(197,213,213,0.8)] mb-6 sm:mb-8 ml-1 text-[11px] sm:text-sm">
              Please provide the following information
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((question) => {
              const questionType = question.type || 'text';
              const error = validationErrors[question.id.toString()];
              
              return (
                <div key={question.id} className="space-y-2">
                  <label className="text-[#9dd5d5] text-[11px] font-medium block">
                    {question.text}
                    {question.required && (
                      <span className="text-[#5dd8d8] ml-1">*</span>
                    )}
                  </label>

                  {/* Text Input */}
                  {questionType === 'text' && (
                    <input
                      type="text"
                      value={(formData.dynamicAnswers[question.id.toString()] as string) || ''}
                      onChange={(e) => updateAnswer(question.id, e.target.value)}
                      required={question.required}
                      placeholder="Type your answer here..."
                      className={`w-full !bg-[rgba(15,30,30,0.9)] border ${error ? 'border-red-500' : 'border-[#5da5a5]'} rounded-xl px-4 py-3 !text-[#d5e5e5] text-sm !placeholder:text-[rgba(197,213,213,0.5)] outline-none transition-all duration-200 focus:border-[#7dc5c5] focus:outline-none`}
                    />
                  )}

                  {/* Multiple Choice */}
                  {questionType === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(15,30,30,0.6)] border border-[#5da5a5]/30 hover:border-[#7dc5c5]/50 cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={(formData.dynamicAnswers[question.id.toString()] as string) === option}
                            onChange={(e) => updateAnswer(question.id, e.target.value)}
                            required={question.required}
                            className="w-4 h-4 text-[#7dc5c5] bg-[rgba(15,30,30,0.9)] border-[#5da5a5] focus:ring-[#7dc5c5] focus:ring-offset-0"
                          />
                          <span className="text-[#d5e5e5] text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Dropdown */}
                  {questionType === 'dropdown' && question.options && (
                    <select
                      value={(formData.dynamicAnswers[question.id.toString()] as string) || ''}
                      onChange={(e) => updateAnswer(question.id, e.target.value)}
                      required={question.required}
                      className={`w-full !bg-[rgba(15,30,30,0.9)] border ${error ? 'border-red-500' : 'border-[#5da5a5]'} rounded-xl px-4 py-3 !text-[#d5e5e5] text-sm outline-none transition-all duration-200 focus:border-[#7dc5c5] focus:outline-none cursor-pointer`}
                    >
                      <option value="" disabled>
                        Select an option...
                      </option>
                      {question.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* File Upload */}
                  {questionType === 'file_upload' && (
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateAnswer(question.id, file);
                          }
                        }}
                        required={question.required && !formData.dynamicAnswers[question.id.toString()]}
                        className="w-full !bg-[rgba(15,30,30,0.9)] border border-[#5da5a5] rounded-xl px-4 py-3 !text-[#d5e5e5] text-sm outline-none transition-all duration-200 focus:border-[#7dc5c5] focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5da5a5]/20 file:text-[#9dd5d5] hover:file:bg-[#5da5a5]/30 file:cursor-pointer"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[rgba(197,213,213,0.6)] text-xs ml-1">
                          Only PDF files accepted
                        </p>
                        {formData.dynamicAnswers[question.id.toString()] instanceof File && (
                          <p className="text-green-400 text-xs ml-1">
                            ✓ {(formData.dynamicAnswers[question.id.toString()] as File).name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Error */}
                  {error && (
                    <p className="text-red-400 text-xs mt-1 ml-1">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 pt-4 border-t border-[rgba(139,197,197,0.15)]">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-[rgba(139,197,197,0.4)] hover:bg-[rgba(20,40,40,0.9)] text-[#95b5b5] font-semibold text-sm transition-all duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3.5 rounded-xl bg-[rgba(35,60,60,0.6)] hover:bg-[rgba(35,60,60,0.7)] text-[#95b5b5] font-semibold text-sm transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
