"use client";

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Question } from '@/types/event';
import { Button } from '@/components/ui/button';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  questions: Question[];
  requireApproval: boolean;
}

export function RsvpModal({ 
  isOpen, 
  onClose, 
  eventTitle, 
  questions,
  requireApproval 
}: RsvpModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const hasQuestions = questions.some(q => q.text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required questions
    const missingRequired = questions.filter(
      q => q.required && q.text && !formData[String(q.id)]?.trim()
    );

    if (missingRequired.length > 0) {
      alert('Please answer all required questions');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({});
      }, 2000);
    }, 1000);
  };

  const handleInputChange = (questionId: number | string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [String(questionId)]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-backdrop-enter"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,128,128,0.4)] max-h-[85vh] overflow-hidden flex flex-col animate-modal-enter">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-start justify-between p-6 md:p-8 border-b border-white/10">
          <div className="flex-1 pr-4">
            <h2 className="font-urbanist text-2xl md:text-3xl font-bold text-white leading-tight">
              {isSuccess ? 'Registration Complete!' : eventTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            // Success State
            <div className="p-8 md:p-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(0,128,128,0.5)]">
                  <CheckCircle size={40} className="text-white" />
                </div>
              </div>
              <h3 className="font-urbanist text-2xl md:text-3xl font-bold text-white mb-3">
                {requireApproval ? 'Pending Approval' : 'You\'re Registered!'}
              </h3>
              <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed">
                {requireApproval 
                  ? 'Your registration is pending host approval. You\'ll receive confirmation soon.'
                  : 'Check your email for event details and updates.'}
              </p>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {requireApproval && (
                <div className="flex items-start gap-3 p-5 rounded-xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/30 mb-6 shadow-[0_0_20px_rgba(238,116,2,0.1)]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                    <CheckCircle size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-secondary font-bold text-sm mb-1">Approval Required</p>
                    <p className="text-white/70 text-sm">Your registration will be reviewed by the host</p>
                  </div>
                </div>
              )}

              {hasQuestions ? (
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <p className="text-white/90 text-sm leading-relaxed">
                      Please answer the following questions to complete your registration:
                    </p>
                  </div>
                  
                  {questions.map((question, index) => (
                    question.text && (
                      <div key={question.id} className="group">
                        <label className="block mb-3">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 border border-primary/30 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(0,128,128,0.3)]">
                              {index + 1}
                            </span>
                            <span className="text-white font-semibold text-base flex-1 pt-0.5">
                              {question.text}
                              {question.required && (
                                <span className="ml-2 text-red-400 text-sm">*</span>
                              )}
                            </span>
                          </div>
                        </label>
                        <textarea
                          value={formData[String(question.id)] || ''}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          required={question.required}
                          rows={3}
                          className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-black/80 transition-all resize-none hover:border-white/20"
                          placeholder="Type your answer here..."
                        />
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <CheckCircle size={32} className="text-primary" />
                  </div>
                  <p className="text-white/90 text-base font-medium">
                    Confirm your registration for this event?
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base rounded-xl transition-all hover:scale-[1.02] active:scale-95 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:flex-1 text-base font-bold py-3.5 shadow-[0_0_30px_rgba(0,128,128,0.4)] hover:shadow-[0_0_40px_rgba(0,128,128,0.6)] disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    hasQuestions ? 'Submit Registration' : 'Confirm RSVP'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
