# Fix-Link Admin Portal

Separate React app for **administrators** and **moderators** of the Fix-Link platform. Uses the same visual language as `fix-link-frontend` (Inter/Outfit, primary blue, glass panels, dark mode).

## Run locally

```bash
cd fix-link-admin
npm install
cp .env.example .env
npm run dev
```

Opens at **http://localhost:5174** (main customer/pro app usually runs on 5173).

## Auth

- Uses the same backend: `POST /api/users/login/`
- Only users with `role: "admin"` or `role: "moderator"` can sign in
- Tokens are stored separately (`admin_access_token`) so staff can stay logged in without conflicting with the main app

## Routes

| Path | Role |
|------|------|
| `/login` | Public |
| `/admin` | Admin overview |
| `/admin/users` | User list |
| `/admin/jobs` | Jobs |
| `/admin/payments` | Payments |
| `/admin/reviews` | Reviews |
| `/admin/notifications` | Notifications |
| `/moderator` | Moderator overview |
| `/moderator/jobs` | Jobs queue |
| `/moderator/reviews` | Reviews |
| `/moderator/reports` | Reports (placeholder) |

## Backend notes

Create staff users in Django with `role=admin` or `role=moderator`. Ensure list endpoints allow staff JWT access; otherwise tables may be empty and the dashboard shows a warning.

## Project layout

```
fix-link-admin/
  src/
    api/          # axios client + auth + data fetches
    components/   # layout, tables, stat cards
    context/      # auth + theme
    pages/        # login, admin/*, moderator/*
```
