# DSAR Portal - Architecture Document

## System Overview

The DSAR Portal is a three-tier SaaS application for managing Data Subject Access Requests with role-based access control and Stripe subscription management.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                     │
│  Landing | Auth | Owner Dashboard | Admin Dashboard | Public │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
┌────────────────────────▼────────────────────────────────────┐
│            Application Layer (Next.js Server)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages (App Router)                                  │   │
│  │  - /auth/login, register                            │   │
│  │  - /owner/* (dashboard)                             │   │
│  │  - /admin/* (dashboard)                             │   │
│  │  - /c/[slug] (public company page)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes & Server Actions                         │   │
│  │  - /api/auth/* (login, register)                    │   │
│  │  - /api/webhooks/stripe (webhook handler)           │   │
│  │  - Server Actions (company, dsar, stripe)           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware                                          │   │
│  │  - Route protection                                 │   │
│  │  - Session validation                               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│           Database Layer (SQLite + Prisma ORM)              │
│  Tables:                                                    │
│  - User (auth)                                              │
│  - Company (registration + status)                          │
│  - DsarRequest (submissions + status)                       │
│  - StripeEvent (webhook log)                                │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   (bcryptjs hashed)
  role      String   ("admin" | "owner")
  company   Company?
  createdAt DateTime
  updatedAt DateTime
}
```

### Company
```prisma
model Company {
  id                   String
  ownerId              String  (links to User)
  name                 String
  logo                 String?
  address, email, phone String?
  employeesCount       Int?
  field                String?
  representation       String  ("EU" | "UK" | "EU_UK")
  status               String  ("pending" | "approved" | "rejected")
  slug                 String? (unique, null until approved)
  stripeCustomerId     String?
  stripeSubscriptionId String?
  subscriptionStatus   String  ("inactive" | "active" | "trialing" | "canceled" | "past_due")
  dsarRequests         DsarRequest[]
  createdAt, updatedAt DateTime
}
```

### DsarRequest
```prisma
model DsarRequest {
  id              String
  companyId       String  (links to Company)
  requesterName   String
  requesterEmail  String
  requesterPhone  String
  requestText     String
  documentUrls    String? (JSON array as string)
  status          String  ("open" | "in_progress" | "in_review" | "closed")
  notes           String?
  createdAt       DateTime
}
```

## Authentication Flow

### Admin/Owner Login
```
User → /auth/login (form) 
  ↓
POST /api/auth/login (validate email/password)
  ↓
bcryptjs.compare(password, hashedPassword)
  ↓
Success → Set session cookie → Redirect to /admin or /owner
Failure → Show error → Reload login page
```

### Owner Registration
```
User → /auth/register (form)
  ↓
POST /api/auth/register (validate input)
  ↓
Check duplicate email
  ↓
bcryptjs.hash(password)
  ↓
Create User in DB
  ↓
Success → Redirect to /owner/register-company
```

## Company Registration Flow

```
Owner (authenticated) → /owner/register-company (form)
  ↓
Fill: name, address, email, phone, employees, field, representation
  ↓
Validate with Zod schema
  ↓
registerCompany() Server Action
  ↓
Create Company record (status: "pending")
  ↓
Redirect to /owner dashboard
  ↓
Admin → /admin dashboard
  ↓
See pending company in list
  ↓
Click "Approve"
  ↓
approveCompany() Server Action
  ↓
Generate slug (deterministic random)
  ↓
Update Company (status: "approved", slug: "company-name-xxxx")
  ↓
Company.slug now has unique public URL
```

## DSAR Submission Flow

```
End User (no login) → /c/[slug] (public company page)
  ↓
Server-side: getCompanyBySlug() finds company
  ↓
Check: status === "approved" && subscription active?
  ↓
NO → Show "Portal Inactive" message, hide form
YES → Show DSAR form
  ↓
User fills: name, email, phone, request text
  ↓
Validate with Zod schema
  ↓
submitDsarRequest() Server Action
  ↓
Create DsarRequest record (status: "open")
  ↓
Console log: "[NOTIFICATION] New DSAR Request: #id from email"
  ↓
Success message shown
  ↓
Owner dashboard shows request in list
  ↓
Admin dashboard shows request in all requests
```

## Subscription Flow

```
Owner (authenticated) → /owner dashboard
  ↓
Company status = "approved"
Subscription status = "inactive"
  ↓
Click "Subscribe Now"
  ↓
createCheckoutSession() Server Action
  ↓
Create/get Stripe Customer (using company.stripeCustomerId)
  ↓
Create Stripe Checkout Session
  ↓
Redirect to Stripe Checkout URL
  ↓
User completes payment with test card
  ↓
Stripe sends webhook: POST /api/webhooks/stripe
  ↓
handleStripeWebhook() processes:
  - checkout.session.completed → Set subscription status = "active"
  - customer.subscription.* → Update subscription details
  ↓
Company.subscriptionStatus updated in DB
  ↓
Owner dashboard shows "active" status
  ↓
Public page now shows DSAR form (isActive = true)
```

## DSAR Status Lifecycle

```
OPEN
  ↓ (Owner/Admin clicks "Update Status")
IN_PROGRESS
  ↓
IN_REVIEW
  ↓
CLOSED

- Each status change calls updateDsarRequestStatus() Server Action
- Updates DsarRequest.status in DB
- Revalidates cache for owner and admin dashboards
```

## Request Routing

### Public Routes (No Auth Required)
- `/` - Landing page
- `/auth/login` - Login form
- `/auth/register` - Register form
- `/c/[slug]` - Public company page
- `/api/auth/login` - Login endpoint
- `/api/auth/register` - Register endpoint
- `/api/webhooks/stripe` - Webhook receiver

### Protected Routes (Auth Required)
- `/owner/*` - Owner dashboard pages
- `/admin/*` - Admin dashboard pages

Protection handled by:
```typescript
// middleware.ts
if (!sessionCookie && !publicRoute) {
  return redirect("/auth/login")
}
```

## API Endpoints

### Authentication

#### POST /api/auth/login
```json
Request: {
  "email": "admin@dsar.local",
  "password": "admin123"
}

Response (200): {
  "user": {
    "id": "uuid",
    "email": "admin@dsar.local",
    "role": "admin"
  }
}

Response (401): {
  "error": "Invalid email or password"
}
```

#### POST /api/auth/register
```json
Request: {
  "email": "owner@test.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (200): {
  "user": {
    "id": "uuid",
    "email": "owner@test.com",
    "role": "owner"
  }
}

Response (400): {
  "error": "Email already registered"
}
```

### Webhooks

#### POST /api/webhooks/stripe
```
Headers:
  stripe-signature: t=timestamp,v1=signature

Body: Stripe event JSON

Processes:
- checkout.session.completed
  → Creates/updates Stripe Customer
  → Sets subscription status to "active"

- customer.subscription.created/updated
  → Updates stripeSubscriptionId
  → Updates subscriptionStatus

- customer.subscription.deleted
  → Sets subscriptionStatus to "canceled"

Response (200): { "received": true }
Response (400): { "error": "signature verification failed" }
```

## Server Actions

All server actions follow pattern:
```typescript
"use server"
export async function actionName(params) {
  try {
    // Validate with Zod
    // Execute Prisma query
    // Revalidate cache
    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

## Error Handling

### Validation Errors
- Zod schemas catch invalid inputs
- Return `{ success: false, error: "Validation error" }`
- UI displays error messages

### Database Errors
- Prisma ORM handles SQL errors
- Try-catch wraps queries
- Console logs errors (production: Sentry)

### Authentication Errors
- Invalid credentials: 401 Unauthorized
- Missing session: Redirect to login
- Wrong role: Unauthorized access error

## Security Measures

### Password Security
```typescript
// Hashing
const hash = await bcryptjs.hash(password, 10)

// Verification
const valid = await bcryptjs.compare(input, hash)
```

### Input Validation
```typescript
// Zod validates all inputs
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
})

const validated = schema.parse(input)
```

### SQL Injection Protection
```typescript
// Prisma prevents SQL injection
const user = await prisma.user.findUnique({
  where: { email } // Parameterized query
})
```

### Session Management
```typescript
// Basic: Cookie-based (demo)
document.cookie = `session=${JSON.stringify(user)}`

// Production: NextAuth.js with DB sessions
```

### Stripe Webhook Security
```typescript
// Verify webhook signature
const event = stripe.webhooks.constructEvent(
  body, 
  signature, 
  webhookSecret
)
```

## Performance Considerations

### Database
- Indexes on frequently queried fields
- Pagination for large datasets (10 items default)
- Eager loading with `include` when needed

### Caching
```typescript
// Revalidate on mutations
revalidatePath("/owner")
revalidatePath("/admin")
```

### Frontend
- Lazy loading components
- Tailwind CSS (utility-first)
- Server-side rendering (default Next.js)

## Deployment Strategy

### Development
- SQLite database
- Environment variables in `.env`
- Dev server: `npm run dev`

### Staging
- PostgreSQL database
- Environment variables in CI/CD
- Pre-production testing

### Production
- PostgreSQL with connection pooling
- Environment variables in platform (Vercel, AWS, etc.)
- HTTPS enforced
- Security headers set
- Monitoring enabled (Sentry, DataDog)

## Scalability

### Horizontal Scaling
- Stateless Next.js servers
- Database connection pooling
- CDN for static assets

### Vertical Scaling
- Database optimization (indexes, queries)
- Caching layer (Redis)
- Background jobs (for notifications)

### Bottlenecks
- Database queries (optimize with indexes)
- File uploads (use S3/Cloudinary)
- Email sending (use queue + service)

## Monitoring & Logging

### Development
- Console logs for errors
- Prisma Studio for database inspection
- Network tab for API calls

### Production
- Structured logging (JSON)
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Uptime monitoring (Pingdom)

## Future Enhancements

1. **NextAuth.js Integration**
   - Database-backed sessions
   - OAuth providers (Google, GitHub)
   - JWT tokens

2. **File Uploads**
   - AWS S3 integration
   - File scanning for malware
   - Encrypted storage

3. **Email Service**
   - SendGrid/Mailgun integration
   - HTML templates
   - Background job queue

4. **Advanced Search**
   - Elasticsearch for DSAR requests
   - Full-text search
   - Filtering and sorting

5. **Analytics**
   - Dashboard metrics
   - Request trends
   - Performance insights

6. **Rate Limiting**
   - Upstash Redis
   - IP-based limiting
   - User-based limiting

7. **Audit Logging**
   - Soft deletes
   - Change tracking
   - Compliance reports

---

For implementation details, see code comments and individual file documentation.
