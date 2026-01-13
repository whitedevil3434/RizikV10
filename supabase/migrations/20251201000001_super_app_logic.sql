-- Super App Logic Injection Schema Updates

-- 1. Rizik Rents: Recurring Payments
ALTER TABLE khata_ledgers 
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- Index for faster cron queries
CREATE INDEX IF NOT EXISTS idx_khata_ledgers_next_payment ON khata_ledgers(next_payment_date) WHERE status = 'recurring';

-- 2. Squad Tribunal: Time Limits
ALTER TABLE disputes 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');

-- Index for faster cron queries
CREATE INDEX IF NOT EXISTS idx_disputes_expires_at ON disputes(expires_at) WHERE status = 'OPEN';

-- 3. Academic Gigs: Student Verification
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_verified_student BOOLEAN DEFAULT FALSE;

-- 4. Dark Economy: Mission Metadata (JSONB already exists in duty_rosters, just ensuring structure via comments)
-- duty_rosters.metadata will hold { "type": "line_standing", "proof_required": true }
