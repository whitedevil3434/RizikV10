const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yhwhkwveupjzrwdljivn.supabase.co';
const supabaseKey = 'Kilo-Code@123'; // Using the master key/admin role if available

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('🚀 Starting migration...');

    // 1. Create user_usage table
    const { error: error1 } = await supabase.rpc('exec_sql', {
        sql: `
            CREATE TABLE IF NOT EXISTS public.user_usage (
                user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                free_uses_remaining INTEGER DEFAULT 3,
                paid_credits INTEGER DEFAULT 0,
                total_transformations INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    });
    if (error1) console.error('❌ Error 1:', error1);

    // 2. Add columns to rizik_order_records
    const { error: error2 } = await supabase.rpc('exec_sql', {
        sql: `
            ALTER TABLE public.rizik_order_records 
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
            ADD COLUMN IF NOT EXISTS trxid TEXT;
        `
    });
    if (error2) console.error('❌ Error 2:', error2);

    console.log('✅ Migration done!');
}

migrate();
