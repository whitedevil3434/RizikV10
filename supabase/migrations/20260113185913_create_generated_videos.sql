-- Generated Videos Table for Flutter App Sync
-- Videos are stored in R2, this table stores metadata for app to fetch

CREATE TABLE IF NOT EXISTS generated_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT DEFAULT 'unknown',
    image_edit_prompt TEXT,
    video_prompt TEXT,
    music_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read (Flutter app can fetch videos)
CREATE POLICY "Allow public read" ON generated_videos
    FOR SELECT USING (true);

-- Allow insert from anon key (pipeline can push videos)
CREATE POLICY "Allow insert" ON generated_videos
    FOR INSERT WITH CHECK (true);

-- Index for faster queries by creation date
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at DESC);
