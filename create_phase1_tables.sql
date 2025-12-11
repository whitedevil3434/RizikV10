-- Phase 1 AI Tools - Database Tables Migration
-- Date: 2025-12-02
-- Purpose: Enable SafeDeal, Sourcing, and Delivery voice commands
-- UPDATED: Idempotent version (Safe to re-run)

-- ============================================
-- 1. SAFE DEALS TABLE (FB Marketplace Escrow)
-- ============================================
CREATE TABLE IF NOT EXISTS safe_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_code VARCHAR(20) UNIQUE NOT NULL,
    seller_id UUID NOT NULL REFERENCES user_profiles(id),
    seller_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    product_description TEXT,
    product_image_url TEXT,
    deal_amount DECIMAL(10, 2) NOT NULL CHECK (deal_amount >= 100 AND deal_amount <= 100000),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed', 'completed', 'cancelled', 'refunded')),
    buyer_id UUID REFERENCES user_profiles(id),
    buyer_name VARCHAR(255),
    buyer_contact VARCHAR(20),
    payment_method VARCHAR(20),
    paid_at TIMESTAMPTZ,
    delivery_confirmed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safe_deals_code ON safe_deals(deal_code);
CREATE INDEX IF NOT EXISTS idx_safe_deals_seller ON safe_deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_safe_deals_status ON safe_deals(status);

-- ============================================
-- 2. SOURCING SYSTEM (Product Finding)
-- ============================================

-- Sourcing Requests
CREATE TABLE IF NOT EXISTS sourcing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES user_profiles(id),
    squad_id UUID REFERENCES squads(id),
    product_name VARCHAR(500) NOT NULL,
    product_description TEXT,
    target_price DECIMAL(10, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT 10.0 CHECK (commission_percentage >= 5 AND commission_percentage <= 20),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'sourcing', 'verified', 'completed', 'cancelled')),
    deadline TIMESTAMPTZ,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sourcing Submissions
CREATE TABLE IF NOT EXISTS sourcing_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    sourcer_id UUID NOT NULL REFERENCES user_profiles(id),
    shop_name VARCHAR(255) NOT NULL,
    shop_location VARCHAR(500) NOT NULL,
    found_price DECIMAL(10, 2) NOT NULL,
    product_image_url TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    commission_earned DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sourcing Knowledge Cards (for reuse)
CREATE TABLE IF NOT EXISTS sourcing_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name VARCHAR(500) NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    shop_location VARCHAR(500) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quality_rating DECIMAL(3, 2) DEFAULT 3.0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
    verified_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sourcing_requests_requester ON sourcing_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_requests_status ON sourcing_requests(status);
CREATE INDEX IF NOT EXISTS idx_sourcing_submissions_request ON sourcing_submissions(request_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_knowledge_product ON sourcing_knowledge_base(product_name);

-- ============================================
-- 2.5 WALLET SYSTEM (Financials)
-- ============================================

CREATE TABLE IF NOT EXISTS user_wallets (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'BDT',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC for atomic balance updates
CREATE OR REPLACE FUNCTION increment_wallet_balance(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_wallets (user_id, balance)
    VALUES (p_user_id, p_amount)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = user_wallets.balance + p_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user UUID REFERENCES user_profiles(id), -- Null for system
    to_user UUID REFERENCES user_profiles(id),
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_wallets_select ON user_wallets;
CREATE POLICY user_wallets_select ON user_wallets FOR SELECT USING (auth.uid() = user_id);

-- Disable RLS for AI Agent (Temporary)
ALTER TABLE user_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;


-- ============================================
-- 3. DELIVERY CHAIN (Mover/Force Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES user_profiles(id),
    consumer_name VARCHAR(255) NOT NULL,
    consumer_contact VARCHAR(20) NOT NULL,
    
    -- Pickup
    pickup_location VARCHAR(500) NOT NULL,
    pickup_lat DECIMAL(10, 7) NOT NULL,
    pickup_lng DECIMAL(10, 7) NOT NULL,
    pickup_notes TEXT,
    
    -- Delivery
    delivery_location VARCHAR(500) NOT NULL,
    delivery_lat DECIMAL(10, 7) NOT NULL,
    delivery_lng DECIMAL(10, 7) NOT NULL,
    delivery_notes TEXT,
    
    -- Item
    item_description VARCHAR(500) NOT NULL,
    item_weight_kg DECIMAL(6, 2) NOT NULL,
    
    -- Pricing & Assignment
    delivery_type VARCHAR(10) CHECK (delivery_type IN ('light', 'heavy')),
    delivery_urgency VARCHAR(10) DEFAULT 'normal' CHECK (delivery_urgency IN ('normal', 'express')),
    base_price DECIMAL(10, 2) NOT NULL,
    urgency_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    total_price DECIMAL(10, 2) NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    
    mover_id UUID REFERENCES user_profiles(id),
    mover_name VARCHAR(255),
    mover_type VARCHAR(10) CHECK (mover_type IN ('mover', 'force')),
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
    current_lat DECIMAL(10, 7),
    current_lng DECIMAL(10, 7),
    
    -- Photos & Proof
    pickup_photo_url TEXT,
    delivery_photo_url TEXT,
    consumer_signature TEXT,
    
    -- Ratings
    consumer_rating DECIMAL(3, 2),
    consumer_review TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- FORCE UPDATE: Add columns if they are missing (for existing tables)
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS urgency_multiplier DECIMAL(3, 2) DEFAULT 1.0;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_delivery_orders_consumer ON delivery_orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_mover ON delivery_orders(mover_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_location ON delivery_orders(pickup_lat, pickup_lng);

-- ============================================
-- 4. UPDATE SQUADS TABLE (Add Capacity Status)
-- ============================================
ALTER TABLE squads ADD COLUMN IF NOT EXISTS capacity_status VARCHAR(10) DEFAULT 'OPEN' CHECK (capacity_status IN ('OPEN', 'BUSY', 'FULL'));

-- ============================================
-- GRANTS (Security)
-- ============================================
GRANT ALL ON safe_deals TO authenticated;
GRANT ALL ON sourcing_requests TO authenticated;
GRANT ALL ON sourcing_submissions TO authenticated;
GRANT ALL ON sourcing_knowledge_base TO authenticated;
GRANT ALL ON delivery_orders TO authenticated;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Safe Deals
ALTER TABLE safe_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS safe_deals_select ON safe_deals;
CREATE POLICY safe_deals_select ON safe_deals FOR SELECT USING (true);

DROP POLICY IF EXISTS safe_deals_insert ON safe_deals;
CREATE POLICY safe_deals_insert ON safe_deals FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS safe_deals_update ON safe_deals;
CREATE POLICY safe_deals_update ON safe_deals FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Sourcing
ALTER TABLE sourcing_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sourcing_requests_select ON sourcing_requests;
CREATE POLICY sourcing_requests_select ON sourcing_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS sourcing_requests_insert ON sourcing_requests;
CREATE POLICY sourcing_requests_insert ON sourcing_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

ALTER TABLE sourcing_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sourcing_submissions_select ON sourcing_submissions;
CREATE POLICY sourcing_submissions_select ON sourcing_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS sourcing_submissions_insert ON sourcing_submissions;
CREATE POLICY sourcing_submissions_insert ON sourcing_submissions FOR INSERT WITH CHECK (auth.uid() = sourcer_id);

-- Delivery
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS delivery_orders_select ON delivery_orders;
CREATE POLICY delivery_orders_select ON delivery_orders FOR SELECT USING (auth.uid() = consumer_id OR auth.uid() = mover_id);

DROP POLICY IF EXISTS delivery_orders_insert ON delivery_orders;
CREATE POLICY delivery_orders_insert ON delivery_orders FOR INSERT WITH CHECK (auth.uid() = consumer_id);

DROP POLICY IF EXISTS delivery_orders_update ON delivery_orders;
CREATE POLICY delivery_orders_update ON delivery_orders FOR UPDATE USING (auth.uid() = mover_id OR auth.uid() = consumer_id);

-- ============================================
-- 5. DISABLE RLS FOR AI AGENT ACCESS (Temporary Dev Fix)
-- ============================================
ALTER TABLE safe_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_knowledge_base DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. SEED DATA (Test User Funds)
-- ============================================
INSERT INTO user_wallets (user_id, balance, currency)
VALUES ('0b6ea9b7-6930-4273-b859-adeb23616dd3', 5000.00, 'BDT')
ON CONFLICT (user_id) DO UPDATE SET balance = user_wallets.balance + 5000.00;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Phase 1 AI Tools Tables Created Successfully!';
    RAISE NOTICE '📦 Tables: safe_deals, sourcing (3 tables), delivery_orders';
    RAISE NOTICE '🔓 Security: RLS Disabled for AI Agent access';
    RAISE NOTICE '💰 Seed: Added 5000 BDT to test wallet';
    RAISE NOTICE '🔧 Updated: squads.capacity_status';
END $$;
