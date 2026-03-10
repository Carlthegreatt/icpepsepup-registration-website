import { updateEventSurvey } from "@/repositories/eventRepository";
import { fetchSurveyResponse, insertSurveyResponse, updateSurveyResponse } from "@/repositories/surveyRepository";
import { getRegistrantByUserAndEvent } from "@/repositories/registrantRepository";
import { getEventIdAndApprovalBySlug } from "@/repositories/eventRepository";

export async function saveEventSurveySettings(slug: string, surveyData: any) {
  // Authorization is handled by the server action
  await updateEventSurvey(slug, surveyData);
}

export async function submitSurvey(slug: string, userId: string, answers: Record<string, any>) {
  const event = await getEventIdAndApprovalBySlug(slug);
  if (!event) throw new Error("Event not found");

  const registration = await getRegistrantByUserAndEvent(userId, event.event_id);
  
  if (!registration) {
    throw new Error("You must be a registered attendee to answer this survey.");
  }

  const existingResponse = await fetchSurveyResponse(event.event_id, userId);

  if (existingResponse) {
    await updateSurveyResponse(existingResponse.survey_responses_id, answers);
  } else {
    await insertSurveyResponse(event.event_id, userId, answers);
  }
}
