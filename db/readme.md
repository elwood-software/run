# Elwood Run Database Control

Get more information at [elwood.run/docs/db](https://elwood.run/docs/db).

This is a [PostgreSQL TLE](https://github.com/aws/pg_tle) (extension) which attempts to provide supabase projects.

Docs available at [elwood.run/docs/db](https://elwood.run/docs/db).

## Install or Update
```sql
/*
Requires:
  - pg_tle: https://github.com/aws/pg_tle
  - pgsql-http: https://github.com/pramsey/pgsql-http
*/
create extension if not exists http with schema extensions;
create extension if not exists pg_tle;
drop extension if exists "elwood-run-supabase";
select pgtle.uninstall_extension_if_exists('elwood-run-supabase');
select
    pgtle.install_extension(
        'elwood-run-supabase',
        resp.contents ->> 'version',
        'Elwood Run Database',
        resp.contents ->> 'sql'
    )
from http(
    (
        'GET',
        'https://elwood.run/db/latest.json',
        array[]::http_header[],
        null,
        null
    )
) x,
lateral (
    select
        ((row_to_json(x) -> 'content') #>> '{}')::json
) resp(contents);

create extension "elwood-run-supabase";
```