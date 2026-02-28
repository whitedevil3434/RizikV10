export const runtime = 'edge';

import { createAdminClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

/**
 * API Route: /api/setup-db
 * Deploys the Rizik product catalog SQL schema to Supabase.
 * Uses the service role key to bypass RLS and create tables.
 * Restricted bootstrap endpoint. Use only during controlled setup.
 */
function getSetupKeyFromRequest(request: Request): string {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
        return authHeader.slice(7).trim();
    }
    return (request.headers.get("x-setup-key") || "").trim();
}

function isLocalDevelopmentRequest(request: Request): boolean {
    const url = new URL(request.url);
    return (
        process.env.NODE_ENV !== "production" &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
}

function isSetupRequestAuthorized(request: Request): boolean {
    const configuredSetupKey = (process.env.SETUP_DB_KEY || "").trim();
    const providedKey = getSetupKeyFromRequest(request);
    const allowUnsafeLocal = process.env.ALLOW_SETUP_DB_WITHOUT_KEY === "true";

    if (configuredSetupKey) {
        return providedKey.length > 0 && providedKey === configuredSetupKey;
    }

    // Opt-in local fallback only when explicitly enabled.
    return allowUnsafeLocal && isLocalDevelopmentRequest(request);
}

async function runSetup() {
    try {
        const supabase = createAdminClient();

        // Step 1: Create product catalog table
        await supabase.rpc('exec_sql', {
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
                description: 'Active packaging program for short-cycle produce distribution and safer handling.',
                base_price_bdt: 25.00,
                minimum_order_quantity: 500,
                image_url: '/products/bio-veg.jpg',
                is_active: true,
            },
            {
                sku: 'BIO-SPICE-01',
                name: 'Bio-Shield Matrix - Raw Spice Pouch',
                category: 'BIO_SHIELD',
                description: 'Moisture-managed packaging program for dry goods and spice supply chains.',
                base_price_bdt: 45.00,
                minimum_order_quantity: 500,
                image_url: '/products/bio-spice.jpg',
                is_active: true,
            },
            {
                sku: 'BIO-RETORT-V1',
                name: 'Bio-Shield Retort Pouch (1yr)',
                category: 'BIO_SHIELD',
                description: 'High-barrier packaging program for extended cooked-food logistics.',
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
                hint: 'Go to supabase.com/dashboard -> SQL Editor -> paste your table SQL and run it.',
            }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            message: `Seeded ${data?.length || 0} products into the catalog table.`,
            products_seeded: data?.length || 0,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ status: 'error', error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!isSetupRequestAuthorized(request)) {
        return NextResponse.json(
            {
                status: "forbidden",
                message: "Setup endpoint is restricted.",
                hint: "Set SETUP_DB_KEY and provide it via Authorization: Bearer <key> or x-setup-key header.",
            },
            { status: 403 }
        );
    }

    return runSetup();
}

export async function GET() {
    return NextResponse.json(
        {
            status: "method_not_allowed",
            message: "Use POST for this endpoint.",
        },
        { status: 405 }
    );
}
