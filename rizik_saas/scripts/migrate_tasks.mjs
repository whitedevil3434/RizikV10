import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing credentials');
    process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY);

async function migrate() {
    const query = `
    ALTER TABLE public.rizik_employee_tasks ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES public.user_profiles(id);
    ALTER TABLE public.rizik_employee_tasks ADD COLUMN IF NOT EXISTS assigned_by_id UUID REFERENCES public.user_profiles(id);
    `;

    // We try to use the exec_sql RPC which is often set up in these templates
    const { error } = await db.rpc('exec_sql', { query });

    if (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }

    console.log('Migration successful: Individual task assignment columns added.');
}

migrate();
