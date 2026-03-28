create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id bigint primary key default 1 check (id = 1),
  mode text not null default 'GROWTH' check (mode in ('STARTER', 'GROWTH')),
  brand_name text not null default 'LuxeBag by Raiya',
  brand_short_name text not null default 'LuxeBag',
  tagline text,
  announcement_text text,
  hero_kicker text,
  hero_title text,
  hero_subtitle text,
  hero_image text,
  hero_secondary_image text,
  campaign_image text,
  contact_email text,
  support_phone text,
  whatsapp_number text,
  instagram_handle text,
  instagram_url text,
  address_line text,
  support_hours text,
  trusted_badge_text text,
  faq_items jsonb not null default '[]'::jsonb,
  trust_bar_items text[] not null default '{}'::text[],
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_settings (
  id bigint primary key default 1 check (id = 1),
  handle text,
  profile_url text,
  badge_text text,
  gallery jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name text not null,
  slug text not null unique,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  original_price numeric(10, 2) not null default 0 check (original_price >= 0),
  discount integer not null default 0 check (discount >= 0),
  short_description text,
  description text,
  rating numeric(3, 2) not null default 4.8,
  reviews_count integer not null default 0,
  images text[] not null default '{}'::text[],
  in_stock boolean not null default true,
  featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  is_customizable boolean not null default false,
  personalization_options jsonb not null default '{}'::jsonb,
  highlights text[] not null default '{}'::text[],
  material text,
  delivery_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  meta_description text,
  content text not null,
  featured_image text,
  category text not null default 'Style',
  published boolean not null default true,
  read_time text not null default '4 min read',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  source text not null default 'popup',
  discount integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address text not null,
  customer_city text not null,
  customer_state text,
  customer_pincode text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal_amount numeric(10, 2) not null default 0,
  shipping_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  status text not null default 'New' check (status in ('New', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
  payment_method text not null default 'COD',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    );
$$;

create or replace function public.track_order(p_order_id text, p_phone text)
returns table (
  order_id text,
  status text,
  customer_name text,
  created_at timestamptz,
  total_amount numeric,
  item_count integer
)
language sql
security definer
set search_path = public
as $$
  select
    o.order_id,
    o.status,
    o.customer_name,
    o.created_at,
    o.total_amount,
    coalesce(jsonb_array_length(o.items), 0) as item_count
  from public.orders o
  where o.order_id = p_order_id
    and regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  limit 1;
$$;

grant execute on function public.track_order(text, text) to anon, authenticated;

create index if not exists products_category_idx on public.products(category);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists blog_posts_published_idx on public.blog_posts(published, published_at desc);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists leads_created_at_idx on public.leads(created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute procedure public.set_updated_at();

drop trigger if exists instagram_settings_set_updated_at on public.instagram_settings;
create trigger instagram_settings_set_updated_at
before update on public.instagram_settings
for each row execute procedure public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute procedure public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;
alter table public.instagram_settings enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.leads enable row level security;
alter table public.contact_messages enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update admin" on public.profiles;
create policy "profiles update admin"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read store settings" on public.store_settings;
create policy "public read store settings"
on public.store_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admin write store settings" on public.store_settings;
create policy "admin write store settings"
on public.store_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read instagram settings" on public.instagram_settings;
create policy "public read instagram settings"
on public.instagram_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admin write instagram settings" on public.instagram_settings;
create policy "admin write instagram settings"
on public.instagram_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "admin write products" on public.products;
create policy "admin write products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews"
on public.reviews
for select
to anon, authenticated
using (verified = true or public.is_admin());

drop policy if exists "admin write reviews" on public.reviews;
create policy "admin write reviews"
on public.reviews
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read blog posts" on public.blog_posts;
create policy "public read blog posts"
on public.blog_posts
for select
to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "admin write blog posts" on public.blog_posts;
create policy "admin write blog posts"
on public.blog_posts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public insert leads" on public.leads;
create policy "public insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads"
on public.leads
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin manage leads" on public.leads;
create policy "admin manage leads"
on public.leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public insert contact messages" on public.contact_messages;
create policy "public insert contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "admin read contact messages" on public.contact_messages;
create policy "admin read contact messages"
on public.contact_messages
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin manage contact messages" on public.contact_messages;
create policy "admin manage contact messages"
on public.contact_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case
      when coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin' then 'admin'
      else 'customer'
    end
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = case
      when new.raw_app_meta_data ? 'role' then excluded.role
      else public.profiles.role
    end,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_current_user_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := coalesce(auth.jwt() ->> 'email', '');
  v_full_name text := nullif(
    coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', split_part(v_email, '@', 1)),
    ''
  );
  v_app_role text := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    v_user_id,
    v_full_name,
    case
      when v_app_role = 'admin' then 'admin'
      else 'customer'
    end
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = case
      when v_app_role in ('admin', 'customer') then excluded.role
      else public.profiles.role
    end,
    updated_at = now();
end;
$$;

grant execute on function public.sync_current_user_profile() to authenticated;

insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  case
    when coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin' then 'admin'
    else 'customer'
  end
from auth.users u
on conflict (id) do nothing;

update public.profiles p
set
  full_name = coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  role = case
    when u.raw_app_meta_data ? 'role' and (u.raw_app_meta_data ->> 'role') in ('admin', 'customer')
      then u.raw_app_meta_data ->> 'role'
    else p.role
  end,
  updated_at = now()
from auth.users u
where u.id = p.id;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.sync_auth_user_profile();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data, raw_app_meta_data on auth.users
for each row execute procedure public.sync_auth_user_profile();
