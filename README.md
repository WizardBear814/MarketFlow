# MarketFlow

Group final for ASE 220.

A nearby-marketplace web app where buyers can browse/search listings,
contact sellers, and save items to a wishlist; sellers can create and
manage listings; and admins can moderate listings and users.

## Tech Stack

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express *(coming next)*
- **Database:** MongoDB *(coming next)*
- **External API:** Google Maps API *(coming next)*

## Project Layout

```
MarketFlow/
├── frontend/        # React app (this is what runs right now)
│   ├── src/
│   │   ├── api/         # mock API layer (localStorage-backed for now)
│   │   ├── components/  # reusable UI pieces
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # route pages
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/         # (coming next: Express + MongoDB)
└── README.md
```

The old static HTML mockups (`index.html`, `login.html`, etc.) at the
repo root are the prototype phase and can be removed once the React
app is fully working.

## Run the frontend

```
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

## Test credentials (mock data, seeded on first load)

- Buyer:  `buyer@marketflow.com` / `buyer123`
- Seller: `seller@marketflow.com` / `seller123`
- Admin:  `admin@marketflow.com` / `admin123`

> Data is stored in your browser's `localStorage` for now.
> To reset the demo data, open DevTools → Application → Local Storage and clear it.

## What's implemented (frontend)

- User registration, login, logout (mock)
- Browse marketplace listings with search + category filter
- View listing details, contact seller (reveal email)
- Wishlist (add / view / remove)  *(buyer feature)*
- Create / edit / delete listings  *(seller feature)*
- Mark items as sold / available  *(seller feature)*
- Admin: remove any listing
- Admin: manage users (change role, enable/disable, delete)
- Role-based navigation and route protection on the client

## Planned API (to be implemented in `backend/`)

| Method | Route                       | Purpose                          | Auth |
|--------|-----------------------------|----------------------------------|------|
| POST   | /auth/register              | Create a new user account        | No   |
| POST   | /auth/login                 | Login + token                    | No   |
| POST   | /auth/logout                | End the session                  | Yes  |
| GET    | /listings                   | List/search products             | No   |
| GET    | /listings/:id               | Get one listing                  | No   |
| POST   | /listings                   | Create a listing                 | Yes (seller/admin) |
| PUT    | /listings/:id               | Edit a listing                   | Yes (owner/admin) |
| PATCH  | /listings/:id/status        | Mark sold / available            | Yes (owner/admin) |
| DELETE | /listings/:id               | Remove a listing                 | Yes (owner/admin) |
| GET    | /wishlist                   | Get current user's wishlist      | Yes  |
| POST   | /wishlist/:listingId        | Add to wishlist                  | Yes  |
| DELETE | /wishlist/:listingId        | Remove from wishlist             | Yes  |
| GET    | /admin/users                | List all users                   | Yes (admin) |
| PATCH  | /admin/users/:id            | Update role / status             | Yes (admin) |
| DELETE | /admin/users/:id            | Delete a user                    | Yes (admin) |

The frontend's `src/api/*.js` files already match these shapes, so
swapping `localStorage` calls for `fetch` to the backend will be
mostly mechanical.
