-- Fase B (ADR 005) — modos de checkout por produto
-- direct: comprar agora (preço fixo)
-- variant: personalizar (variantes simples antes do checkout)
-- quote: solicitar orçamento (form → Lead no CRM)
-- contact_only: apenas exibir (sem botão de compra, só fala com vendedor)

alter table products
  add column if not exists checkout_mode text not null default 'direct'
    check (checkout_mode in ('direct', 'variant', 'quote', 'contact_only'));

-- variants: lista de grupos de opção, ex:
-- [{"name": "Cor", "options": ["Roxo", "Verde", "Azul"]}, {"name": "Tamanho", "options": ["P", "M", "G"]}]
alter table products
  add column if not exists variants jsonb;

-- allows_custom: cliente pode pedir customização extra mesmo nos modos direct/variant
alter table products
  add column if not exists allows_custom boolean not null default false;

create index if not exists idx_products_checkout_mode
  on products (checkout_mode);
