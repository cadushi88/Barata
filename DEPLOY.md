# Deploying Barata

Barata runs on Vercel with a Neon Postgres database. Locally (no `DATABASE_URL`)
it falls back to an in-memory PGLite database with no configuration needed —
these variables only matter for a real deployment.

## Required environment variables

Set these in Vercel → Project → Settings → Environment Variables, for both the
**Production** and **Preview** scopes, then redeploy.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon/Postgres connection string. Without it the app falls back to PGLite even when deployed — fine for a demo, but data doesn't persist across deploys/restarts. |
| `BETTER_AUTH_SECRET` | **Yes, once `DATABASE_URL` is set** | Signs and verifies session cookies. **The app refuses to start without this when `DATABASE_URL` is set** — see below for why. |
| `ANTHROPIC_API_KEY` | Yes (for AI receipt reading) | Claude API key used by `parseReceipt` to read grocery receipts. Without it, receipt reading returns a clear "AI is not available" message instead of failing. |
| `BETTER_AUTH_URL` | Optional | Only needed if you see "Invalid origin" errors — the app already trusts Vercel's own `VERCEL_URL`/`VERCEL_PROJECT_PRODUCTION_URL` automatically. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Enables the "Continue with Google" button. Hidden client-side when unset. |

### Why `BETTER_AUTH_SECRET` is required, not just recommended

Without an explicit secret, the app falls back to a **random secret generated
per server process**. On Vercel's serverless runtime that's one random secret
per warm instance/cold start — not one per deployment. A session cookie signed
by one instance fails signature verification on another, so sessions "randomly"
stop working: a signed-in visitor's next request can come back `Unauthorized`,
or a previously-valid session can appear signed out, with no code bug to point
at (this doesn't reproduce locally, where dev runs one long-lived process and
so only ever sees one secret).

The app now **fails loudly at startup** instead of silently running with a
random secret in this situation — if you see the app crash with
`BETTER_AUTH_SECRET must be set when DATABASE_URL is configured`, add the
variable and redeploy. Generate one with:

```sh
openssl rand -hex 32
```

## Verifying a deploy

After setting the variables above and redeploying:

1. **Login → Add to list**: sign in, add an item to your list from the
   catalog, then open `/list` — the item should be there. If `/list` stays
   empty or you're bounced to `/login` with an error, `BETTER_AUTH_SECRET` is
   most likely missing or was just added (existing sessions signed under the
   old random secret won't verify — sign out and back in).
2. **Quantity + remove**: on `/list`, use the +/− stepper and the Remove
   button — both should update immediately with no error banner.
3. **Receipt parsing**: on `/contribute`, click "Read with AI" with the
   sample receipt text already filled in.
   - With `ANTHROPIC_API_KEY` set: items appear, sorted by category and price.
   - Without it: a clear "AI is not available in this environment" message —
     not a generic failure.
4. **Messages**: on `/messages`, send a note and confirm it appears in the
   list below the form with no error.
