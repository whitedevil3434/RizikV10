-- Migration: rizik_openclaw_comms
-- Create a table for real-time 2-way communication between the Web UI, Antigravity, and the local OpenClaw Python Agent

CREATE TYPE message_sender AS ENUM ('USER', 'OPENCLAW', 'ANTIGRAVITY');
CREATE TYPE message_type AS ENUM ('COMMAND', 'LOG', 'ERROR', 'SUCCESS', 'CHAT');

CREATE TABLE public.rizik_openclaw_comms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender message_sender NOT NULL,
    msg_type message_type NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.rizik_openclaw_comms ENABLE ROW LEVEL SECURITY;

-- Allow Admins full access
CREATE POLICY "Admins have full access to openclaw comms"
    ON public.rizik_openclaw_comms
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.rizik_employees
            WHERE auth_id = auth.uid()
            AND role IN ('SUPER_ADMIN', 'PRODUCTION_MANAGER', 'LOGISTICS_MANAGER')
        )
    );

-- Allow OpenClaw (via Service Role API Key) to read/write.
-- Service Role bypasses RLS by default, but this keeps the logic explicit.

-- Enable Realtime for the table so the UI can subscribe to active loops
ALTER PUBLICATION supabase_realtime ADD TABLE public.rizik_openclaw_comms;

-- Create an index for faster querying by time
CREATE INDEX idx_openclaw_comms_created_at ON public.rizik_openclaw_comms (created_at DESC);
