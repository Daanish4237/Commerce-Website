# Soho Jewels

A luxury eCommerce platform for jewellery, built with Next.js 14, Prisma, and deployed on Vercel.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT strategy)
- **Payments**: Stripe Checkout
- **Image Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **Testing**: Jest + fast-check (property-based testing)
- **Deployment**: Vercel

---

## Features

- Product browsing with category filters and keyword search
- Product variations (colour and size)
- Shopping cart and wishlist/favourites
- Stripe payment integration
- Admin dashboard — manage products, categories, and orders
- Image uploads via Cloudinary
- Customer reviews (verified buyers only)
- Admin 2FA with OTP via email
- About Us and Contact Us pages
- Responsive black and gold luxury design

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- A Cloudinary account
- A Stripe account

### Installation

```bash
git clone https://github.com/Daanish4237/Commerce-Website.git
cd Commerce-Website
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env.local` file in the root:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
EMAIL_SERVER="smtp://user:pass@smtp.gmail.com:587"
EMAIL_FROM="your@email.com"
```

### Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
```

### Seed Admin Account

```bash
npx ts-node --project tsconfig.json -e "require('./prisma/seed')"
```

Default admin credentials are set in `prisma/seed.ts`.

### Run Locally

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Deploy

After deploying, run migrations against your production database:

```bash
npx prisma migrate deploy
```

---

## Project Structure

```
app/
  api/          — API routes (auth, products, cart, orders, payments)
  admin/        — Admin dashboard pages
  auth/         — Login and register pages
  products/     — Product listing and detail pages
  cart/         — Cart page
  wishlist/     — Favourites page
  about/        — About Us page
  contact/      — Contact Us page
components/     — Shared UI components
lib/            — Prisma client, auth helpers, Cloudinary, Billplz/Stripe
prisma/         — Schema and migrations
tests/          — Unit and property-based tests
```

---

## License

Private — Soho Jewels. All rights reserved.
