-- Active Khata OS Schema

-- 1. Consumables (Master List of Items)
-- This table holds the global definition of items (e.g., "Miniket Rice", "Soybean Oil").
create table if not exists public.consumables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null, -- 'grain', 'oil', 'spice', 'vegetable', 'cleaning'
  default_unit text not null, -- 'kg', 'liter', 'packet', 'piece'
  avg_shelf_life_days integer, -- For predictive expiry
  image_url text,
  created_at timestamptz default now()
);

-- Enable RLS for consumables
alter table public.consumables enable row level security;

-- Policy: Everyone can read consumables (Public Master List)
create policy "Consumables are public read"
  on public.consumables for select
  using (true);

-- Policy: Only admins can insert/update (For now)
-- (Assuming service_role or specific admin check, skipping for simplicity in V1)


-- 2. Inventory (User's Personal Stock)
-- This table tracks what a specific user/squad has in stock.
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid references public.squads(id) on delete cascade not null,
  consumable_id uuid references public.consumables(id) on delete restrict not null,
  quantity numeric not null default 0,
  unit text not null, -- Should match consumable.default_unit or be convertible
  expiry_date date,
  purchase_date date default current_date,
  status text default 'in_stock', -- 'in_stock', 'running_low', 'out_of_stock'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for inventory
alter table public.inventory enable row level security;

-- Policy: Squad members can view their own inventory
create policy "Squad members can view inventory"
  on public.inventory for select
  using (
    auth.uid() in (
      select user_id from public.squad_members where squad_id = inventory.squad_id
    )
  );

-- Policy: Squad members can update their own inventory
create policy "Squad members can update inventory"
  on public.inventory for insert
  with check (
    auth.uid() in (
      select user_id from public.squad_members where squad_id = inventory.squad_id
    )
  );

create policy "Squad members can modify inventory"
  on public.inventory for update
  using (
    auth.uid() in (
      select user_id from public.squad_members where squad_id = inventory.squad_id
    )
  );

create policy "Squad members can delete inventory"
  on public.inventory for delete
  using (
    auth.uid() in (
      select user_id from public.squad_members where squad_id = inventory.squad_id
    )
  );

-- 3. Shopping List (Smart List)
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid references public.squads(id) on delete cascade not null,
  consumable_id uuid references public.consumables(id) on delete restrict,
  custom_item_name text, -- If not in consumables master list
  quantity_needed numeric not null default 1,
  unit text,
  is_purchased boolean default false,
  added_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS for shopping list
alter table public.shopping_list_items enable row level security;

-- Policy: Squad members can view/edit shopping list
create policy "Squad members can manage shopping list"
  on public.shopping_list_items for all
  using (
    auth.uid() in (
      select user_id from public.squad_members where squad_id = shopping_list_items.squad_id
    )
  );
