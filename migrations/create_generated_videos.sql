-- ============================================
-- GENERATED VIDEOS TABLE for Flutter App Sync
-- ============================================
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS generated_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT DEFAULT 'unknown',
    image_edit_prompt TEXT,
    video_prompt TEXT,
    music_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read (for Flutter app to fetch videos)
CREATE POLICY "Allow public read" ON generated_videos
    FOR SELECT USING (true);

-- Allow insert from anon key (for pipeline to push videos)
CREATE POLICY "Allow insert" ON generated_videos
    FOR INSERT WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_generated_videos_created_at ON generated_videos(created_at DESC);

-- Grant permissions
GRANT SELECT, INSERT ON generated_videos TO anon;
GRANT SELECT, INSERT ON generated_videos TO authenticated;
