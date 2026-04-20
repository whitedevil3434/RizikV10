const { Client } = require('pg');

const dbUrl = 'postgresql://postgres.yhwhkwveupjzrwdljivn:Kilo-Code@123@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString: dbUrl,
});

async function checkTrigger() {
    console.log('🔍 Checking if trigger exists...');
    try {
        await client.connect();
        const res = await client.query(`
            SELECT trigger_name 
            FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created_writer';
        `);
        if (res.rows.length > 0) {
            console.log('✅ Trigger EXISTS!');
        } else {
            console.log('❌ Trigger DOES NOT EXIST.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTrigger();
