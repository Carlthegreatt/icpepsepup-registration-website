import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SurveyForm from "@/components/survey/SurveyForm";
import BokehBackground from "@/components/create-event/bokeh-background";
import Squares from "@/components/create-event/squares-background";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SurveyConfig } from "@/types/survey";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveyPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "event_id, event_name, post_event_survey, cover_image, location, start_date",
    )
    .eq("slug", slug)
    .single();

  if (!event || error) {
    notFound();
  }

  let userProfile = null;
  let existingResponse = null;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("first_name, last_name, email, avatar_url")
      .eq("users_id", user.id)
      .single();

    if (profile) {
      userProfile = profile;
    } else {
      userProfile = {
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        email: user.email || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };
    }

    // Check for existing response
    const { data: response } = await supabase
      .from("survey_responses")
      .select("answers")
      .eq("event_id", event.event_id)
      .eq("users_id", user.id)
      .maybeSingle();

    if (response) {
      existingResponse = response.answers;
    }
  }

  // Cast JSONB to SurveyConfig type
  const surveyConfig = event.post_event_survey as unknown as SurveyConfig;

  if (!surveyConfig?.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1520] text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold font-urbanist">
            Survey Not Available
          </h1>
          <p className="text-white/60 font-urbanist">
            The survey for this event is strictly closed.
          </p>
          <Link
            href={`/event/${slug}`}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-urbanist"
          >
            <ArrowLeft size={16} /> Back to Event
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = event.start_date
    ? new Date(event.start_date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f14] via-[#0a1520] to-[#120c08] text-white relative overflow-x-hidden">
      <BokehBackground />
      <Squares direction="diagonal" speed={0.3} />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header Section - Left Aligned */}
        <div className="text-left mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            href={`/event/${slug}`}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 text-sm font-urbanist tracking-wide uppercase"
          >
            <ArrowLeft size={14} /> Back to Event
          </Link>

          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 font-urbanist leading-tight tracking-tight drop-shadow-2xl">
            {event.event_name}
          </h1>

          <div className="flex items-center justify-start gap-4 text-cyan-400 font-urbanist font-medium tracking-wide">
            <span>Post-Event Survey</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            <span className="text-white/60">{eventDate}</span>
          </div>

          <p className="max-w-2xl text-white/60 text-lg leading-relaxed font-urbanist">
            We hope you enjoyed the event! Please verify your attendance and
            share your feedback below.
          </p>
        </div>

        {/* Survey Form */}
        <SurveyForm
          slug={slug}
          config={surveyConfig}
          userProfile={userProfile}
          initialAnswers={existingResponse}
        />
      </main>

      {/* Footer / Copyright */}
      <footer className="relative z-10 text-center py-8 text-white/20 text-sm font-urbanist">
        &copy; {new Date().getFullYear()} Arduino Day Philippines
      </footer>
    </div>
  );
}
