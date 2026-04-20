const { Client } = require('pg');
const fs = require('fs');

const dbUrl = 'postgresql://postgres.yhwhkwveupjzrwdljivn:Kilo-Code%40123@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runSQL() {
    const sql = fs.readFileSync('/Users/sabbir/Downloads/RizikV10/supabase/decrement_user_credits.sql', 'utf8');
    
    console.log('🚀 Running credit decrement RPC migration...');
    try {
        await client.connect();
        console.log('Connected to Supabase!');
        await client.query(sql);
        console.log('✅ RPC Function created successfully.');
    } catch (err) {
        console.error('❌ Error details:', err.message);
    } finally {
        await client.end();
    }
}

runSQL();
