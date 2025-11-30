-- ==========================================
-- RIZIK V10 MASTER SCHEMA (The Foundation)
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USER PROFILES (The Passport)
-- ==========================================
CREATE TYPE user_role AS ENUM ('seeker', 'source', 'force', 'admin');

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    
    -- Identity & Trust (The Passport)
    role user_role DEFAULT 'seeker',
    trust_score FLOAT DEFAULT 50.0, -- 0.0 to 100.0
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Context
    current_squad_id UUID, -- FK to squads (added later to avoid circular dependency)
    
    -- Metadata (Biometrics, Preferences)
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. SQUADS (The Core Unit)
-- ==========================================
CREATE TYPE squad_type AS ENUM ('household', 'business', 'cloud_kitchen', 'mover_squad');

CREATE TABLE IF NOT EXISTS public.squads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type squad_type NOT NULL,
    
    -- Financial Core
    wallet_id UUID, -- Link to the Shared Wallet (Moneybag)
    
    -- Operational Config
    settings JSONB DEFAULT '{
        "allow_swaps": true,
        "require_mover_float": false,
        "auto_lock_funds": true
    }'::JSONB,
    
    -- Metrics
    reputation_score FLOAT DEFAULT 50.0,
    
    -- Viral Growth
    invite_code TEXT UNIQUE, -- e.g. "RZK-DHAKA-42"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circular Dependency Fix
ALTER TABLE public.user_profiles 
ADD CONSTRAINT fk_user_current_squad 
FOREIGN KEY (current_squad_id) REFERENCES public.squads(id);

-- ==========================================
-- 3. KHATA LEDGERS (The Accounting Hub)
-- ==========================================
CREATE TYPE ledger_type AS ENUM ('general', 'rent', 'utilities', 'food', 'project');

CREATE TABLE IF NOT EXISTS public.khata_ledgers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id) NOT NULL,
    
    name TEXT NOT NULL, -- e.g., "November Rent", "Daily Bazar"
    type ledger_type DEFAULT 'general',
    
    -- Financial State
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) DEFAULT 0.00,
    is_settled BOOLEAN DEFAULT FALSE,
    
    -- Linked Wallet (Tohobil)
    wallet_id UUID, -- Optional: Specific wallet for this ledger
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Individual transactions (khata_entries) would link to this ledger_id

-- ==========================================
-- 4. DUTY ROSTERS (The Operational Roster)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.duty_rosters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id) NOT NULL,
    
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- System 49: Swap Logic Support
    -- We store shifts and swaps as JSONB for maximum flexibility 
    -- or relational tables can be linked. For V10 Master Schema, 
    -- we define the container that holds the state.
    status TEXT DEFAULT 'active', -- active, archived
    
    -- Mover Float / Asset Links
    required_assets JSONB DEFAULT '[]'::JSONB, -- e.g., ["bike", "bag"]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(squad_id, week_start_date)
);

-- Supporting Table for System 49 (Explicitly requested logic support)
CREATE TYPE swap_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

CREATE TABLE IF NOT EXISTS public.duty_swaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    roster_id UUID REFERENCES public.duty_rosters(id) NOT NULL,
    
    requester_user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    target_user_id UUID REFERENCES public.user_profiles(id), -- Can be null if open to anyone
    
    shift_details JSONB NOT NULL, -- Date, Role, Time
    
    -- Financials (Paid Swap)
    offered_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_fee_locked BOOLEAN DEFAULT FALSE, -- Proof of "Financial Lock"
    
    status swap_status DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
