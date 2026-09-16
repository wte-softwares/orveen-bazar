-- The composite primary key is what makes a duplicate save harmless: the
-- API inserts with `on conflict (user_id, item_id) do nothing` rather than
-- checking-then-inserting, so a double-click or double-tap never surfaces
-- an error to the user.
create table public.wishlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.catalog_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

comment on table public.wishlists is
  'Saved items, owner-only. Composite PK makes duplicate saves a harmless no-op — always insert with ON CONFLICT DO NOTHING.';

create index wishlists_user_id_idx on public.wishlists (user_id);
