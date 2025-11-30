import { createClient } from '@supabase/supabase-js'

// Credentials found in test_supabase_crud.js
const SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
const SUPABASE_KEY = 'sbp_279856121fdba35b343f21605230bf549d11e482'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
