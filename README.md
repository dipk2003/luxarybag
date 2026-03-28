# LuxeBag Ecommerce

Vite + React storefront and admin panel backed by Supabase only.

## Project Overview

LuxeBag Ecommerce is a full-stack fashion ecommerce project built for a premium handbag brand. It combines a customer-facing storefront with a protected admin panel so the same codebase can manage products, orders, leads, reviews, blog content, brand settings, and storefront content from one place.

The project is designed as a practical business-ready system rather than a static frontend demo. Public users can browse products, read blog content, place COD orders, track orders, and connect through WhatsApp or lead forms. Admin users can log in with Supabase Auth and manage the operational side of the store.

## Key Features

- Premium storefront with home, shop, category, product detail, reviews, blog, FAQ, contact, checkout, and order tracking pages
- Admin dashboard with protected routes and role-based login
- Product catalog management with featured products, best sellers, new arrivals, stock flags, pricing, and media
- Order management and customer order tracking
- Review management for social proof and moderation
- Lead capture and contact message handling
- Blog/content management for organic growth and brand storytelling
- Brand and store settings managed from Supabase instead of hardcoded local content
- WhatsApp and mobile-first engagement elements for conversion support
- Invoice/PDF utility support through `jsPDF`

## Folder Structure

```text
src/
  components/        Reusable UI blocks, shared layout, admin shell, toast system
  contexts/          Cart state, mode state, auth/admin state
  hooks/             Data access and reusable frontend hooks
  lib/               Supabase client and utility helpers
  modules/           Domain services for admin, catalog, content, marketing, orders, settings
  pages/             Public pages and admin pages
  utils/             Extra utilities such as invoice generation
supabase/
  schema.sql         Database schema, RLS policies, triggers, helper functions
  seed.sql           Sample seed content for products, reviews, blog, settings
  fix-admin-access.sql
                     One-time SQL repair for admin role setup
```

## Core Files

- `src/App.jsx`: central route map for public and admin areas
- `src/contexts/AdminAuthContext.jsx`: admin authentication and role validation
- `src/contexts/CartContext.jsx`: cart and checkout state
- `src/hooks/useSupabaseData.js`: frontend data access layer for Supabase-backed content
- `src/modules/*`: service modules that isolate business logic by domain
- `supabase/schema.sql`: database tables, policies, triggers, and auth sync logic
- `supabase/seed.sql`: starter content to bootstrap the storefront quickly

## Tech Stack

- Frontend: React 18, Vite, React Router
- Styling: Tailwind CSS, Radix UI primitives, Lucide icons
- Backend: Supabase Auth, Postgres database, Row Level Security, SQL functions and triggers
- State/Data: React Context APIs and custom hooks
- Utility libraries: Framer Motion, jsPDF, clsx, class-variance-authority

## Backend Shape

- `store_settings`: singleton brand + storefront settings
- `instagram_settings`: social and gallery configuration
- `products`: catalog data
- `reviews`: customer reviews
- `blog_posts`: journal and SEO content
- `leads`: popup and campaign captures
- `contact_messages`: support/contact submissions
- `orders`: checkout orders
- `profiles`: admin role lookup for Supabase Auth

## Setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL and anon key.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Run `supabase/seed.sql` to preload products, reviews, settings, and blog content.
5. Create an admin user in Supabase Auth, then either set `raw_app_meta_data.role = 'admin'` or run `supabase/fix-admin-access.sql` once. `full_name = 'admin'` does not grant admin access.
6. Install and run:

```bash
npm install
npm run dev
```

## Notes

- Order tracking uses the `track_order` RPC from the schema file.
- Admin login now uses Supabase Auth instead of a local password.
- Store mode (`STARTER` / `GROWTH`) is stored in Supabase, not local storage.

## Future Scope

- Online payment gateway integration in addition to COD
- Customer accounts, wishlist, and order history
- Coupon system and promotional pricing engine
- Advanced analytics for sales, conversion, and campaign tracking
- Image upload/storage integration for product and blog media
- Email notifications for orders, leads, and admin events
- Better code splitting and performance optimization for large frontend bundles
- Automated tests for auth, checkout, admin workflows, and critical data services
