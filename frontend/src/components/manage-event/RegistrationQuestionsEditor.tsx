"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  FileUp,
  List,
  Type,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Question, QuestionType, QuestionFieldValue } from "@/types/event";
import { saveRegistrationQuestionsAction } from "@/actions/eventActions";

interface RegistrationQuestionsEditorProps {
  slug: string;
  initialQuestions: Question[];
}

const questionTypes: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "Text Input", icon: <Type className="w-4 h-4" /> },
  { value: "multiple_choice", label: "Multiple Choice", icon: <List className="w-4 h-4" /> },
  { value: "dropdown", label: "Dropdown", icon: <ChevronDown className="w-4 h-4" /> },
  { value: "file_upload", label: "File Upload", icon: <FileUp className="w-4 h-4" /> },
];

const validationPatterns = [
  { value: "", label: "No Validation", pattern: "", message: "", example: "" },
  { value: "email", label: "Email", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message: "Please enter a valid email address", example: "example@email.com" },
  { value: "phone", label: "Phone Number", pattern: "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$", message: "Please enter a valid phone number", example: "(123) 456-7890" },
  { value: "url", label: "URL", pattern: "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$", message: "Please enter a valid URL", example: "https://example.com" },
  { value: "numbers", label: "Numbers Only", pattern: "^[0-9]+$", message: "Please enter numbers only", example: "12345" },
  { value: "letters", label: "Letters Only", pattern: "^[a-zA-Z\\s]+$", message: "Please enter letters only", example: "John Doe" },
  { value: "alphanumeric", label: "Alphanumeric", pattern: "^[a-zA-Z0-9]+$", message: "Please enter letters and numbers only", example: "ABC123" },
];

export function RegistrationQuestionsEditor({
  slug,
  initialQuestions,
}: RegistrationQuestionsEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: "",
      required: false,
      type: "text",
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const removeQuestion = (id: number | string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (
    id: number | string,
    field: keyof Question,
    value: QuestionFieldValue,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const addOption = (questionId: number | string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      updateQuestion(questionId, "options", [...(question.options || []), ""]);
    }
  };

  const updateOption = (questionId: number | string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question?.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, "options", newOptions);
    }
  };

  const removeOption = (questionId: number | string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question?.options) {
      updateQuestion(
        questionId,
        "options",
        question.options.filter((_, i) => i !== optionIndex),
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    const result = await saveRegistrationQuestionsAction(slug, questions);

    setIsSaving(false);
    if (result.success) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setErrorMessage(result.error || "Failed to save questions");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="font-urbanist text-lg md:text-xl font-bold text-white">
          Registration Questions
        </h2>
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1 text-green-400 text-sm font-urbanist">
              <Check size={14} /> Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-400 text-sm font-urbanist truncate max-w-[200px]">
              {errorMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="font-urbanist px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Questions"
            )}
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-10 text-white/50 font-urbanist">
            No questions added yet
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
            >
              {/* Question row */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-bold mt-1">
                  {index + 1}
                </div>
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                  className="font-urbanist flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm leading-relaxed focus:ring-0 p-0"
                />
                <select
                  value={question.type || "text"}
                  onChange={(e) => {
                    const type = e.target.value as QuestionType;
                    updateQuestion(question.id, "type", type);
                    if ((type === "multiple_choice" || type === "dropdown") && !question.options) {
                      updateQuestion(question.id, "options", ["Option 1", "Option 2"]);
                    }
                    if (type === "file_upload") {
                      updateQuestion(question.id, "allowedFileTypes", [".pdf"]);
                    }
                  }}
                  className="font-urbanist flex-shrink-0 bg-[#1a1a2e] border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none cursor-pointer"
                >
                  {questionTypes.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#1a1a2e] text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Required checkbox */}
              <div className="flex items-center gap-2 pl-10 mb-3">
                <input
                  type="checkbox"
                  id={`required-${question.id}`}
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, "required", e.target.checked)}
                  className="w-4 h-4 rounded bg-white/5 border-white/20 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor={`required-${question.id}`}
                  className="font-urbanist text-xs text-white/50 uppercase tracking-wider cursor-pointer select-none"
                >
                  Required
                </label>
              </div>

              {/* Validation pattern for text */}
              {question.type === "text" && (
                <div className="pl-10 mb-3 space-y-2">
                  <div className="font-urbanist text-xs text-white/50 uppercase tracking-wider">
                    Input Validation (Optional)
                  </div>
                  <select
                    value={validationPatterns.find((p) => p.pattern === question.validationPattern)?.value || ""}
                    onChange={(e) => {
                      const selected = validationPatterns.find((p) => p.value === e.target.value);
                      if (selected) {
                        updateQuestion(question.id, "validationPattern", selected.pattern);
                        updateQuestion(question.id, "validationMessage", selected.message);
                      }
                    }}
                    className="font-urbanist w-full bg-[#1a1a2e] border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none cursor-pointer"
                  >
                    {validationPatterns.map((p) => (
                      <option key={p.value} value={p.value} className="bg-[#1a1a2e] text-white">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {question.validationPattern && (
                    <div className="font-urbanist text-xs text-white/40 italic">
                      Example: {validationPatterns.find((p) => p.pattern === question.validationPattern)?.example}
                    </div>
                  )}
                </div>
              )}

              {/* Options for multiple_choice / dropdown */}
              {(question.type === "multiple_choice" || question.type === "dropdown") && (
                <div className="pl-10 mt-2 space-y-2">
                  <div className="font-urbanist text-xs text-white/50 uppercase tracking-wider">
                    Options
                  </div>
                  {(question.options || []).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs">
                        {optionIndex + 1}
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="font-urbanist flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(question.id, optionIndex)}
                        disabled={(question.options?.length || 0) <= 2}
                        className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(question.id)}
                    className="font-urbanist flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white/50 hover:text-cyan-400 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Add Option
                  </button>
                </div>
              )}

              {/* File upload info */}
              {question.type === "file_upload" && (
                <div className="pl-10 mt-2">
                  <div className="font-urbanist text-xs text-white/40 italic">
                    Only PDF files will be accepted
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Add question button */}
        <button
          type="button"
          onClick={addQuestion}
          className="font-urbanist w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-black/30 border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white/50 hover:text-cyan-400 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>
    </div>
  );
}
