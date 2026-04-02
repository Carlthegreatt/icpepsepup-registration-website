"use client";

import { useRef, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  X,
  Ticket,
  Users,
  Lock,
  LockOpen,
  Settings,
  ChevronDown,
} from "lucide-react";
import { EventFormData, Question, QuestionFieldValue } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegistrationQuestionsModal } from "@/components/create-event/registration-questions-modal";
import { LocationPicker } from "@/components/create-event/LocationPicker";
import { useEventValidation } from "@/hooks/event/use-event-validation";
import { useEventSubmission } from "@/hooks/event/use-event-submission";
import { useTicketPrice } from "@/hooks/event/use-ticket-price";
import { useEventImageUpload } from "@/hooks/event/use-event-image-upload";
import { parseDateTimeInput } from "@/utils/file-utils";

interface EventFormProps {
  formData: EventFormData;
  updateField: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
  addQuestion: () => void;
  removeQuestion: (id: number | string) => void;
  updateQuestion: (
    id: number | string,
    field: keyof Question,
    value: QuestionFieldValue,
  ) => void;
}

const ValidationError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-red-400 text-[10px] mt-1 uppercase font-bold tracking-wider">
      {message}
    </p>
  ) : null;

export default function EventForm({
  formData,
  updateField,
  addQuestion,
  removeQuestion,
  updateQuestion,
}: EventFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);

  // Use custom hooks for separation of concerns
  const { validationErrors, validateField, validateForm } =
    useEventValidation();
  const { isSubmitting, error, submitEvent } = useEventSubmission();
  const {
    ticketType,
    priceAmount,
    handleTicketTypeChange,
    handlePriceAmountChange,
  } = useTicketPrice(formData.ticketPrice, (price) => {
    updateField("ticketPrice", price);
    validateField("ticketPrice", price, formData);
  });

  // UI event handlers
  const handleDateTimeChange = (
    value: string,
    dateField: "startDate" | "endDate",
    timeField: "startTime" | "endTime",
  ) => {
    const parsed = parseDateTimeInput(value);
    if (parsed) {
      updateField(dateField, parsed.date);
      updateField(timeField, parsed.time);
      validateField(dateField, parsed.date, formData);
      validateField(timeField, parsed.time, formData);
    }
  };

  const handleFieldChange = (
    field: keyof EventFormData,
    value: EventFormData[keyof EventFormData],
  ) => {
    updateField(field, value);
    validateField(field, value, formData);
  };

  const { isUploading, handleFileUpload, handleCoverImageRemove } =
    useEventImageUpload({ updateField });

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const validationResult = validateForm(formData);
    submitEvent(formData, validationResult);
  };

  // Check if form has required fields filled (for button state)
  const hasRequiredFields =
    formData.title && formData.startDate && formData.startTime;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      {/* Left Column: Cover Image Upload */}
      <div className="flex flex-col gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square w-full max-w-[600px] mx-auto lg:mx-0 rounded-2xl bg-black/40 backdrop-blur-md border border-yellow-900/20 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer md:hover:border-yellow-500/50 transition-all duration-300 shadow-2xl shadow-black/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {formData.coverImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.coverImage}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <button
                onClick={(e) => handleCoverImageRemove(e, fileInputRef)}
                className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition-colors z-10 border border-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-3 md:inset-4 border-2 border-dashed border-yellow-900/30 rounded-2xl md:group-hover:border-yellow-500/40 transition-colors" />
              <div className="text-center p-4 relative z-10">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent mb-3" />
                    <p className="text-base font-bold text-yellow-50 mb-1 uppercase tracking-widest">
                      Processing...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-500/10 p-4 rounded-full mb-4 mx-auto w-fit border border-yellow-500/20 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                      <ImageIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <p className="text-lg font-bold text-white mb-1 uppercase tracking-widest">
                      Upload Artwork
                    </p>
                    <p className="text-[10px] text-yellow-100/40 uppercase tracking-[0.2em] font-medium">
                      1080x1080 High-Res Recommended
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Event Details Form */}
      <div className="flex flex-col w-full">
        <div className="space-y-5 w-full">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3.5 mb-4 shadow-lg">
              <p className="text-red-400 text-sm text-center font-bold uppercase tracking-wider">
                {error}
              </p>
            </div>
          )}

          {/* Event Title */}
          <div className="group relative">
            <label className="text-[10px] sm:text-xs text-yellow-500 font-bold uppercase tracking-[0.2em] mb-2 block">
              Event Identity
            </label>
            <input
              type="text"
              placeholder="ENTER EVENT NAME"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="w-full bg-transparent border-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-morganite font-normal tracking-wider placeholder-yellow-900/30 focus:ring-0 p-0 text-white outline-none uppercase"
            />
            <div
              className={`absolute bottom-0 left-0 w-full h-[1px] transition-all duration-500 ${
                validationErrors.title
                  ? "bg-red-500/50"
                  : "bg-yellow-900/30 group-focus-within:bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
              }`}
            />
            <ValidationError message={validationErrors.title} />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Input
                label="Launch"
                icon={Calendar}
                type="datetime-local"
                iconAlwaysActive={true}
                value={
                  formData.startDate && formData.startTime
                    ? `${formData.startDate}T${formData.startTime}`
                    : ""
                }
                onChange={(e) =>
                  handleDateTimeChange(e.target.value, "startDate", "startTime")
                }
              />
              <ValidationError
                message={
                  validationErrors.startDate || validationErrors.startTime
                }
              />
            </div>
            <div>
              <Input
                label="Conclusion"
                icon={Clock}
                type="datetime-local"
                variant="secondary"
                iconAlwaysActive={true}
                value={
                  formData.endDate && formData.endTime
                    ? `${formData.endDate}T${formData.endTime}`
                    : ""
                }
                onChange={(e) =>
                  handleDateTimeChange(e.target.value, "endDate", "endTime")
                }
              />
              <ValidationError
                message={validationErrors.endDate || validationErrors.endTime}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <LocationPicker
              value={formData.location}
              onChange={(location) => handleFieldChange("location", location)}
            />
            <ValidationError message={validationErrors.location} />
          </div>

          {/* Description */}
          <div
            className={`bg-black/40 backdrop-blur-md border rounded-xl p-3 sm:p-4 flex items-start gap-3 transition-all group focus-within:border-yellow-400 ${
              validationErrors.description
                ? "border-red-500/50"
                : "border-yellow-900/20 hover:border-yellow-500/30"
            }`}
          >
            <div className="p-2 bg-yellow-500/5 rounded-lg mt-0.5 flex-shrink-0 border border-yellow-500/10">
              <FileText className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold block mb-1">
                Event Dossier
              </label>
              <textarea
                placeholder="Specify the details and objectives of the event..."
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                className="bg-transparent border-none outline-none text-sm focus:ring-0 w-full p-0 placeholder-yellow-900/30 resize-none h-24 text-yellow-50 leading-relaxed custom-scrollbar"
              />
              <ValidationError message={validationErrors.description} />
            </div>
          </div>

          {/* Event Options */}
          <div className="pt-2 space-y-4">
            <h3 className="text-[11px] font-bold text-yellow-400 uppercase tracking-[0.2em] ml-1">
              Configuration Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ticket Price */}
              <div
                className={`bg-black/40 backdrop-blur-md border rounded-xl p-4 transition-all group focus-within:border-yellow-400 ${
                  validationErrors.ticketPrice
                    ? "border-red-500/50"
                    : "border-yellow-900/20 hover:border-yellow-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold">
                    Access Level
                  </label>
                </div>
                <div className="relative mb-3">
                  <select
                    value={ticketType}
                    onChange={(e) =>
                      handleTicketTypeChange(e.target.value as "free" | "paid")
                    }
                    className="bg-transparent border-none outline-none text-sm focus:ring-0 w-full pr-8 appearance-none text-white font-bold cursor-pointer uppercase tracking-wider"
                  >
                    <option value="free" className="bg-[#1a1405] text-white">
                      COMPLIMENTARY
                    </option>
                    <option value="paid" className="bg-[#1a1405] text-white">
                      PREMIUM ACCESS
                    </option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/50 pointer-events-none" />
                </div>
                {ticketType === "paid" && (
                  <input
                    type="text"
                    placeholder="E.G. ₱500.00"
                    value={priceAmount}
                    onChange={(e) => handlePriceAmountChange(e.target.value)}
                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2 outline-none text-sm focus:ring-0 w-full placeholder-yellow-900/30 text-yellow-400 font-bold focus:border-yellow-400 transition-colors uppercase"
                  />
                )}
                <ValidationError message={validationErrors.ticketPrice} />
              </div>

              {/* Requires Approval */}
              <div className="bg-black/40 backdrop-blur-md border border-yellow-900/20 rounded-xl p-4 hover:border-yellow-500/30 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  {formData.requireApproval ? (
                    <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <LockOpen className="w-4 h-4 text-yellow-500/40 flex-shrink-0" />
                  )}
                  <label className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold">
                    Vetting Required
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    {formData.requireApproval ? "Strict Protocol" : "Open Gate"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("requireApproval", !formData.requireApproval)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 flex-shrink-0 shadow-inner ${
                      formData.requireApproval
                        ? "bg-yellow-500 shadow-yellow-500/20"
                        : "bg-yellow-900/40"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        formData.requireApproval
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div
              className={`bg-black/40 backdrop-blur-md border rounded-xl p-4 transition-all group focus-within:border-yellow-400 ${
                validationErrors.capacity
                  ? "border-red-500/50"
                  : "border-yellow-900/20 hover:border-yellow-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <label className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold">
                  Maximum Enrollment
                </label>
              </div>
              <input
                type="text"
                placeholder="E.G. 1000"
                value={formData.capacity}
                onChange={(e) => handleFieldChange("capacity", e.target.value)}
                className="bg-transparent border-none outline-none text-base focus:ring-0 w-full p-0 placeholder-yellow-900/30 text-white font-bold tracking-widest"
              />
              <ValidationError message={validationErrors.capacity} />
            </div>
          </div>

          {/* Registration Questions Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsQuestionsModalOpen(true)}
              className="w-full bg-yellow-500/5 backdrop-blur-md border border-yellow-500/20 rounded-xl p-4 hover:border-yellow-400 transition-all group flex items-center justify-between active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-yellow-500/10 rounded-xl flex-shrink-0 border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                  <Settings className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">
                    Form Schema
                  </h3>
                  <p className="text-[10px] text-yellow-100/40 mt-1 uppercase font-medium tracking-wider">
                    {!formData.questions?.length
                      ? "Standard Registration Only"
                      : `${formData.questions.length} CUSTOM DATA POINTS CONFIGURED`}
                  </p>
                </div>
              </div>
              <div className="text-yellow-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 group-hover:bg-yellow-400 group-hover:text-[#0a0a05] transition-all">
                Config
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasRequiredFields}
              className={`
      w-full py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3
      ${
        isSubmitting || !hasRequiredFields
          ? "bg-yellow-900/10 text-yellow-500/30 border border-yellow-900/30 cursor-not-allowed"
          : "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-[#0a0a05] shadow-[0_4px_25px_rgba(250,204,21,0.2)] hover:shadow-[0_8px_30px_rgba(250,204,21,0.4)]"
      }
    `}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#0a0a05]/30 border-t-[#0a0a05] animate-spin" />
                  INITIATING EVENT...
                </>
              ) : (
                "PUBLISH EVENT"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Registration Questions Modal */}
      <RegistrationQuestionsModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        questions={formData.questions || []}
        addQuestion={addQuestion}
        removeQuestion={removeQuestion}
        updateQuestion={updateQuestion}
      />
    </div>
  );
}
