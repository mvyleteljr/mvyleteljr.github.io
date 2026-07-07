create extension if not exists pgcrypto;

create table if not exists challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null,
  day integer not null check (day between 1 and 30),
  author text not null,
  body text not null default '',
  media jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists challenge_entries_challenge_day_created_idx
  on challenge_entries (challenge_id, day, created_at);
