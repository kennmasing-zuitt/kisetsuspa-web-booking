# kisetsu-booking-client

Kisetsu Spa's public booking site, **kisetsuspa.com/book**. Clients set it up once (a code by
SMS, then an authenticator app such as Google Authenticator) and afterwards sign in with only
their mobile number and the 6-digit code from the app. They pick a day (today to 7 days ahead),
a treatment and length, a therapist or "anyone", and a free time. Cancelling is by phone.

```
/book/        sign in: mobile + app code              (First time? → /book/setup/)
/book/setup/  mobile + bot check → texted code → name (new clients) → QR → first app code
/book/new/    day · treatment · therapist · time → confirm
/book/done/   "You're booked"
```

## Stack

Next.js (App Router) as a **static export** (`output: "export"`, `basePath: "/book"`): `npm run
build` writes plain files to `out/`, served by Nginx. No Node server in production. Redux Toolkit

- RTK Query talk to the server's **public** endpoint, `/booking/graphql`, typed by GraphQL Code
  Generator from the server's `booking.schema.graphql`, so staff operations aren't even available
  to type-check. The session (30 minutes) is kept in `sessionStorage` and sent as a Bearer token.

## Getting started

```sh
npm install
cp .env.example .env          # NEXT_PUBLIC_MOCK_API=true to click through without the server
npm run dev                   # http://localhost:2500/book/
```

With the real server: run kisetsu-scheduler-server (its `BOOKING_CORS_ORIGINS` allows
`http://localhost:2500` in development) with `SMS_PROVIDER=console`: the texted code is printed in
the server log. Cloudflare's test keys (the defaults) always pass the bot check.

In mock mode, `0917 123 4567` already has the app, the texted code is `123456` and any 6-digit
app code works.

| Script                        | What it does                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `dev`                         | Dev server on port 2500                                                        |
| `build`                       | Static export to `out/`                                                        |
| `codegen`                     | Regenerate `src/gql` from `../kisetsu-scheduler-server/booking.schema.graphql` |
| `typecheck`, `lint`, `format` | The usual                                                                      |

After changing the server's public API, print the schema there
(`npm run schema:print -- schema.graphql booking.schema.graphql`) and run `npm run codegen` here.

## Project structure

```
src/
  app/                 pages: / (sign in), setup/, new/, done/
  lib/                 graphqlBaseQuery (public API), mock API, mobile numbers, formatting
  store/               session (sessionStorage), last booking, RTK Query base API
  mods/session/        sign-in, setup flow, Cloudflare Turnstile, route guards
  mods/booking/        booking wizard, confirmation, season colours
  gql/                 generated (don't edit)
deploy/                Nginx confs and the go-live checklist
```

## Security notes

- Only the public endpoint is used. It has its own CORS list, rate limits and schema on the
  server; staff tokens don't work there and client tokens don't work on the staff API.
- Every sign-in failure looks the same (`INVALID_CLIENT_CODE`), so the page can't be used to find
  out who is a client. Five wrong codes pause sign-in for 15 minutes.
- Texting a code needs a passed Turnstile check, and the server limits codes per number and IP,
  because each text costs money.

## Deploying

See [deploy/README.md](deploy/README.md): Cloudflare Turnstile and Semaphore checklists, Namecheap
DNS, the certificate, and the order to deploy the three projects.
