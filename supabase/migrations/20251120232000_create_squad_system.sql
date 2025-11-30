-- Rizik Squad System Schema Design
-- Based on 'all. idea and plan.md' and existing Dart models

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. User Profiles (Enhanced)
-- ==========================================
-- Extends the default auth.users or existing profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    
    -- Trust Score (Rizik Passport)
    trust_score FLOAT DEFAULT 50.0,
    
    -- Current Active Squad (for quick context switching)
    current_squad_id UUID, -- FK added later to avoid circular dependency
    
    -- Metadata for role-specific avatars and titles
    role_metadata JSONB DEFAULT '{}'::JSONB, -- { "consumer": {"avatar": "...", "title": "..."}, ... }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. Wallets (Unified System)
-- ==========================================
-- Supports both Personal (UnifiedWallet) and Squad (SharedWallet)
DO $$ BEGIN
    CREATE TYPE wallet_type AS ENUM ('personal', 'squad_shared', 'escrow');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type wallet_type NOT NULL,
    
    -- Owner Reference (Polymorphic-like)
    owner_user_id UUID REFERENCES public.user_profiles(id),
    owner_squad_id UUID, -- FK added later
    
    balance DECIMAL(12, 2) DEFAULT 0.00,
    locked_funds DECIMAL(12, 2) DEFAULT 0.00, -- For rent, escrow, etc.
    
    currency TEXT DEFAULT 'BDT',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_wallet_owner CHECK (
        (type = 'personal' AND owner_user_id IS NOT NULL AND owner_squad_id IS NULL) OR
        (type = 'squad_shared' AND owner_squad_id IS NOT NULL AND owner_user_id IS NULL) OR
        (type = 'escrow')
    )
);

-- ==========================================
-- 3. Squads
-- ==========================================
DO $$ BEGIN
    CREATE TYPE squad_type AS ENUM ('bachelor_mess', 'family', 'cloud_kitchen', 'mover_squad');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.squads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT,
    type squad_type NOT NULL,
    
    -- Ownership
    created_by UUID REFERENCES public.user_profiles(id),
    invite_code TEXT UNIQUE,
    
    -- Links
    wallet_id UUID REFERENCES public.wallets(id),
    
    -- Metrics
    trust_score FLOAT DEFAULT 50.0,
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Config
    metadata JSONB DEFAULT '{}'::JSONB, -- For custom settings
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add circular FKs
DO $$ BEGIN
    ALTER TABLE public.wallets ADD CONSTRAINT fk_wallet_squad FOREIGN KEY (owner_squad_id) REFERENCES public.squads(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.user_profiles ADD CONSTRAINT fk_profile_squad FOREIGN KEY (current_squad_id) REFERENCES public.squads(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 4. Squad Members
-- ==========================================
DO $$ BEGIN
    CREATE TYPE squad_role AS ENUM ('leader', 'chef', 'buyer', 'cutter', 'driver', 'helper', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.squad_members (
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    role squad_role NOT NULL DEFAULT 'member',
    
    -- Financials
    contribution_percentage FLOAT DEFAULT 0.0, -- For profit splitting
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Status
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    PRIMARY KEY (squad_id, user_id)
);

-- ==========================================
-- 5. Transactions
-- ==========================================
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'earning', 'expense', 'transfer', 'refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_source AS ENUM ('manual', 'order', 'salary', 'rent', 'utility');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id) NOT NULL,
    
    amount DECIMAL(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    
    -- Context
    performed_by_user_id UUID REFERENCES public.user_profiles(id),
    description TEXT,
    reference_id TEXT, -- External ID (e.g., Order ID)
    source transaction_source DEFAULT 'manual',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. Inventory & Recipes (Active Task Chain)
-- ==========================================

-- Inventory Items (Stock)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id) NOT NULL,
    
    name TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 0.0,
    unit TEXT NOT NULL, -- kg, liter, pcs
    
    min_threshold DECIMAL(10, 2), -- For auto-restock alerts
    avg_price DECIMAL(10, 2), -- Weighted average cost
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes (Standardization)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id), -- Can be null for global recipes
    
    name TEXT NOT NULL,
    output_quantity DECIMAL(10, 2) DEFAULT 1.0, -- e.g., 1 plate
    output_unit TEXT DEFAULT 'plate',
    
    instructions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Ingredients (Mapping)
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    inventory_item_name TEXT NOT NULL, -- Logical link to inventory items by name
    
    required_quantity DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    
    PRIMARY KEY (recipe_id, inventory_item_name)
);

-- ==========================================
-- 7. Khata (Dual-Mode)
-- ==========================================
DO $$ BEGIN
    CREATE TYPE khata_type AS ENUM ('mess', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.khata_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id) NOT NULL,
    
    type khata_type NOT NULL,
    
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    
    -- Links
    transaction_id UUID REFERENCES public.transactions(id),
    user_id UUID REFERENCES public.user_profiles(id), -- Who incurred this expense
    
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Categorization
    category TEXT, -- e.g., 'Food', 'Rent', 'Utility'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. Duty Roster
-- ==========================================
CREATE TABLE IF NOT EXISTS public.duty_roster (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id) NOT NULL,
    
    date DATE NOT NULL,
    
    -- Assignments
    chef_user_id UUID REFERENCES public.user_profiles(id),
    buyer_user_id UUID REFERENCES public.user_profiles(id),
    cleaner_user_id UUID REFERENCES public.user_profiles(id),
    
    is_completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(squad_id, date)
);

-- ==========================================
-- 9. Meal Toggles (Mill Hisab)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.meal_toggles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    squad_id UUID REFERENCES public.squads(id) NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    
    date DATE NOT NULL,
    
    breakfast BOOLEAN DEFAULT TRUE,
    lunch BOOLEAN DEFAULT TRUE,
    dinner BOOLEAN DEFAULT TRUE,
    
    guest_count INT DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(squad_id, user_id, date)
);
