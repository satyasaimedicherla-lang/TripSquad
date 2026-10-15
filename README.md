# TripSquad

A Supabase-backed MVP for budget-first group travel. Serve the folder over HTTP to run it.

## Supabase authentication

Authentication uses Supabase Auth with email/password sign-up, sign-in, session restoration, password reset, and sign-out.

1. Create or open a Supabase project and enable Email auth under Authentication → Providers.
2. Copy `supabase-config.js` and replace the project URL and publishable/anon key with the values from Project Settings → API.
3. Serve the folder over HTTP (for example `python3 -m http.server`) and open the local URL. ES modules and Supabase Auth do not work reliably from a `file://` URL.

Only the publishable/anon key belongs in this browser app. Never put a Supabase service-role key in `supabase-config.js`.

## Project structure

```
TripSquad/
├── index.html       # Application shell and loading screen
├── styles.css       # Responsive visual system and page styling
├── app.js           # Routes, Supabase data access, and UI interactions
├── supabase-config.js # Browser-safe Supabase project configuration
├── supabase-schema.sql # Tables and Row Level Security policies
└── README.md        # Product and run notes
```

## Included flows

- Responsive landing page with clear product flow
- Supabase sign up, sign in, session restoration, password reset, and sign out
- Supabase trip discovery with search, vibe, and budget filters
- Real trip detail pages with costs, itinerary, spot count, and organiser
- Real saved trips stored in `saved_trips`
- Real join requests stored in `trip_requests`
- Real trip publishing form for authenticated organisers
- Profile editing backed by the `profiles` table

Run `supabase-schema.sql` in the Supabase SQL Editor before using trip discovery, saving, publishing, or join requests. The schema enables Row Level Security and keeps users limited to their own profile, saved trips, and requests. The app intentionally does not show fake chat, fake votes, simulated security controls, local “account deletion”, or pretend payment flows.
