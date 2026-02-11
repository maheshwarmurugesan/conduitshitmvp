# Mahesh College Counseling

Premium, minimal college counseling website for 1:1 mentorship. Application-only, founder-led, $1,000 flat.

## Stack

- **Next.js 16** – App Router
- **Prisma** – SQLite (local) / PostgreSQL (production)
- **NextAuth** – Authentication (admin + clients)
- **Stripe** – Payments
- **Resend** – Email notifications
- **Tailwind CSS** – Styling

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required:**
- `DATABASE_URL` – SQLite: `file:./dev.db`
- `NEXTAUTH_SECRET` – Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` – e.g. `http://localhost:3000`
- `ADMIN_EMAIL` – Admin login email
- `ADMIN_PASSWORD` – Admin login password

**Optional (for production):**
- `STRIPE_SECRET_KEY` – Stripe dashboard
- `STRIPE_PUBLISHABLE_KEY` – Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook
- `RESEND_API_KEY` – Email on new applications
- `FROM_EMAIL` – Verified sender (Resend)
- `NEXT_PUBLIC_CALENDLY_LINK` – Call booking link for portal

### 3. Initialize database and seed admin

```bash
npx prisma db push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 5. Login as admin

- Email: value of `ADMIN_EMAIL` in `.env`
- Password: value of `ADMIN_PASSWORD` in `.env`

## Pages

| Page | Description |
|------|-------------|
| `/` | Landing page |
| `/apply` | Application form |
| `/login` | Sign in |
| `/pay` | Payment (Accepted applicants) |
| `/portal` | Client dashboard |
| `/admin` | Admin dashboard |

## Application data logging

Every application is stored in two places:

1. **Database** – All fields (name, email, Instagram, school, class year, GPA, activities, what makes unique, why mentorship) are saved in the SQLite/PostgreSQL database via Prisma. You can view and manage them in the Admin Dashboard at `/admin`.

2. **Email (optional)** – If `RESEND_API_KEY` and `FROM_EMAIL` are set in `.env`, each new application triggers an email to `ADMIN_EMAIL` with:
   - An HTML table of all application data
   - A CSV attachment you can open in Excel/Google Sheets

Without Resend configured, data is still stored in the database and visible in the admin dashboard.

## Stripe webhook (production)

1. Create webhook in Stripe Dashboard → Developers → Webhooks
2. Endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Events: `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Production

- Switch `DATABASE_URL` to PostgreSQL (e.g. Vercel Postgres, Supabase)
- Run migrations: `npx prisma migrate deploy`
- Configure Stripe webhook
- Add Resend for email
- Set `NEXTAUTH_URL` to production domain
