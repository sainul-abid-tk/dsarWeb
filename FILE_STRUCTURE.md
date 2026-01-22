# DSAR Portal - Complete File Structure

## 📦 Project Overview

A production-ready SaaS application for Data Subject Access Request (DSAR) management with:
- ✅ 3 user types (Admin, Company Owner, End User)
- ✅ Company registration with admin approval
- ✅ Unique public company URLs
- ✅ DSAR submission and management
- ✅ Stripe subscription integration
- ✅ Role-based access control

## 📁 Complete File Structure

```
dsar-port/
│
├── 📄 Configuration Files
│   ├── .env                          # Environment variables (test mode)
│   ├── .env.example                  # Template for environment variables
│   ├── .gitignore                    # Git ignore rules
│   ├── .eslintrc.json                # ESLint configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.mjs               # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── package.json                  # Dependencies & scripts
│   ├── package-lock.json             # Locked dependencies
│   └── prisma.config.ts              # Prisma configuration
│
├── 📚 Documentation
│   ├── README.md                     # Complete project documentation
│   ├── GET_STARTED.md               # Quick start guide (5 minutes)
│   ├── TESTING.md                   # Testing flows & scenarios
│   ├── DEPLOYMENT.md                # Production deployment guide
│   ├── QUICK_REFERENCE.md           # Command reference & API docs
│   └── FILE_STRUCTURE.md            # This file
│
├── src/
│   │
│   ├── 🗂️ app/                      # Next.js App Router
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts  # POST: Login endpoint
│   │   │   │   └── register/route.ts # POST: Register endpoint
│   │   │   └── webhooks/
│   │   │       └── stripe/route.ts  # POST: Stripe webhook handler
│   │   │
│   │   ├── actions/                 # Server Actions
│   │   │   ├── company.ts          # Company registration, approval
│   │   │   ├── dsar.ts             # DSAR submission & management
│   │   │   └── stripe.ts           # Stripe integration
│   │   │
│   │   ├── auth/                    # Authentication Pages
│   │   │   ├── login/page.tsx       # Owner/Admin login form
│   │   │   └── register/page.tsx    # Owner registration form
│   │   │
│   │   ├── owner/                   # Company Owner Dashboard
│   │   │   ├── page.tsx             # Dashboard main page
│   │   │   ├── client.tsx           # Dashboard client component
│   │   │   ├── register-company/
│   │   │   │   └── page.tsx         # Company registration form
│   │   │   └── layout.tsx           # Owner layout (if needed)
│   │   │
│   │   ├── admin/                   # Admin Dashboard
│   │   │   ├── page.tsx             # Admin main page
│   │   │   ├── client.tsx           # Admin client component
│   │   │   └── layout.tsx           # Admin layout (if needed)
│   │   │
│   │   ├── c/                       # Public Company Pages
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Public company details + DSAR form
│   │   │       └── client.tsx       # Client component for DSAR form
│   │   │
│   │   ├── globals.css              # Global Tailwind styles
│   │   ├── layout.tsx               # Root layout with admin auto-init
│   │   └── page.tsx                 # Landing/home page
│   │
│   ├── 🎨 components/               # Reusable Components
│   │   └── ui.tsx                   # Button, Card, Badge, Input, etc.
│   │
│   ├── 🛠️ lib/                      # Utilities & Helpers
│   │   ├── auth.ts                  # Password hashing, user creation
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── validation.ts            # Zod validation schemas
│   │   └── utils.ts                 # Helper functions (slug, formatting)
│   │
│   └── 🔌 middleware.ts             # Route protection middleware
│
├── prisma/
│   ├── schema.prisma                # Database schema (User, Company, DsarRequest, StripeEvent)
│   ├── seed.ts                      # Database seeding script
│   └── migrations/                  # Database migration files
│       └── [timestamp]_init/
│           └── migration.sql        # Initial schema migration
│
├── public/                          # Static assets
│   ├── next.svg
│   └── vercel.svg
│
└── Generated/
    ├── .next/                       # Build output (auto-generated)
    ├── node_modules/                # Dependencies (auto-generated)
    └── prisma/dev.db               # SQLite database (auto-generated)
```

## 📄 File Descriptions

### Core Application Files

#### `src/app/page.tsx`
- Landing page with navigation
- Links to login, register, and feature overview
- Demo credentials displayed

#### `src/app/layout.tsx`
- Root layout for entire app
- Auto-initializes admin user on startup
- Global fonts and CSS setup

#### `src/app/auth/login/page.tsx`
- Login form for Admin and Owner
- Calls `/api/auth/login`
- Session cookie management

#### `src/app/auth/register/page.tsx`
- Owner registration form
- Calls `/api/auth/register`
- Redirects to company registration

#### `src/app/owner/page.tsx` & `client.tsx`
- Owner dashboard showing company status
- Displays subscription status
- Lists DSAR requests
- Manage request statuses
- Subscribe button with Stripe checkout

#### `src/app/owner/register-company/page.tsx`
- Company registration form
- Collects: name, address, email, phone, employees, field, representation
- Validates with Zod
- Calls `registerCompany` server action

#### `src/app/admin/page.tsx` & `client.tsx`
- Admin dashboard
- Lists pending companies with approve/reject buttons
- Shows all DSAR requests across companies
- Manage request statuses
- Approve generates slug and activates public URL

#### `src/app/c/[slug]/page.tsx` & `client.tsx`
- Public company page (no login required)
- Shows company details
- DSAR submission form (only if subscription active)
- Portal inactive message if not subscribed
- Email notification stub (logs to console)

### API Routes

#### `src/app/api/auth/login/route.ts`
```
POST /api/auth/login
Body: { email, password }
Returns: { user: { id, email, role } }
```

#### `src/app/api/auth/register/route.ts`
```
POST /api/auth/register
Body: { email, password, confirmPassword }
Returns: { user: { id, email, role } }
```

#### `src/app/api/webhooks/stripe/route.ts`
```
POST /api/webhooks/stripe
Handles: checkout.session.completed, customer.subscription.*
Updates: Company subscription status
```

### Server Actions

#### `src/app/actions/company.ts`
Functions:
- `registerCompany()` - Owner registers company
- `updateCompany()` - Update company details
- `getOwnerCompany()` - Get owner's company
- `approveCompany()` - Generate slug, approve
- `rejectCompany()` - Reject pending company
- `getPendingCompanies()` - Admin view
- `getAllCompanies()` - List all
- `getCompanyBySlug()` - Public page lookup

#### `src/app/actions/dsar.ts`
Functions:
- `submitDsarRequest()` - End user submission
- `getCompanyDsarRequests()` - Owner's requests (paginated)
- `getAllDsarRequests()` - Admin's requests (paginated)
- `updateDsarRequestStatus()` - Change status
- `getDsarRequestById()` - Get single request

#### `src/app/actions/stripe.ts`
Functions:
- `createCheckoutSession()` - Initiate Stripe checkout
- `handleStripeWebhook()` - Process webhook events
- Updates subscription status in DB

### Utilities & Helpers

#### `src/lib/auth.ts`
- `hashPassword()` - bcryptjs hashing
- `verifyPassword()` - bcryptjs verification
- `getUserByEmail()` - Prisma query
- `createUser()` - Create user with hashing


#### `src/lib/validation.ts`
Zod schemas:
- `LoginSchema` - Email & password
- `RegisterSchema` - Email, password, confirmation
- `CompanyRegistrationSchema` - Company details
- `DsarRequestSchema` - DSAR form fields

#### `src/lib/prisma.ts`
- Singleton Prisma client
- Prevents multiple instances in dev mode

#### `src/lib/utils.ts`
Functions:
- `generateSlug()` - Creates unique company slug
- `formatDate()` - Internationalized date formatting
- `getStatusBadgeColor()` - Color for status badges

#### `src/components/ui.tsx`
Components:
- `Button` - Primary, secondary, danger variants
- `Card` - Container with styling
- `Badge` - Status badge
- `Input` - Text input field
- `Textarea` - Multi-line input
- `Label` - Form label
- `Select` - Dropdown select

### Database

#### `prisma/schema.prisma`
Models:
- `User` - id, email, password, role, timestamps
- `Company` - All company data + Stripe fields
- `DsarRequest` - DSAR request details
- `StripeEvent` - Webhook event log

#### `prisma/seed.ts`
- Auto-creates admin user
- Creates sample company (optional)

#### `prisma/migrations/`
- SQL migration files
- Applied by: `npx prisma migrate dev`

### Configuration Files

#### `.env`
```
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_EMAIL=admin@dsar.local
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### `next.config.mjs`
- Security headers
- Image optimization
- TypeScript checking

#### `tsconfig.json`
- Strict mode enabled
- Path aliases configured
- Isolated modules

#### `tailwind.config.ts`
- Tailwind CSS configuration
- Custom colors (if any)

#### `postcss.config.js`
- PostCSS plugins for Tailwind

#### `package.json`
Scripts:
- `dev` - Start dev server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint
- `type-check` - TypeScript check
- `db:*` - Database commands

### Documentation Files

#### `README.md`
- Complete project overview
- Feature list
- Tech stack
- Database schema
- Setup instructions
- API documentation
- Deployment guide

#### `GET_STARTED.md`
- Quick start (5 minutes)
- Test flows
- Credentials
- Troubleshooting

#### `TESTING.md`
- Detailed test flows
- User scenarios
- API curl examples
- Stripe testing
- Accessibility testing
- Security testing

#### `DEPLOYMENT.md`
- Vercel deployment
- Environment setup
- Database migration
- Stripe production setup
- Webhook testing
- Performance monitoring
- Security hardening

#### `QUICK_REFERENCE.md`
- Test credentials
- URL reference
- Database schema quick view
- Common tasks
- Environment variables
- Debugging tips

## 🔄 Data Flow

### Company Registration Flow
```
Owner Register → User Created → Register Company Form → Company(pending) → 
Admin Reviews → Company(approved) + slug → Public URL Active
```

### DSAR Submission Flow
```
End User → Public Page (no login) → Submit Form → DsarRequest Created → 
Email Notification (stub) → Owner Dashboard shows request → Admin Dashboard shows request
```

### Subscription Flow
```
Owner Dashboard → Subscribe Button → Stripe Checkout → Payment Success → 
Webhook → subscriptionStatus(active) → Portal Activated → DSAR Form Enabled
```

## 🔐 Security Features

- **Password Hashing:** bcryptjs (10 rounds)
- **Input Validation:** Zod schemas
- **SQL Injection Protection:** Prisma ORM
- **XSS Protection:** React escaping + Content Security Headers
- **CSRF:** Session tokens (basic implementation)
- **Role-Based Access:** Middleware checks
- **Stripe Webhook Signature:** Verification on events

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### Database
- `@prisma/client` - ORM
- `prisma` - Migration & schema tools

### Authentication
- `bcryptjs` - Password hashing
- `next-auth` - Auth library (optional, basic impl used)

### Payments
- `stripe` - Stripe API client

### Validation
- `zod` - Schema validation

### Styling
- `tailwindcss` - Utility CSS
- `tailwind-merge` - Class merging
- `clsx` - Conditional classes
- `class-variance-authority` - Component variants

### Development
- `@types/*` - TypeScript types
- `eslint` - Linting
- `shadcn-ui` - Component library

## 🎯 Key Features Implemented

✅ 3 User Types
- Admin (approve companies, manage all DSARs)
- Owner (register company, manage requests)
- End User (submit DSAR, no login)

✅ Company Management
- Registration form with validation
- Pending/Approved/Rejected statuses
- Unique URL slug generation
- Owner relationship tracking

✅ DSAR Lifecycle
- Submit form (public, no login)
- Status tracking (open → closed)
- Pagination and filtering
- Timestamps for audit trail

✅ Subscriptions
- Stripe integration (test mode)
- Webhook handling
- Subscription status tracking
- Portal activation/deactivation

✅ Dashboard UIs
- Admin dashboard (companies, DSARs)
- Owner dashboard (company details, DSARs, subscription)
- Public company page (information, DSAR form)

✅ Production Readiness
- TypeScript throughout
- Zod validation
- Error handling
- Database migrations
- Environment configuration
- Security headers

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:studio        # Open Prisma Studio
npm run db:migrate       # Create migration
npm run db:reset         # Reset database

# Code Quality
npm run type-check       # TypeScript check
npm run lint             # ESLint check
```

## 📝 Notes

- Admin auto-created on first startup
- SQLite for simplicity (use PostgreSQL in production)
- Basic session management (use NextAuth in production)
- Stripe test mode (no real charges)
- File uploads schema-ready (implement with S3/Cloudinary)
- Email notifications stub (implement with SendGrid/Mailgun)

---

For more details, see individual documentation files.
