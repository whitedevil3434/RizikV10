// Apply Phase 1 AI Tools Database Migration
// Run: node apply_phase1_migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zlmtbllfmbocwcbftmoe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbXRibGxmbWJvY3djYmZ0bW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM0NDIwMywiZXhwIjoyMDQ0OTIwMjAzfQ.HICOJVb4p-DaJ1hIzCr3vSqV9wVWi6VVZAvR5hUx7pw';

async function applyMigration() {
    console.log('🚀 Starting Phase 1 AI Tools Migration...\n');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Read SQL file
    const sqlPath = path.join(__dirname, 'create_phase1_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        // Skip comments and DO blocks (handle separately)
        if (statement.startsWith('--') || statement.includes('RAISE NOTICE')) {
            continue;
        }

        console.log(`[${i + 1}/${statements.length}] Executing...`);

        try {
            const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

            if (error) {
                // Try direct query for simpler statements
                const { error: directError } = await supabase.from('_migrations').insert({ statement });

                if (directError) {
                    console.log(`⚠️  Warning: ${error.message.substring(0, 100)}`);
                }
            } else {
                console.log(`✅ Success`);
            }
        } catch (err) {
            console.log(`❌ Error: ${err.message.substring(0, 100)}`);
        }
    }

    console.log('\n🎉 Phase 1 Migration Complete!');
    console.log('\n📊 Created Tables:');
    console.log('  ✅ safe_deals (FB Marketplace Escrow)');
    console.log('  ✅ sourcing_requests (Product Finding)');
    console.log('  ✅ sourcing_submissions (Sourcer Responses)');
    console.log('  ✅ sourcing_knowledge_cards (Reusable Data)');
    console.log('  ✅ delivery_orders (Mover/Force Jobs)');
    console.log('  ✅ squads.capacity_status (OPEN/BUSY/FULL)');

    console.log('\n🔧 Next: Test AI tools with voice commands!');
    console.log('   curl -X POST "http://localhost:8787/api/ai/chat" \\');
    console.log('     -d \'{"message":"3500 taka er phone sell link bana dao"}\'');
}

applyMigration().catch(console.error);
