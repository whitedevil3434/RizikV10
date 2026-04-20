const { Client } = require('pg');

const dbUrl = 'postgresql://postgres.yhwhkwveupjzrwdljivn:Kilo-Code@123@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    console.log('🚀 Final attempt via PG Pooler (Port 6543) with SSL Override...');
    try {
        await client.connect();
        console.log('Connected to Supabase!');

        console.log('Executing multi-query DDL...');
        await client.query(`
            -- Table to track Rizik Writer usage
            CREATE TABLE IF NOT EXISTS public.user_usage (
                user_id UUID PRIMARY KEY,
                free_uses_remaining INTEGER DEFAULT 3,
                paid_credits INTEGER DEFAULT 0,
                total_transformations INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Sync columns in orders
            ALTER TABLE public.rizik_order_records 
            ADD COLUMN IF NOT EXISTS user_id UUID,
            ADD COLUMN IF NOT EXISTS trxid TEXT;

            -- Foreign keys
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_usage_auth_v5') THEN
                    ALTER TABLE public.user_usage ADD CONSTRAINT fk_user_usage_auth_v5 FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_auth_v5') THEN
                    ALTER TABLE public.rizik_order_records ADD CONSTRAINT fk_orders_auth_v5 FOREIGN KEY (user_id) REFERENCES auth.users(id);
                END IF;
            END $$;

            -- Trigger handles
            CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO public.user_usage (user_id)
                VALUES (NEW.id)
                ON CONFLICT (user_id) DO NOTHING;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;

            DROP TRIGGER IF EXISTS on_auth_user_created_writer ON auth.users;
            CREATE TRIGGER on_auth_user_created_writer
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();
        `);

        console.log('✅ Status: Migration successful via pooling.');
    } catch (err) {
        console.error('❌ Error details:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
