# Gadget Store Backend

Node.js / Express / MongoDB (Mongoose) backend for the electronics and gadgets e-commerce store. This phase covers **Categories**, **Products** (with reviews), and a working **Orders** flow so checkout has somewhere real to submit to.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
   - `MONGODB_URI` — a local MongoDB instance (`mongodb://127.0.0.1:27017/gadget-store`) or a free MongoDB Atlas cluster connection string.
   - `CLIENT_URL` — comma-separated list of frontend origins allowed to call the API (your Lovable storefront preview, admin dashboard, `localhost`, etc.)
3. Seed the database with your existing product/category catalogue:
   ```
   npm run seed
   ```
   This inserts the 7 categories and 16 products (with their original reviews) that were already used as mock data in the Lovable storefront, so the API isn't empty. Run `npm run seed:destroy` any time to wipe it clean.
4. Start the server:
   ```
   npm run dev
   ```
   The API runs at `http://localhost:5000` by default. Check it's alive at `GET /api/health`.

## Project Structure

```
server.js                     entry point: express app, middleware, route mounting
src/
  config/db.js                MongoDB connection
  models/                     Category, Product, Review, Order (Mongoose schemas)
  controllers/                request handlers per resource
  routes/                     route definitions per resource
  middleware/                 asyncHandler, ApiError, global error handler
  utils/
    APIFeatures.js            filter/search/sort/paginate helper for product listing
    seed.js                   seeds categories/products/reviews from the current catalogue
```

## API Reference

All responses are JSON in the shape `{ success, data, ...extras }`. Errors return `{ success: false, message }`.

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories with subcategories. `?shoppable=true` to exclude "support". |
| GET | `/api/categories/:slug` | Get one category by slug (e.g. `audio`). |
| POST | `/api/categories` | Create a category. |
| PUT | `/api/categories/id/:id` | Update a category by Mongo `_id`. |
| DELETE | `/api/categories/id/:id` | Delete a category (blocked if products still reference it). |
| POST | `/api/categories/id/:id/subcategories` | Add a subcategory. |
| PUT | `/api/categories/id/:id/subcategories/:subId` | Update a subcategory. |
| DELETE | `/api/categories/id/:id/subcategories/:subId` | Delete a subcategory. |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products. Supports `category`, `subcategory`, `brand` (comma-separated), `minPrice`, `maxPrice`, `tags`, `inStock`, `search`, `sort` (`price-asc`, `price-desc`, `newest`, `rating`), `page`, `limit`. |
| GET | `/api/products/featured` | Featured products for the hero / Hot & New section. |
| GET | `/api/products/brands` | Distinct brand list for the filter sidebar. |
| GET | `/api/products/:slug` | Get one product by slug, including its approved reviews. |
| GET | `/api/products/:slug/related` | Related products from the same category. |
| POST | `/api/products/:slug/reviews` | Customer submits a review — goes into the moderation queue as `pending`. |
| POST | `/api/products` | Create a product. |
| PUT | `/api/products/id/:id` | Update a product by Mongo `_id`. |
| DELETE | `/api/products/id/:id` | Delete a product (and its reviews). |

### Reviews (admin moderation)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reviews` | List all reviews. Supports `status`, `rating`, `product`. |
| PATCH | `/api/reviews/:id` | Approve/reject a review, or set a `storeReply`. |
| DELETE | `/api/reviews/:id` | Delete a review. |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place an order (checkout). Re-prices items server-side, checks stock, decrements it. |
| GET | `/api/orders` | List orders. Supports `status`, `email`. |
| GET | `/api/orders/:id` | Get one order. |
| PATCH | `/api/orders/:id` | Update `status`, `paymentStatus`, or `internalNotes`. |

**Example order payload:**
```json
{
  "customer": {
    "name": "Jane Wanjiku",
    "email": "jane@example.com",
    "phone": "0712345678",
    "address": "123 Moi Avenue",
    "city": "Nairobi"
  },
  "items": [
    { "product": "<productId>", "quantity": 1, "color": "Black" }
  ],
  "deliveryFee": 300,
  "paymentMethod": "cash_on_delivery"
}
```

## Not Wired Up Yet (next steps)

- **Auth**: admin login (JWT), and the `TODO` comments in each route file mark exactly where `protect`/`admin` middleware needs to go once it exists.
- **Image uploads**: product/category images are plain string URLs right now (seeded as placeholder paths). Add an upload endpoint (e.g. Cloudinary or S3) and swap the placeholder paths for real hosted URLs.
- **Payments**: `paymentMethod`/`paymentStatus` fields exist on Order but no gateway is connected yet (M-Pesa is the obvious one for Kenya).
- **Sitemap/robots.txt generation**: the storefront's SEO requirements call for this to be driven by real product/category data — a good next small addition once this API is live.

Bring this back once it's running and we'll wire up admin authentication next, followed by image uploads and the M-Pesa payment flow.
