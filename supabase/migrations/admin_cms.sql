-- Universal CMS for Couch and Carpet Heroes.
-- Run this once in Supabase SQL editor if the tables do not exist yet.

create extension if not exists pgcrypto;

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  path text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo jsonb not null default '{}'::jsonb,
  schema_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null references public.cms_pages(page_key) on delete cascade,
  section_key text not null,
  section_type text not null default 'content',
  label text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_key, section_key)
);

create table if not exists public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  snapshot jsonb not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create or replace function public.set_cms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_pages_updated_at on public.cms_pages;
create trigger cms_pages_updated_at
before update on public.cms_pages
for each row execute function public.set_cms_updated_at();

drop trigger if exists cms_sections_updated_at on public.cms_sections;
create trigger cms_sections_updated_at
before update on public.cms_sections
for each row execute function public.set_cms_updated_at();

alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_revisions enable row level security;

drop policy if exists "Public can read CMS pages" on public.cms_pages;
create policy "Public can read CMS pages"
on public.cms_pages for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read CMS sections" on public.cms_sections;
create policy "Public can read CMS sections"
on public.cms_sections for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cms_pages p
    where p.page_key = cms_sections.page_key
      and p.is_active = true
  )
);

drop policy if exists "Authenticated users manage CMS pages" on public.cms_pages;
create policy "Authenticated users manage CMS pages"
on public.cms_pages for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users manage CMS sections" on public.cms_sections;
create policy "Authenticated users manage CMS sections"
on public.cms_sections for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users manage CMS revisions" on public.cms_revisions;
create policy "Authenticated users manage CMS revisions"
on public.cms_revisions for all
to authenticated
using (true)
with check (true);

insert into public.cms_pages (page_key, title, path, sort_order)
values
  ('home', 'Home', '/', 10),
  ('carpet-cleaning', 'Carpet Cleaning', '/carpet-cleaning/', 20),
  ('upholstery-cleaning', 'Upholstery Cleaning', '/upholstery-cleaning/', 30),
  ('mattress-cleaning', 'Mattress Cleaning', '/mattress-cleaning/', 40),
  ('area-rug-cleaning', 'Area Rug Cleaning', '/area-rug-cleaning/', 50)
on conflict (page_key) do update set
  title = excluded.title,
  path = excluded.path,
  sort_order = excluded.sort_order;

insert into storage.buckets (id, name, public)
values ('before-after', 'before-after', true)
on conflict (id) do nothing;

drop policy if exists "Public can read CMS media" on storage.objects;
create policy "Public can read CMS media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'before-after');

drop policy if exists "Authenticated users upload CMS media" on storage.objects;
create policy "Authenticated users upload CMS media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'before-after');

drop policy if exists "Authenticated users update CMS media" on storage.objects;
create policy "Authenticated users update CMS media"
on storage.objects for update
to authenticated
using (bucket_id = 'before-after')
with check (bucket_id = 'before-after');

drop policy if exists "Authenticated users delete CMS media" on storage.objects;
create policy "Authenticated users delete CMS media"
on storage.objects for delete
to authenticated
using (bucket_id = 'before-after');

