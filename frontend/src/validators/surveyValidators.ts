import { z } from "zod";

export const SaveSurveySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  surveyData: z.any(),
});

export const SubmitSurveyResponseSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  answers: z.record(z.string(), z.any()),
});
