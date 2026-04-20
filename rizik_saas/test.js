const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
let url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*)"/)?.[1] || envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
let anonKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="(.*)"/)?.[1] || envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
let serviceKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*)"/)?.[1] || envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, serviceKey);

async function run() {
  let { data, error } = await supabase.from('user_usage').select('*');
  console.log('User Usage Table:', data);
  console.log('Error if any:', error);
}
run();
