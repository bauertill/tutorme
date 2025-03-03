-- This migration acknowledges extensions that are already installed in the Supabase database
-- It won't try to create them, just mark them as known to Prisma

-- Note: These extensions are already available in the Supabase database:
-- - pg_graphql
-- - pg_stat_statements
-- - pgcrypto
-- - pgjwt
-- - pgsodium
-- - supabase_vault
-- - uuid-ossp

-- This migration uses a technique called "fake migration" to sync Prisma's migration state
-- with what's already in the database, without trying to make changes to the database itself.

SELECT 1;  -- Dummy SQL that does nothing but allows Prisma to mark this migration as applied 