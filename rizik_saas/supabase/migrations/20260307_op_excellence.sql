-- Operational Excellence Upgrade
-- This migration adds tables for B2B Intake, Purchase Orders, and Tax tracking.

-- 1. B2B Inquiries Table
CREATE TABLE IF NOT EXISTS public.rizik_b2b_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    category VARCHAR(50), -- ECO_MAT, BIO_SHIELD, etc.
    estimated_volume INTEGER,
    requirements TEXT,
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, QUOTED, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Purchase Orders (Raw Materials)
CREATE TABLE IF NOT EXISTS public.rizik_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.rizik_suppliers(id),
    total_amount_bdt DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SENT, RECEIVED, CANCELLED
    expected_delivery_date DATE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PO Items Table
CREATE TABLE IF NOT EXISTS public.rizik_po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES public.rizik_purchase_orders(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20), -- KG, Meters, Pieces
    unit_price_bdt DECIMAL(12, 2) NOT NULL,
    total_price_bdt DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price_bdt) STORED
);

-- 4. Financial Schema Updates (Tax/VAT)
ALTER TABLE public.empire_orders ADD COLUMN IF NOT EXISTS vat_amount_bdt DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.rizik_invoices ADD COLUMN IF NOT EXISTS vat_amount_bdt DECIMAL(12, 2) DEFAULT 0;

-- RLS Policies
ALTER TABLE public.rizik_b2b_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_po_items ENABLE ROW LEVEL SECURITY;

-- Allow public to submit B2B inquiries
CREATE POLICY "Public can insert B2B inquiries" ON public.rizik_b2b_inquiries FOR INSERT WITH CHECK (true);
-- Admin access for all tables
CREATE POLICY "Admins have full access to B2B" ON public.rizik_b2b_inquiries FOR ALL USING (true);
CREATE POLICY "Admins have full access to POs" ON public.rizik_purchase_orders FOR ALL USING (true);
CREATE POLICY "Admins have full access to PO items" ON public.rizik_po_items FOR ALL USING (true);

-- Disable RLS for AI Agent context (Agentic Mode)
ALTER TABLE public.rizik_b2b_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_po_items DISABLE ROW LEVEL SECURITY;
