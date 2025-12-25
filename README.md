# SINMA BAZAAR 🛍️

A modern e-commerce platform specialized in women's clothing, kitchenware, and accessories.

## 🌟 Features

### Customer Features
- **Product Catalog**: Browse products by category (Women's Clothing, Kitchenware, Accessories)
- **Shopping Cart**: Add products to cart with size and color options
- **Wishlist**: Save favorite products for later
- **Order Tracking**: Track orders using phone number
- **Guest Checkout**: Place orders without registration
- **Bilingual Support**: Full Arabic and English support with RTL layout
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Admin Features
- **Product Management**: Add, edit, and delete products with images
- **Order Management**: View and update order status (Pending, Confirmed, Preparing, Shipped, Delivered)
- **Analytics Dashboard**: 
  - Total revenue and inventory value calculations
  - Category-wise breakdowns (stock, value, orders, revenue)
  - Top selling products
  - Order status overview
- **Secure Admin Panel**: Password-protected admin access

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Package Manager**: pnpm

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/codeminionsdz/sinmabazaar.git
cd sinmabazaar
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
Run the SQL scripts in order from the `scripts/` folder in your Supabase SQL Editor:
- `001_create_tables.sql`
- `002_create_profile_trigger.sql`
- `003_add_admin_policies.sql`
- `004_add_guest_orders_support.sql`
- `005_fix_guest_orders_rls.sql`
- `006_fix_orders_table_nullable_user.sql`

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── products/          # Product pages
│   ├── track-order/       # Order tracking
│   └── wishlist/          # Wishlist
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── customer/         # Customer-facing components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client setup
│   ├── admin-auth.ts    # Admin authentication
│   └── i18n.ts          # Internationalization
├── scripts/             # Database migration scripts
└── public/              # Static assets
```

## 🚀 Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/codeminionsdz/sinmabazaar)

### Manual Deployment

1. Build the project:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

## 🔐 Admin Access

To access the admin panel:
1. Navigate to `/admin/auth`
2. Use the admin credentials (set up in your database)

Default admin credentials should be set during database initialization.

## 🌍 Localization

The platform supports:
- **Arabic (العربية)**: RTL layout with full Arabic translation
- **English**: LTR layout

Switch languages using the language toggle in the header.

## 📊 Database Schema

The application uses the following main tables:
- `products`: Product information with category, price, and stock
- `product_images`: Multiple images per product
- `product_sizes`: Available sizes (XS, S, M, L, XL)
- `product_colors`: Available colors
- `orders`: Customer orders (supports both authenticated and guest users)
- `order_items`: Items within each order
- `wishlists`: User wishlists

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

**Code Minions DZ**
- GitHub: [@codeminionsdz](https://github.com/codeminionsdz)

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- UI components from Shadcn/ui
- Icons from Lucide React

---

Made with ❤️ by Code Minions DZ
