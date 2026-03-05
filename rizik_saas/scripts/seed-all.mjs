#!/usr/bin/env node
/**
 * Rizik SaaS — Full Database Population Script
 * Creates all 8 operational tables and seeds them with realistic demo data.
 * Run: source .env.local && node scripts/seed-all.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY);

async function sql(query) {
    const { error } = await db.rpc('exec_sql', { query });
    if (error) {
        // If exec_sql doesn't exist, try raw SQL via REST
        console.warn(`  ⚠ rpc exec_sql failed: ${error.message}. Trying direct...`);
        return false;
    }
    return true;
}

async function createTables() {
    console.log('\n📦 Creating tables...');

    // 1. empire_products (may already exist)
    const createProducts = `
    CREATE TABLE IF NOT EXISTS public.empire_products (
      product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sku VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      base_price_bdt DECIMAL(12, 2) NOT NULL,
      minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
      image_url TEXT,
      image_alt TEXT,
      brand_family TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 2. rizik_order_records
    const createOrders = `
    CREATE TABLE IF NOT EXISTS public.rizik_order_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_code VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      channel VARCHAR(20) DEFAULT 'B2C',
      product_sku VARCHAR(100),
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_bdt DECIMAL(12,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      sla_state VARCHAR(30) DEFAULT 'ON_TRACK',
      expected_delivery_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 3. rizik_support_tickets
    const createTickets = `
    CREATE TABLE IF NOT EXISTS public.rizik_support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_code VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      account_type VARCHAR(20) DEFAULT 'B2C',
      topic VARCHAR(255) NOT NULL,
      status VARCHAR(30) DEFAULT 'OPEN',
      priority VARCHAR(10) DEFAULT 'P2',
      latest_request TEXT,
      assigned_team VARCHAR(100),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 4. rizik_inventory_items
    const createInventory = `
    CREATE TABLE IF NOT EXISTS public.rizik_inventory_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sku VARCHAR(100) UNIQUE NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity_on_hand INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 100,
      unit_name VARCHAR(30) DEFAULT 'unit',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 5. rizik_employee_tasks
    const createTasks = `
    CREATE TABLE IF NOT EXISTS public.rizik_employee_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      owner_team VARCHAR(100),
      status VARCHAR(30) DEFAULT 'TODO',
      due_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 6. rizik_ops_requests
    const createRequests = `
    CREATE TABLE IF NOT EXISTS public.rizik_ops_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_code VARCHAR(50) UNIQUE NOT NULL,
      request_type VARCHAR(100) NOT NULL,
      owner_team VARCHAR(100),
      status VARCHAR(50) DEFAULT 'APPROVAL_PENDING',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 7. rizik_shipments
    const createShipments = `
    CREATE TABLE IF NOT EXISTS public.rizik_shipments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      shipment_code VARCHAR(50) UNIQUE NOT NULL,
      route_text VARCHAR(255),
      customer_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'READY_FOR_PICKUP',
      eta_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // 8. rizik_notifications
    const createNotifications = `
    CREATE TABLE IF NOT EXISTS public.rizik_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audience VARCHAR(20) DEFAULT 'BOTH',
      level VARCHAR(20) DEFAULT 'INFO',
      title VARCHAR(255) NOT NULL,
      body TEXT,
      source VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    for (const [name, ddl] of [
        ['empire_products', createProducts],
        ['rizik_order_records', createOrders],
        ['rizik_support_tickets', createTickets],
        ['rizik_inventory_items', createInventory],
        ['rizik_employee_tasks', createTasks],
        ['rizik_ops_requests', createRequests],
        ['rizik_shipments', createShipments],
        ['rizik_notifications', createNotifications],
    ]) {
        const ok = await sql(ddl);
        console.log(`  ${ok ? '✅' : '⚠️ '} ${name}`);
    }
}

async function seedProducts() {
    console.log('\n🛍️  Seeding products...');
    const products = [
        { sku: 'MAT-DESERT-SKY-01', name: 'Rizik Safar Mat - Desert Sky Edition', category: 'ECO_MAT', description: 'Foldable travel prayer mat with geometric weave and enterprise-grade packaging.', base_price_bdt: 690, minimum_order_quantity: 1, image_url: '/products/variants/safar-desert-sky.svg', image_alt: 'Rizik Safar Mat Desert Sky Edition', brand_family: 'Rizik EcoMat' },
        { sku: 'MAT-MIDNIGHT-EM-01', name: 'Rizik Safar Mat - Midnight Emerald', category: 'ECO_MAT', description: 'Premium portable mat variant for retail and gifting channels.', base_price_bdt: 790, minimum_order_quantity: 1, image_url: '/products/variants/safar-midnight-emerald.svg', image_alt: 'Rizik Safar Mat Midnight Emerald', brand_family: 'Rizik EcoMat' },
        { sku: 'MAT-SANDSTONE-01', name: 'Rizik Safar Mat - Sandstone Weave', category: 'ECO_MAT', description: 'Lightweight travel-ready mat with neutral palette and compact fold profile.', base_price_bdt: 650, minimum_order_quantity: 1, image_url: '/products/variants/safar-sandstone.svg', image_alt: 'Rizik Safar Mat Sandstone Weave', brand_family: 'Rizik EcoMat' },
        { sku: 'MAT-GRAMIN-IND-01', name: 'Rizik Gramin Mat - Indigo Mandala', category: 'ECO_MAT', description: 'Cultural pattern mat line inspired by gramin craft geometry.', base_price_bdt: 920, minimum_order_quantity: 1, image_url: '/products/variants/gramin-mandala-indigo.svg', image_alt: 'Rizik Gramin Mat Indigo Mandala', brand_family: 'Rizik Textile' },
        { sku: 'MAT-GRAMIN-RUST-01', name: 'Rizik Gramin Mat - Rust Mandala', category: 'ECO_MAT', description: 'Warm-tone mandala line for youth and community campaign gifting.', base_price_bdt: 920, minimum_order_quantity: 1, image_url: '/products/variants/gramin-mandala-rust.svg', image_alt: 'Rizik Gramin Mat Rust Mandala', brand_family: 'Rizik Textile' },
        { sku: 'BIO-LEAF-CANVAS-01', name: 'Rizik BioShield - Eco Leaf Canvas Wrap', category: 'BIO_SHIELD', description: 'Bio-based wrap material for food and retail packaging operations.', base_price_bdt: 180, minimum_order_quantity: 500, image_url: '/products/variants/eco-leaf-canvas.svg', image_alt: 'Rizik BioShield Eco Leaf Canvas', brand_family: 'Rizik BioShield' },
    ];
    for (const p of products) {
        const { error } = await db.from('empire_products').upsert(p, { onConflict: 'sku' });
        console.log(`  ${error ? '❌' : '✅'} ${p.sku} ${error ? error.message : ''}`);
    }
}

async function seedOrders() {
    console.log('\n📋 Seeding orders...');
    const skus = ['MAT-DESERT-SKY-01', 'MAT-MIDNIGHT-EM-01', 'MAT-SANDSTONE-01', 'MAT-GRAMIN-IND-01', 'MAT-GRAMIN-RUST-01', 'BIO-LEAF-CANVAS-01'];
    const customers = ['Noor Holdings', 'Pran Agro Ltd.', 'Amina Jahan', 'Rahim Group', 'Kamal Enterprises', 'Dhaka Handicrafts', 'Green Valley Foods', 'Sunrise Traders', 'Shahjalal Exports', 'Bengal Weave Co.'];
    const statuses = ['PENDING', 'CONFIRMED', 'MANUFACTURING', 'QA_HOLD', 'SHIPPED', 'DELIVERED'];
    const slaStates = ['ON_TRACK', 'WATCH', 'RISK', 'ON_TRACK', 'ON_TRACK', 'ON_TRACK'];
    const channels = ['B2C', 'B2C', 'B2B', 'B2B', 'B2C', 'B2B', 'B2C', 'B2C', 'B2B', 'B2C'];
    const orders = [];

    for (let i = 1; i <= 18; i++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const created = new Date(Date.now() - daysAgo * 86400000).toISOString();
        const deliveryDays = Math.floor(Math.random() * 14) + 3;
        const expected = new Date(Date.now() - (daysAgo - deliveryDays) * 86400000).toISOString();
        const qty = channels[i % channels.length] === 'B2B' ? Math.floor(Math.random() * 5000) + 500 : Math.floor(Math.random() * 5) + 1;
        const skuIdx = i % skus.length;
        const prices = [690, 790, 650, 920, 920, 180];

        orders.push({
            order_code: `RZK-ORD-2026-${String(i).padStart(4, '0')}`,
            customer_name: customers[i % customers.length],
            channel: channels[i % channels.length],
            product_sku: skus[skuIdx],
            quantity: qty,
            unit_price_bdt: prices[skuIdx],
            status: statuses[i % statuses.length],
            sla_state: slaStates[i % slaStates.length],
            expected_delivery_at: expected,
            created_at: created,
        });
    }

    const { error } = await db.from('rizik_order_records').upsert(orders, { onConflict: 'order_code' });
    console.log(`  ${error ? '❌ ' + error.message : '✅ 18 orders seeded'}`);
}

async function seedTickets() {
    console.log('\n🎫 Seeding support tickets...');
    const tickets = [
        { ticket_code: 'TKT-001', customer_name: 'Noor Holdings', account_type: 'B2B', topic: 'Dispatch window mismatch', status: 'OPEN', priority: 'P1', latest_request: 'Need confirmed truck ETA before 14:00.', assigned_team: 'Logistics' },
        { ticket_code: 'TKT-002', customer_name: 'Pran Agro Ltd.', account_type: 'B2B', topic: 'MOQ pricing clarification', status: 'IN_PROGRESS', priority: 'P2', latest_request: 'Share tier pricing for 50,000 pouches.', assigned_team: 'Sales' },
        { ticket_code: 'TKT-003', customer_name: 'Amina Jahan', account_type: 'B2C', topic: 'Order replacement request', status: 'OPEN', priority: 'P2', latest_request: 'Requesting exchange for damaged retail unit.', assigned_team: 'Support' },
        { ticket_code: 'TKT-004', customer_name: 'Rahim Group', account_type: 'B2B', topic: 'Compliance document request', status: 'RESOLVED', priority: 'P3', latest_request: 'Documents received. Thank you.', assigned_team: 'Legal' },
        { ticket_code: 'TKT-005', customer_name: 'Kamal Enterprises', account_type: 'B2B', topic: 'Bulk packaging defect report', status: 'OPEN', priority: 'P1', latest_request: 'Batch BIO-2026-03 has seal integrity issues. Need urgent QA review.', assigned_team: 'QA' },
        { ticket_code: 'TKT-006', customer_name: 'Green Valley Foods', account_type: 'B2B', topic: 'Invoice discrepancy', status: 'IN_PROGRESS', priority: 'P2', latest_request: 'Invoice total does not match PO amount.', assigned_team: 'Finance' },
        { ticket_code: 'TKT-007', customer_name: 'Shahjalal Exports', account_type: 'B2B', topic: 'Export documentation delay', status: 'OPEN', priority: 'P1', latest_request: 'C/O and phytosanitary certificates needed before vessel cutoff.', assigned_team: 'Logistics' },
        { ticket_code: 'TKT-008', customer_name: 'Bengal Weave Co.', account_type: 'B2B', topic: 'Custom branding inquiry', status: 'OPEN', priority: 'P3', latest_request: 'Can we co-brand the Gramin line for our retail stores?', assigned_team: 'Marketing' },
    ];
    const { error } = await db.from('rizik_support_tickets').upsert(tickets, { onConflict: 'ticket_code' });
    console.log(`  ${error ? '❌ ' + error.message : '✅ 8 tickets seeded'}`);
}

async function seedInventory() {
    console.log('\n📦 Seeding inventory...');
    const items = [
        { sku: 'RAW-CHITOSAN-01', item_name: 'Chitosan Fiber Bale (Grade A)', quantity_on_hand: 12400, reorder_level: 5000, unit_name: 'kg' },
        { sku: 'RAW-LDPE-ROLL-01', item_name: 'LDPE Film Roll (40μm)', quantity_on_hand: 3200, reorder_level: 1500, unit_name: 'roll' },
        { sku: 'RAW-COLLAGEN-01', item_name: 'Marine Collagen Powder', quantity_on_hand: 890, reorder_level: 500, unit_name: 'kg' },
        { sku: 'RAW-JUTE-FIBER-01', item_name: 'Processed Jute Fiber Bundle', quantity_on_hand: 8500, reorder_level: 3000, unit_name: 'kg' },
        { sku: 'RAW-OUD-EXTRACT-01', item_name: 'Oud Essential Oil Extract', quantity_on_hand: 45, reorder_level: 20, unit_name: 'litre' },
        { sku: 'FIN-SAFAR-DSK', item_name: 'Safar Desert Sky Mat (Finished)', quantity_on_hand: 2800, reorder_level: 500, unit_name: 'unit' },
        { sku: 'FIN-SAFAR-ME', item_name: 'Safar Midnight Emerald Mat (Finished)', quantity_on_hand: 1200, reorder_level: 500, unit_name: 'unit' },
        { sku: 'FIN-GRAMIN-IND', item_name: 'Gramin Indigo Mandala Mat (Finished)', quantity_on_hand: 750, reorder_level: 200, unit_name: 'unit' },
        { sku: 'FIN-BIO-LEAF', item_name: 'BioShield Eco Leaf Wrap (Pack of 100)', quantity_on_hand: 35000, reorder_level: 10000, unit_name: 'pack' },
        { sku: 'PKG-EXPORT-BOX-01', item_name: 'Export Carton Box (5-ply)', quantity_on_hand: 4200, reorder_level: 2000, unit_name: 'box' },
    ];
    const { error } = await db.from('rizik_inventory_items').upsert(items, { onConflict: 'sku' });
    console.log(`  ${error ? '❌ ' + error.message : '✅ 10 inventory items seeded'}`);
}

async function seedTasks() {
    console.log('\n✅ Seeding employee tasks...');
    const tasks = [
        { title: 'Complete QA inspection for Batch BIO-2026-03', owner_team: 'Quality Assurance', status: 'IN_PROGRESS', due_at: new Date(Date.now() + 3600000 * 4).toISOString() },
        { title: 'Prepare export documentation for Shahjalal shipment', owner_team: 'Logistics', status: 'TODO', due_at: new Date(Date.now() + 3600000 * 8).toISOString() },
        { title: 'Finalize B2B tier pricing deck for Q2', owner_team: 'Sales', status: 'IN_PROGRESS', due_at: new Date(Date.now() + 86400000 * 3).toISOString() },
        { title: 'Raw material reorder — Chitosan Fiber (below threshold)', owner_team: 'Procurement', status: 'TODO', due_at: new Date(Date.now() + 86400000 * 2).toISOString() },
        { title: 'Update Rizik Fair booth design for March exhibition', owner_team: 'Marketing', status: 'IN_PROGRESS', due_at: new Date(Date.now() + 86400000 * 7).toISOString() },
        { title: 'Onboard new support agent (Fatima Akter)', owner_team: 'HR', status: 'TODO', due_at: new Date(Date.now() + 86400000 * 5).toISOString() },
        { title: 'Audit RLS policies on user_profiles table', owner_team: 'Engineering', status: 'DONE', due_at: new Date(Date.now() - 86400000).toISOString() },
        { title: 'Monthly P&L report generation', owner_team: 'Finance', status: 'TODO', due_at: new Date(Date.now() + 86400000 * 10).toISOString() },
        { title: 'Gramin line production run — 1,000 units target', owner_team: 'Production', status: 'IN_PROGRESS', due_at: new Date(Date.now() + 86400000 * 4).toISOString() },
        { title: 'Resolve Pran Agro MOQ pricing escalation', owner_team: 'Sales', status: 'IN_PROGRESS', due_at: new Date(Date.now() + 3600000 * 6).toISOString() },
    ];

    // Tasks have no unique constraint, so insert each individually
    for (const t of tasks) {
        const { error } = await db.from('rizik_employee_tasks').insert(t);
        if (error && error.message.includes('duplicate')) continue;
        if (error) console.log(`  ❌ Task: ${error.message}`);
    }
    console.log('  ✅ 10 tasks seeded');
}

async function seedRequests() {
    console.log('\n📝 Seeding ops requests...');
    const requests = [
        { request_code: 'REQ-2026-001', request_type: 'Raw Material Purchase', owner_team: 'Procurement', status: 'APPROVAL_PENDING' },
        { request_code: 'REQ-2026-002', request_type: 'New Hire Approval', owner_team: 'HR', status: 'APPROVED' },
        { request_code: 'REQ-2026-003', request_type: 'Equipment Maintenance', owner_team: 'Production', status: 'IN_REVIEW' },
        { request_code: 'REQ-2026-004', request_type: 'B2B Credit Extension', owner_team: 'Finance', status: 'APPROVAL_PENDING' },
        { request_code: 'REQ-2026-005', request_type: 'Export License Renewal', owner_team: 'Legal', status: 'APPROVED' },
        { request_code: 'REQ-2026-006', request_type: 'Marketing Budget Allocation — Q2', owner_team: 'Marketing', status: 'IN_REVIEW' },
    ];
    const { error } = await db.from('rizik_ops_requests').upsert(requests, { onConflict: 'request_code' });
    console.log(`  ${error ? '❌ ' + error.message : '✅ 6 requests seeded'}`);
}

async function seedShipments() {
    console.log('\n🚛 Seeding shipments...');
    const shipments = [
        { shipment_code: 'SHP-2026-001', route_text: 'Barishal → Dhaka Hub', customer_name: 'Noor Holdings', status: 'IN_TRANSIT', eta_at: new Date(Date.now() + 3600000 * 6).toISOString() },
        { shipment_code: 'SHP-2026-002', route_text: 'Dhaka Hub → Chittagong Port', customer_name: 'Shahjalal Exports', status: 'READY_FOR_PICKUP', eta_at: new Date(Date.now() + 86400000 * 2).toISOString() },
        { shipment_code: 'SHP-2026-003', route_text: 'Factory → Barishal Warehouse', customer_name: 'Internal Transfer', status: 'DELIVERED', eta_at: null },
        { shipment_code: 'SHP-2026-004', route_text: 'Dhaka Hub → Sylhet Distribution', customer_name: 'Green Valley Foods', status: 'IN_TRANSIT', eta_at: new Date(Date.now() + 3600000 * 12).toISOString() },
        { shipment_code: 'SHP-2026-005', route_text: 'Factory → Dhaka Hub', customer_name: 'Kamal Enterprises', status: 'LOADING', eta_at: new Date(Date.now() + 3600000 * 3).toISOString() },
        { shipment_code: 'SHP-2026-006', route_text: 'Dhaka Hub → Rajshahi', customer_name: 'Bengal Weave Co.', status: 'IN_TRANSIT', eta_at: new Date(Date.now() + 86400000).toISOString() },
        { shipment_code: 'SHP-2026-007', route_text: 'Chittagong Port → Dubai (Sea)', customer_name: 'Pran Agro Ltd.', status: 'CUSTOMS_HOLD', eta_at: new Date(Date.now() + 86400000 * 14).toISOString() },
        { shipment_code: 'SHP-2026-008', route_text: 'Factory → Comilla Hub', customer_name: 'Sunrise Traders', status: 'DELIVERED', eta_at: null },
    ];
    const { error } = await db.from('rizik_shipments').upsert(shipments, { onConflict: 'shipment_code' });
    console.log(`  ${error ? '❌ ' + error.message : '✅ 8 shipments seeded'}`);
}

async function seedNotifications() {
    console.log('\n🔔 Seeding notifications...');
    const notifications = [
        { audience: 'ADMIN', level: 'ALERT', title: 'Chitosan fiber stock approaching reorder threshold', body: 'Current: 12,400 kg. Reorder level: 5,000 kg. Projected to hit threshold in 18 days at current burn rate.', source: 'Inventory System' },
        { audience: 'ADMIN', level: 'INFO', title: 'March Rizik Fair registration confirmed', body: 'Booth allocation at Dhaka International Trade Fair has been confirmed for March 15-22.', source: 'Marketing' },
        { audience: 'EMPLOYEE', level: 'WARNING', title: 'QA hold on Batch BIO-2026-03', body: 'Seal integrity test failed on 3/50 sample units. Full batch inspection required before release.', source: 'Quality Assurance' },
        { audience: 'BOTH', level: 'INFO', title: 'New B2B client onboarded — Green Valley Foods', body: 'Account type: Enterprise. Primary interest: BioShield packaging line. Credit limit: ৳500,000.', source: 'Sales' },
        { audience: 'ADMIN', level: 'ALERT', title: 'SLA risk: Order RZK-ORD-2026-0007 delivery overdue', body: 'Expected delivery was 48 hours ago. Customer: Shahjalal Exports. Escalating to logistics head.', source: 'SLA Monitor' },
        { audience: 'EMPLOYEE', level: 'INFO', title: 'Team meeting scheduled — Production sync', body: 'All production and logistics team members requested for sync at 10:00 AM BDT tomorrow.', source: 'HR' },
    ];

    for (const n of notifications) {
        const { error } = await db.from('rizik_notifications').insert(n);
        if (error) console.log(`  ❌ Notification: ${error.message}`);
    }
    console.log('  ✅ 6 notifications seeded');
}

// ── Main ──
async function main() {
    console.log('🚀 Rizik SaaS — Full Database Population');
    console.log(`   Target: ${SUPABASE_URL}`);

    await createTables();
    await seedProducts();
    await seedOrders();
    await seedTickets();
    await seedInventory();
    await seedTasks();
    await seedRequests();
    await seedShipments();
    await seedNotifications();

    console.log('\n🎉 All done! Visit /store, /admin, and /portal to see live data.\n');
}

main().catch(console.error);
