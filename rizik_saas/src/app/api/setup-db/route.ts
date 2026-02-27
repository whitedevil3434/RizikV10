import { createAdminClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

/**
 * API Route: /api/setup-db
 * Deploys the Rizik Empire + Ecosystem SQL schema to Supabase.
 * Uses the service role key to bypass RLS and create tables.
 * Call this ONCE during initial setup, then disable.
 */
export async function GET() {
    try {
        const supabase = createAdminClient();

        // Step 1: Create empire_products table
        const { error: productsError } = await supabase.rpc('exec_sql', {
            query: `
        CREATE TABLE IF NOT EXISTS public.empire_products (
          product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sku VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(50) NOT NULL,
          description TEXT,
          base_price_bdt DECIMAL(12, 2) NOT NULL,
          minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
          image_url TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        // If RPC doesn't exist, we'll seed via direct insert
        // Step 2: Seed products (always safe with ON CONFLICT)
        const products = [
            {
                sku: 'MAT-GLOW-01',
                name: 'Barishal Eco Pray Mat - Glow Series',
                category: 'ECO_MAT',
                description: '100% Biodegradable, Night-Glow ink, Taraweeh optimized. Decomposes into natural fertilizer.',
                base_price_bdt: 150.00,
                minimum_order_quantity: 1,
                image_url: '/products/glow-mat.jpg',
                is_active: true,
            },
            {
                sku: 'MAT-SCENT-01',
                name: 'Barishal Eco Pray Mat - Oud Infused',
                category: 'ECO_MAT',
                description: '100% Biodegradable with chemically bonded Oud & Jasmine scent. Premium sensory prayer experience.',
                base_price_bdt: 120.00,
                minimum_order_quantity: 1,
                image_url: '/products/oud-mat.jpg',
                is_active: true,
            },
            {
                sku: 'MAT-STANDARD-01',
                name: 'Barishal Eco Pray Mat - Classic',
                category: 'ECO_MAT',
                description: 'The original 100% biodegradable non-woven prayer mat. Affordable and planet-friendly.',
                base_price_bdt: 50.00,
                minimum_order_quantity: 1,
                image_url: '/products/classic-mat.jpg',
                is_active: true,
            },
            {
                sku: 'BIO-VEG-01',
                name: 'Bio-Shield Matrix - Vegetable Membrane',
                category: 'BIO_SHIELD',
                description: '30 GSM + 20 Micron LDPE. 15-day shelf life for perishables. Non-woven base with chitosan layer.',
                base_price_bdt: 25.00,
                minimum_order_quantity: 500,
                image_url: '/products/bio-veg.jpg',
                is_active: true,
            },
            {
                sku: 'BIO-SPICE-01',
                name: 'Bio-Shield Matrix - Raw Spice Pouch',
                category: 'BIO_SHIELD',
                description: '50 GSM + Standard LDPE. 6-month preservation for raw spices. Oxygen barrier technology.',
                base_price_bdt: 45.00,
                minimum_order_quantity: 500,
                image_url: '/products/bio-spice.jpg',
                is_active: true,
            },
            {
                sku: 'BIO-RETORT-V1',
                name: 'Bio-Shield Retort Pouch (1yr)',
                category: 'BIO_SHIELD',
                description: '80 GSM + 50 Micron Thick LDPE. God Mode preservation (121°C). Zero refrigeration for 1 year.',
                base_price_bdt: 85.00,
                minimum_order_quantity: 500,
                image_url: '/products/bio-retort.jpg',
                is_active: true,
            },
        ];

        const { data, error: seedError } = await supabase
            .from('empire_products')
            .upsert(products, { onConflict: 'sku' })
            .select();

        if (seedError) {
            return NextResponse.json({
                status: 'partial',
                message: 'Table may not exist yet. Please run the SQL in Supabase Dashboard first.',
                error: seedError.message,
                hint: 'Go to supabase.com/dashboard → SQL Editor → paste create_empire_tables.sql and run it.',
            }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            message: `Seeded ${data?.length || 0} products into empire_products.`,
            products: data,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ status: 'error', error: message }, { status: 500 });
    }
}
