import { useState, useCallback, useEffect } from "react";
import { SurveyConfig, SurveyQuestion } from "@/types/survey";

export function useSurvey(initialConfig?: SurveyConfig) {
  // Use default configuration if none is provided
  const [config, setConfig] = useState<SurveyConfig>(
    initialConfig || {
      isEnabled: false,
      questions: [],
    },
  );

  // Update config when initialConfig changes (e.g. after data fetch)
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Toggle survey enabled/disabled
  const toggleEnabled = useCallback(() => {
    setConfig((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  // Set the entire config (e.g., after loading from DB)
  const setSurveyConfig = useCallback((newConfig: SurveyConfig) => {
    setConfig(newConfig);
  }, []);

  // Add a new question
  const addQuestion = useCallback((type: SurveyQuestion["type"] = "text") => {
    const newQuestion: SurveyQuestion = {
      id: `q_${Date.now()}`, // Temporary unique ID based on timestamp
      text: "",
      type,
      required: false,
      options:
        type === "multiple_choice" ? ["Option 1", "Option 2"] : undefined,
    };

    setConfig((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }, []);

  // Update a specific question by ID
  const updateQuestion = useCallback(
    (id: string, updates: Partial<SurveyQuestion>) => {
      setConfig((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === id ? { ...q, ...updates } : q,
        ),
      }));
    },
    [],
  );

  // Remove a question
  const removeQuestion = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }, []);

  // Check if configuration has changed (basic dirty check logic would go here if needed)
  // For now, we just return the methods.

  return {
    config,
    toggleEnabled,
    setSurveyConfig,
    addQuestion,
    updateQuestion,
    removeQuestion,
  };
}
