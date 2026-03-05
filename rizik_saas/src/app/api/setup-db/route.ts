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
          image_alt TEXT,
          brand_family TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });

        // If RPC doesn't exist, we'll seed via direct insert
        // Step 2: Seed products (always safe with ON CONFLICT)
        const products = [
            {
                sku: 'MAT-DESERT-SKY-01',
                name: 'Rizik Safar Mat - Desert Sky Edition',
                category: 'ECO_MAT',
                description: 'Foldable travel prayer mat with geometric weave and enterprise-grade packaging.',
                base_price_bdt: 690.00,
                minimum_order_quantity: 1,
                image_url: '/products/variants/safar-desert-sky.svg',
                image_alt: 'Rizik Safar Mat Desert Sky Edition folded variant',
                brand_family: 'Rizik EcoMat',
                is_active: true,
            },
            {
                sku: 'MAT-MIDNIGHT-EM-01',
                name: 'Rizik Safar Mat - Midnight Emerald',
                category: 'ECO_MAT',
                description: 'Premium portable mat variant for retail and gifting channels.',
                base_price_bdt: 790.00,
                minimum_order_quantity: 1,
                image_url: '/products/variants/safar-midnight-emerald.svg',
                image_alt: 'Rizik Safar Mat Midnight Emerald folded variant',
                brand_family: 'Rizik EcoMat',
                is_active: true,
            },
            {
                sku: 'MAT-SANDSTONE-01',
                name: 'Rizik Safar Mat - Sandstone Weave',
                category: 'ECO_MAT',
                description: 'Lightweight travel-ready mat with neutral palette and compact fold profile.',
                base_price_bdt: 650.00,
                minimum_order_quantity: 1,
                image_url: '/products/variants/safar-sandstone.svg',
                image_alt: 'Rizik Safar Mat Sandstone folded variant',
                brand_family: 'Rizik EcoMat',
                is_active: true,
            },
            {
                sku: 'MAT-GRAMIN-IND-01',
                name: 'Rizik Gramin Mat - Indigo Mandala',
                category: 'ECO_MAT',
                description: 'Cultural pattern mat line inspired by gramin craft geometry.',
                base_price_bdt: 920.00,
                minimum_order_quantity: 1,
                image_url: '/products/variants/gramin-mandala-indigo.svg',
                image_alt: 'Rizik Gramin Mat Indigo Mandala pattern',
                brand_family: 'Rizik Textile',
                is_active: true,
            },
            {
                sku: 'MAT-GRAMIN-RUST-01',
                name: 'Rizik Gramin Mat - Rust Mandala',
                category: 'ECO_MAT',
                description: 'Warm-tone mandala line for youth and community campaign gifting.',
                base_price_bdt: 920.00,
                minimum_order_quantity: 1,
                image_url: '/products/variants/gramin-mandala-rust.svg',
                image_alt: 'Rizik Gramin Mat Rust Mandala pattern',
                brand_family: 'Rizik Textile',
                is_active: true,
            },
            {
                sku: 'BIO-LEAF-CANVAS-01',
                name: 'Rizik BioShield - Eco Leaf Canvas Wrap',
                category: 'BIO_SHIELD',
                description: 'Bio-based wrap material for food and retail packaging operations.',
                base_price_bdt: 180.00,
                minimum_order_quantity: 500,
                image_url: '/products/variants/eco-leaf-canvas.svg',
                image_alt: 'Rizik BioShield Eco Leaf Canvas packaging variant',
                brand_family: 'Rizik BioShield',
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
