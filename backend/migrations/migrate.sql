\set ON_ERROR_STOP on
\echo 'Starting migrations...'

\i ./00_base.sql
\i ./01_schemas.sql
\i ./02_security.sql
\i ./03_events.sql
\i ./04_people.sql
\i ./05_finance.sql

\i mock-data/new/00_security.sql

\echo 'All migrations completed successfully!'