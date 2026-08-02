-- TROQUE O E-MAIL ABAIXO PELO E-MAIL REAL DO DONO.
-- Depois execute no SQL Editor.

insert into public.perfis (id, nome, role)
select id, 'Dono da loja', 'dono'
from auth.users
where email = 'EMAIL_DO_DONO'
on conflict (id)
do update set
  nome = 'Dono da loja',
  role = 'dono';

-- Conferência:
select u.email, p.nome, p.role
from auth.users u
left join public.perfis p on p.id = u.id
where u.email = 'EMAIL_DO_DONO';
