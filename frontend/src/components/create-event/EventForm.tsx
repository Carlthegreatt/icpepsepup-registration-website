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
    <p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider">
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
          className="aspect-square w-full max-w-[600px] mx-auto lg:mx-0 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer md:hover:border-primary transition-all duration-300 shadow-2xl shadow-black/50"
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
              <button
                onClick={(e) => handleCoverImageRemove(e, fileInputRef)}
                className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-3 md:inset-4 border-2 border-dashed border-white/10 rounded-2xl md:group-hover:border-primary/50 transition-colors" />
              <div className="text-center p-4 relative z-10">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2.5" />
                    <p className="text-base font-bold text-white mb-1 uppercase tracking-wide">
                      Uploading...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/5 p-2.5 rounded-full mb-2.5 mx-auto w-fit">
                      <ImageIcon className="w-6 h-6 text-white/50" />
                    </div>
                    <p className="text-base font-bold text-white mb-1 uppercase tracking-wide">
                      Upload Cover Image
                    </p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest">
                      1080x1080 Recommended
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
        <div className="space-y-3.5 w-full">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl px-4 py-3.5 mb-4 shadow-lg shadow-red-500/20">
              <p className="text-red-100 text-sm text-center font-semibold">
                {error}
              </p>
            </div>
          )}

          {/* Event Title */}
          <div className="group relative">
            <label className="text-[10px] sm:text-xs text-secondary font-bold uppercase tracking-widest mb-1 md:mb-2 block">
              Event Name
            </label>
            <input
              type="text"
              placeholder="Event Name"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="w-full bg-transparent border-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-urbanist font-bold placeholder-white/10 focus:ring-0 p-0 text-white outline-none"
            />
            <div
              className={`absolute bottom-0 left-0 w-full h-[2px] transition-colors ${
                validationErrors.title
                  ? "bg-red-500/50"
                  : "bg-white-50/10 group-focus-within:bg-gradient-to-r group-focus-within:from-primary group-focus-within:to-secondary"
              }`}
            />
            <ValidationError message={validationErrors.title} />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Input
                label="Start"
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
                label="End"
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
            className={`bg-black/40 backdrop-blur-md border rounded-xl p-2.5 sm:p-3 flex items-start gap-2 sm:gap-2.5 transition-all group focus-within:border-primary ${
              validationErrors.description
                ? "border-red-500/50"
                : "border-white/10 hover:border-primary/30"
            }`}
          >
            <div className="p-1.5 sm:p-2 bg-white-50/5 rounded-lg mt-0.5 flex-shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">
                Description
              </label>
              <textarea
                placeholder="Details about your event..."
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                className="bg-transparent border-none outline-none text-xs sm:text-sm focus:ring-0 w-full p-0 placeholder-white/20 resize-none h-16 sm:h-20 text-white leading-relaxed"
              />
              <ValidationError message={validationErrors.description} />
            </div>
          </div>

          {/* Event Options */}
          <div className="pt-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-urbanist font-bold text-white tracking-wide">
              Event Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Ticket Price */}
              <div
                className={`bg-black/40 backdrop-blur-md border rounded-xl p-3 sm:p-4 transition-all group focus-within:border-primary ${
                  validationErrors.ticketPrice
                    ? "border-red-500/50"
                    : "border-white/10 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  <label className="text-[9px] sm:text-[10px] text-white/60 uppercase tracking-widest font-bold">
                    Ticket Price
                  </label>
                </div>
                <div className="relative mb-2">
                  <select
                    value={ticketType}
                    onChange={(e) =>
                      handleTicketTypeChange(e.target.value as "free" | "paid")
                    }
                    className="bg-transparent border-none outline-none text-sm sm:text-base focus:ring-0 w-full pr-6 appearance-none text-white font-medium cursor-pointer"
                  >
                    <option value="free" className="bg-[#0a1520] text-white">
                      Free
                    </option>
                    <option value="paid" className="bg-[#0a1520] text-white">
                      Paid
                    </option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                </div>
                {ticketType === "paid" && (
                  <input
                    type="text"
                    placeholder="e.g., $50, ₱500, etc."
                    value={priceAmount}
                    onChange={(e) => handlePriceAmountChange(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm sm:text-base focus:ring-0 w-full placeholder-white/30 text-white font-medium focus:border-primary transition-colors"
                  />
                )}
                <ValidationError message={validationErrors.ticketPrice} />
              </div>

              {/* Requires Approval */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.requireApproval ? (
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                    ) : (
                      <LockOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50 flex-shrink-0" />
                    )}
                    <label className="text-[9px] sm:text-[10px] text-white/60 uppercase tracking-widest font-bold">
                      Requires Approval
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("requireApproval", !formData.requireApproval)
                    }
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      formData.requireApproval ? "bg-secondary" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        formData.requireApproval
                          ? "translate-x-5 sm:translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div
              className={`bg-black/40 backdrop-blur-md border rounded-xl p-3 sm:p-4 transition-all group focus-within:border-primary ${
                validationErrors.capacity
                  ? "border-red-500/50"
                  : "border-white/10 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <label className="text-[9px] sm:text-[10px] text-white/60 uppercase tracking-widest font-bold">
                  Capacity
                </label>
              </div>
              <input
                type="text"
                placeholder="e.g., 1000"
                value={formData.capacity}
                onChange={(e) => handleFieldChange("capacity", e.target.value)}
                className="bg-transparent border-none outline-none text-sm sm:text-base focus:ring-0 w-full p-0 placeholder-white/30 text-white font-medium"
              />
              <ValidationError message={validationErrors.capacity} />
            </div>
          </div>

          {/* Registration Questions Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsQuestionsModalOpen(true)}
              className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white-50/5 rounded-lg flex-shrink-0">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs sm:text-sm font-urbanist font-bold text-white tracking-wide">
                    Registration Questions
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/50 mt-0.5">
                    {!formData.questions?.length
                      ? "No questions added"
                      : `${formData.questions.length} question${formData.questions.length === 1 ? "" : "s"} configured`}
                  </p>
                </div>
              </div>
              <div className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                Manage
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasRequiredFields}
              fullWidth
              size="lg"
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
            {!hasRequiredFields && !isSubmitting && (
              <p className="text-white/40 text-[10px] text-center mt-2 uppercase tracking-wider">
                Fill in event name, start date, and start time to continue
              </p>
            )}
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
