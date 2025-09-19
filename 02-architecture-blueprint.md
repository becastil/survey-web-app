# Architecture Blueprint

## High-Level Design

- Next.js 14 App Router (TypeScript) for UI and routing.
- SurveyJS for dynamic survey rendering and conditional logic.
- Supabase for PostgreSQL, Auth (JWT), RLS, Storage, Realtime, and Edge Functions.
- Vercel for hosting, previews, and edge caching.
- Observability via Vercel Analytics, Log Drains, and Supabase logs.

## Data Flow

1. User authenticates via Supabase Auth (email/password or OAuth if enabled).
2. Client queries via Supabase JS client with RLS enforcing org- and role-based access.
3. Survey rendering uses versioned SurveyJS JSON fetched from `survey_versions`.
4. Responses save incrementally (autosave) to `response_sets` and `response_items`.
5. Realtime channels broadcast presence and updates to collaborating clients.
6. Server-side rendering for SEO-light pages; client-side heavy interactions for forms.
7. Exports rendered via server routes/Edge Functions streaming CSV/PDF.

## Key Services

- Auth & Session: Supabase Auth; Next.js middleware to gate protected routes.
- DB & RLS: Postgres with carefully scoped policies; JSONB for survey schema.
- Storage: Supabase Storage buckets for attachments/exports (scoped by org).
- Realtime: Channels by `org_id` and `response_set_id` with presence metadata.
- Edge Functions: Exports, heavy processing (e.g., Excel import/transform).

## Client Modules

- `app/(auth)` for sign-in/up; `app/(protected)` for authenticated views.
- `components/survey/` with SurveyJS wrappers and adapters.
- `lib/supabase/` for server/client Supabase clients.
- `lib/logic/` for conditional logic helpers and expression evaluation.
- `lib/export/` for CSV/Excel/PDF utilities.

## Example: Supabase Client (Server & Client)

```ts
// lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );
}
```

```ts
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Realtime Channels

- Presence: `presence:org:{org_id}` — who’s online in the org.
- Document: `response:{response_set_id}` — responding users + patch broadcasts.

## Caching & Performance

- Next.js Route Segment Config: `revalidate` for survey schemas; client-side SWR for responses.
- DB: GIN indexes on JSONB paths used for analytics filters.
- Client: lazy-load SurveyJS components and heavy charts.

## Security Highlights

- All data access via RLS; no public admin keys client-side.
- Storage buckets with JWT-scoped policies.
- Edge Functions require JWT with role claims.

