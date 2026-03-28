-- One-time repair for the existing admin account that is stuck with role = 'customer'.
-- If your admin email is different, replace both occurrences of admin@dkp.com before running.

with target_user as (
  select id, email
  from auth.users
  where email = 'admin@dkp.com'
  limit 1
)
insert into public.profiles (id, full_name, role)
select id, 'Admin User', 'admin'
from target_user
on conflict (id) do update
set role = 'admin',
    updated_at = now();

select p.id, u.email, p.full_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@dkp.com';
