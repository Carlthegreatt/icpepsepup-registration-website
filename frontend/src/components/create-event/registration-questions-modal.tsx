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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#0f0f05] to-[#050502] border border-yellow-900/30 rounded-2xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-600/5 opacity-50 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between p-5 sm:p-7 md:p-9 border-b border-yellow-900/20">
          <div className="flex-1 pr-4">
            <h2 className="font-morganite text-3xl sm:text-4xl font-bold text-yellow-400 tracking-wider uppercase mb-1">
              Form Schema
            </h2>
            <p className="text-yellow-100/40 text-[10px] sm:text-xs uppercase font-bold tracking-widest">
              Configure custom data points for registration requirements
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-900/30 flex items-center justify-center transition-all active:scale-90"
          >
            <X size={20} className="text-yellow-400/70" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 md:p-9">
          <div className="space-y-6">
            {questions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-yellow-500/5 border border-yellow-900/20 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <HelpCircle className="w-10 h-10 text-yellow-900/40" />
                </div>
                <p className="text-yellow-100/30 text-sm font-bold uppercase tracking-widest mb-8">
                  No Custom Fields Configured
                </p>
                <button
                  onClick={addQuestion}
                  className="mx-auto flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-[#0a0a05] font-black uppercase tracking-[0.2em] text-xs shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:shadow-[0_6px_25px_rgba(250,204,21,0.4)] transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Initialize Schema
                </button>
              </div>
            ) : (
              <>
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-black/40 backdrop-blur-md border border-yellow-900/20 rounded-2xl p-5 hover:border-yellow-500/30 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-4 mb-5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 border border-yellow-400/30 flex items-center justify-center text-[#0a0a05] text-sm font-black shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        {index + 1}
                      </div>
                      <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="QUESTION TEXT"
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                "text",
                                e.target.value,
                              )
                            }
                            className="bg-transparent border-none outline-none text-base font-bold focus:ring-0 flex-1 p-0 placeholder-yellow-900/30 text-white uppercase tracking-wide"
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="flex-shrink-0 p-2 hover:bg-red-500/10 rounded-lg transition-colors group/trash"
                          >
                            <Trash2 className="w-4 h-4 text-white/20 group-hover/trash:text-red-400" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="relative">
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
                              className="bg-[#1a1405] border border-yellow-900/50 rounded-xl pl-3 pr-10 py-2 text-[11px] font-bold text-yellow-400 uppercase tracking-widest focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 appearance-none cursor-pointer"
                            >
                              {questionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label.toUpperCase()}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-yellow-600 pointer-events-none" />
                          </div>

                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/5 border border-yellow-900/50">
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
                              className="w-4 h-4 rounded bg-black/40 border-yellow-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <label
                              htmlFor={`required-${question.id}`}
                              className="text-[10px] text-yellow-100/50 uppercase tracking-widest font-black cursor-pointer select-none"
                            >
                              Mandatory
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logic Panels */}
                    <div className="md:pl-12 space-y-4">
                      {/* Validation Pattern for Text Input */}
                      {question.type === "text" && (
                        <div className="bg-yellow-500/5 border border-yellow-900/20 rounded-xl p-4 space-y-3">
                          <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em]">
                            Input Verification
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
                              className="w-full bg-[#1a1405] border border-yellow-900/50 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-yellow-50 uppercase tracking-widest focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 appearance-none"
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
                          {question.validationPattern && (
                            <div className="text-[10px] text-yellow-500/40 uppercase font-black tracking-widest pl-1">
                              Target Pattern:{" "}
                              <span className="text-yellow-100/60 font-mono lowercase tracking-normal italic">
                                {
                                  validationPatterns.find(
                                    (p) =>
                                      p.pattern === question.validationPattern,
                                  )?.example
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options Editor */}
                      {(question.type === "multiple_choice" ||
                        question.type === "dropdown") && (
                        <div className="bg-yellow-500/5 border border-yellow-900/20 rounded-xl p-4 space-y-3">
                          <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em]">
                            Defined Options
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                    className="flex-1 bg-black/30 border border-yellow-900/50 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-yellow-900/30 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeOption(question.id, optionIndex)
                                    }
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-0"
                                    disabled={
                                      (question.options?.length || 0) <= 2
                                    }
                                  >
                                    <X className="w-3.5 h-3.5 text-red-400/60" />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => addOption(question.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/5 border border-dashed border-yellow-500/20 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            Append Option
                          </button>
                        </div>
                      )}

                      {/* File Upload Info */}
                      {question.type === "file_upload" && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-amber-400">
                            <FileUp size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                              System Restriction
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-100/40 uppercase font-bold tracking-widest mt-1">
                            Only encrypted PDF containers will be accepted via
                            secure upload
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-yellow-500/5 backdrop-blur-md border border-dashed border-yellow-500/20 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400 text-xs font-black uppercase tracking-[0.3em] transition-all group active:scale-[0.99]"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Add New Data Point
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-6 md:p-8 border-t border-yellow-900/20 bg-black/40">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-[#0a0a05] font-black uppercase tracking-[0.3em] text-sm shadow-[0_4px_25px_rgba(250,204,21,0.2)] hover:shadow-[0_8px_30px_rgba(250,204,21,0.4)] transition-all active:scale-[0.99]"
          >
            Confirm Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
