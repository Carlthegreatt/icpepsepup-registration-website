import { createClient } from "@/lib/supabase/server";

export type DashboardEventRow = {
  event_id: string;
  start_date: string | null;
  end_date: string | null;
  capacity: number | null;
  status: string | null;
  created_at: string | null;
};

export type DashboardRegistrantRow = {
  event_id: string;
  created_at: string | null;
  is_registered: boolean | null;
  check_in: boolean | null;
};

export type DashboardSurveyResponseRow = {
  created_at: string | null;
};

export async function getDashboardAnalyticsRows() {
  const supabase = await createClient();

  const [eventsResult, registrantsResult, surveyResponsesResult] =
    await Promise.all([
      supabase
        .from("events")
        .select("event_id,start_date,end_date,capacity,status,created_at"),
      supabase
        .from("registrants")
        .select("event_id,created_at,is_registered,check_in"),
      supabase.from("survey_responses").select("created_at"),
    ]);

  if (eventsResult.error) {
    throw new Error(
      `Failed to fetch dashboard events: ${eventsResult.error.message}`,
    );
  }

  if (registrantsResult.error) {
    throw new Error(
      `Failed to fetch dashboard registrants: ${registrantsResult.error.message}`,
    );
  }

  if (surveyResponsesResult.error) {
    throw new Error(
      `Failed to fetch dashboard survey responses: ${surveyResponsesResult.error.message}`,
    );
  }

  return {
    events: (eventsResult.data ?? []) as DashboardEventRow[],
    registrants: (registrantsResult.data ?? []) as DashboardRegistrantRow[],
    surveyResponses: (surveyResponsesResult.data ??
      []) as DashboardSurveyResponseRow[],
  };
}
