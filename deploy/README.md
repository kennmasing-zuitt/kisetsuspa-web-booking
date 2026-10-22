# Going live: kisetsuspa.com

Three sites on the same Droplet, behind the shared Nginx proxy:

| Address                                 | What                                              | Project                  |
| --------------------------------------- | ------------------------------------------------- | ------------------------ |
| `https://scheduling.kisetsuspa.com`     | Staff scheduling app                              | kisetsu-scheduler-client |
| `https://scheduling-api.kisetsuspa.com` | API (`/graphql` staff, `/booking/graphql` public) | kisetsu-scheduler-server |
| `https://kisetsuspa.com/book`           | Client booking site                               | kisetsu-booking-client   |

## 1. Accounts to set up first

### Cloudflare Turnstile (free bot check before texting codes)

- [ ] Sign up at <https://dash.cloudflare.com/sign-up>. The domain does **not** have to move to
      Cloudflare; DNS can stay at Namecheap.
- [ ] In the dashboard: **Turnstile** → **Add widget**.
    - Widget name: `Kisetsu booking`
    - Hostnames: `kisetsuspa.com` and `www.kisetsuspa.com`. Add `localhost` too if you want to
      try the real widget locally.
    - Widget mode: **Managed** (Cloudflare decides; most people never see a challenge).
    - Pre-clearance: **No**.
- [ ] Copy the **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in this project's `.env`.
- [ ] Copy the **Secret key** → `TURNSTILE_SECRET_KEY` in the server's `.env`. Never put the
      secret in the booking site.
- [ ] For local development, keep Cloudflare's test keys (always pass): site key
      `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

### Semaphore (SMS)

- [ ] Sign up at <https://semaphore.co> and load credits (₱0.56 per text before VAT; setup
      codes use the priority OTP route, 2 credits per text).
- [ ] **Sender Names** → request `KISETSUSPA`. Texts can't use it until Semaphore approves it, so
      do this early.
- [ ] **Account** → copy the API key → `SEMAPHORE_API_KEY` in the server's `.env`, with
      `SMS_PROVIDER=semaphore` and `SEMAPHORE_SENDER_NAME=KISETSUSPA`.
- [ ] Send yourself a test: on the booking site, **Set up online booking** with your own number.

## 2. DNS at Namecheap

Domain List → kisetsuspa.com → **Advanced DNS** → add **A records** pointing at the Droplet's IP:

| Type     | Host             | Value          |
| -------- | ---------------- | -------------- |
| A Record | `@`              | `<droplet IP>` |
| A Record | `www`            | `<droplet IP>` |
| A Record | `scheduling`     | `<droplet IP>` |
| A Record | `scheduling-api` | `<droplet IP>` |

Check with `dig +short kisetsuspa.com` (and the others) before asking for a certificate.

## 3. Certificate

One certificate for all four names, named `kisetsuspa` (the proxy confs expect
`/etc/letsencrypt/live/kisetsuspa/`). Use the same certbot method as your `masings-apps`
certificate, e.g. with the webroot your proxy serves `/.well-known/acme-challenge/` from:

```sh
certbot certonly --webroot -w <proxy acme webroot> --cert-name kisetsuspa \
  -d kisetsuspa.com -d www.kisetsuspa.com \
  -d scheduling.kisetsuspa.com -d scheduling-api.kisetsuspa.com
```

## 4. Deploy, in this order

1. **Server** (kisetsu-scheduler-server): add to `.env` `TOTP_ENCRYPTION_KEY`,
   `TURNSTILE_SECRET_KEY`, `SMS_PROVIDER=semaphore`, `SEMAPHORE_API_KEY`,
   `SEMAPHORE_SENDER_NAME=KISETSUSPA`, `SPA_PHONE`. Then `docker compose up -d --build`. Copy its
   `nginx.conf` to the proxy as `scheduling-api.conf`.
2. **Staff app** (kisetsu-scheduler-client): `.env` with
   `NEXT_PUBLIC_GRAPHQL_URL=https://scheduling-api.kisetsuspa.com/graphql`, then
   `docker compose up -d --build`. Copy its `nginx.conf` to the proxy as `scheduling.conf`.
3. **Booking site** (this project): `.env` with `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>`, then
   `docker compose up -d --build`. Copy `deploy/kisetsuspa.conf` to the proxy as
   `kisetsuspa.conf`.
4. Reload the proxy: `docker exec <nginx-proxy> nginx -t && docker exec <nginx-proxy> nginx -s reload`.
5. Sign in to the staff app as an admin: it asks you to set up two-factor sign-in first.

Checks: `curl https://scheduling-api.kisetsuspa.com/health` → `{"status":"ok"}`;
`https://kisetsuspa.com/book/` shows the sign-in page.
