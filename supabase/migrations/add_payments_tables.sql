-- Create payments and payment_logs tables required by Edge Function `pay`
-- Safe to run multiple times (IF NOT EXISTS)

create table if not exists public.payments (
  id uuid primary key default extensions.uuid_generate_v4(),
  merchant_id uuid references public.merchants(id) on delete set null,
  amount numeric not null,
  currency varchar default 'SSP',
  status varchar not null default 'pending',
  mode varchar not null default 'test',
  link_code varchar null,
  customer_email varchar null,
  flutterwave_reference varchar null,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

alter table public.payments enable row level security;

create table if not exists public.payment_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  event varchar not null,
  data jsonb default '{}'::jsonb,
  created_at timestamp without time zone default now()
);

alter table public.payment_logs enable row level security;

