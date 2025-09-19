# Data Model & Schema

This model balances flexibility (SurveyJS JSON per version) with analytics-friendly structures for responses.

## Entities

- `profiles` — application profile mapped to `auth.users`.
- `orgs` — organizations/workspaces.
- `org_memberships` — many-to-many user↔org with role.
- `clients` — client/customer/entity to survey; scoped to an org.
- `surveys` — logical survey container (e.g., "Annual Assessment").
- `survey_versions` — immutable SurveyJS JSON snapshots; published flag.
- `response_sets` — a single respondent session/context per client per version.
- `response_items` — normalized answers keyed by question path.
- `comments` — threaded notes attached to response sets.
- `attachments` — files in Storage associated to response sets.
- `audit_logs` — immutable audit events.

## SQL (Supabase Migrations)

```sql
-- profiles, linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- orgs and memberships
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.org_role as enum ('owner','admin','editor','viewer');

create table if not exists public.org_memberships (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'viewer',
  primary key (org_id, user_id)
);

-- clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists clients_org_id_idx on public.clients(org_id);

-- surveys and versions
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  key text not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.survey_versions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  version int not null,
  schema jsonb not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (survey_id, version)
);
create index if not exists survey_versions_published_idx on public.survey_versions(survey_id, published_at);

-- responses
create type public.response_status as enum ('draft','in_review','submitted','locked');

create table if not exists public.response_sets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  survey_version_id uuid not null references public.survey_versions(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  status public.response_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locked_at timestamptz
);
create index if not exists response_sets_org_idx on public.response_sets(org_id);
create index if not exists response_sets_client_idx on public.response_sets(client_id);

create table if not exists public.response_items (
  id bigserial primary key,
  response_set_id uuid not null references public.response_sets(id) on delete cascade,
  question_path text not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  unique (response_set_id, question_path)
);
create index if not exists response_items_gin on public.response_items using gin (value);

-- comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  response_set_id uuid not null references public.response_sets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

-- attachments metadata (files live in Storage)
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  response_set_id uuid not null references public.response_sets(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

-- audit logs
create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## Row-Level Security (RLS)

Enable RLS and grant access via membership roles.

```sql
alter table public.orgs enable row level security;
alter table public.org_memberships enable row level security;
alter table public.clients enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_versions enable row level security;
alter table public.response_sets enable row level security;
alter table public.response_items enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;

-- helper: is org member
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.org_memberships m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;

-- helper: has role at least (owner>admin>editor>viewer)
create or replace function public.has_org_role(org uuid, min_role public.org_role)
returns boolean language plpgsql stable as $$
declare r public.org_role;
begin
  select role into r from public.org_memberships where org_id = org and user_id = auth.uid();
  if r is null then return false; end if;
  return array_position(array['viewer','editor','admin','owner']::public.org_role[], r)
       >= array_position(array['viewer','editor','admin','owner']::public.org_role[], min_role);
end;
$$;

-- policies
create policy "orgs readable by members" on public.orgs for select using (public.is_org_member(id));
create policy "orgs manageable by owners" on public.orgs for all using (public.has_org_role(id,'owner')) with check (public.has_org_role(id,'owner'));

create policy "memberships by self or owner" on public.org_memberships for select using (user_id = auth.uid() or public.has_org_role(org_id,'owner'));

create policy "clients member access" on public.clients for select using (public.is_org_member(org_id));
create policy "clients editor manage" on public.clients for insert with check (public.has_org_role(org_id,'editor'));
create policy "clients editor update" on public.clients for update using (public.has_org_role(org_id,'editor')) with check (public.has_org_role(org_id,'editor'));

create policy "surveys member read" on public.surveys for select using (public.is_org_member(org_id));
create policy "surveys editor manage" on public.surveys for all using (public.has_org_role(org_id,'editor')) with check (public.has_org_role(org_id,'editor'));

create policy "survey_versions read" on public.survey_versions for select using (
  exists(select 1 from public.surveys s where s.id = survey_versions.survey_id and public.is_org_member(s.org_id))
);

create policy "responses member read" on public.response_sets for select using (public.is_org_member(org_id));
create policy "responses editor insert" on public.response_sets for insert with check (public.has_org_role(org_id,'editor'));
create policy "responses author or editor update" on public.response_sets for update using (
  created_by = auth.uid() or public.has_org_role(org_id,'editor')
) with check (
  created_by = auth.uid() or public.has_org_role(org_id,'editor')
);

create policy "response_items member read" on public.response_items for select using (
  exists(select 1 from public.response_sets rs where rs.id = response_items.response_set_id and public.is_org_member(rs.org_id))
);
create policy "response_items edit" on public.response_items for all using (
  exists(select 1 from public.response_sets rs where rs.id = response_items.response_set_id and (rs.created_by = auth.uid() or public.has_org_role(rs.org_id,'editor')))
) with check (
  exists(select 1 from public.response_sets rs where rs.id = response_items.response_set_id and (rs.created_by = auth.uid() or public.has_org_role(rs.org_id,'editor')))
);
```

## JSON Structures

- Survey schema (`survey_versions.schema`): SurveyJS JSON object for a version.
- Response item value: `jsonb` to support arrays, matrices, and rich answers.

```json
{
  "title": "Annual Assessment",
  "pages": [
    { "name": "intro", "elements": [ { "type": "text", "name": "contact.name", "title": "Contact name" } ] },
    { "name": "ops", "elements": [ { "type": "radiogroup", "name": "ops.size", "choices": ["S","M","L"] } ] }
  ]
}
```

