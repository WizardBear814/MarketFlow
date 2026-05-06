# MarketFlow

Group final for ASE 220.

A multi-tier marketplace web app where buyers browse and search products,
add them to a cart, and check out; sellers create and manage product listings;
and admins moderate listings, manage users, and review inventory KPIs.

Produced by Oscar Bankemper, Logan Lambert, Naeun Kim, and Aiden Gill.

## Tech stack

- **Frontend:** Vanilla HTML / CSS / JavaScript (multi-page) — served as static files by the backend
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas) via Mongoose
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Validation:** `express-validator`

## Project layout

```
MarketFlow/
├── backend/                # Express API + Mongoose models + seed script
│   ├── server.js
│   ├── db.js
│   ├── auth-middleware.js
│   ├── auth-routes.js
│   ├── products.js
│   ├── users.js
│   ├── cart.js
│   ├── inventory.js
│   ├── User.js, Product.js, CartModel.js, Transaction.js
│   ├── seed.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/               # Static site served by Express on the same port
│   ├── index.html
│   ├── login.html, register.html, cart.html
│   ├── admin-products.html, admin-users.html, inventory-report.html
│   ├── api.js              # shared fetch / toast / nav / auth-guard helper
│   ├── *-page.js           # one script per page
│   └── styles.css
│
├── README.md
└── .gitignore
```

The backend serves both `/api/*` and the static frontend on the same port,
so there's no CORS pain — open `http://localhost:3002/` and the page's `fetch('/api/...')` calls just work.

## Setup (only needed once)

### 1. Clone and install backend dependencies

```bash
git clone <your-repo-url>
cd MarketFlow/backend
npm install
```

### 2. Create `.env`

Inside `backend/`, copy the example file:

```bash
# Windows PowerShell
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `backend/.env` and fill in:

```
PORT=3002
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/marketflow?retryWrites=true&w=majority
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
```

Tips:
- Use MongoDB Atlas (free tier). Add your IP to the cluster's whitelist.
- If your Atlas password contains special characters (`$`, `@`, `:`, etc.), URL-encode them.

### 3. Seed test data (optional but recommended)

From inside `backend/`:

```bash
npm run seed
```

That creates these accounts and a few sample products:

| Role   | Email                       | Password    |
|--------|-----------------------------|-------------|
| Admin  | admin@marketflow.com        | admin123    |
| Seller | seller@marketflow.com       | seller123   |
| Buyer  | buyer@marketflow.com        | buyer123    |

Re-running is safe — duplicates are skipped.

## Run

From inside `backend/`:

```bash
npm start
```

You should see:

```
MongoDB connected: <host>
MarketFlow API running on http://localhost:3002
Open the site:                   http://localhost:3002/
```

Open `http://localhost:3002/` in your browser. The Express server delivers the
`frontend/` files as static assets, and your `fetch('/api/...')` calls hit the
same origin, so nothing extra needs to run.

To stop, press `Ctrl + C` in the terminal.

## Implemented features

### Course-level requirements (rubric)
- ✅ Register / Login / Logout (JWT)
- ✅ Authentication enforced on the **server** (`protect` middleware)
- ✅ Authorization enforced on the **server** (`restrictTo('admin'|'seller'|...)`)
- ✅ Persistence in MongoDB (User, Product, Cart, Transaction)
- ✅ Validation client- and server-side (`express-validator`)
- ✅ Responsive layout (CSS grid + media queries)
- ✅ Full-stack integration on a single port
- ✅ Comprehensive CRUD across products, users, cart, inventory

### Approved MVPs
- **User registration and login** — `/api/auth/register`, `/api/auth/login`
- **Browse marketplace listings** — `index.html` + `GET /api/products`
- **Search for items** — `?search=` on `/api/products`
- **Create and manage listings** — `admin-products.html` (sellers + admins)
- **Mark items as sold** — when a sale is recorded the product's stock is decremented; products with `quantity = 0` show **Out of stock**
- **Admin: remove inappropriate listings** — `DELETE /api/products/:id` (admin only)
- **Admin: manage users** — `admin-users.html` + `/api/users` (admin only)

### Stretch / extras
- Cart with quantity adjustment, line removal, clear-cart, checkout that records sale transactions
- Inventory accounting dashboard (KPIs, sale/purchase log, stock auto-adjust)
- Toast notifications
- Role-aware navigation that auto-rebuilds based on the logged-in user

## REST API

All endpoints are prefixed with `/api`. JSON request/response bodies. JWT goes in
`Authorization: Bearer <token>` for protected routes.

### Auth

#### `POST /api/auth/register`
- **Auth:** none
- **Body:** `{ fullName, email, password, confirmPassword }`
- **201:** `{ status, token, user: { id, fullName, email, role } }`
- **400:** validation errors  ·  **409:** email already exists

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane","email":"jane@x.com","password":"secret123","confirmPassword":"secret123"}'
```

#### `POST /api/auth/login`
- **Auth:** none
- **Body:** `{ email, password }`
- **200:** `{ status, token, user }`
- **401:** wrong credentials  ·  **403:** account suspended

#### `GET /api/auth/me`
- **Auth:** required
- **200:** `{ status, user }`

### Products

| Method | Path                     | Purpose                | Auth                         |
|--------|--------------------------|------------------------|------------------------------|
| GET    | `/api/products?search=q` | List / search products | none                         |
| GET    | `/api/products/:id`      | One product            | none                         |
| POST   | `/api/products`          | Create                 | seller, admin                |
| PUT    | `/api/products/:id`      | Update                 | seller, admin                |
| DELETE | `/api/products/:id`      | Delete                 | admin                        |

`POST` body: `{ sku, name, description?, price, quantity }` — `409` if SKU exists.

### Users (admin only)

| Method | Path                | Purpose      |
|--------|---------------------|--------------|
| GET    | `/api/users`        | List users   |
| GET    | `/api/users/:id`    | One user     |
| POST   | `/api/users`        | Create user  |
| PUT    | `/api/users/:id`    | Update user  |
| DELETE | `/api/users/:id`    | Delete user  |

All require `Authorization: Bearer <admin-token>` (`401`/`403` otherwise).

### Cart (logged-in users)

| Method | Path                       | Purpose                                  |
|--------|----------------------------|------------------------------------------|
| GET    | `/api/cart`                | Get my cart                              |
| POST   | `/api/cart`                | Add item `{ productId, quantity? }`      |
| PUT    | `/api/cart/:productId`     | Update line quantity                     |
| DELETE | `/api/cart/:productId`     | Remove a line                            |
| DELETE | `/api/cart`                | Clear cart                               |

Stock is enforced server-side — exceeding `product.quantity` returns `400`.

### Inventory (seller / admin)

| Method | Path                       | Purpose                                                                     |
|--------|----------------------------|-----------------------------------------------------------------------------|
| GET    | `/api/inventory`           | KPIs + 50 most recent transactions                                          |
| POST   | `/api/inventory`           | Record `{ type:'sale'\|'purchase', productId, quantity, unitPrice }` — adjusts stock |
| DELETE | `/api/inventory/:id`       | Delete a transaction (admin only)                                           |

### Health

`GET /api/health` → `{ status:'ok', timestamp }`

## Common issues

| Symptom | Fix |
|---|---|
| `[db] Missing MONGO_URI environment variable.` | You forgot to create `backend/.env`. Copy from `.env.example`. |
| `MongoDB connection error: ...` | Check the URI, your IP is whitelisted in Atlas, special chars URL-encoded. |
| Login button doesn't disappear after login | Hard-refresh the page (cached JS). If still broken, ensure both `api.js` and the page-specific script are loaded. |
| `401 Not authorized` on every request | Your JWT expired. Log out and log in again. |
| Port already in use | Change `PORT` in `backend/.env`, then restart. |

## How to demo (quick walkthrough)

1. Log in as the seeded admin → register/login both work, role badge in nav.
2. Go to **Marketplace** → search "wireless" → 1 result.
3. Add an item to the cart while logged in as **buyer** → cart updates.
4. Log out, try to add to cart → blocked with "Please log in" toast.
5. Log in as **seller** → **Admin Products** lets you create / edit / delete.
6. **Inventory** → record a sale → stock decreases on the marketplace card; KPIs update.
7. Log in as **admin** → **Admin Users** lets you change roles and suspend/delete users.
