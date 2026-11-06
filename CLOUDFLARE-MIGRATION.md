# PartnerFind — Cloudflare setup

The application API and database use Cloudflare Workers and D1. Static site assets are served by the Worker. Admin access uses a built-in admin password: the first /admin visit creates it (PBKDF2 hash stored in D1 under the internal, non-public settings id `admin_auth`), and the Worker issues an HMAC-signed HttpOnly session cookie. The app contains only the landing page, its admin settings page, the two hero counters, and the hero countdown. It no longer includes course, premium-token, profile, invitation, or matching workflows, APIs, or data tables; D1 holds a single `settings` table. The Hero and CTA buttons continue to open the existing Tally embeds; Tally is an external form provider and its responses are not stored by this app's D1 API.

## Local development

Prerequisites: Node.js 20+ and npm.

1. Run `npm install`.
2. Copy `.dev.vars.example` to `.dev.vars`. The local admin bypass only works in Wrangler's explicit local development environment; never copy it into production.
3. Run `npm run db:local:migrate` to create the local D1 schema and apply cleanup migration `0002`.
4. Run `npm run dev` and check `/api/health`.

Local D1 data is separate from any Cloudflare production database. These steps do not read or change remote data.

## Cloudflare setup still required

1. Create a D1 database with `npx wrangler d1 create partnerfind-db`, then replace the placeholder `database_id` in `wrangler.toml` with the returned ID.
2. No Cloudflare Access setup is needed. Open `/admin` once after deploy and create the admin password in the setup form.
3. Review the D1 schema migrations. For an existing database that previously ran migration `0001`, migration `0002_remove_retired_features.sql` drops the retired `profiles`, `creator_invites`, `invite_redemptions`, `submissions`, `matches`, and `tokens` tables. Applying the remote migration permanently deletes those retired tables and their contents; review the target database and backups before running `npm run db:remote:migrate`.
4. Run `npm run build`, then deploy only after configuration and acceptance testing with `npm run deploy`.

The Cloudflare database ID, Access team domain, and Access audience are placeholders until configured. No remote migration, deployment, production DNS change, or access-policy change has been run by this package preparation.

## API remaining in this build

- Public read-only settings: `GET /api/settings/:id`.
- Admin session: `GET /api/admin/session`.
- Admin settings writes: `PUT` or `PATCH /api/admin/settings/:id`, requiring a valid admin session cookie issued by the Worker after password login.
- Health check: `GET /api/health`.

There are no course, premium-token, profile, invitation, partner-directory, matching, or partnership-submission APIs in this build. Tally handles the Hero/CTA form submissions independently.

## Commands

- `npm run build` — build the SPA.
- `npm run lint` — TypeScript check.
- `npm run db:local:migrate` — apply D1 migrations locally.
- `npm run db:remote:migrate` — apply D1 migrations remotely; review and back up first because migration `0002` deletes the retired tables.
- `npm run dev` — run the Worker and SPA locally.
- `npm run deploy` — deploy the Worker and static assets.
