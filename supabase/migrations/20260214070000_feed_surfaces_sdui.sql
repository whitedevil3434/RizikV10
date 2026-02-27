-- SDUI feed surfaces backing table and seed payload for 4-direction shell.

CREATE TABLE IF NOT EXISTS public.app_screens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role TEXT NOT NULL,
    screen_id TEXT NOT NULL,
    screen_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role, screen_id)
);

INSERT INTO public.app_screens (role, screen_id, screen_data)
VALUES
(
    'seeker',
    'feed_surfaces',
    '{
      "center": [
        {
          "title": "Rizik Now Feed",
          "subtitle": "Hot food, rides, and squad-ready social cards.",
          "icon": "play",
          "colors": ["#052E16", "#059669"],
          "actionLabel": "Open Seeker",
          "actionRoute": "/seeker"
        },
        {
          "title": "Quick Ride",
          "subtitle": "Nearest rider is moving. Lock with one tap.",
          "icon": "ride",
          "colors": ["#064E3B", "#10B981"],
          "actionLabel": "Track Order",
          "actionRoute": "/seeker/order/sample"
        },
        {
          "title": "Squad Boost",
          "subtitle": "Left swipe to management surface for squad ops.",
          "icon": "squad",
          "colors": ["#022C22", "#34D399"],
          "actionLabel": "Open Squad",
          "actionRoute": "/squad/dashboard"
        }
      ],
      "left": [
        {"title": "Squad Hub", "icon": "squad", "route": "/squad/dashboard", "metric_key": "squad_count", "value": "12", "label": "active threads"},
        {"title": "Mess Board", "icon": "control", "route": "/seeker", "metric_key": "active_orders", "value": "3", "label": "today tasks"},
        {"title": "Live Chat", "icon": "chat", "route": "/chat", "metric_key": "chat_unread_count", "value": "5", "label": "new messages"}
      ],
      "right": [
        {"title": "Spending Khata", "icon": "khata", "route": "/seeker", "metric_key": "delivered_spend", "value": "৳2.4k", "label": "this week"},
        {"title": "Wallet", "icon": "wallet", "route": "/seeker", "metric_key": "wallet_balance", "value": "৳980", "label": "available"},
        {"title": "Safe Deal", "icon": "wallet", "route": "/seeker", "metric_key": "closed_orders", "value": "100%", "label": "protection"}
      ]
    }'::JSONB
),
(
    'force',
    'feed_surfaces',
    '{
      "center": [
        {
          "title": "Opportunity Feed",
          "subtitle": "Swipe up for the next mission, then accept fast.",
          "icon": "work",
          "colors": ["#0F172A", "#1D4ED8"],
          "actionLabel": "Open Gigs",
          "actionRoute": "/force/gig/sample"
        },
        {
          "title": "Delivery Burst",
          "subtitle": "Route intelligence and surge windows in real time.",
          "icon": "delivery",
          "colors": ["#111827", "#0EA5E9"],
          "actionLabel": "Open Missions",
          "actionRoute": "/force"
        },
        {
          "title": "Skill Drill",
          "subtitle": "Micro training to unlock higher payout tiers.",
          "icon": "skill",
          "colors": ["#1F2937", "#6366F1"],
          "actionLabel": "Start Training",
          "actionRoute": "/force"
        }
      ],
      "left": [
        {"title": "Team Ops", "icon": "squad", "route": "/squad/dashboard", "metric_key": "squad_count", "value": "8", "label": "available members"},
        {"title": "Squad Chat", "icon": "chat", "route": "/chat", "metric_key": "chat_unread_count", "value": "4", "label": "new pings"},
        {"title": "Gig Pipeline", "icon": "work", "route": "/force", "metric_key": "open_missions", "value": "6", "label": "open gigs"}
      ],
      "right": [
        {"title": "Today Earnings", "icon": "earnings", "route": "/force", "metric_key": "rider_earnings_est", "value": "৳1.8k", "label": "today"},
        {"title": "Cash Out", "icon": "wallet", "route": "/force", "metric_key": "withdrawable_balance", "value": "৳650", "label": "ready"},
        {"title": "Income Khata", "icon": "khata", "route": "/force", "metric_key": "payout_entries", "value": "14", "label": "entries"}
      ]
    }'::JSONB
),
(
    'source',
    'feed_surfaces',
    '{
      "center": [
        {
          "title": "Business Feed",
          "subtitle": "Demand spikes, inventory movement, and margin pulse.",
          "icon": "store",
          "colors": ["#111827", "#F59E0B"],
          "actionLabel": "Open Source Hub",
          "actionRoute": "/source"
        },
        {
          "title": "Inventory Trigger",
          "subtitle": "Low-stock events mapped to restock actions.",
          "icon": "inventory",
          "colors": ["#1F2937", "#F97316"],
          "actionLabel": "Open Inventory",
          "actionRoute": "/inventory"
        },
        {
          "title": "Profit Signal",
          "subtitle": "Margin trend plus market timing recommendations.",
          "icon": "profit",
          "colors": ["#0F172A", "#CA8A04"],
          "actionLabel": "Open Profit",
          "actionRoute": "/source"
        }
      ],
      "left": [
        {"title": "Staff Control", "icon": "control", "route": "/source", "metric_key": "team_units", "value": "9", "label": "on shift"},
        {"title": "Inventory Ops", "icon": "inventory", "route": "/inventory", "metric_key": "low_stock_count", "value": "4", "label": "low stock"},
        {"title": "Squad Board", "icon": "squad", "route": "/squad/dashboard", "metric_key": "squad_alerts", "value": "2", "label": "alerts"}
      ],
      "right": [
        {"title": "Profit Ledger", "icon": "profit", "route": "/source", "metric_key": "net_profit_est", "value": "৳7.1k", "label": "net today"},
        {"title": "Business Wallet", "icon": "wallet", "route": "/source", "metric_key": "wallet_balance", "value": "৳12k", "label": "available"},
        {"title": "Asset Rent", "icon": "control", "route": "/source", "metric_key": "closed_deals", "value": "3", "label": "active deals"}
      ]
    }'::JSONB
)
ON CONFLICT (role, screen_id) DO UPDATE
SET screen_data = EXCLUDED.screen_data,
    updated_at = NOW();
