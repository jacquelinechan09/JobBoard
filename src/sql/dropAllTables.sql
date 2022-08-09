-- Drop all tables (adapted from https://stackoverflow.com/a/61221726, https://stackoverflow.com/a/4202280,
-- https://stackoverflow.com/a/53062718, and https://stackoverflow.com/a/18341502)

DO
$$
DECLARE
    row RECORD;
BEGIN
    FOR row IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || row.tablename || ' CASCADE;';
    END LOOP;
END;
$$;
