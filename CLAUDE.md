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
