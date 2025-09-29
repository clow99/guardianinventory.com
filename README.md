<<<<<<< HEAD
## Guardian Inventory

This project is a Next.js application for managing inventory, assets, and related workflows. It now supports Umami analytics for tracking user engagement across key UI interactions.

### Analytics configuration

Set the following environment variables before running the app to enable tracking:

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: The Umami site identifier.
- `NEXT_PUBLIC_UMAMI_HOST_URL` (optional): Base URL to your self-hosted Umami instance (omit when using `https://analytics.umami.is`).

If the website ID is not provided, the analytics script will be skipped automatically.

### Development

Install dependencies and start the development server:

```powershell
npm install
npm run dev
```

The server defaults to `http://localhost:3000`.
=======
# Guardian Inventory

Local asset management portal built with Next.js and MySQL-backed APIs.

## Local Self-Signup Workflow
- Copy `.env.example` to `.env` and adjust MySQL credentials if needed.
- Ensure a MySQL instance is running and accessible with those credentials.
- Start the dev server with `npm install` and `npm run dev`.
- Visit `http://localhost:3000/auth/register`.
- Complete the registration form (including Account name) to create a user and a private account in your local database.

## Environment Flags
- `ENABLE_SELF_SIGNUP`/`NEXT_PUBLIC_ENABLE_SELF_SIGNUP`: set to `1` to allow the registration flow to automatically create accounts (defaults to enabled outside production).
- `NEXTAUTH_SECRET`: required by NextAuth for local JWT signing; the dev default in `.env.example` is safe for local testing only.
- `MYSQL_*`: connection details consumed by `serverless-mysql` in API routes.

## Demo Data
- Run `npm run seed` to bootstrap the database schema and load six months of realistic assets, tasks, and categories for the sample "Seed Demo Account".
- The seed creates (or reuses) an admin user. Defaults: `admin@guardian.test` / `guardian123`. Override with the `SEED_ADMIN_*` env vars before running the script.
- After seeding, sign in with those credentials and the dashboard charts will immediately reflect the generated metrics.

## Notes
- The registration API will provision required tables (`users`, `accounts`, `account_users`) if they are missing -- handy for a fresh local database.
- The first user created through self-signup is promoted to admin and added to the newly created account with `last_selected` set, so the dashboard loads immediately after sign-in.
>>>>>>> 9602f3c0a8b703cce89550a113bb9bb9e76f8db3
