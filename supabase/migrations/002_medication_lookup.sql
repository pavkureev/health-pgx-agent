create table if not exists public.medication_lookup_cache (
    id uuid primary key default gen_random_uuid(),
    query_name text not null,
    normalized_name text not null,
    substance text,
    substance_label text,
    source_url text,
    source_name text,
    shot_list_match text,
    shot_list_category text,
    shot_list_note text,
    raw_summary text,
    confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
    checked_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    unique (normalized_name)
);

create table if not exists public.medication_evidence_flags (
    id uuid primary key default gen_random_uuid(),
    label text not null,
    aliases text[] not null default '{}'::text[],
    category text not null,
    note text,
    source_url text,
    source_name text,
    updated_at timestamptz not null default now()
);

create index if not exists medication_lookup_cache_normalized_idx
on public.medication_lookup_cache(normalized_name);

create index if not exists medication_evidence_flags_aliases_idx
on public.medication_evidence_flags using gin(aliases);

alter table public.medication_lookup_cache enable row level security;
alter table public.medication_evidence_flags enable row level security;

drop policy if exists "authenticated users can read medication lookup cache" on public.medication_lookup_cache;
create policy "authenticated users can read medication lookup cache"
on public.medication_lookup_cache
for select
to authenticated
using (true);

drop policy if exists "authenticated users can read medication evidence flags" on public.medication_evidence_flags;
create policy "authenticated users can read medication evidence flags"
on public.medication_evidence_flags
for select
to authenticated
using (true);
