"use client";

import React from 'react';
import { X, Plus, HelpCircle, Trash2, ChevronDown, FileUp, List, Type } from 'lucide-react';
import { Question, QuestionType, QuestionFieldValue } from '@/types/event';
import { Button } from '@/components/ui/button';

interface RegistrationQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  addQuestion: () => void;
  removeQuestion: (id: number | string) => void;
  updateQuestion: (id: number | string, field: keyof Question, value: QuestionFieldValue) => void;
}

export function RegistrationQuestionsModal({ 
  isOpen, 
  onClose, 
  questions,
  addQuestion,
  removeQuestion,
  updateQuestion
}: RegistrationQuestionsModalProps) {
  if (!isOpen) return null;

  const questionTypes: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
    { value: 'text', label: 'Text Input', icon: <Type className="w-4 h-4" /> },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: <List className="w-4 h-4" /> },
    { value: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" /> },
    { value: 'file_upload', label: 'File Upload', icon: <FileUp className="w-4 h-4" /> },
  ];

  const validationPatterns = [
    { value: '', label: 'No Validation', pattern: '', message: '', example: '' },
    { value: 'email', label: 'Email', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Please enter a valid email address', example: 'example@email.com' },
    { value: 'phone', label: 'Phone Number', pattern: '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$', message: 'Please enter a valid phone number', example: '(123) 456-7890' },
    { value: 'url', label: 'URL', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$', message: 'Please enter a valid URL', example: 'https://example.com' },
    { value: 'numbers', label: 'Numbers Only', pattern: '^[0-9]+$', message: 'Please enter numbers only', example: '12345' },
    { value: 'letters', label: 'Letters Only', pattern: '^[a-zA-Z\\s]+$', message: 'Please enter letters only', example: 'John Doe' },
    { value: 'alphanumeric', label: 'Alphanumeric', pattern: '^[a-zA-Z0-9]+$', message: 'Please enter letters and numbers only', example: 'ABC123' },
  ];

  const addOption = (questionId: number | string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const currentOptions = question.options || [];
      updateQuestion(questionId, 'options', [...currentOptions, '']);
    }
  };

  const updateOption = (questionId: number | string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, 'options', newOptions);
    }
  };

  const removeOption = (questionId: number | string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, 'options', newOptions);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-backdrop-enter"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-modal-enter">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-start justify-between p-4 sm:p-6 md:p-8 border-b border-white/10">
          <div className="flex-1 pr-3 sm:pr-4">
            <h2 className="font-urbanist text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-1.5 sm:mb-2">
              Registration Questions
            </h2>
            <p className="text-white/60 text-xs sm:text-sm">
              Add custom questions to collect information from attendees during registration
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8">
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/50 text-sm mb-6">No questions added yet</p>
                <Button
                  onClick={addQuestion}
                  variant="primary"
                  size="md"
                  className="mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <>
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-all group">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 border border-primary/30 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(0,128,128,0.3)] mt-1">
                        {index + 1}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Type your question here..."
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        className="bg-transparent border-none outline-none text-base focus:ring-0 flex-1 p-0 placeholder-white/30 text-white leading-relaxed"
                      />
                      <select
                        value={question.type || 'text'}
                        onChange={(e) => {
                          updateQuestion(question.id, 'type', e.target.value as QuestionType);
                          // Initialize options array for choice types
                          if ((e.target.value === 'multiple_choice' || e.target.value === 'dropdown') && !question.options) {
                            updateQuestion(question.id, 'options', ['Option 1', 'Option 2']);
                          }
                          // Set PDF as the only allowed file type for file upload
                          if (e.target.value === 'file_upload') {
                            updateQuestion(question.id, 'allowedFileTypes', ['.pdf']);
                          }
                        }}
                        className="flex-shrink-0 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                      >
                        {questionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="flex-shrink-0 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    
                    {/* Required Checkbox */}
                    <div className="flex items-center gap-2 pl-11 mb-3">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                        className="w-4 h-4 rounded bg-white/5 border-white/20 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      />
                      <label 
                        htmlFor={`required-${question.id}`}
                        className="text-xs text-white/50 uppercase tracking-wider font-medium cursor-pointer select-none"
                      >
                        Required
                      </label>
                    </div>

                    {/* Validation Pattern for Text Input */}
                    {question.type === 'text' && (
                      <div className="pl-11 mb-3 space-y-2">
                        <div className="text-xs text-white/50 uppercase tracking-wider font-medium mb-2">
                          Input Validation (Optional)
                        </div>
                        <select
                          value={validationPatterns.find(p => p.pattern === question.validationPattern)?.value || ''}
                          onChange={(e) => {
                            const selected = validationPatterns.find(p => p.value === e.target.value);
                            if (selected) {
                              updateQuestion(question.id, 'validationPattern', selected.pattern);
                              updateQuestion(question.id, 'validationMessage', selected.message);
                            }
                          }}
                          className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                        >
                          {validationPatterns.map((pattern) => (
                            <option key={pattern.value} value={pattern.value}>
                              {pattern.label}
                            </option>
                          ))}
                        </select>
                        {question.validationPattern && (
                          <div className="text-xs text-white/40 italic">
                            Example: {validationPatterns.find(p => p.pattern === question.validationPattern)?.example}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options Editor for Multiple Choice and Dropdown */}
                    {(question.type === 'multiple_choice' || question.type === 'dropdown') && (
                      <div className="pl-11 mt-3 space-y-2">
                        <div className="text-xs text-white/50 uppercase tracking-wider font-medium mb-2">
                          Options
                        </div>
                        {(question.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs">
                              {optionIndex + 1}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="flex-shrink-0 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              disabled={(question.options?.length || 0) <= 2}
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 text-white/60 hover:text-primary text-xs font-medium transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Add Option
                        </button>
                      </div>
                    )}

                    {/* File Upload Info */}
                    {question.type === 'file_upload' && (
                      <div className="pl-11 mt-3">
                        <div className="text-xs text-white/40 italic">
                          Only PDF files will be accepted
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-black/40 backdrop-blur-md border border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 text-white/60 hover:text-primary text-sm font-bold uppercase tracking-wide transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Question
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-6 md:p-8 border-t border-white/10 bg-black/20">
          <Button 
            onClick={onClose}
            fullWidth
            size="lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
