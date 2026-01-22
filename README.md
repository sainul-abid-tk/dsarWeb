# DSAR Portal - Data Subject Access Request Management System

A complete SaaS-style application for managing GDPR/CCPA Data Subject Access Requests (DSARs) with role-based access control, company registration, Stripe subscriptions, and public submission forms.

## Features

### Admin Dashboard
- View all pending company registrations
- Approve/reject company registrations
- Auto-generate unique public slugs for approved companies
- View all DSAR requests across companies
- Update DSAR request status
- Manage company subscription statuses

### Company Owner Dashboard
- User registration and authentication
- Company profile registration with details (name, logo, employees, field, representation)
- View company registration status (pending/approved/rejected)
- Subscribe to activate DSAR portal (Stripe integration)
- View DSAR requests submitted to their company
- Update DSAR request status and notes
- Unique public URL with subscription status validation

### Public Company Page
- Accessible via unique slug: `/c/[company-slug]`
- Display company details and representation
- DSAR submission form (no login required)
- Form validation and error handling
- Subscription status display (inactive portal warning)

### DSAR Management
- Full lifecycle management (open → in_progress → in_review → closed)
- Attachment support (schema-ready)
- Notification stub (logs to console)
- Audit trail with timestamps

## Tech Stack

- **Frontend:** Next.js 15+ (App Router) with React 19
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Authentication:** Custom credentials-based auth (production-ready schema)
- **Payments:** Stripe (test mode with webhook support)
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Forms:** Server Actions + Client Components

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Login/Register endpoints
│   │   └── webhooks/          # Stripe webhook
│   ├── actions/               # Server actions
│   │   ├── company.ts         # Company registration, approval
│   │   ├── dsar.ts            # DSAR request management
│   │   └── stripe.ts          # Stripe integration
│   ├── auth/                  # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── admin/                 # Admin dashboard
│   ├── owner/                 # Owner dashboard
│   ├── c/[slug]/             # Public company page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui.tsx                 # Reusable UI components
├── lib/
│   ├── auth.ts               # Password hashing & user creation
│   ├── prisma.ts             # Prisma client singleton
│   ├── validation.ts          # Zod schemas
│   └── utils.ts              # Helper functions
├── middleware.ts              # Route protection
└── generated/prisma/          # Generated Prisma client

prisma/
├── schema.prisma              # Database schema
└── migrations/                # Migration files
```

## Database Schema

### User
- id, email, password, role (admin | owner), createdAt, updatedAt

### Company
- id, ownerId, name, logo, address, email, phone, employeesCount, field
- representation (EU | UK | EU_UK), status (pending | approved | rejected)
- slug (unique, nullable until approved)
- stripeCustomerId, stripeSubscriptionId, subscriptionStatus
- subscriptionEndDate, createdAt, updatedAt

### DsarRequest
- id, companyId, requesterName, requesterEmail, requesterPhone, requestText
- documentUrls (JSON), status (open | in_progress | in_review | closed)
- notes, createdAt, updatedAt

### StripeEvent
- id, type, stripeId (unique), data (JSON), processed, createdAt

## Setup Instructions

### Prerequisites
- Node.js 18+ (with npm)
- Git

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd dsar-port
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local` from `.env`:
   ```bash
   cp .env .env.local
   ```
   
   The default `.env` file already has test values configured:
   - Admin: admin@dsar.local / admin123
   - Stripe: Test mode keys (no real payments)
   - Database: SQLite at `./prisma/dev.db`

3. **Set up database:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Admin user auto-creation:**
   - Admin account is auto-created on first app startup
   - Email: `admin@dsar.local`
   - Password: `admin123`
   - Credentials from `.env` file

5. **Run development server:**
   ```bash
   npm run dev
   ```

   The app will start on:
   - **Local:** http://localhost:3000 (or available port if 3000 in use)
   - **Network:** http://192.168.x.x:3000

## Usage

### Admin Flow
1. Go to `/auth/login`
2. Use credentials: `admin@dsar.local` / `admin123`
3. Approve pending companies on `/admin` dashboard
4. Monitor all DSAR requests

### Owner Flow
1. Go to `/auth/register` to create an account
2. Register company details on `/owner/register-company`
3. Wait for admin approval
4. Subscribe to activate portal at `/owner`
5. Manage DSAR requests

### End User Flow
1. Access public company page: `/c/[company-slug]`
2. (Only if subscription active) Submit DSAR form
3. Company owner reviews request

## Stripe Integration

### Mock Mode (Default)
- No real Stripe account needed for testing
- Webhook responses are mocked in code
- Test subscription activation by clicking "Subscribe" button

### Production Setup (Stripe Account Required)

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Create account and get API keys

2. **Configure Environment:**
   Update `.env` with your Stripe keys

3. **Create Price:**
   - Dashboard → Prices → Create Price
   - Set up monthly subscription (e.g., $10/month)
   - Copy Price ID to code: `src/app/actions/stripe.ts:8`

4. **Webhook Setup:**
   - Dashboard → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`

5. **Test Webhook Locally (with ngrok):**
   ```bash
   ngrok http 3000
   # Then add webhook endpoint: https://your-ngrok-url.ngrok.io/api/webhooks/stripe
   ```

6. **Test Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

## API Routes

### Authentication
- `POST /api/auth/login` - Owner/Admin login
- `POST /api/auth/register` - Owner registration

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Server Actions

### Company Management (`src/app/actions/company.ts`)
- `registerCompany()` - Owner registers company
- `updateCompany()` - Update company details
- `getOwnerCompany()` - Get owner's company
- `approveCompany()` - Admin approves company
- `rejectCompany()` - Admin rejects company
- `getPendingCompanies()` - List pending approvals
- `getAllCompanies()` - List all companies
- `getCompanyBySlug()` - Public company lookup

### DSAR Management (`src/app/actions/dsar.ts`)
- `submitDsarRequest()` - End user submits DSAR
- `getCompanyDsarRequests()` - Owner's requests (paginated)
- `getAllDsarRequests()` - Admin's requests (paginated)
- `updateDsarRequestStatus()` - Update request status

### Stripe Integration (`src/app/actions/stripe.ts`)
- `createCheckoutSession()` - Initiate Stripe checkout
- `handleStripeWebhook()` - Process webhook events

## Middleware & Security

- **Route Protection:** Unauthenticated users redirected to `/auth/login`
- **Public Routes:** `/`, `/c/[slug]`, `/api/auth/*`
- **Role-Based Access:** Admin routes check user role (via cookie)
- **Input Validation:** Zod schemas on all inputs
- **Password Security:** bcryptjs hashing with salt rounds=10

## Features & Bonus

### Implemented
- ✅ Company registration & approval workflow
- ✅ Unique public company URLs with slug generation
- ✅ DSAR submission form (no login)
- ✅ Full DSAR lifecycle management
- ✅ Stripe subscription integration (test mode)
- ✅ Role-based access control
- ✅ Admin & Owner dashboards
- ✅ Subscription status validation
- ✅ Database schema with Prisma
- ✅ TypeScript throughout
- ✅ Zod validation
- ✅ Server Actions
- ✅ Clean UI with Tailwind

### Bonus (Completed)
- ✅ Email notification stub (console logs)
- ✅ Stripe webhook handling
- ✅ Audit trail (timestamps on all records)

## Testing Checklist

- [ ] Admin can log in with test credentials
- [ ] Owner can register and create company
- [ ] Company appears pending on admin dashboard
- [ ] Admin can approve → slug generated → public URL works
- [ ] Public page shows company details
- [ ] End user can submit DSAR without login
- [ ] DSAR visible in owner dashboard
- [ ] DSAR visible in admin dashboard
- [ ] Owner can update DSAR status
- [ ] Admin can update DSAR status
- [ ] Subscription button works (redirects to Stripe)
- [ ] After subscription, portal active
- [ ] Without subscription, shows inactive message

## Troubleshooting

### Database Issues
- Delete `prisma/dev.db` to reset
- Run `npx prisma migrate dev --name init` to recreate

### Stripe Webhook Not Working
- Check webhook URL matches your domain
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Use Stripe CLI to test: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Session Issues
- Cookies stored in `document.cookie` (basic auth)
- For production, implement NextAuth properly
- See `src/app/auth/login/page.tsx` for session setup

## Production Improvements

For production deployment, consider:

1. **Authentication:** Upgrade to NextAuth.js with persistent sessions
2. **Database:** Migrate to PostgreSQL with connection pooling
3. **Email:** Integrate email service (SendGrid, Mailgun) for notifications
4. **File Storage:** Add file uploads to S3/Cloudinary for DSAR attachments
5. **Rate Limiting:** Implement rate limiting on DSAR submissions
6. **Logging:** Add structured logging (Sentry, LogRocket)
7. **Monitoring:** Set up monitoring (Datadog, New Relic)
8. **CI/CD:** Set up GitHub Actions for automated testing & deployment

## License

MIT

---

**Built with ❤️ for GDPR/CCPA compliance**
