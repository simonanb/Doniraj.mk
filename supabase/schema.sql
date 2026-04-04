-- ─── DONATIONS ────────────────────────────────────────────────────────────────
create table if not exists donations (
  id           text primary key default (gen_random_uuid()::text),
  title        text not null,
  description  text default '',
  category     text default 'Друго',
  condition    text default 'Добра',
  location     text default 'Скопје',
  donor_name   text not null,
  donor_avatar text default '',
  image        text,
  images       text[],
  emoji        text default '🎁',
  card_color   text default '#F5F5F5',
  accent_color text default '#888',
  created_at_iso timestamptz default now() not null,
  interested_count int default 0,
  user_id      uuid references auth.users(id) on delete cascade not null
);

alter table donations enable row level security;
create policy "Anyone can read donations"   on donations for select using (true);
create policy "Owner can insert donations"  on donations for insert with check (auth.uid() = user_id);
create policy "Owner can update donations"  on donations for update using (auth.uid() = user_id);
create policy "Owner can delete donations"  on donations for delete using (auth.uid() = user_id);

-- ─── INTERESTS ────────────────────────────────────────────────────────────────
create table if not exists interests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  donation_id text references donations(id) on delete cascade not null,
  unique(user_id, donation_id)
);

alter table interests enable row level security;
create policy "User reads own interests"   on interests for select using (auth.uid() = user_id);
create policy "User inserts interest"      on interests for insert with check (auth.uid() = user_id);
create policy "User deletes interest"      on interests for delete using (auth.uid() = user_id);

-- ─── MESSAGES ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id             uuid primary key default gen_random_uuid(),
  donation_id    text references donations(id) on delete cascade not null,
  participant_id uuid references auth.users(id) on delete cascade not null,
  sender_id      uuid references auth.users(id) on delete cascade not null,
  sender_name    text not null,
  text           text not null,
  created_at     timestamptz default now() not null
);

alter table messages enable row level security;
create policy "Participant can read messages" on messages for select
  using (
    auth.uid() = participant_id
    or auth.uid() = (select user_id from donations where id = donation_id)
  );
create policy "Sender can insert message" on messages for insert
  with check (auth.uid() = sender_id);
create policy "Participant can delete messages" on messages for delete
  using (
    auth.uid() = participant_id
    or auth.uid() = (select user_id from donations where id = donation_id)
  );

-- ─── TOGGLE INTEREST FUNCTION ─────────────────────────────────────────────────
-- Atomically inserts or deletes an interest and updates the counter on donations.
create or replace function toggle_interest(p_donation_id text, p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  already boolean;
begin
  select exists(
    select 1 from interests where user_id = p_user_id and donation_id = p_donation_id
  ) into already;

  if already then
    delete from interests where user_id = p_user_id and donation_id = p_donation_id;
    update donations set interested_count = greatest(0, interested_count - 1) where id = p_donation_id;
  else
    insert into interests (user_id, donation_id) values (p_user_id, p_donation_id);
    update donations set interested_count = interested_count + 1 where id = p_donation_id;
  end if;
end;
$$;
