-- Initial Supabase schema for the PGx / lab assistant.
-- Designed around the future authenticated user:
-- auth.users -> patient_profiles -> documents/results/genetics/signals.

create extension if not exists pgcrypto;

create type public.profile_role as enum ('owner', 'editor', 'viewer');
create type public.document_status as enum ('uploaded', 'parsed', 'partial', 'failed');
create type public.document_kind as enum ('lab_pdf', 'lab_text', 'vcf', 'genetic_report', 'manual');
create type public.signal_severity as enum ('low', 'moderate', 'high');

create table public.patient_profiles (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    display_name text not null,
    birth_date date,
    sex_at_birth text check (sex_at_birth in ('male', 'female', 'other', 'unknown')),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.profile_members (
    profile_id uuid not null references public.patient_profiles(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role public.profile_role not null,
    created_at timestamptz not null default now(),
    primary key (profile_id, user_id)
);

create table public.source_documents (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.patient_profiles(id) on delete cascade,
    uploaded_by uuid references auth.users(id) on delete set null,
    kind public.document_kind not null,
    status public.document_status not null default 'uploaded',
    file_name text,
    storage_path text,
    sha256 text,
    lab_name text,
    report_date date,
    parser_version text,
    extracted_text text,
    diagnostics jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.lab_observations (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.patient_profiles(id) on delete cascade,
    document_id uuid references public.source_documents(id) on delete set null,
    analyte_key text not null,
    analyte_label text not null,
    observed_on date not null,
    value numeric not null,
    unit text,
    reference_low numeric,
    reference_high numeric,
    source_line text,
    confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
    parser_version text,
    created_at timestamptz not null default now()
);

create table public.genetic_reports (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.patient_profiles(id) on delete cascade,
    document_id uuid references public.source_documents(id) on delete set null,
    source_name text,
    raw_format text,
    parser_version text,
    created_at timestamptz not null default now()
);

create table public.genetic_findings (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.patient_profiles(id) on delete cascade,
    report_id uuid references public.genetic_reports(id) on delete cascade,
    gene text,
    rsid text,
    genotype text,
    diplotype text,
    phenotype text,
    evidence_source text,
    raw_line text,
    created_at timestamptz not null default now()
);

create table public.clinical_signals (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.patient_profiles(id) on delete cascade,
    signal_type text not null,
    title text not null,
    body text not null,
    severity public.signal_severity not null,
    source_data jsonb not null default '{}'::jsonb,
    generated_at timestamptz not null default now(),
    dismissed_at timestamptz
);

create index patient_profiles_owner_idx on public.patient_profiles(owner_user_id);
create index profile_members_user_idx on public.profile_members(user_id);
create index source_documents_profile_idx on public.source_documents(profile_id, report_date desc);
create index lab_observations_profile_key_date_idx on public.lab_observations(profile_id, analyte_key, observed_on);
create index genetic_findings_profile_gene_idx on public.genetic_findings(profile_id, gene);
create index clinical_signals_profile_idx on public.clinical_signals(profile_id, generated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger patient_profiles_set_updated_at
before update on public.patient_profiles
for each row execute function public.set_updated_at();

create trigger source_documents_set_updated_at
before update on public.source_documents
for each row execute function public.set_updated_at();

create or replace function public.is_profile_member(target_profile_id uuid, allowed_roles public.profile_role[] default array['owner', 'editor', 'viewer']::public.profile_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profile_members pm
        where pm.profile_id = target_profile_id
          and pm.user_id = auth.uid()
          and pm.role = any(allowed_roles)
    );
$$;

alter table public.patient_profiles enable row level security;
alter table public.profile_members enable row level security;
alter table public.source_documents enable row level security;
alter table public.lab_observations enable row level security;
alter table public.genetic_reports enable row level security;
alter table public.genetic_findings enable row level security;
alter table public.clinical_signals enable row level security;

create policy "members can read patient profiles"
on public.patient_profiles
for select
using (public.is_profile_member(id));

create policy "authenticated users can create owned profiles"
on public.patient_profiles
for insert
with check (owner_user_id = auth.uid());

create policy "owners and editors can update profiles"
on public.patient_profiles
for update
using (public.is_profile_member(id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(id, array['owner', 'editor']::public.profile_role[]));

create policy "owners can delete profiles"
on public.patient_profiles
for delete
using (public.is_profile_member(id, array['owner']::public.profile_role[]));

create policy "members can read profile memberships"
on public.profile_members
for select
using (public.is_profile_member(profile_id));

create policy "owners can manage profile memberships"
on public.profile_members
for all
using (public.is_profile_member(profile_id, array['owner']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner']::public.profile_role[]) or user_id = auth.uid());

create policy "owners can insert their initial membership"
on public.profile_members
for insert
with check (
    user_id = auth.uid()
    and exists (
        select 1 from public.patient_profiles pp
        where pp.id = profile_id and pp.owner_user_id = auth.uid()
    )
);

create policy "members can read source documents"
on public.source_documents
for select
using (public.is_profile_member(profile_id));

create policy "owners and editors can write source documents"
on public.source_documents
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

create policy "members can read lab observations"
on public.lab_observations
for select
using (public.is_profile_member(profile_id));

create policy "owners and editors can write lab observations"
on public.lab_observations
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

create policy "members can read genetic reports"
on public.genetic_reports
for select
using (public.is_profile_member(profile_id));

create policy "owners and editors can write genetic reports"
on public.genetic_reports
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

create policy "members can read genetic findings"
on public.genetic_findings
for select
using (public.is_profile_member(profile_id));

create policy "owners and editors can write genetic findings"
on public.genetic_findings
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

create policy "members can read clinical signals"
on public.clinical_signals
for select
using (public.is_profile_member(profile_id));

create policy "owners and editors can write clinical signals"
on public.clinical_signals
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

