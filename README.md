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
