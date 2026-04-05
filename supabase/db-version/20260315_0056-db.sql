-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.events (
  event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL,
  event_name character varying NOT NULL,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  location character varying,
  description text,
  price character varying,
  require_approval boolean DEFAULT false,
  capacity numeric DEFAULT '25'::numeric,
  form_questions jsonb,
  status character varying,
  created_at timestamp with time zone DEFAULT now(),
  modified_at timestamp with time zone DEFAULT now(),
  registered numeric DEFAULT '0'::numeric,
  slug text UNIQUE,
  registration_open boolean NOT NULL DEFAULT true,
  cover_image text,
  post_event_survey jsonb DEFAULT '{"isEnabled": false, "questions": []}'::jsonb,
  certificate_config jsonb,
  CONSTRAINT events_pkey PRIMARY KEY (event_id),
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(users_id)
);
CREATE TABLE public.registrants (
  registrant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_registered boolean NOT NULL,
  terms_approval boolean NOT NULL,
  event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_answers jsonb NOT NULL,
  qr_data text,
  users_id uuid DEFAULT gen_random_uuid(),
  check_in boolean NOT NULL DEFAULT false,
  check_in_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  is_going boolean,
  CONSTRAINT registrants_pkey PRIMARY KEY (registrant_id),
  CONSTRAINT registrants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id),
  CONSTRAINT registrants_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(users_id)
);
CREATE TABLE public.survey_responses (
  survey_responses_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  users_id uuid,
  CONSTRAINT survey_responses_pkey PRIMARY KEY (survey_responses_id),
  CONSTRAINT survey_responses_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id),
  CONSTRAINT survey_responses_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(users_id)
);
CREATE TABLE public.users (
  users_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name character varying,
  last_name character varying,
  email character varying,
  role character varying DEFAULT 'authenticated'::character varying,
  CONSTRAINT users_pkey PRIMARY KEY (users_id),
  CONSTRAINT users_users_id_fkey FOREIGN KEY (users_id) REFERENCES auth.users(id)
);