import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.*)"/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*)"/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const sql = fs.readFileSync('../supabase/migrations/20260304185000_rizik_openclaw_comms.sql', 'utf8');

async function run() {
    console.log("Deploying rizik_openclaw_comms migration...");
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
        console.error("Migration failed:", error);
    } else {
        console.log("Migration applied successfully!");
    }
}

run();
