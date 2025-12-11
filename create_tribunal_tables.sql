-- Tribunal System Tables

-- 1. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL, -- References squads(id) but keeping loose for now
    accused_user_id UUID NOT NULL, -- References user_profiles(id)
    accuser_user_id UUID NOT NULL, -- References user_profiles(id)
    reason TEXT NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'OPEN', -- OPEN, RESOLVED, EXPIRED
    metadata JSONB DEFAULT '{}',
    penalty_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- 2. Dispute Votes Table
CREATE TABLE IF NOT EXISTS dispute_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
    voter_user_id UUID NOT NULL,
    vote TEXT NOT NULL, -- GUILTY, INNOCENT
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dispute_id, voter_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_squad ON disputes(squad_id);
CREATE INDEX IF NOT EXISTS idx_disputes_accused ON disputes(accused_user_id);
CREATE INDEX IF NOT EXISTS idx_dispute_votes_dispute ON dispute_votes(dispute_id);

-- Disable RLS for AI Agent Access (Temporary)
ALTER TABLE disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_votes DISABLE ROW LEVEL SECURITY;

-- Explicitly GRANT permissions
GRANT ALL ON disputes TO anon, authenticated, service_role;
GRANT ALL ON dispute_votes TO anon, authenticated, service_role;

-- Seed Mock Dispute (so we don't have to do it manually)
INSERT INTO disputes (id, squad_id, accused_user_id, accuser_user_id, reason, amount, status, metadata)
VALUES (
    'd15a07e1-1234-4567-89ab-cdef01234567', -- Valid UUID (hex only, no 'p')
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '0b6ea9b7-6930-4273-b859-adeb23616dd3', -- Accused (Test User)
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Accuser (Squad/System)
    'Broken Laptop Screen',
    5000,
    'OPEN',
    '{"evidence_url": "http://broken-screen.jpg"}'
) ON CONFLICT (id) DO NOTHING;
