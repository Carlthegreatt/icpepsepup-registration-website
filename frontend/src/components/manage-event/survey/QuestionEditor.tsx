import { SurveyQuestion } from "@/types/survey";
import { Trash2, GripVertical, Plus, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils";

interface QuestionEditorProps {
  question: SurveyQuestion;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  index: number;
}

export function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  index,
}: QuestionEditorProps) {
  const [showOptions, setShowOptions] = useState(
    question.type === "multiple_choice",
  );

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 mb-4 hover:border-white/20 transition-all font-urbanist">
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="mt-3 text-white/20 cursor-grab active:cursor-grabbing hover:text-white/40">
          <GripVertical size={20} />
        </div>

        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
            {/* Question Text */}
            <div className="flex-1">
              <label className="text-sm font-medium text-white/80 mb-2 block tracking-wide">
                Question {index + 1}
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="e.g. How would you rate the event?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Question Type */}
            <div className="w-full">
              <label className="text-sm font-medium text-white/80 mb-2 block tracking-wide">
                Type
              </label>
              <div className="relative">
                <select
                  value={question.type}
                  onChange={(e) => {
                    const newType = e.target.value as SurveyQuestion["type"];
                    onUpdate({
                      type: newType,
                      options:
                        newType === "multiple_choice"
                          ? ["Option 1", "Option 2"]
                          : undefined,
                    });
                    setShowOptions(newType === "multiple_choice");
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer [&>option]:bg-[#0a1520]"
                >
                  <option value="text">Text Answer</option>
                  <option value="rating">Star Rating (1-5)</option>
                  <option value="yes_no">Yes / No</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
                {/* Custom Arrow Icon could go here */}
              </div>
            </div>
          </div>

          {/* Multiple Choice Options */}
          {question.type === "multiple_choice" && (
            <div className="pl-4 border-l-2 border-cyan-500/30 space-y-3 mt-4 bg-white/5 p-4 rounded-r-lg">
              <label className="text-sm font-bold text-white/90 block mb-2">
                Options
              </label>
              {question.options?.map((opt, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[i] = e.target.value;
                      onUpdate({ options: newOptions });
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    onClick={() => {
                      const newOptions =
                        question.options?.filter((_, idx) => idx !== i) || [];
                      onUpdate({ options: newOptions });
                    }}
                    className="text-white/40 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-md"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  onUpdate({
                    options: [
                      ...(question.options || []),
                      `Option ${question.options!.length + 1}`,
                    ],
                  })
                }
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mt-2 px-2 py-1 hover:bg-white/5 rounded-md transition-colors"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>
          )}

          {/* Settings Row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
            <label className="flex items-center gap-3 cursor-pointer select-none group/check">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-white/5 checked:bg-cyan-600 checked:border-cyan-600 focus:ring-offset-0 focus:ring-cyan-500/50 transition-all cursor-pointer"
                />
                <Check
                  size={12}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                />
              </div>
              <span className="text-sm text-white/70 group-hover/check:text-white transition-colors font-medium">
                Required
              </span>
            </label>

            <button
              onClick={onDelete}
              className="text-white/40 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg flex items-center gap-2"
              title="Delete Question"
            >
              <Trash2 size={16} />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
