-- TripMind Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip status enum
CREATE TYPE trip_status AS ENUM ('planning', 'active', 'completed');

-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  destinations JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  status trip_status DEFAULT 'planning',
  itinerary JSONB,
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip members table
CREATE TYPE member_role AS ENUM ('owner', 'collaborator');

CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'collaborator',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Trip photos table
CREATE TABLE IF NOT EXISTS public.trip_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  day_number INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip invites table
CREATE TABLE IF NOT EXISTS public.trip_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_invites ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Allow reading other users' profiles (for collaborator display)
CREATE POLICY "users_select_members" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM public.trip_members
      WHERE trip_id IN (
        SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid()
      )
    )
  );

-- Trips RLS Policies
CREATE POLICY "trips_select_members" ON public.trips
  FOR SELECT USING (
    id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trips_insert_owner" ON public.trips
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "trips_update_members" ON public.trips
  FOR UPDATE USING (
    id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trips_delete_owner" ON public.trips
  FOR DELETE USING (created_by = auth.uid());

-- Trip Members RLS Policies
CREATE POLICY "trip_members_select" ON public.trip_members
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trip_members_insert_owner" ON public.trip_members
  FOR INSERT WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "trip_members_delete_owner" ON public.trip_members
  FOR DELETE USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Trip Photos RLS Policies
CREATE POLICY "trip_photos_select" ON public.trip_photos
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trip_photos_insert" ON public.trip_photos
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    trip_id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trip_photos_delete_own" ON public.trip_photos
  FOR DELETE USING (uploaded_by = auth.uid());

-- Trip Invites RLS Policies
CREATE POLICY "trip_invites_select_owner" ON public.trip_invites
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "trip_invites_insert_owner" ON public.trip_invites
  FOR INSERT WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket setup (run after creating bucket in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', true);

-- Storage RLS policies
-- CREATE POLICY "trip_photos_storage_select" ON storage.objects
--   FOR SELECT USING (bucket_id = 'trip-photos');

-- CREATE POLICY "trip_photos_storage_insert" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'trip-photos' AND
--     auth.uid() IS NOT NULL
--   );

-- Enable Realtime on trip_photos
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_photos;
