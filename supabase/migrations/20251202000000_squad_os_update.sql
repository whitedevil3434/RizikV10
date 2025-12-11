-- ==========================================
-- SQUAD OS UPDATE (Daily Roster Support)
-- ==========================================

-- 1. Update duty_rosters to support Daily Shifts
ALTER TABLE public.duty_rosters 
ADD COLUMN IF NOT EXISTS shifts JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS daily_capacity JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS date DATE;

-- 2. Make weekly columns optional (since we are moving to daily)
ALTER TABLE public.duty_rosters 
ALTER COLUMN week_start_date DROP NOT NULL,
ALTER COLUMN week_end_date DROP NOT NULL;

-- 3. Add Profit Pool support to Ledgers if needed (Enum update is hard in Postgres without transaction, so we just add it to the check constraint if it exists, or just use 'general' and name it 'Profit Pool')
-- Actually, the enum 'ledger_type' exists. We can try to add 'profit_pool' to it.
ALTER TYPE ledger_type ADD VALUE IF NOT EXISTS 'profit_pool';
