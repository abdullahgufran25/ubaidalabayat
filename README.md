# Ubaid Al Abayat - Luxury Pakistani Fashion E-commerce Platform

Ubaid Al Abayat is a COMPLETE, production-ready, premium e-commerce web application designed for a high-end Modesty Abaya and Hijab fashion brand. It features a fully responsive customer catalog website, customer profiles, shopping cart, Cash on Delivery (COD) and Bank Transfer checkouts, order tracking timeline, and an interactive Admin Dashboard panel for content, category, product, inventory, discount coupons, and review moderations.

---

## 1. Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS (Custom luxury theme), React Router DOM (v6), Axios, Context API (Auth, Cart, Settings, and Toast contexts), Lucide Icons, and responsive mobile drawers.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT) authentication, bcrypt hashing, Multer file parser, Cloudinary API, Helmet security, central error handler, and CORS.
- **Database**: MongoDB (Mongoose ODM), compatible with MongoDB Atlas. Has dynamic auto-seeding on startup and dynamic fallback to in-memory database if local/Atlas instances are not running.

---

## 2. Folder Structure

```text
ubaid-al-abayat/
│
├── client/                      # React / Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, ProductCard, Drawer, etc.)
│   │   ├── context/             # Auth, Cart, Settings, and Toast Contexts
│   │   ├── layouts/             # MainLayout (public) and AdminLayout (dashboard)
│   │   ├── pages/               # Home, Shop, Details, Cart, Checkout, Success, Policies
│   │   │   ├── customer/        # Customer Profile, Orders History & tracking
│   │   │   └── admin/           # Admin Dashboard, Products, Orders, Inventory CRUDs
│   │   ├── App.jsx              # Routing configurations
│   │   └── main.jsx             # Entrypoint mounts
│   └── package.json
│
├── server/                      # Node.js / Express Backend
│   ├── config/                  # Database connections
│   ├── controllers/             # Express controllers (Auth, Products, Orders, etc.)
│   ├── middleware/              # Auth protections & central Error Handler
│   ├── models/                  # Mongoose models (User, Product, Order, Coupon, etc.)
│   ├── routes/                  # Express REST routes mapping
│   ├── services/                # Image uploading services (Multer / Cloudinary)
│   ├── uploads/                 # Static local images fallback storage
│   ├── seed.js                  # Database seeder (20+ premium products)
│   ├── server.js                # App entrypoint
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 3. Environment Variables

Create a `.env` file at the root of the project (or copy `.env.example`).

```env
# Server Configurations
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Supports local & MongoDB Atlas)
MONGO_URI=mongodb://localhost:27017/ubaid-al-abayat

# Authentication Secrets
JWT_SECRET=ubaid_al_abayat_jwt_secret_token_123456789_abcdef
JWT_EXPIRES_IN=7d

# Cloudinary Images (Optional, fallbacks to local directory if empty)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Defaults Fallbacks
WHATSAPP_NUMBER=923001234567
DEFAULT_SHIPPING_CHARGES=200
DEFAULT_FREE_SHIPPING_THRESHOLD=5000
DEFAULT_CURRENCY=PKR
```

---

## 4. Local Installation & Setup

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### Step 1: Clone and install packages
Open your terminal in the project root and run:
```bash
# Install root, client, and server dependencies
npm run install:all
```
*Note: On Windows PowerShell, if script execution is disabled, you can run `cmd.exe /c npm run install:all`.*

### Step 2: Database Seeding
If you have MongoDB installed and running locally, you can seed the database with realistic products, categories, coupons, and mock orders:
```bash
npm run seed
```
**Default Seeding Credentials:**
- **Admin account:**
  - Email: `admin@ubaidalabayat.com`
  - Password: `adminpassword123`
- **Customer account:**
  - Email: `customer@ubaidalabayat.com`
  - Password: `customerpassword123`

*Self-Seeding System: If no local MongoDB is running, the server will automatically download and spawn an in-memory MongoDB instance (`mongodb-memory-server`) and seed itself on initial startup, letting you test out-of-the-box with zero setup!*

### Step 3: Run Locally (Development)
Start both frontend and backend concurrently:
```bash
npm run dev
```
- Frontend will open on: [http://localhost:5173](http://localhost:5173)
- Backend will run on: [http://localhost:5000](http://localhost:5000)

---

## 5. Main Features Walkthrough

### 1. Customer Website
- **Home:** Interactive hero sliders, premium categories lists, new arrivals and bestsellers grids, customer testimonials.
- **Shop Catalog:** Advanced pagination, sort filters (price-low, price-high, newest, popular, bestselling), categories, sizes (52, 54, 56, 58), colors, price range bounds, and sale flags. Filter selections are mapped to URL query parameters for shareability.
- **Product Details:** Zoomable picture gallery, sizing/color selection checks, stock level alerts, and direct WhatsApp placement API.
- **Order Placement:** COD or bank details verification checks, discount coupon validations, cart item subtotals calculations, and success screens.
- **Orders Timeline:** Customer dashboard with a step-by-step order tracking timeline (Pending → Confirmed → Processing → Shipped → Delivered).

### 2. Admin Dashboard
- **Overview:** Interactive cards for Sales Revenue, today's order count, monthly sales, low-stock warnings, and recent orders log.
- **Products Manager:** CRUD catalog table with multi-image file uploads and promotional toggles.
- **Categories Manager:** CRUD category names and upload category covers.
- **Orders Manager:** Moderation panel to view client orders, update logistics status (e.g. Cancelled returns stock, Delivered marks Paid), and save courier tracking IDs.
- **Inventory Hub:** Real-time stock counts audit, low-stock warnings, and manual adjustments logger.
- **Coupons:** CRUD manager for percentage/fixed coupons with minimum values and usage limits.
- **Reviews:** Moderate and approve reviews before displaying them on product cards.
- **Banners & Store Settings:** Upload slide banners and configure shipping rates or WhatsApp support numbers dynamically without editing code files.

---

## 6. REST API Endpoint Overview

### Authentication `/api/auth`
- `POST /register` - Register a customer account
- `POST /login` - Log in to account
- `GET /me` - Get profile details (Auth protect)
- `PUT /profile` - Update details (Auth protect)
- `PUT /update-password` - Update password (Auth protect)
- `GET /users` - View all users (Admin/Staff protect)

### Products `/api/products`
- `GET /` - List products with filter queries
- `GET /slug/:slug` - Get product by SEO slug name
- `GET /:id` - Get product by ID
- `POST /` - Create product + images upload (Admin/Staff protect)
- `PUT /:id` - Update product + images upload (Admin/Staff protect)
- `DELETE /:id` - Delete product (Admin protect)

### Categories `/api/categories`
- `GET /` - List active categories
- `POST /` - Create category + image upload (Admin/Staff protect)
- `PUT /:id` - Update category + image upload (Admin/Staff protect)
- `DELETE /:id` - Delete category (Admin protect)

### Orders `/api/orders`
- `POST /` - Place order (Deducts stock + logs transactions)
- `GET /my-orders` - List customer orders (Customer protect)
- `GET /` - View all orders (Admin/Staff protect)
- `GET /:id` - Order details page (Auth / Phone validation protect)
- `PUT /:id/status` - Change status (Admin/Staff protect)
- `PUT /:id/tracking` - Save tracking ID (Admin/Staff protect)

### Coupons `/api/coupons`
- `POST /validate` - Validate coupon against cart total
- `GET /` - List coupons (Admin/Staff protect)
- `POST /` - Create coupon (Admin protect)
- `PUT /:id` - Update coupon (Admin protect)
- `DELETE /:id` - Delete coupon (Admin protect)

---

## 7. Production Deployment

### Frontend (Vercel / Netlify / Hostinger)
Build optimized production code:
```bash
npm run build:client
```
Deploy the generated `client/dist` directory. Ensure the proxy config or API URL matches your hosted backend service.

### Backend (Render / Railway / VPS / Hostinger)
Ensure Node environment is production:
```bash
NODE_ENV=production
PORT=80
```
Start the Node server:
```bash
npm start
```
Render/Railway will automatically parse the `package.json` scripts. Ensure your MongoDB Atlas URL and Cloudinary environment variables are configured in the dashboard.
