-- Chat Messages Table for AI Memory
create table if not exists chat_messages (
    id uuid primary key default gen_random_uuid(),
    squad_id uuid not null references squads(id) on delete cascade,
    user_id uuid references user_profiles(id) on delete set null,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_chat_messages_squad on chat_messages(squad_id, created_at desc);
create index idx_chat_messages_user on chat_messages(user_id, created_at desc);

-- RLS Policies
alter table chat_messages enable row level security;

-- Squad members can read messages in their squad
create policy "Squad members can read messages"
    on chat_messages for select
    using (
        squad_id in (
            select squad_id from squad_members where user_id = auth.uid()
        )
    );

-- Authenticated users can insert messages in their squads
create policy "Squad members can insert messages"
    on chat_messages for insert
    with check (
        squad_id in (
            select squad_id from squad_members where user_id = auth.uid()
        )
    );
