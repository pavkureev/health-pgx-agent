# Deploy to health.yelchervya.com

This app is a static frontend. It can be served from `/pgx/` with nginx.

## First deploy on the server

```bash
cd /var/www
git clone git@github.com:pavkureev/health-pgx-agent.git
cd health-pgx-agent
npm test
```

Add `deploy/nginx-health-pgx-agent.conf` into the existing nginx `server { ... }` block for `health.yelchervya.com`.

Then reload nginx:

```bash
nginx -t
systemctl reload nginx
```

Open:

```text
https://health.yelchervya.com/pgx/
```

## Updates

```bash
cd /var/www/health-pgx-agent
git pull
npm test
systemctl reload nginx
```

## Notes

- Patient profiles and parsed data are stored in the browser local storage.
- No uploaded medical files are sent to a backend in the current MVP.
- PDF text extraction uses pdf.js from a CDN. If the server later gets a strict CSP, host pdf.js locally.
