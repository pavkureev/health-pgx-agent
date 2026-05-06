-- Repair profile visibility after enabling RLS.
-- Some profiles may have been created while RLS was disabled or before the
-- membership row was reliably written. Backfill owner memberships so existing
-- source documents and lab observations become visible through RLS again.

insert into public.profile_members (profile_id, user_id, role)
select pp.id, pp.owner_user_id, 'owner'::public.profile_role
from public.patient_profiles pp
where pp.owner_user_id is not null
on conflict (profile_id, user_id) do update
set role = case
    when public.profile_members.role = 'owner' then public.profile_members.role
    when excluded.user_id = (
        select owner_user_id
        from public.patient_profiles
        where id = excluded.profile_id
    ) then 'owner'::public.profile_role
    else public.profile_members.role
end;

drop policy if exists "members can read patient profiles" on public.patient_profiles;
create policy "members can read patient profiles"
on public.patient_profiles
for select
using (
    owner_user_id = auth.uid()
    or public.is_profile_member(id)
);

-- Diagnostic: this should return zero rows after the backfill.
select pp.id, pp.display_name, pp.owner_user_id
from public.patient_profiles pp
left join public.profile_members pm
  on pm.profile_id = pp.id
 and pm.user_id = pp.owner_user_id
where pp.owner_user_id is not null
  and pm.profile_id is null
order by pp.created_at;
