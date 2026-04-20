const { Client } = require('pg');

// SESSION MODE (Port 5432) or DIRECT DB HOST
// Try common Supabase direct host pattern
const host = 'db.yhwhkwveupjzrwdljivn.supabase.co';
const dbUrl = `postgresql://postgres.yhwhkwveupjzrwdljivn:Kilo-Code@123@${host}:5432/postgres`;

const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🚀 Starting migration (Direct DB Host)...');
    try {
        await client.connect();
        console.log('Connected!');

        console.log('Creating user_usage table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.user_usage (
                user_id UUID PRIMARY KEY,
                free_uses_remaining INTEGER DEFAULT 3,
                paid_credits INTEGER DEFAULT 0,
                total_transformations INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('Adding columns to rizik_order_records...');
        await client.query(`
            ALTER TABLE public.rizik_order_records 
            ADD COLUMN IF NOT EXISTS user_id UUID,
            ADD COLUMN IF NOT EXISTS trxid TEXT;
        `);

        // Check if constraints exist manually to avoid errors if they do
        console.log('Adding foreign keys...');
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_usage_auth') THEN
                    ALTER TABLE public.user_usage ADD CONSTRAINT fk_user_usage_auth FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_auth') THEN
                    ALTER TABLE public.rizik_order_records ADD CONSTRAINT fk_orders_auth FOREIGN KEY (user_id) REFERENCES auth.users(id);
                END IF;
            END $$;
        `);

        console.log('Setting up trigger...');
        await client.query(`
            CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO public.user_usage (user_id)
                VALUES (NEW.id)
                ON CONFLICT (user_id) DO NOTHING;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        
        await client.query(`
            DROP TRIGGER IF EXISTS on_auth_user_created_writer ON auth.users;
            CREATE TRIGGER on_auth_user_created_writer
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();
        `);

        console.log('✅ Status: Database schema updated successfully.');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
