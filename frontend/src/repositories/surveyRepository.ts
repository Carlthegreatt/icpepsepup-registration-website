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

export interface SurveyResponseWithUser {
  survey_responses_id: string;
  users_id: string;
  answers: Record<string, unknown>;
  created_at?: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export async function getSurveyResponsesByEvent(eventId: string): Promise<SurveyResponseWithUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .select(`
      survey_responses_id,
      users_id,
      answers,
      created_at,
      users:users!users_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq("event_id", eventId);

  if (error) {
    throw new Error(`Failed to fetch survey responses: ${error.message}`);
  }

  return (data || []) as unknown as SurveyResponseWithUser[];
}
