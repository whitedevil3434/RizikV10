import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing credentials');
    process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY);

async function migrate() {
    console.log('🚀 Running SDUI Migration...');

    const query = `
    CREATE TABLE IF NOT EXISTS public.rizik_sdui_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        screen_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        root JSONB NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Seed a sample screen for debugging
    INSERT INTO public.rizik_sdui_configs (screen_id, title, root)
    VALUES (
        'home_sd',
        'Rizik Hub',
        '{
            "type": "column",
            "props": {"padding": 16, "crossAlign": "start"},
            "children": [
                {
                    "type": "text",
                    "props": {"text": "Welcome to Rizik V10", "size": 24, "weight": 600}
                },
                {
                    "type": "gap",
                    "props": {"h": 16}
                },
                {
                    "type": "card",
                    "props": {"padding": 24},
                    "children": [
                        {
                            "type": "column",
                            "props": {"crossAlign": "start"},
                            "children": [
                                {
                                    "type": "text",
                                    "props": {"text": "Operational Status", "size": 16, "weight": 600}
                                },
                                {
                                    "type": "gap",
                                    "props": {"h": 8}
                                },
                                {
                                    "type": "text",
                                    "props": {"text": "All systems nominal. Hub 01 active.", "size": 14, "color": "#00B16A"}
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "gap",
                    "props": {"h": 24}
                },
                {
                    "type": "button",
                    "props": {"label": "Start New Batch", "action": "nav_production"}
                }
            ]
        }'::jsonb
    ) ON CONFLICT (screen_id) DO NOTHING;
    `;

    // We'll try dynamic import for a simpler script if possible, or just use the existing setup
    // Since I'm in the SaaS root, I can use the existing node_modules
    const { error } = await db.rpc('exec_sql', { query });

    if (error) {
        console.error('Migration failed:', error.message);
        // If exec_sql fails, we might need the user to run it in the SQL editor
        console.info('Please run the following SQL in your Supabase SQL Editor manually if the RPC fails:');
        console.info(query);
        process.exit(1);
    }

    console.log('✅ SDUI Configs table created and seeded.');
}

migrate();
