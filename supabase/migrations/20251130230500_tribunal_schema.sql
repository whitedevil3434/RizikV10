-- Phase 8: The Resilience Engine (Squad Tribunal)

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
    accused_user_id UUID REFERENCES auth.users(id),
    accuser_user_id UUID REFERENCES auth.users(id),
    duty_id UUID, -- Optional link to a specific duty/task
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'VOTING', -- VOTING, RESOLVED, DISMISSED
    penalty_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE dispute_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
    voter_user_id UUID REFERENCES auth.users(id),
    vote TEXT NOT NULL, -- GUILTY, INNOCENT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dispute_id, voter_user_id)
);

-- RLS Policies (Simplified for now)
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squad members can view disputes" ON disputes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM squad_members WHERE squad_id = disputes.squad_id
        )
    );

CREATE POLICY "Squad members can create disputes" ON disputes
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM squad_members WHERE squad_id = disputes.squad_id
        )
    );

CREATE POLICY "Squad members can view votes" ON dispute_votes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM squad_members WHERE squad_id = (SELECT squad_id FROM disputes WHERE id = dispute_votes.dispute_id)
        )
    );

CREATE POLICY "Squad members can vote" ON dispute_votes
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM squad_members WHERE squad_id = (SELECT squad_id FROM disputes WHERE id = dispute_votes.dispute_id)
        )
    );
