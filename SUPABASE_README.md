# MenuMaster - Supabase migration

## 1. Create the database

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Open `SUPABASE_SETUP.sql`.
4. Run the whole file.

## 2. Configure the frontend

Open:

`src/api/supabaseClient.js`

Set:

```js
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Get both values from **Supabase Dashboard -> Project Settings -> API**.

Use the **anon/publishable key**, never the `service_role` key in browser code.

## 3. Authentication

The project now uses Supabase Auth for both:

- normal users
- restaurants

User accounts are stored in `auth.users` + `public.profiles`.
Restaurant accounts are stored in `auth.users` + `public.restaurants`.

The Auth metadata contains `role: user` or `role: restaurant`.

## 4. Email confirmation

The code supports email confirmation. If you want the original project behaviour where a user can login immediately after signup, disable email confirmation in:

**Authentication -> Providers -> Email -> Confirm email**

If confirmation remains enabled, the user must click the confirmation email before login.

## 5. Password reset

Password reset now uses Supabase's secure reset-link flow instead of the old custom backend 6-digit code flow.

Make sure the URL below is allowed in Supabase:

`http://localhost:5500/commonfiles/password-reset.html`

If you use another local development port or deploy the project, add the corresponding URL under:

**Authentication -> URL Configuration -> Redirect URLs**

## 6. Run the project

Because the project uses ES modules and imports Supabase from a CDN, do not open the HTML files with `file://`.

Use a local web server, for example VS Code **Live Server**, and open:

`commonfiles/main-page.html`

## 7. Backend

The old `http://localhost:5000/api` backend is no longer used.

The application now talks directly to Supabase through:

- `src/api/supabaseClient.js`
- `src/api/userService.js`
- `src/api/restaurantService.js`
- `src/api/authService.js`

`axiosInstance.js` is kept only as a compatibility placeholder and is not used by the application.
