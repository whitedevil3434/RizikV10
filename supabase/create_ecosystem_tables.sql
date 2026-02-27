-- Rizik Ecosystem SaaS: Enhanced E-Commerce, ERP, & CRM Schema

-- 1. Expanded User Profiles & Role Hierarchy
-- Extends auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'B2B_BUYER', 'SUPPORT_AGENT', 'PRODUCTION_MANAGER', 'LOGISTICS_MANAGER', 'SUPER_ADMIN')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customer Delivery Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home', -- e.g., Home, Office, Storage Unit
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE
);

-- 3. E-Commerce Cart System
CREATE TABLE IF NOT EXISTS public.shopping_carts (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE, -- 1 cart per user at a time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES public.shopping_carts(cart_id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.empire_products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE(cart_id, product_id)
);

-- 4. Unified Ecosystem Orders (For both B2C Retail and B2B Bulk)
CREATE TABLE IF NOT EXISTS public.ecosystem_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('B2C_RETAIL', 'B2B_BULK')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAYMENT_CONFIRMED', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount_bdt DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    delivery_address_id UUID REFERENCES public.customer_addresses(address_id) ON DELETE SET NULL,
    payment_status VARCHAR(50) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Physical Product QR Code Tracking (Inventory/Authenticity)
-- Whenever a production batch completes, individual items or master boxes get a QR code.
CREATE TABLE IF NOT EXISTS public.product_qr_tags (
    qr_tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.production_batches(batch_id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.empire_products(product_id) ON DELETE CASCADE,
    qr_code_hash VARCHAR(255) UNIQUE NOT NULL, -- The unique string embedded in the QR image
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    is_allocated BOOLEAN DEFAULT FALSE, -- Set to true when assigned to an order
    allocated_order_id UUID REFERENCES public.ecosystem_orders(order_id) ON DELETE SET NULL,
    scanned_count INTEGER DEFAULT 0, -- To track if an item has been verified multiple times (counterfeit check)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRM Support Chat Threads (Customer -> Support Agent)
CREATE TABLE IF NOT EXISTS public.support_threads (
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.ecosystem_orders(order_id) ON DELETE CASCADE, -- Optional linkage to specific order
    assigned_agent_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    topic VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.support_threads(thread_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Logistics & Dispatch Tracking (For Delivery Agents / Employees)
CREATE TABLE IF NOT EXISTS public.logistics_dispatch (
    dispatch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.ecosystem_orders(order_id) ON DELETE CASCADE,
    assigned_driver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- A user with 'LOGISTICS_MANAGER' or Custom Delivery Role
    vehicle_type VARCHAR(50),
    tracking_number VARCHAR(100) UNIQUE,
    current_gps_lat DECIMAL(10, 8),
    current_gps_lng DECIMAL(11, 8),
    dispatch_status VARCHAR(50) DEFAULT 'AWAITING_PICKUP' CHECK (dispatch_status IN ('AWAITING_PICKUP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
