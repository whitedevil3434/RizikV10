const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yhwhkwveupjzrwdljivn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMjg3OCwiZXhwIjoyMDg3Nzg4ODc4fQ.cOMxhnL4BjvllMx5K2UNkfHUuhC3rVhzWWSIIBLWCDg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('🔍 Checking if tables exist...');
    const { data, error } = await supabase.from('user_usage').select('count', { count: 'exact', head: true });
    if (error) {
        console.log('❌ user_usage table does not exist or error:', error.message);
    } else {
        console.log('✅ user_usage table EXISTS!');
    }

    const { data: data2, error: error2 } = await supabase.from('rizik_order_records').select('trxid').limit(1);
    if (error2) {
        console.log('❌ trxid column does not exist:', error2.message);
    } else {
        console.log('✅ trxid column EXISTS!');
    }
}

check();
