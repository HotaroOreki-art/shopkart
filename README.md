# ShopKart

Full-stack shopping lab: customer auth, product catalog, wishlist, cart, Razorpay Test Mode checkout, and order history.

The React app lives in `shopkart-frontend`. The Express API lives in `shopkart-backend`. MongoDB stores customers, products, wishlists, carts, and orders.

## Run it locally

Use two terminals.

### Backend

```bash
cd shopkart-backend
npm install
```

Copy `.env.example` to `.env` and fill in your own values:

- `MONGO_URI` from MongoDB Atlas
- `JWT_SECRET` any long random string
- `PORT` defaults to `8000` in the example
- `CLIENT_URL` is `http://localhost:5173` for local development
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the Razorpay dashboard in **Test Mode**

```bash
npm run dev
```

The API is at `http://localhost:8000`. A health check is `GET /health`.

### Frontend

```bash
cd shopkart-frontend
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

Open `http://localhost:5173`.

## What the app does

1. Register and log in. The API stores a JWT in an HttpOnly cookie.
2. Browse products, search by name, filter by category, and sort by price.
3. Save products to a wishlist and add them to the cart.
4. Check out with a shipping address. The server rechecks stock, snapshots the price, and opens Razorpay Test Mode.
5. After the payment signature is verified, the order is marked paid and the cart is cleared.
6. Previous orders are listed under Orders.

Product stock is checked again at checkout. A successful order does not reduce the catalog stock.

## Deployed environment variables

Set these on the backend host. Do not commit `.env`.

| Name | Purpose |
|---|---|
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | Signs the login cookie |
| `NODE_ENV` | `production` on the host |
| `CLIENT_URL` | The frontend origin, for CORS |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode key id |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Mode secret |

On the frontend host, set `VITE_API_URL` to `https://<backend-host>/api` and rebuild.

In production the auth cookie uses `SameSite=None` and `Secure`, so the Vercel site can call the API on another host. Locally it stays `SameSite=Strict`.

`render.yaml` describes the free Render web service for `shopkart-backend`. Enter the secret values in the Render dashboard when the blueprint asks for them.
