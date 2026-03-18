# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Next.js dev server on :3000
pnpm server       # json-server mock API on :3001 (watches db.json)
pnpm build        # Production build + type check
pnpm lint         # ESLint
pnpm format       # Prettier (auto-fixes in place)
```

## Architecture

**App Router** — all routes live under `src/app/`. Server Components are the default; add `'use client'` only when needed (event handlers, hooks, browser APIs).

**Data layer**
- `src/providers/query-provider.tsx` — `QueryClientProvider` wrapping the whole tree (mounted in `src/app/layout.tsx`). Use `useQuery`/`useMutation` from `@tanstack/react-query` for all client-side data fetching.
- `json-server` serves `db.json` at `http://localhost:3001` as a REST API during development. Add collections to `db.json` to expose new endpoints (e.g., `"users": []` → `GET /users`).

**State** — Zustand for global client state. Create stores under `src/store/`.

**Forms** — React Hook Form + Zod + `@hookform/resolvers`. Define schemas with Zod, pass the resolver to `useForm`.

**Components**
- shadcn/ui components are installed into `src/components/ui/` via `pnpm dlx shadcn@latest add <component>`.
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) for conditional class merging.
- Icons: lucide-react.

**Styling** — Tailwind CSS v4 (PostCSS plugin, no `tailwind.config.js`). Theme tokens are CSS variables defined in `src/app/globals.css` under `:root` / `.dark`. shadcn uses the `base-nova` preset with neutral base color.

**Path alias** — `@/*` maps to `src/*`.

## Feature architecture (screaming architecture)

Feature-specific code lives co-located with its route using `_`-prefixed dirs (Next.js private folders, not routable):

```
src/app/login/
  page.tsx
  _components/login-form.tsx
  _hooks/use-login.ts
```

Shared code that crosses feature boundaries stays in `src/`:
- `src/types/` — shared TypeScript types
- `src/lib/` — shared constants and utilities
- `src/store/` — global Zustand stores

## Auth

- `src/types/auth.ts` — `User`, `UserRole`, `LoginCredentials` types
- `src/lib/auth.ts` — `AUTH_COOKIE_NAME`, `PUBLIC_ROUTES`, `API_URL` constants
- `src/store/auth-store.ts` — Zustand store with cookie `persist` adapter; exposes `login(user)` / `logout()`
- `src/app/login/_hooks/use-login.ts` — TanStack Query `useMutation` that queries json-server `/users?email&password`, then calls `store.login`
- `src/proxy.ts` — Next.js 16 route protection (replaces `middleware.ts`); exports named `proxy(request)` + `config.matcher`; redirects unauthenticated requests to `/login` and authenticated users away from `/login`

## Code Style

When creating UI for this project always try to use shadcn components using the best practices, only utilize custom components when necessary.
