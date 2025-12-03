create type account_status as enum ('new','onboarded','verified','rejected');

create table if not exists merchants (
  id bigint generated always as identity primary key,
  user_id uuid not null unique,
  email text not null unique,
  account_status account_status not null default 'new',
  test_public_key text,
  test_secret_hash text,
  live_public_key text,
  live_secret_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists merchant_onboarding (
  id bigint generated always as identity primary key,
  merchant_id bigint not null references merchants(id) on delete cascade,
  business_type text,
  address text,
  description text,
  industry text,
  contact_name text,
  contact_phone text,
  submitted_at timestamptz not null default now()
);

create table if not exists merchant_kyc (
  id bigint generated always as identity primary key,
  merchant_id bigint not null references merchants(id) on delete cascade,
  registration_doc_url text,
  id_doc_url text,
  address_proof_url text,
  bank_account_name text,
  bank_account_number text,
  bank_code text,
  status text not null default 'pending',
  reviewed_by_admin_id bigint,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists payments (
  id bigint generated always as identity primary key,
  merchant_id bigint not null references merchants(id) on delete cascade,
  link_code text,
  amount numeric(14,2) not null,
  currency text not null default 'SSP',
  status text not null default 'pending',
  mode text not null default 'test',
  flutterwave_reference text,
  customer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_logs (
  id bigint generated always as identity primary key,
  payment_id bigint references payments(id) on delete cascade,
  event text not null,
  data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payouts (
  id bigint generated always as identity primary key,
  merchant_id bigint not null references merchants(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null default 'SSP',
  status text not null default 'requested',
  flutterwave_transfer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table merchants enable row level security;
alter table merchant_onboarding enable row level security;
alter table merchant_kyc enable row level security;
alter table payments enable row level security;
alter table payment_logs enable row level security;
alter table payouts enable row level security;

create policy merchants_owner_select on merchants for select using (user_id = auth.uid());
create policy merchants_owner_update on merchants for update using (user_id = auth.uid());

create policy onboarding_owner_all on merchant_onboarding for all using (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);

create policy kyc_owner_select on merchant_kyc for select using (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);
create policy kyc_owner_insert on merchant_kyc for insert with check (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);
create policy kyc_owner_update on merchant_kyc for update using (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);

create policy payments_owner_select on payments for select using (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);
create policy payments_owner_insert on payments for insert with check (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);
create policy payments_owner_update on payments for update using (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);

create policy payment_logs_owner_select on payment_logs for select using (
  exists (select 1 from payments p join merchants m on p.merchant_id = m.id where payment_logs.payment_id = p.id and m.user_id = auth.uid())
);

create policy payouts_owner_select on payouts for select using (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);
create policy payouts_owner_insert on payouts for insert with check (
  exists (select 1 from merchants m where m.id = merchant_id and m.user_id = auth.uid())
);

insert into storage.buckets (id, name, public) values ('merchant-kyc','merchant-kyc', false)
on conflict (id) do nothing;
