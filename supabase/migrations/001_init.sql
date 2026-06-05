-- ============================================================
-- MiniCRM for Small Business — 初期スキーマ
-- Supabase SQL Editor でこのファイルをそのまま実行してください
-- ============================================================

-- ============================================================
-- Extension
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles テーブル
-- 事業者情報（会社名・代表名）を保存する
-- auth.users と 1:1 で紐付く
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  company    text not null default '',
  owner_name text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- customers テーブル
-- 顧客情報
-- ============================================================
create table if not exists public.customers (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  phone      text,
  email      text,
  notes      text,
  created_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers(user_id);

-- ============================================================
-- inquiries テーブル
-- 問い合わせ管理
-- status: 'unreplied' | 'replied' | 'done'
-- ============================================================
create type inquiry_status as enum ('unreplied', 'replied', 'done');

create table if not exists public.inquiries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  subject     text not null,
  body        text,
  status      inquiry_status not null default 'unreplied',
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists inquiries_user_id_idx on public.inquiries(user_id);
create index if not exists inquiries_status_idx  on public.inquiries(status);

-- ============================================================
-- invoices テーブル
-- 請求・支払い管理
-- status: 'unpaid' | 'paid'
-- ============================================================
create type invoice_status as enum ('unpaid', 'paid');

create table if not exists public.invoices (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  customer_id     uuid references public.customers(id) on delete set null,
  description     text not null,
  amount          integer not null default 0, -- 円単位
  issued_at       date not null default current_date,
  payment_due_at  date,
  status          invoice_status not null default 'unpaid',
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_status_idx  on public.invoices(status);

-- ============================================================
-- appointments テーブル
-- 予約管理
-- status: 'pending' | 'confirmed' | 'cancelled'
-- ============================================================
create type appointment_status as enum ('pending', 'confirmed', 'cancelled');

create table if not exists public.appointments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  date        date not null,
  time        time,
  service     text,
  status      appointment_status not null default 'pending',
  created_at  timestamptz not null default now()
);

create index if not exists appointments_user_id_idx on public.appointments(user_id);
create index if not exists appointments_date_idx    on public.appointments(date);
create index if not exists appointments_status_idx  on public.appointments(status);

-- ============================================================
-- Row Level Security (RLS)
-- 認証ユーザーは自分のデータのみ操作可能
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

create policy "profiles: own row"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- customers
alter table public.customers enable row level security;

create policy "customers: own rows"
  on public.customers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 公開予約フォームから顧客を検索・作成できるようにする（anon も INSERT 許可）
create policy "customers: public insert"
  on public.customers
  for insert
  to anon
  with check (true);

-- inquiries
alter table public.inquiries enable row level security;

create policy "inquiries: own rows"
  on public.inquiries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- invoices
alter table public.invoices enable row level security;

create policy "invoices: own rows"
  on public.invoices
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- appointments
alter table public.appointments enable row level security;

create policy "appointments: own rows"
  on public.appointments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 公開予約フォームから予約を作成できるようにする（anon も INSERT 許可）
-- user_id は NULL として登録し、後で事業者が確認・承認する
create policy "appointments: public insert"
  on public.appointments
  for insert
  to anon
  with check (true);

-- ============================================================
-- Handle new user — profiles レコードを自動作成するトリガー
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- サンプルデータ（オプション）
-- テスト用。実運用では削除してください。
-- auth.users に登録済みのユーザーの UUID を下記に入れて実行する
-- ============================================================
-- do $$
-- declare
--   sample_user_id uuid := 'YOUR-USER-UUID-HERE';
-- begin
--   insert into public.customers (user_id, name, phone, email, notes)
--   values
--     (sample_user_id, '山田 太郎', '090-1234-5678', 'yamada@example.com', 'VIP顧客'),
--     (sample_user_id, '鈴木 花子', '080-9876-5432', 'suzuki@example.com', null),
--     (sample_user_id, '田中 一郎', '070-1111-2222', 'tanaka@example.com', '初回問い合わせ');
-- end $$;
