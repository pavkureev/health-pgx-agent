-- Repair child-row visibility after enabling RLS.
-- The app stores labs/documents under patient_profiles. Owners should be able
-- to read and write child rows even if an older profile_members row is missing
-- or stale.

create or replace function public.is_profile_owner(target_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.patient_profiles pp
        where pp.id = target_profile_id
          and pp.owner_user_id = auth.uid()
    );
$$;

drop policy if exists "members can read source documents" on public.source_documents;
create policy "members can read source documents"
on public.source_documents
for select
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id)
);

drop policy if exists "owners and editors can write source documents" on public.source_documents;
create policy "owners and editors can write source documents"
on public.source_documents
for all
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
)
with check (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
);

drop policy if exists "members can read lab observations" on public.lab_observations;
create policy "members can read lab observations"
on public.lab_observations
for select
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id)
);

drop policy if exists "owners and editors can write lab observations" on public.lab_observations;
create policy "owners and editors can write lab observations"
on public.lab_observations
for all
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
)
with check (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
);

drop policy if exists "members can read genetic reports" on public.genetic_reports;
create policy "members can read genetic reports"
on public.genetic_reports
for select
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id)
);

drop policy if exists "owners and editors can write genetic reports" on public.genetic_reports;
create policy "owners and editors can write genetic reports"
on public.genetic_reports
for all
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
)
with check (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
);

drop policy if exists "members can read genetic findings" on public.genetic_findings;
create policy "members can read genetic findings"
on public.genetic_findings
for select
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id)
);

drop policy if exists "owners and editors can write genetic findings" on public.genetic_findings;
create policy "owners and editors can write genetic findings"
on public.genetic_findings
for all
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
)
with check (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
);

drop policy if exists "members can read clinical signals" on public.clinical_signals;
create policy "members can read clinical signals"
on public.clinical_signals
for select
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id)
);

drop policy if exists "owners and editors can write clinical signals" on public.clinical_signals;
create policy "owners and editors can write clinical signals"
on public.clinical_signals
for all
using (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
)
with check (
    public.is_profile_owner(profile_id)
    or public.is_profile_member(profile_id, array['owner', 'editor']::public.profile_role[])
);

-- Diagnostic for pkureev@gmail.com. It should show the profiles with
-- owner_membership_present=true and non-zero labs.
select
    au.email,
    pp.id as profile_id,
    pp.display_name,
    exists (
        select 1
        from public.profile_members pm
        where pm.profile_id = pp.id
          and pm.user_id = pp.owner_user_id
          and pm.role = 'owner'
    ) as owner_membership_present,
    count(distinct sd.id) as documents,
    count(lo.id) as lab_observations,
    min(lo.observed_on) as first_lab_date,
    max(lo.observed_on) as last_lab_date
from public.patient_profiles pp
join auth.users au on au.id = pp.owner_user_id
left join public.source_documents sd on sd.profile_id = pp.id
left join public.lab_observations lo on lo.profile_id = pp.id
where au.email = 'pkureev@gmail.com'
group by au.email, pp.id, pp.display_name
order by pp.created_at;
