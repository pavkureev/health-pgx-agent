# Maintenance

## Local development

```bash
npm test
```

Open `index.html` directly or use the deployed URL.

## Git flow

Use `main` as the deploy branch. GitHub Actions deploys on push.

```bash
git status
git add .
git commit -m "..."
git push
```

After `git push`, deployment runs through GitHub Actions.

Avoid committing generated artifacts. `.gitignore` excludes:

- `dist/`
- `*.tar.gz`
- `*.bundle`
- `._*`
- `.vscode/`
- `supabase/.temp/`

After changing frontend scripts, bump their query version in `index.html`.
Never store a service role key in browser code.

## Manual SQL migrations

Run SQL in Supabase SQL Editor for now. CI intentionally does not apply migrations.

For Supabase security warning `rls_disabled_in_public`, run:

```sql
-- supabase/migrations/003_repair_public_rls.sql
```

The final diagnostic query in that migration should return zero rows.

## Manual shot-list sync

GitHub Actions → `Sync shot list` → `Run workflow`.

Treat the shot list as a critical reference source, not a regulatory database.

Expected successful response:

```json
{"synced":20,"parsed":16,"groupRules":4,"seedRules":12}
```

## Server fallback

If GitHub Actions is unavailable:

```bash
scp health-pgx-agent-update.tar.gz root@204.168.193.255:/root/
ssh root@204.168.193.255
cd /var/www/health-pgx-agent
tar -xzf /root/health-pgx-agent-update.tar.gz
supabase functions deploy lookup-medication
supabase functions deploy sync-shot-list
nginx -t
systemctl reload nginx
```
