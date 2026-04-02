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
  eventSlug,
}: StepDynamicProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    const errors: Record<string, string> = {};

    // Validate required questions and patterns
    questions.forEach((q) => {
      const answer = formData.dynamicAnswers[q.id.toString()];

      if (q.required && !answer) {
        errors[q.id.toString()] = "This field is required";
      } else if (
        answer &&
        typeof answer === "string" &&
        q.type === "text" &&
        q.validationPattern
      ) {
        const regex = new RegExp(q.validationPattern);
        if (!regex.test(answer)) {
          errors[q.id.toString()] = q.validationMessage || "Invalid format";
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
        [questionId.toString()]: value,
      },
    });
    // Clear validation error when user types
    if (validationErrors[questionId.toString()]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId.toString()];
        return newErrors;
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full animate-in fade-in duration-500 slide-in-from-right-4"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] tracking-tight mb-2 leading-tight">
              Additional Information
            </h2>
            <p className="text-yellow-100/60 mb-6 sm:mb-8 ml-1 text-[11px] sm:text-sm">
              Please provide the following information
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((question) => {
              const questionType = question.type || "text";
              const error = validationErrors[question.id.toString()];

              return (
                <div key={question.id} className="space-y-2">
                  <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
                    {question.text}
                    {question.required && (
                      <span className="text-yellow-500 ml-1">*</span>
                    )}
                  </label>

                  {/* Text Input */}
                  {questionType === "text" && (
                    <input
                      type="text"
                      value={
                        (formData.dynamicAnswers[
                          question.id.toString()
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        updateAnswer(question.id, e.target.value)
                      }
                      required={question.required}
                      placeholder="Type your answer here..."
                      className={`w-full !bg-[rgba(25,25,10,0.8)] border ${error ? "border-red-500" : "border-yellow-900/50"} rounded-xl px-4 py-3 !text-yellow-50 text-sm !placeholder:text-yellow-700/50 outline-none transition-all duration-200 focus:!border-yellow-400 focus:outline-none`}
                    />
                  )}

                  {/* Multiple Choice */}
                  {questionType === "multiple_choice" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(25,25,10,0.6)] border border-yellow-900/30 hover:border-yellow-500/50 cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={
                              (formData.dynamicAnswers[
                                question.id.toString()
                              ] as string) === option
                            }
                            onChange={(e) =>
                              updateAnswer(question.id, e.target.value)
                            }
                            required={question.required}
                            className="w-4 h-4 text-yellow-500 bg-[rgba(25,25,10,0.9)] border-yellow-900 focus:ring-yellow-500 focus:ring-offset-0"
                          />
                          <span className="text-yellow-50 text-sm">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Dropdown */}
                  {questionType === "dropdown" && question.options && (
                    <select
                      value={
                        (formData.dynamicAnswers[
                          question.id.toString()
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        updateAnswer(question.id, e.target.value)
                      }
                      required={question.required}
                      className={`w-full !bg-[rgba(25,25,10,0.8)] border ${error ? "border-red-500" : "border-yellow-900/50"} rounded-xl px-4 py-3 !text-yellow-50 text-sm outline-none transition-all duration-200 focus:!border-yellow-400 focus:outline-none cursor-pointer`}
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
                  {questionType === "file_upload" && (
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
                        required={
                          question.required &&
                          !formData.dynamicAnswers[question.id.toString()]
                        }
                        className="w-full !bg-[rgba(25,25,10,0.8)] border border-yellow-900/50 rounded-xl px-4 py-3 !text-yellow-50 text-sm outline-none transition-all duration-200 focus:!border-yellow-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/10 file:text-yellow-400 hover:file:bg-yellow-500/20 file:cursor-pointer"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-yellow-100/50 text-xs ml-1">
                          Only PDF files accepted
                        </p>
                        {formData.dynamicAnswers[
                          question.id.toString()
                        ] instanceof File && (
                          <p className="text-emerald-400 text-xs ml-1 font-medium">
                            ✓{" "}
                            {
                              (
                                formData.dynamicAnswers[
                                  question.id.toString()
                                ] as File
                              ).name
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Error */}
                  {error && (
                    <p className="text-red-400 text-xs mt-1 ml-1 font-medium">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 pt-4 border-t border-yellow-900/20">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-yellow-900/40 hover:bg-yellow-950/30 text-yellow-700 hover:text-yellow-500 font-semibold text-sm transition-all duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-sm transition-all duration-300 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
