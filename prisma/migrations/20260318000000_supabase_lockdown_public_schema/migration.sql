-- Lock down Supabase API access to the application tables.
-- This project uses Supabase for Auth only; all DB access is via Prisma.
--
-- Goal:
-- - Prevent `anon` / `authenticated` roles from reading/writing tables in `public`
-- - Enable RLS on all `public` tables as defense-in-depth
-- - Keep Prisma/server role behavior unchanged (table owners bypass RLS by default)

DO $$
DECLARE
  r RECORD;
  role_name TEXT;
BEGIN
  -- Ensure the roles exist before attempting privilege changes.
  FOR role_name IN SELECT unnest(ARRAY['anon', 'authenticated']) LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE USAGE ON SCHEMA public FROM %I', role_name);
      EXECUTE format('REVOKE CREATE ON SCHEMA public FROM %I', role_name);
    END IF;
  END LOOP;

  -- Revoke on all current tables and enable RLS.
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);

    FOR role_name IN SELECT unnest(ARRAY['anon', 'authenticated']) LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I', r.tablename, role_name);
      END IF;
    END LOOP;
  END LOOP;

  -- Revoke on all sequences (Prisma may have created some).
  FOR r IN
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    FOR role_name IN SELECT unnest(ARRAY['anon', 'authenticated']) LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE public.%I FROM %I', r.sequence_name, role_name);
      END IF;
    END LOOP;
  END LOOP;

  -- Revoke on all functions in public schema (avoid accidental RPC exposure).
  FOR r IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    FOR role_name IN SELECT unnest(ARRAY['anon', 'authenticated']) LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON FUNCTION %s FROM %I', r.signature, role_name);
      END IF;
    END LOOP;
  END LOOP;

  -- Future-proof: revoke default privileges for objects created in public schema.
  -- Note: default privileges are scoped to the role executing this migration.
  FOR role_name IN SELECT unnest(ARRAY['anon', 'authenticated']) LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TYPES FROM %I', role_name);
    END IF;
  END LOOP;
END $$;

