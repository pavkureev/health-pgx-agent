-- Repair migration for Supabase security advisory rls_disabled_in_public.
-- Safe to run repeatedly from the Supabase SQL Editor.

alter table if exists public.patient_profiles enable row level security;
alter table if exists public.profile_members enable row level security;
alter table if exists public.source_documents enable row level security;
alter table if exists public.lab_observations enable row level security;
alter table if exists public.genetic_reports enable row level security;
alter table if exists public.genetic_findings enable row level security;
alter table if exists public.clinical_signals enable row level security;
alter table if exists public.medication_lookup_cache enable row level security;
alter table if exists public.medication_evidence_flags enable row level security;

create or replace function public.is_profile_member(
    target_profile_id uuid,
    allowed_roles public.profile_role[] default array['owner', 'editor', 'viewer']::public.profile_role[]
)
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

-- The advisory did not include the table name in the email text. Enable RLS for
-- every ordinary/partitioned table in public so an older manually-created table
-- cannot stay exposed.
do $$
declare
    public_table record;
begin
    for public_table in
        select c.oid::regclass as table_name
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relkind in ('r', 'p')
          and not c.relrowsecurity
    loop
        execute format('alter table %s enable row level security', public_table.table_name);
    end loop;
end;
$$;

drop policy if exists "members can read patient profiles" on public.patient_profiles;
create policy "members can read patient profiles"
on public.patient_profiles
for select
using (public.is_profile_member(id));

drop policy if exists "authenticated users can create owned profiles" on public.patient_profiles;
create policy "authenticated users can create owned profiles"
on public.patient_profiles
for insert
with check (owner_user_id = auth.uid());

drop policy if exists "owners and editors can update profiles" on public.patient_profiles;
create policy "owners and editors can update profiles"
on public.patient_profiles
for update
using (public.is_profile_member(id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(id, array['owner', 'editor']::public.profile_role[]));

drop policy if exists "owners can delete profiles" on public.patient_profiles;
create policy "owners can delete profiles"
on public.patient_profiles
for delete
using (public.is_profile_member(id, array['owner']::public.profile_role[]));

drop policy if exists "members can read profile memberships" on public.profile_members;
create policy "members can read profile memberships"
on public.profile_members
for select
using (public.is_profile_member(profile_id));

drop policy if exists "owners can manage profile memberships" on public.profile_members;
create policy "owners can manage profile memberships"
on public.profile_members
for all
using (public.is_profile_member(profile_id, array['owner']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner']::public.profile_role[]) or user_id = auth.uid());

drop policy if exists "owners can insert their initial membership" on public.profile_members;
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

drop policy if exists "members can read source documents" on public.source_documents;
create policy "members can read source documents"
on public.source_documents
for select
using (public.is_profile_member(profile_id));

drop policy if exists "owners and editors can write source documents" on public.source_documents;
create policy "owners and editors can write source documents"
on public.source_documents
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

drop policy if exists "members can read lab observations" on public.lab_observations;
create policy "members can read lab observations"
on public.lab_observations
for select
using (public.is_profile_member(profile_id));

drop policy if exists "owners and editors can write lab observations" on public.lab_observations;
create policy "owners and editors can write lab observations"
on public.lab_observations
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

drop policy if exists "members can read genetic reports" on public.genetic_reports;
create policy "members can read genetic reports"
on public.genetic_reports
for select
using (public.is_profile_member(profile_id));

drop policy if exists "owners and editors can write genetic reports" on public.genetic_reports;
create policy "owners and editors can write genetic reports"
on public.genetic_reports
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

drop policy if exists "members can read genetic findings" on public.genetic_findings;
create policy "members can read genetic findings"
on public.genetic_findings
for select
using (public.is_profile_member(profile_id));

drop policy if exists "owners and editors can write genetic findings" on public.genetic_findings;
create policy "owners and editors can write genetic findings"
on public.genetic_findings
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

drop policy if exists "members can read clinical signals" on public.clinical_signals;
create policy "members can read clinical signals"
on public.clinical_signals
for select
using (public.is_profile_member(profile_id));

drop policy if exists "owners and editors can write clinical signals" on public.clinical_signals;
create policy "owners and editors can write clinical signals"
on public.clinical_signals
for all
using (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]))
with check (public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[]));

do $$
begin
    if to_regclass('public.medication_lookup_cache') is not null then
        execute 'drop policy if exists "authenticated users can read medication lookup cache" on public.medication_lookup_cache';

        execute 'create policy "authenticated users can read medication lookup cache"
        on public.medication_lookup_cache
        for select
        to authenticated
        using (true)';
    end if;

    if to_regclass('public.medication_evidence_flags') is not null then
        execute 'drop policy if exists "authenticated users can read medication evidence flags" on public.medication_evidence_flags';

        execute 'create policy "authenticated users can read medication evidence flags"
        on public.medication_evidence_flags
        for select
        to authenticated
        using (true)';
    end if;
end;
$$;

-- Run this check after applying the migration. It should return zero rows.
select n.nspname as schemaname, c.relname as tablename
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and not c.relrowsecurity
order by c.relname;
