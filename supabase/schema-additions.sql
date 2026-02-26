-- CORPUS — Schema additions
-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- Safe to re-run

-- ─── Categories (for concepts and cases) ─────────────────────────────────────

create table if not exists categories (
  id text primary key,
  slug text not null unique,
  label text not null,
  type text not null,          -- 'concept' | 'case'
  description text,
  icon text,                   -- emoji or short string
  sort_order int default 0,
  parent_id text references categories(id),  -- for nested folders
  updated_at timestamptz default now()
);

-- ─── Provisions (as DB objects) ───────────────────────────────────────────────

create table if not exists provisions (
  id text primary key,
  number int not null,
  title text not null,
  deal text,
  deal_date text,
  sections text,
  description text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- Seed with existing provisions
insert into provisions (id, number, title, deal, deal_date, sections, sort_order) values
  ('structure',    1,  'Structure & Mechanics',  'Twitter / X Holdings', 'Apr. 25, 2022', '§§ 2.1–2.3', 1),
  ('economics',    2,  'Deal Economics',          'Twitter / X Holdings', 'Apr. 25, 2022', '§§ 3.1–3.2', 2),
  ('ppa',          3,  'PPA Mechanics',           'Twitter / X Holdings', 'Apr. 25, 2022', '§§ 3.1–3.7', 3),
  ('earnouts',     4,  'Earnouts',                'Twitter / X Holdings', 'Apr. 25, 2022', 'N/A',         4),
  ('rw',           5,  'Reps & Warranties',       'Twitter / X Holdings', 'Apr. 25, 2022', 'Arts. IV–V',  5),
  ('mae',          6,  'Material Adverse Effect', 'Twitter / X Holdings', 'Apr. 25, 2022', 'Art. I',      6),
  ('covenants',    7,  'Covenants',               'Twitter / X Holdings', 'Apr. 25, 2022', 'Art. VI',     7),
  ('conditions',   8,  'Conditions to Closing',   'Twitter / X Holdings', 'Apr. 25, 2022', 'Art. VII',    8),
  ('termination',  9,  'Termination',             'Twitter / X Holdings', 'Apr. 25, 2022', 'Art. VIII',   9),
  ('indemnity',    10, 'Indemnification',          'Twitter / X Holdings', 'Apr. 25, 2022', '§ 6.6',      10),
  ('boilerplate',  11, 'Boilerplate',             'Twitter / X Holdings', 'Apr. 25, 2022', 'Art. IX',    11)
on conflict (id) do nothing;

-- ─── Add category_id to concepts and cases ────────────────────────────────────

alter table concepts add column if not exists category_id text references categories(id);
alter table cases    add column if not exists category_id text references categories(id);

-- ─── Add full_decision to cases ───────────────────────────────────────────────

alter table cases add column if not exists full_decision text;
alter table cases add column if not exists decision_url text;   -- link to full opinion

-- ─── Add folder_path to concepts (breadcrumb display) ────────────────────────

alter table concepts add column if not exists folder_path text[];  -- e.g. ['Merger Structures', 'Triangular Mergers']

-- ─── Seed concept categories ──────────────────────────────────────────────────

insert into categories (id, slug, label, type, icon, sort_order) values
  ('cat-merger-structures', 'merger-structures', 'Merger Structures', 'concept', '⬡', 1),
  ('cat-mae',               'mae-standards',     'MAE Standards',     'concept', '⚖', 2),
  ('cat-earnouts',          'earnout-mechanics', 'Earnout Mechanics',  'concept', '📊', 3),
  ('cat-rw',                'rep-warranty',      'Reps & Warranties',  'concept', '✓', 4),
  ('cat-delaware',          'delaware-law',      'Delaware Case Law',  'case',    '⚖', 1),
  ('cat-mac',               'mac-cases',         'MAE/MAC Cases',      'case',    '📋', 2)
on conflict (id) do nothing;

-- ─── RLS for new tables ───────────────────────────────────────────────────────

alter table categories enable row level security;
alter table provisions enable row level security;

do $$ begin
  create policy "Public read" on categories for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read" on provisions for select using (true);
exception when duplicate_object then null; end $$;
