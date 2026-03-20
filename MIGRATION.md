# Database migration

## If `npx prisma migrate dev` fails with P1000 (Authentication failed)

1. **Get the correct connection strings from Supabase**
   - Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **Database**.
   - Under **Connection string**, copy:
     - **URI** for **Session mode** (port **5432**) → use for `DIRECT_URL`.
     - **URI** for **Transaction mode** (port **6543**) → use for `DATABASE_URL`; add `?pgbouncer=true` at the end.
   - If you use a custom **Prisma** database user (see [Supabase Prisma docs](https://supabase.com/docs/guides/database/prisma)), use that user and password instead of `postgres`.

2. **Reset database password if needed**
   - In **Project Settings** → **Database**, use **Reset database password**.
   - Update both `DATABASE_URL` and `DIRECT_URL` in `.env` with the new password.
   - Encode special characters in the URL: `@` → `%40`, `#` → `%23`, `!` → `%21`, `%` → `%25`.

3. **Ensure project is not paused**
   - Free-tier projects can be paused; resume from the dashboard if needed.

## Required `.env` variables

- `DATABASE_URL` – Transaction mode pooler: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL` (required for reliable migrations) – Session mode: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-eu-west-1.supabase.com:5432/postgres`

Replace `[PROJECT_REF]` and `[PASSWORD]` with your project reference and database password.
