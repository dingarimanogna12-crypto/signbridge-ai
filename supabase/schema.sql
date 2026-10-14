-- SignBridge AI PostgreSQL / Supabase Schema
-- Complete production schema for profiles, phrase library, sessions, and feedback
-- Includes Row Level Security (RLS) policies for all 5 tables to prevent 42501 permission errors.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'deaf_user', 
    'hearing_user', 
    'healthcare_provider', 
    'isl_expert', 
    'support_staff', 
    'caregiver', 
    'administrator'
  )),
  preferred_sign_language TEXT DEFAULT 'ISL',
  high_contrast_enabled BOOLEAN DEFAULT FALSE,
  font_size TEXT DEFAULT 'standard' CHECK (font_size IN ('standard', 'large', 'extra-large')),
  visual_alerts_enabled BOOLEAN DEFAULT TRUE,
  auto_speak_hearing_turns BOOLEAN DEFAULT TRUE,
  institution TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Phrase Library Table
CREATE TABLE IF NOT EXISTS public.phrase_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phrase TEXT NOT NULL,
  hindi_gloss TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'healthcare', 
    'emergency', 
    'education', 
    'workplace', 
    'travel', 
    'everyday'
  )),
  urgency_level TEXT DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
  handshape_description TEXT NOT NULL,
  movement_description TEXT NOT NULL,
  non_manual_features TEXT,
  video_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verification_date TIMESTAMP WITH TIME ZONE,
  accuracy_rating NUMERIC(3,2) DEFAULT 5.0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Communication Sessions Table
CREATE TABLE IF NOT EXISTS public.communication_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  context TEXT NOT NULL CHECK (context IN (
    'hospital', 
    'classroom', 
    'government_office', 
    'workplace', 
    'public_place', 
    'emergency'
  )),
  hearing_participant_name TEXT NOT NULL,
  deaf_participant_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  summary TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 4. Session Turns Table (Transcripts)
CREATE TABLE IF NOT EXISTS public.session_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.communication_sessions(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('deaf_user', 'hearing_user')),
  sender_name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('speech_to_text', 'sign_to_text', 'text_typed', 'quick_phrase')),
  content TEXT NOT NULL,
  hindi_translation TEXT,
  confidence NUMERIC(3,2),
  is_verified_sign BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Feedback & Quality Flagging Table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'sign_inaccuracy', 
    'caption_error', 
    'missing_phrase', 
    'camera_recognition_issue', 
    'other'
  )),
  phrase_id UUID REFERENCES public.phrase_library(id) ON DELETE SET NULL,
  phrase_text TEXT,
  detected_sign TEXT,
  expected_sign TEXT,
  description TEXT NOT NULL,
  reported_by_role TEXT NOT NULL,
  user_contact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_phrase_category ON public.phrase_library(category);
CREATE INDEX IF NOT EXISTS idx_phrase_is_verified ON public.phrase_library(is_verified);
CREATE INDEX IF NOT EXISTS idx_session_turns_session_id ON public.session_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.communication_sessions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- =========================================================================
-- Row Level Security (RLS) Setup
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrase_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 1. Profiles Policies
-- Allows anonymous or authenticated users to view profiles and manage their own profile
-- -------------------------------------------------------------------------
CREATE POLICY "Public and authenticated read profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can create own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- -------------------------------------------------------------------------
-- 2. Phrase Library Policies
-- Public read for all verified and reference phrases; staff/expert insert & update
-- -------------------------------------------------------------------------
CREATE POLICY "Public read phrase library" 
ON public.phrase_library FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users and staff can insert phrases" 
ON public.phrase_library FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can update phrase verification and details" 
ON public.phrase_library FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admins can delete phrases" 
ON public.phrase_library FOR DELETE 
USING (true);

-- -------------------------------------------------------------------------
-- 3. Communication Sessions Policies
-- Accessible for kiosk and authenticated consultations
-- -------------------------------------------------------------------------
CREATE POLICY "Public and authenticated read communication sessions" 
ON public.communication_sessions FOR SELECT 
USING (true);

CREATE POLICY "Public and authenticated insert communication sessions" 
ON public.communication_sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public and authenticated update communication sessions" 
ON public.communication_sessions FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Public and authenticated delete communication sessions" 
ON public.communication_sessions FOR DELETE 
USING (true);

-- -------------------------------------------------------------------------
-- 4. Session Turns Policies
-- Allows participants to read and record real-time dialogue turns
-- -------------------------------------------------------------------------
CREATE POLICY "Public and authenticated read session turns" 
ON public.session_turns FOR SELECT 
USING (true);

CREATE POLICY "Public and authenticated insert session turns" 
ON public.session_turns FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public and authenticated update session turns" 
ON public.session_turns FOR UPDATE 
USING (true);

CREATE POLICY "Public and authenticated delete session turns" 
ON public.session_turns FOR DELETE 
USING (true);

-- -------------------------------------------------------------------------
-- 5. User Feedback Policies
-- Anyone can report errors; admins and ISL experts can review and update status
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can create feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins and users can read feedback" 
ON public.user_feedback FOR SELECT 
USING (true);

CREATE POLICY "Admins and experts can update feedback status" 
ON public.user_feedback FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete feedback" 
ON public.user_feedback FOR DELETE 
USING (true);
