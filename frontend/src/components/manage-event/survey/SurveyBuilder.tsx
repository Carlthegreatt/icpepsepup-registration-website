import { saveEventSurveyAction } from "@/actions/surveyActions";
import { useSurvey } from "@/hooks/use-survey";
import { SurveyConfig } from "@/types/survey";
import { Loader2, Plus, Save, Info } from "lucide-react";
import { useState } from "react";
import { QuestionEditor } from "./QuestionEditor";

interface SurveyBuilderProps {
  slug: string;
  initialConfig?: SurveyConfig;
}

export default function SurveyBuilder({
  slug,
  initialConfig,
}: SurveyBuilderProps) {
  const { config, addQuestion, updateQuestion, removeQuestion, toggleEnabled } =
    useSurvey(initialConfig);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      const result = await saveEventSurveyAction(slug, config);
      if (!result.success) {
        throw new Error(result.error);
      }
      setSuccessMessage("Survey saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to save survey. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-urbanist pb-24">
      {/* Header / Toggle Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Post-Event Survey
            </h2>
            <p className="text-sm text-white/50 font-medium">
              Collect feedback from your attendees after the event.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
            <span
              className={`text-sm font-bold uppercase tracking-wider ${
                config.isEnabled ? "text-emerald-400" : "text-white/30"
              }`}
            >
              {config.isEnabled ? "Active" : "Disabled"}
            </span>
            <button
              onClick={toggleEnabled}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                config.isEnabled ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                  config.isEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner (Optional, similar to alerts in other parts of app) */}
      {config.isEnabled && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 text-cyan-400" />
          <p>
            This survey will be available to attendees after the event ends. You
            can include a link to it in your post-event emails.
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {config.questions.map((q, idx) => (
          <QuestionEditor
            key={q.id}
            index={idx}
            question={q}
            onUpdate={(updates) => updateQuestion(q.id, updates)}
            onDelete={() => removeQuestion(q.id)}
          />
        ))}

        {config.questions.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              No questions yet
            </h3>
            <p className="text-white/40 mb-6 max-w-sm mx-auto">
              Start building your survey by adding your first question. You can
              ask for ratings, text feedback, and more.
            </p>
            <button
              onClick={() => addQuestion("rating")}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              Start with a Rating Question
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
        <div className="bg-[#0a1520]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
          <button
            onClick={() => addQuestion("text")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white hover:text-cyan-200 rounded-xl text-sm font-bold transition-colors border border-white/10"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Question</span>
            <span className="sm:hidden">Add</span>
          </button>

          <div className="flex items-center gap-4">
            {successMessage && (
              <span className="text-sm font-bold text-emerald-400 animate-in fade-in slide-in-from-bottom-2 hidden sm:block">
                {successMessage}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
