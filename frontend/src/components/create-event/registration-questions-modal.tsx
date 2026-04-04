"use client";

import React from "react";
import {
  X,
  Plus,
  HelpCircle,
  Trash2,
  ChevronDown,
  FileUp,
  List,
  Type,
} from "lucide-react";
import { Question, QuestionType, QuestionFieldValue } from "@/types/event";

interface RegistrationQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  addQuestion: () => void;
  removeQuestion: (id: number | string) => void;
  updateQuestion: (
    id: number | string,
    field: keyof Question,
    value: QuestionFieldValue,
  ) => void;
}

export function RegistrationQuestionsModal({
  isOpen,
  onClose,
  questions,
  addQuestion,
  removeQuestion,
  updateQuestion,
}: RegistrationQuestionsModalProps) {
  if (!isOpen) return null;

  const questionTypes: {
    value: QuestionType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "text", label: "Text Input", icon: <Type className="w-4 h-4" /> },
    {
      value: "multiple_choice",
      label: "Multiple Choice",
      icon: <List className="w-4 h-4" />,
    },
    {
      value: "dropdown",
      label: "Dropdown",
      icon: <ChevronDown className="w-4 h-4" />,
    },
    {
      value: "file_upload",
      label: "File Upload",
      icon: <FileUp className="w-4 h-4" />,
    },
  ];

  const validationPatterns = [
    {
      value: "",
      label: "No Validation",
      pattern: "",
      message: "",
      example: "",
    },
    {
      value: "email",
      label: "Email",
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      message: "Please enter a valid email address",
      example: "example@email.com",
    },
    {
      value: "phone",
      label: "Phone Number",
      pattern: "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$",
      message: "Please enter a valid phone number",
      example: "(123) 456-7890",
    },
    {
      value: "url",
      label: "URL",
      pattern:
        "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$",
      message: "Please enter a valid URL",
      example: "https://example.com",
    },
    {
      value: "numbers",
      label: "Numbers Only",
      pattern: "^[0-9]+$",
      message: "Please enter numbers only",
      example: "12345",
    },
    {
      value: "letters",
      label: "Letters Only",
      pattern: "^[a-zA-Z\\s]+$",
      message: "Please enter letters only",
      example: "John Doe",
    },
    {
      value: "alphanumeric",
      label: "Alphanumeric",
      pattern: "^[a-zA-Z0-9]+$",
      message: "Please enter letters and numbers only",
      example: "ABC123",
    },
  ];

  const addOption = (questionId: number | string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const currentOptions = question.options || [];
      updateQuestion(questionId, "options", [...currentOptions, ""]);
    }
  };

  const updateOption = (
    questionId: number | string,
    optionIndex: number,
    value: string,
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, "options", newOptions);
    }
  };

  const removeOption = (questionId: number | string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter(
        (_, index) => index !== optionIndex,
      );
      updateQuestion(questionId, "options", newOptions);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop - Slightly more transparent to emphasize the modal glass blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-lg animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Glass Modal Container */}
      <div className="relative w-full max-w-3xl bg-[rgba(15,15,5,0.7)] backdrop-blur-3xl border border-yellow-500/20 rounded-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 shadow-[0_0_80px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(250,204,21,0.05)]">
        {/* Decorative Inner Glow Layers */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-yellow-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-600/5 blur-[60px] pointer-events-none" />

        {/* Header - Glassy with subtle separator */}
        <div className="relative flex items-start justify-between p-6 sm:p-8 md:p-10 border-b border-yellow-500/10 bg-white/[0.02]">
          <div className="flex-1 pr-4">
            <h2 className="font-morganite text-4xl sm:text-5xl font-bold text-yellow-400 tracking-widest uppercase mb-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">
              Form Schema
            </h2>
            <p className="text-yellow-100/40 text-[10px] sm:text-xs uppercase font-black tracking-[0.2em]">
              Architecting Attendee Data Collection
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center transition-all active:scale-90 group"
          >
            <X
              size={22}
              className="text-yellow-400/50 group-hover:text-yellow-400 transition-colors"
            />
          </button>
        </div>

        {/* Content - Layered Glass Panels */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 md:p-10">
          <div className="space-y-8">
            {questions.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                <div className="w-24 h-24 rounded-full bg-yellow-500/5 border border-yellow-900/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <HelpCircle className="w-12 h-12 text-yellow-900/30" />
                </div>
                <p className="text-yellow-100/30 text-sm font-black uppercase tracking-[0.2em] mb-10">
                  Data Structure Empty
                </p>
                <button
                  onClick={addQuestion}
                  className="mx-auto flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-[#0a0a05] font-black uppercase tracking-[0.3em] text-xs shadow-[0_10px_30px_rgba(250,204,21,0.3)] hover:shadow-[0_15px_40px_rgba(250,204,21,0.5)] transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Initialize Schema
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    (() => {
                      const isLocked = Boolean(question.locked);

                      return (
                    <div
                      key={question.id}
                      className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-white/[0.05] hover:border-yellow-500/20 transition-all duration-500 group relative"
                    >
                      {/* Side Index Accent */}
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-yellow-500/0 rounded-full group-hover:bg-yellow-500/60 transition-colors" />

                      <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 border border-white/20 flex items-center justify-center text-[#0a0a05] text-lg font-black shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                          {index + 1}
                        </div>
                        <div className="flex-1 w-full space-y-5">
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              placeholder="DEFINE DATA POINT TITLE"
                              value={question.text}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "text",
                                  e.target.value,
                                )
                              }
                              className="bg-transparent border-none outline-none text-lg font-bold focus:ring-0 flex-1 p-0 placeholder-yellow-900/20 text-white uppercase tracking-wider"
                            />
                            {isLocked ? (
                              <span className="flex-shrink-0 px-3 py-1 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-[10px] text-yellow-300 uppercase tracking-widest font-black">
                                System Field
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeQuestion(question.id)}
                                className="flex-shrink-0 p-2.5 hover:bg-red-500/10 rounded-xl transition-all group/trash border border-transparent hover:border-red-500/20"
                              >
                                <Trash2 className="w-5 h-5 text-white/10 group-hover/trash:text-red-400" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <div className="relative group/select">
                              <select
                                value={question.type || "text"}
                                onChange={(e) => {
                                  updateQuestion(
                                    question.id,
                                    "type",
                                    e.target.value as QuestionType,
                                  );
                                  if (
                                    (e.target.value === "multiple_choice" ||
                                      e.target.value === "dropdown") &&
                                    !question.options
                                  ) {
                                    updateQuestion(question.id, "options", [
                                      "Option 1",
                                      "Option 2",
                                    ]);
                                  }
                                  if (e.target.value === "file_upload") {
                                    updateQuestion(
                                      question.id,
                                      "allowedFileTypes",
                                      [".pdf"],
                                    );
                                  }
                                }}
                                className="bg-[#1a1405]/60 backdrop-blur-md border border-yellow-900/50 rounded-xl pl-4 pr-12 py-2.5 text-xs font-black text-yellow-400 uppercase tracking-widest focus:border-yellow-400 focus:outline-none focus:ring-0 appearance-none group-hover/select:border-yellow-500 transition-colors cursor-pointer"
                              >
                                {questionTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-900/30 group/check cursor-pointer">
                              <input
                                type="checkbox"
                                id={`required-${question.id}`}
                                checked={question.required}
                                onChange={(e) =>
                                  updateQuestion(
                                    question.id,
                                    "required",
                                    e.target.checked,
                                  )
                                }
                                className="w-5 h-5 rounded bg-black/40 border-yellow-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 transition-transform group-hover/check:scale-110 cursor-pointer"
                              />
                              <label
                                htmlFor={`required-${question.id}`}
                                className="text-[10px] text-yellow-100/40 uppercase tracking-[0.2em] font-black cursor-pointer select-none group-hover/check:text-yellow-400 transition-colors"
                              >
                                Mandatory
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Logic Sub-Panels (Nested Glass) */}
                      <div className="md:pl-16 space-y-5">
                        {question.type === "text" && (
                          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4 shadow-inner">
                            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em]">
                              Validation Protocol
                            </div>
                            <div className="relative">
                              <select
                                value={
                                  validationPatterns.find(
                                    (p) =>
                                      p.pattern === question.validationPattern,
                                  )?.value || ""
                                }
                                onChange={(e) => {
                                  const selected = validationPatterns.find(
                                    (p) => p.value === e.target.value,
                                  );
                                  if (selected) {
                                    updateQuestion(
                                      question.id,
                                      "validationPattern",
                                      selected.pattern,
                                    );
                                    updateQuestion(
                                      question.id,
                                      "validationMessage",
                                      selected.message,
                                    );
                                  }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs font-bold text-yellow-50 uppercase tracking-widest focus:border-yellow-400 transition-all appearance-none"
                              >
                                {validationPatterns.map((pattern) => (
                                  <option
                                    key={pattern.value}
                                    value={pattern.value}
                                  >
                                    {pattern.label.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 pointer-events-none" />
                            </div>
                          </div>
                        )}

                        {(question.type === "multiple_choice" ||
                          question.type === "dropdown") && (
                          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-5 shadow-inner">
                            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em]">
                              Data Set Options
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(question.options || []).map(
                                (option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center gap-2 group/option"
                                  >
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) =>
                                        updateOption(
                                          question.id,
                                          optionIndex,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-white/10 focus:border-yellow-400 focus:bg-white/[0.06] transition-all"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeOption(question.id, optionIndex)
                                      }
                                      className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-0 group-hover/option:opacity-100 opacity-20"
                                      disabled={
                                        (question.options?.length || 0) <= 2
                                      }
                                    >
                                      <X className="w-4 h-4 text-red-400/60" />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-500/5 border border-dashed border-yellow-500/20 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                              Append Field
                            </button>
                          </div>
                        )}

                        {question.type === "file_upload" && (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-sm">
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                              <FileUp className="text-amber-400 w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">
                                System Restriction
                              </div>
                              <p className="text-[10px] text-amber-100/40 uppercase font-bold tracking-widest leading-relaxed">
                                Only encrypted PDF containers will be accepted
                                via secure encrypted channel
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-4 py-6 rounded-3xl bg-white/[0.02] backdrop-blur-md border border-dashed border-white/10 hover:border-yellow-400 hover:bg-yellow-500/5 text-yellow-400/50 hover:text-yellow-400 text-xs font-black uppercase tracking-[0.4em] transition-all group active:scale-[0.98]"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                  Add New Data Schema
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer - Solid Glass with High Contrast Button */}
        <div className="relative p-8 md:p-10 border-t border-yellow-500/10 bg-white/[0.02] backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full py-5 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-[#0a0a05] font-black uppercase tracking-[0.4em] text-sm shadow-[0_10px_40px_rgba(250,204,21,0.2)] hover:shadow-[0_15px_50px_rgba(250,204,21,0.4)] transition-all active:scale-[0.99] active:brightness-90"
          >
            Confirm Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
