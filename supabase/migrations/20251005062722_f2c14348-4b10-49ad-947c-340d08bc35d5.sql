-- Performance indexes for common queries
-- If these objects already exist, these statements will no-op in most managed environments when run once.
-- Adjust table/column names if your schema differs.

-- Notes listing by author and recency
CREATE INDEX IF NOT EXISTS notes_author_created_at_idx ON notes (author_id, created_at DESC);

-- Notes filtering by subject/tag (replace `subject` if your column is named differently)
CREATE INDEX IF NOT EXISTS notes_subject_idx ON notes (subject);

-- Fast recent notes
CREATE INDEX IF NOT EXISTS notes_created_at_desc_idx ON notes (created_at DESC);
-- Create profiles table for public user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  tags TEXT[],
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Everyone can view notes
CREATE POLICY "Notes are viewable by everyone"
ON public.notes
FOR SELECT
USING (true);

-- Users can insert their own notes
CREATE POLICY "Users can insert own notes"
ON public.notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notes_download_count ON public.notes(download_count DESC);
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);

-- Create storage bucket for notes
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true);

-- Storage policies for notes bucket
CREATE POLICY "Anyone can view notes files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'notes');

CREATE POLICY "Authenticated users can upload notes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'notes' 
  AND auth.role() = 'authenticated'
);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();