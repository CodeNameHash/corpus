-- Run this in Supabase SQL Editor to create the content tables

create table if not exists explainers (
  id text primary key,            -- e.g. "structure-junior"
  provision_id text not null,
  level text not null,
  headline text,
  body text,
  updated_at timestamptz default now()
);

create table if not exists qa (
  id text primary key,
  provision_id text not null,
  level text not null,
  question text,
  answer text,
  concepts text[],
  tags text[],
  sort_order int default 0,
  updated_at timestamptz default now()
);

create table if not exists war_stories (
  id text primary key,
  provision_id text not null,
  level text not null,
  title text,
  story text,
  concepts text[],
  tags text[],
  sort_order int default 0,
  updated_at timestamptz default now()
);

create table if not exists negotiation_points (
  id text primary key,
  provision_id text not null,
  title text,
  deal_context text,
  buyer_position text,
  seller_position text,
  key_points text[],
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (public read, service role write)
alter table explainers enable row level security;
alter table qa enable row level security;
alter table war_stories enable row level security;
alter table negotiation_points enable row level security;

-- Public can read everything
create policy "Public read" on explainers for select using (true);
create policy "Public read" on qa for select using (true);
create policy "Public read" on war_stories for select using (true);
create policy "Public read" on negotiation_points for select using (true);

-- Service role can write (handled server-side via API routes)
-- No additional policies needed since service role bypasses RLS
