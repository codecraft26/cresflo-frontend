# Cresflo AI Advisor — Frontend

Next.js console for the Cresflo AI Advisor prototype. It exercises the full backend flow: superadmin and organization authentication, organization/user provisioning, document ingestion for retrieval, and a WebSocket-streamed advisor chat.

This app is a thin client over the [`cresflo-backend`](../cresflo-backend) API — it has no server-side business logic of its own; every dashboard section maps to a backend capability described in that repo's design doc.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- Plain `fetch`/`WebSocket` against the backend — no data-fetching or state library

## Prerequisites

- Node.js 20+ (or Bun, which this repo is set up to use — see `bun.lock`)
- The [`cresflo-backend`](../cresflo-backend) running locally (Postgres + pgvector, Redis, and the Express API). See that repo's README for setup.

## Getting started

```bash
bun install        # or npm install / pnpm install
bun dev             # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits redirect to `/login`.

## Environment variables

Create `.env.local` (or edit `.env`):

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3004
```

This is the base URL the frontend calls for both HTTP requests (`lib/api.ts`) and the advisor WebSocket (`ws://…/ws/advisor`). It defaults to `http://localhost:3000` if unset, so set it explicitly whenever the backend runs on a different port than the frontend.

## Scripts

| Command | Description |
| --- | --- |
| `dev` | Start the dev server with Turbopack |
| `build` | Production build |
| `start` | Serve the production build |
| `lint` | Run ESLint |

## Project structure

```text
app/
  login/                    organization sign-in
  superadmin/login/         superadmin sign-in
  dashboard/                authenticated shell, one route per section
    overview/ access/ organizations/ users/
    documents/ advisor-chat/ diagnostics/

components/
  advisor/
    workbench/               dashboard shell + state (see below)
    auth-portal.tsx          shared login screen (superadmin/organization)
    document-ingestion-panel.tsx
    advisor-chat-panel.tsx
    organization-panel.tsx, organization-user-panel.tsx, ...
  ui/                        design-system primitives (button, card, field, icon, select, ...)

lib/
  api.ts                     typed fetch calls to the backend
  session-storage.ts         localStorage-backed session persistence
  types.ts                   shared API/domain types
```

### `components/advisor/workbench/`

The dashboard's data layer and shell, split by responsibility:

- `context.tsx` — `DashboardProvider`/`useDashboardContext`: all dashboard state, API calls, and the advisor WebSocket connection
- `shell.tsx` — sidebar, header, and the authenticated/unauthenticated page chrome
- `route-layout.tsx` — wires the provider and shell together for `app/dashboard/layout.tsx`
- `pages/*.tsx` — one component per dashboard route (`overview`, `access`, `organizations`, `users`, `documents`, `advisor-chat`, `diagnostics`)
- `index.tsx` — barrel export consumed by `app/dashboard/**/page.tsx`

## Auth model

Two independent session types, each persisted separately in `localStorage` via `lib/session-storage.ts`:

- **Superadmin** — logs in at `/superadmin/login`, can create organizations and organization users, manage documents for any organization.
- **Organization user** — logs in at `/login`, scoped to one tenant; `admin` role can manage that organization's documents, all roles can use advisor chat.

Both sessions can be held at once (e.g. for testing), and the dashboard header exposes a switcher when that happens. The active view determines which sidebar sections and data are shown — see `isSuperadminView` / `isOrganizationView` in `context.tsx`.

## Notes

- There is no build-time or runtime validation that `NEXT_PUBLIC_BACKEND_URL` points at a reachable backend — connection and auth failures surface as inline error banners and a `Disconnected`/`Error` chat connection state.
- The advisor chat WebSocket reconnects manually (via the "Reconnect" action in the chat panel), not automatically.
