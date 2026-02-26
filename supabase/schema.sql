-- CORPUS — Full Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS)

-- ─── Provision content ────────────────────────────────────────────────────────

create table if not exists explainers (
  id text primary key,
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

-- ─── Annotations (clause underlines) ─────────────────────────────────────────

create table if not exists annotations (
  id text primary key,
  provision_id text not null,
  clause_id text not null,
  level text not null,
  phrase text,
  note text,
  updated_at timestamptz default now()
);

-- ─── Defined Terms ────────────────────────────────────────────────────────────

create table if not exists defined_terms (
  id text primary key,
  term text not null,
  short_def text,
  long_def text,
  appears_in text[],
  related_cases text[],
  related_terms text[],
  updated_at timestamptz default now()
);

-- ─── Cases ────────────────────────────────────────────────────────────────────

create table if not exists cases (
  id text primary key,
  name text not null,
  court text,
  year int,
  cite text,
  summary text,
  holdings text[],
  provisions text[],
  terms text[],
  updated_at timestamptz default now()
);

-- ─── Concepts ─────────────────────────────────────────────────────────────────

create table if not exists concepts (
  id text primary key,
  slug text not null unique,
  title text not null,
  category text not null,
  provision_ids text[],
  summary text,
  definition text,
  mechanics text[],
  when_used text,
  advantages text[],
  disadvantages text[],
  deal_relationship text,
  related_concepts text[],
  related_cases text[],
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table explainers enable row level security;
alter table qa enable row level security;
alter table war_stories enable row level security;
alter table negotiation_points enable row level security;
alter table annotations enable row level security;
alter table defined_terms enable row level security;
alter table cases enable row level security;
alter table concepts enable row level security;

-- Public read
do $$ begin
  create policy "Public read" on explainers for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on qa for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on war_stories for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on negotiation_points for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on annotations for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on defined_terms for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on cases for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on concepts for select using (true);
exception when duplicate_object then null; end $$;
