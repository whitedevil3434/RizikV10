-- Rizik SaaS Phase-2: Live Ops Data, Notifications, and Community Media Moderation

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1) Product Catalog hardening
-- ==========================================
CREATE TABLE IF NOT EXISTS public.empire_products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price_bdt NUMERIC(12, 2) NOT NULL,
  minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  image_alt TEXT,
  brand_family TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.empire_products ADD COLUMN IF NOT EXISTS image_alt TEXT;
ALTER TABLE public.empire_products ADD COLUMN IF NOT EXISTS brand_family TEXT;
ALTER TABLE public.empire_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ==========================================
-- 2) Operations data surfaces (DB-backed admin/portal)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rizik_order_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  channel TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  sla_state TEXT NOT NULL DEFAULT 'ON_TRACK',
  expected_dispatch_at TIMESTAMPTZ,
  expected_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  priority TEXT NOT NULL DEFAULT 'P2',
  latest_request TEXT,
  assigned_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_employee_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignee_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  owner_team TEXT,
  status TEXT NOT NULL DEFAULT 'TODO',
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_ops_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code TEXT UNIQUE NOT NULL,
  request_type TEXT NOT NULL,
  owner_team TEXT,
  status TEXT NOT NULL DEFAULT 'APPROVAL_PENDING',
  created_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_code TEXT UNIQUE NOT NULL,
  route_text TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'READY_FOR_PICKUP',
  eta_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  unit_name TEXT NOT NULL DEFAULT 'unit',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience TEXT NOT NULL DEFAULT 'BOTH',
  level TEXT NOT NULL DEFAULT 'INFO',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3) Community media + moderation
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rizik_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  bucket_name TEXT NOT NULL,
  object_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  public_url TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bucket_name, object_path)
);

ALTER TABLE public.rizik_social_posts ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE public.rizik_social_posts ADD COLUMN IF NOT EXISTS media_asset_id UUID;
ALTER TABLE public.rizik_social_comments ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.rizik_order_records (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_sla ON public.rizik_order_records (status, sla_state);
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON public.rizik_support_tickets (status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON public.rizik_employee_tasks (status, due_at);
CREATE INDEX IF NOT EXISTS idx_requests_status_updated ON public.rizik_ops_requests (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_status_eta ON public.rizik_shipments (status, eta_at);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON public.rizik_inventory_items (quantity_on_hand, reorder_level);
CREATE INDEX IF NOT EXISTS idx_notifications_audience_created ON public.rizik_notifications (audience, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_moderation ON public.rizik_social_posts (moderation_status, created_at DESC);

-- ==========================================
-- 4) Seed baseline DB records (professional starter dataset)
-- ==========================================
INSERT INTO public.empire_products (
  sku, name, category, description, base_price_bdt, minimum_order_quantity,
  image_url, image_alt, brand_family, is_active, updated_at
)
VALUES
  (
    'MAT-DESERT-SKY-01',
    'Rizik Safar Mat - Desert Sky Edition',
    'ECO_MAT',
    'Foldable travel prayer mat with geometric weave and enterprise-grade packaging.',
    690.00,
    1,
    '/products/variants/safar-desert-sky.svg',
    'Rizik Safar Mat Desert Sky Edition folded variant',
    'Rizik EcoMat',
    TRUE,
    NOW()
  ),
  (
    'MAT-MIDNIGHT-EM-01',
    'Rizik Safar Mat - Midnight Emerald',
    'ECO_MAT',
    'Premium portable mat variant for retail and gifting channels.',
    790.00,
    1,
    '/products/variants/safar-midnight-emerald.svg',
    'Rizik Safar Mat Midnight Emerald folded variant',
    'Rizik EcoMat',
    TRUE,
    NOW()
  ),
  (
    'MAT-SANDSTONE-01',
    'Rizik Safar Mat - Sandstone Weave',
    'ECO_MAT',
    'Lightweight travel-ready mat with neutral palette and compact fold profile.',
    650.00,
    1,
    '/products/variants/safar-sandstone.svg',
    'Rizik Safar Mat Sandstone folded variant',
    'Rizik EcoMat',
    TRUE,
    NOW()
  ),
  (
    'MAT-GRAMIN-IND-01',
    'Rizik Gramin Mat - Indigo Mandala',
    'ECO_MAT',
    'Cultural pattern mat line inspired by gramin craft geometry.',
    920.00,
    1,
    '/products/variants/gramin-mandala-indigo.svg',
    'Rizik Gramin Mat Indigo Mandala pattern',
    'Rizik Textile',
    TRUE,
    NOW()
  ),
  (
    'MAT-GRAMIN-RUST-01',
    'Rizik Gramin Mat - Rust Mandala',
    'ECO_MAT',
    'Warm-tone mandala line for youth and community campaign gifting.',
    920.00,
    1,
    '/products/variants/gramin-mandala-rust.svg',
    'Rizik Gramin Mat Rust Mandala pattern',
    'Rizik Textile',
    TRUE,
    NOW()
  ),
  (
    'BIO-LEAF-CANVAS-01',
    'Rizik BioShield - Eco Leaf Canvas Wrap',
    'BIO_SHIELD',
    'Bio-based wrap material for food and retail packaging operations.',
    180.00,
    500,
    '/products/variants/eco-leaf-canvas.svg',
    'Rizik BioShield Eco Leaf Canvas packaging variant',
    'Rizik BioShield',
    TRUE,
    NOW()
  )
ON CONFLICT (sku) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  base_price_bdt = EXCLUDED.base_price_bdt,
  minimum_order_quantity = EXCLUDED.minimum_order_quantity,
  image_url = EXCLUDED.image_url,
  image_alt = EXCLUDED.image_alt,
  brand_family = EXCLUDED.brand_family,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO public.rizik_order_records (
  order_code, customer_name, channel, product_sku, quantity, unit_price_bdt, status, sla_state,
  expected_dispatch_at, expected_delivery_at, created_at, updated_at
)
VALUES
  ('RB-9101', 'Noor Holdings', 'B2B', 'BIO-LEAF-CANVAS-01', 8000, 180.00, 'MANUFACTURING', 'ON_TRACK', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 days', NOW() - INTERVAL '5 hours', NOW()),
  ('RB-9102', 'Al-Hikmah Mosque', 'B2B', 'MAT-DESERT-SKY-01', 1200, 690.00, 'SHIPPED', 'ON_TRACK', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '10 hours', NOW() - INTERVAL '1 day', NOW()),
  ('RB-9103', 'Green Agro Chain', 'B2B', 'BIO-LEAF-CANVAS-01', 4500, 180.00, 'QA_CHECK', 'WATCH', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '1 day', NOW() - INTERVAL '8 hours', NOW()),
  ('RB-9104', 'Amina Jahan', 'B2C', 'MAT-SANDSTONE-01', 1, 650.00, 'DELIVERED', 'CLOSED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW()),
  ('RB-9105', 'Pran Agro Ltd.', 'B2B', 'BIO-LEAF-CANVAS-01', 15000, 180.00, 'PENDING', 'RISK', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '12 hours', NOW() - INTERVAL '10 hours', NOW())
ON CONFLICT (order_code) DO UPDATE
SET
  customer_name = EXCLUDED.customer_name,
  channel = EXCLUDED.channel,
  product_sku = EXCLUDED.product_sku,
  quantity = EXCLUDED.quantity,
  unit_price_bdt = EXCLUDED.unit_price_bdt,
  status = EXCLUDED.status,
  sla_state = EXCLUDED.sla_state,
  expected_dispatch_at = EXCLUDED.expected_dispatch_at,
  expected_delivery_at = EXCLUDED.expected_delivery_at,
  updated_at = NOW();

INSERT INTO public.rizik_support_tickets (
  ticket_code, customer_name, account_type, topic, status, priority, latest_request, assigned_team, created_at, updated_at
)
VALUES
  ('CRM-2201', 'Noor Holdings', 'B2B', 'Dispatch window confirmation', 'OPEN', 'P1', 'Need confirmed truck ETA before 14:00.', 'Logistics', NOW() - INTERVAL '2 hours', NOW()),
  ('CRM-2202', 'Pran Agro Ltd.', 'B2B', 'MOQ pricing clarification', 'IN_PROGRESS', 'P2', 'Share pricing slab for 50,000 wraps.', 'Sales Ops', NOW() - INTERVAL '6 hours', NOW()),
  ('CRM-2203', 'Amina Jahan', 'B2C', 'Retail replacement request', 'OPEN', 'P2', 'Requesting replacement for damaged retail unit.', 'Customer Support', NOW() - INTERVAL '4 hours', NOW()),
  ('CRM-2204', 'Rahim Group', 'B2B', 'Compliance docs request', 'RESOLVED', 'P3', 'Documents received and validated.', 'Compliance', NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (ticket_code) DO UPDATE
SET
  customer_name = EXCLUDED.customer_name,
  account_type = EXCLUDED.account_type,
  topic = EXCLUDED.topic,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  latest_request = EXCLUDED.latest_request,
  assigned_team = EXCLUDED.assigned_team,
  updated_at = NOW();

INSERT INTO public.rizik_employee_tasks (
  title, owner_team, status, due_at, created_at, updated_at
)
VALUES
  ('Confirm shipment docs for Noor Holdings', 'Logistics', 'TODO', NOW() + INTERVAL '45 minutes', NOW() - INTERVAL '2 hours', NOW()),
  ('Upload QA evidence for batch RB-PRD-2203', 'Production', 'TODO', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '90 minutes', NOW()),
  ('Reply to enterprise escalation thread', 'Support', 'IN_PROGRESS', NOW() + INTERVAL '3 hours', NOW() - INTERVAL '70 minutes', NOW()),
  ('Finalize warehouse picklist', 'Supply', 'IN_PROGRESS', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW()),
  ('Morning shift attendance lock', 'People Ops', 'DONE', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '8 hours', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.rizik_ops_requests (
  request_code, request_type, owner_team, status, created_at, updated_at
)
VALUES
  ('REQ-3101', 'Dispatch Priority', 'Logistics', 'APPROVAL_PENDING', NOW() - INTERVAL '3 hours', NOW()),
  ('REQ-3102', 'Overtime Approval', 'Production', 'APPROVED', NOW() - INTERVAL '5 hours', NOW()),
  ('REQ-3103', 'Stock Reorder', 'Supply', 'NEEDS_INFO', NOW() - INTERVAL '6 hours', NOW()),
  ('REQ-3104', 'Client Visit Access', 'Support', 'APPROVAL_PENDING', NOW() - INTERVAL '9 hours', NOW())
ON CONFLICT (request_code) DO UPDATE
SET
  request_type = EXCLUDED.request_type,
  owner_team = EXCLUDED.owner_team,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO public.rizik_shipments (
  shipment_code, route_text, customer_name, status, eta_at, created_at, updated_at
)
VALUES
  ('SHP-9101', 'Dhaka -> Chattogram', 'Noor Holdings', 'IN_TRANSIT', NOW() + INTERVAL '4 hours', NOW() - INTERVAL '6 hours', NOW()),
  ('SHP-9102', 'Dhaka -> Barishal', 'Al-Hikmah Mosque', 'OUT_FOR_DELIVERY', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '4 hours', NOW()),
  ('SHP-9103', 'Dhaka -> Gazipur', 'Pran Agro Ltd.', 'READY_FOR_PICKUP', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW()),
  ('SHP-9104', 'Dhaka -> Khulna', 'Green Agro Chain', 'DELAYED', NOW() + INTERVAL '8 hours', NOW() - INTERVAL '5 hours', NOW())
ON CONFLICT (shipment_code) DO UPDATE
SET
  route_text = EXCLUDED.route_text,
  customer_name = EXCLUDED.customer_name,
  status = EXCLUDED.status,
  eta_at = EXCLUDED.eta_at,
  updated_at = NOW();

INSERT INTO public.rizik_inventory_items (
  sku, item_name, quantity_on_hand, reorder_level, unit_name, updated_at
)
VALUES
  ('MAT-DESERT-SKY-01', 'Safar Mat - Desert Sky', 420, 180, 'pcs', NOW()),
  ('MAT-MIDNIGHT-EM-01', 'Safar Mat - Midnight Emerald', 160, 220, 'pcs', NOW()),
  ('MAT-SANDSTONE-01', 'Safar Mat - Sandstone', 510, 200, 'pcs', NOW()),
  ('MAT-GRAMIN-IND-01', 'Gramin Mandala Indigo', 130, 150, 'pcs', NOW()),
  ('BIO-LEAF-CANVAS-01', 'BioShield Leaf Canvas Wrap', 9200, 10000, 'sheets', NOW())
ON CONFLICT (sku) DO UPDATE
SET
  item_name = EXCLUDED.item_name,
  quantity_on_hand = EXCLUDED.quantity_on_hand,
  reorder_level = EXCLUDED.reorder_level,
  unit_name = EXCLUDED.unit_name,
  updated_at = NOW();

INSERT INTO public.rizik_notifications (audience, level, title, body, source, is_active, created_at)
SELECT 'BOTH', 'WARN', 'Low stock threshold reached',
       format('%s is below reorder level (%s <= %s).', i.item_name, i.quantity_on_hand, i.reorder_level),
       'inventory', TRUE, NOW()
FROM public.rizik_inventory_items i
WHERE i.quantity_on_hand <= i.reorder_level
ON CONFLICT DO NOTHING;

INSERT INTO public.rizik_notifications (audience, level, title, body, source, is_active, created_at)
SELECT 'ADMIN', 'WARN', 'Dispatch delay risk',
       format('Shipment %s (%s) is in %s state.', s.shipment_code, s.customer_name, s.status),
       'logistics', TRUE, NOW()
FROM public.rizik_shipments s
WHERE s.status IN ('DELAYED', 'HOLD')
ON CONFLICT DO NOTHING;

INSERT INTO public.rizik_notifications (audience, level, title, body, source, is_active, created_at)
SELECT 'ADMIN', 'WARN', 'Order SLA attention required',
       format('Order %s for %s is marked %s.', o.order_code, o.customer_name, o.sla_state),
       'orders', TRUE, NOW()
FROM public.rizik_order_records o
WHERE o.sla_state IN ('RISK', 'WATCH')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5) RLS and policies
-- ==========================================
ALTER TABLE public.empire_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_order_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_employee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_ops_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rizik_media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS empire_products_public_read ON public.empire_products;
CREATE POLICY empire_products_public_read
ON public.empire_products
FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS ops_orders_auth_read ON public.rizik_order_records;
CREATE POLICY ops_orders_auth_read
ON public.rizik_order_records
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS ops_tickets_auth_read ON public.rizik_support_tickets;
CREATE POLICY ops_tickets_auth_read
ON public.rizik_support_tickets
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS ops_tasks_auth_read ON public.rizik_employee_tasks;
CREATE POLICY ops_tasks_auth_read
ON public.rizik_employee_tasks
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS ops_requests_auth_read ON public.rizik_ops_requests;
CREATE POLICY ops_requests_auth_read
ON public.rizik_ops_requests
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS ops_shipments_auth_read ON public.rizik_shipments;
CREATE POLICY ops_shipments_auth_read
ON public.rizik_shipments
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS ops_inventory_auth_read ON public.rizik_inventory_items;
CREATE POLICY ops_inventory_auth_read
ON public.rizik_inventory_items
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS ops_notifications_auth_read ON public.rizik_notifications;
CREATE POLICY ops_notifications_auth_read
ON public.rizik_notifications
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = TRUE);

DROP POLICY IF EXISTS media_assets_owner_read ON public.rizik_media_assets;
CREATE POLICY media_assets_owner_read
ON public.rizik_media_assets
FOR SELECT
USING (auth.uid() = owner_user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS media_assets_owner_insert ON public.rizik_media_assets;
CREATE POLICY media_assets_owner_insert
ON public.rizik_media_assets
FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

-- ==========================================
-- 6) Storage bucket for secure community uploads
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rizik-community',
  'rizik-community',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS community_bucket_public_read ON storage.objects;
CREATE POLICY community_bucket_public_read
ON storage.objects
FOR SELECT
USING (bucket_id = 'rizik-community');

DROP POLICY IF EXISTS community_bucket_authenticated_upload ON storage.objects;
CREATE POLICY community_bucket_authenticated_upload
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rizik-community');
