# SDLE Compass — Architecture & Implementation Guide

## Product Name
**SDLE Compass** — configurable in `src/config/app.ts`

## Purpose
A professional, connected study platform for the Saudi Dental Licensure Examination (SDLE). Students always know what to study next, why an answer was wrong, and exactly where to find the correct information.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19 |
| Language | TypeScript | ~6 |
| Build Tool | Vite | 8 |
| Styling | Tailwind CSS | v4 (CSS-first) |
| Database & Auth | Supabase | 2.x (PostgreSQL 15 + GoTrue) |
| State (server) | TanStack Query | 5 |
| State (client) | Zustand | 5 |
| Routing | React Router | 7 |
| Forms | React Hook Form + Zod | 7 + 4 |
| Icons | Lucide React | latest |
| Toasts | Sonner | 2 |
| Charts | Recharts | 3 |
| Animations | Framer Motion | 12 |
| i18n | i18next + react-i18next | 26 + 17 |
| AI | Claude Fable 5 via Supabase Edge Functions | — |

---

## Important Folders

```
sdle-compass/
├── docs/                   # Architecture and guides
├── supabase/
│   ├── migrations/         # Ordered SQL migration files
│   └── schema.sql          # Full schema reference
├── src/
│   ├── config/
│   │   └── app.ts          # APP_NAME, APP_CONFIG — change product name here
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client (anon key only)
│   │   └── utils.ts        # cn(), formatDate(), shared helpers
│   ├── types/
│   │   └── index.ts        # All TypeScript interfaces
│   ├── store/
│   │   └── auth.ts         # Zustand auth store
│   ├── hooks/              # Shared React hooks
│   ├── components/
│   │   ├── ui/             # Reusable design-system components
│   │   ├── layout/         # AppShell, Sidebar, Header, MobileNav
│   │   └── shared/         # Feature-level shared components
│   ├── pages/
│   │   ├── auth/           # Login, Signup, ForgotPassword
│   │   ├── student/        # Student-facing pages
│   │   └── admin/          # Admin-facing pages
│   └── locales/
│       ├── en/             # English translations
│       └── ar/             # Arabic translations
```

---

## Database Setup

Supabase project required. Set the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Never** place the service role key in frontend code or `.env` files that are committed.

Edge Functions (server-side) use `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` as Supabase secrets, not in any frontend file.

---

## Authentication

Supabase Auth (email + password). After sign-up, a trigger creates a row in `public.users` with role = `student`. Administrators promote accounts via the admin panel.

Roles: `student` | `editor` | `reviewer` | `admin` | `main_admin`

Protected routes check the role from `public.users` (not just the auth session).

---

## AI Architecture

**Model:** Claude Fable 5 (`claude-fable-5`) with server-side fallback to `claude-opus-4-8`.

**Pattern:** All AI calls go through Supabase Edge Functions. The frontend sends a request to `/functions/v1/ai-tutor` (or similar). The Edge Function calls the Anthropic API with the service-level key, applies RAG from embeddings stored in Supabase (pgvector), and returns a grounded response.

**The Anthropic API key is never exposed in frontend code.**

---

## Environment Variables

```env
# Required — Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional — Feature flags
VITE_APP_ENV=development
```

Edge Function secrets (set via Supabase dashboard, never in .env):
```
ANTHROPIC_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # auto-provided by Supabase runtime
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run typecheck    # TypeScript check without emit
npm run lint         # ESLint
```

---

## Build Phases

| Phase | Status | Description |
|---|---|---|
| 0 | ✅ | Audit + architecture plan |
| 1 | 🔄 | Foundation + design system |
| 2 | — | Authentication + profiles + RBAC |
| 3 | — | Curriculum + subject management |
| 4 | — | Resource library |
| 5 | — | Notes + flashcards |
| 6 | — | Question bank foundation |
| 7 | — | Quiz engine |
| 8 | — | Mock examinations |
| 9 | — | Performance analytics |
| 10 | — | Study planner |
| 11 | — | AI knowledge system (Fable 5) |
| 12 | — | AI question generation |
| 13 | — | PDF question import |
| 14 | — | Global search |
| 15 | — | Reporting + quality control |
| 16 | — | Arabic + English full support |
| 17 | — | Notifications |
| 18 | — | Security + privacy |
| 19 | — | Accessibility |
| 20 | — | Final testing + production |

---

## Key Assumptions

1. Supabase project must be created manually before running the app. The app gracefully shows a configuration message if env vars are missing.
2. Claude Fable 5 requires 30-day data retention — ZDR Supabase plans are not compatible with the AI Edge Functions.
3. PDF book distribution must comply with copyright. The platform supports licensing metadata but does not bypass restrictions.
4. The examination blueprint weighting is administrator-configurable (not hard-coded).
5. AI-generated questions are never auto-published; all must pass the review queue.
6. Arabic support uses `dir="rtl"` on the `<html>` element and RTL-aware Tailwind classes (`rtl:` prefix).
