-- RPC pra criar Lead via formulário público de orçamento.
-- Roda como SECURITY DEFINER → bypass RLS sem expor service_role.
-- Resolve dono via catalog.slug e valida que produto pertence ao mesmo dono.

create or replace function public.create_catalog_lead(
  p_catalog_slug  text,
  p_product_id    text,
  p_name          text,
  p_contact       text,
  p_notes         text,
  p_date          text default to_char(now(), 'YYYY-MM-DD')
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id    text;
  v_user_id    uuid;
  v_project_id text;
  v_product_user uuid;
begin
  if coalesce(trim(p_name), '')        = '' then raise exception 'Nome é obrigatório';        end if;
  if coalesce(trim(p_notes), '')       = '' then raise exception 'Descrição é obrigatória';   end if;
  if coalesce(trim(p_contact), '')     = '' then raise exception 'Contato é obrigatório';     end if;
  if coalesce(trim(p_catalog_slug), '')= '' then raise exception 'catalog_slug é obrigatório';end if;
  if coalesce(trim(p_product_id), '')  = '' then raise exception 'product_id é obrigatório';  end if;

  select user_id, project_id
    into v_user_id, v_project_id
    from catalogs
   where slug = p_catalog_slug
     and is_public = true
   limit 1;

  if v_user_id is null then
    raise exception 'Catálogo não encontrado ou não é público';
  end if;

  select user_id into v_product_user
    from products
   where id = p_product_id
   limit 1;

  if v_product_user is null or v_product_user <> v_user_id then
    raise exception 'Produto não pertence a este catálogo';
  end if;

  v_lead_id := 'lead-' || extract(epoch from now())::bigint::text || '-' || substr(md5(random()::text), 1, 6);

  insert into leads (id, user_id, project_id, name, contact, source, status, value, notes, date)
  values (v_lead_id, v_user_id, v_project_id, trim(p_name), trim(p_contact), 'catalog', 'new', 0, p_notes, p_date);

  return v_lead_id;
end;
$$;

grant execute on function public.create_catalog_lead(text, text, text, text, text, text) to anon, authenticated;
