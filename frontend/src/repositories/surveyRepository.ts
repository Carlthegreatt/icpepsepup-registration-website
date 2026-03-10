import { createClient } from "@/lib/supabase/server";

export async function fetchSurveyResponse(eventId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .select("survey_responses_id")
    .eq("event_id", eventId)
    .eq("users_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch survey response: ${error.message}`);
  }

  return data;
}

export async function updateSurveyResponse(responseId: string, answers: Record<string, any>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("survey_responses")
    .update({ answers })
    .eq("survey_responses_id", responseId);

  if (error) {
    throw new Error(`Failed to update survey response: ${error.message}`);
  }
}

export async function insertSurveyResponse(eventId: string, userId: string, answers: Record<string, any>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("survey_responses")
    .insert({
      event_id: eventId,
      users_id: userId,
      answers,
    });

  if (error) {
    throw new Error(`Failed to insert survey response: ${error.message}`);
  }
}
