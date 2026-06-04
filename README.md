# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Google Search Console data

The dashboard falls back to local sandbox data unless Google OAuth credentials are configured.

Set these values in `.env.local` to enable real Search Console imports:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
```

Create a Google OAuth web client with this redirect URI:

```txt
http://localhost:3000/api/auth/google/callback
```

After setting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, open **Manage Websites** and click **Connect Google**. The callback page will show the `GOOGLE_REFRESH_TOKEN` value to add to `.env.local`.

Once configured, open **Manage Websites** and click **Load GSC Sites** to list verified Search Console properties. Importing a property fetches 28-day GSC query, page, country, device, and trend data through the server API.

## Supabase persistence

Website records are persisted in Supabase when these values exist in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run [supabase/schema.sql](supabase/schema.sql) once in the Supabase SQL editor. The dashboard uses the server-only service role key for website management today, while RLS is enabled so auth and workspace roles can be added next.
