# DSAR Portal - Quick Reference

## Test Credentials

### Admin Account
- **Email:** admin@dsar.local
- **Password:** admin123
- **Access:** `/admin` dashboard

### Sample Owner Account
Create via `/auth/register` page

## URLs

| Page | URL | Role | Description |
|------|-----|------|-------------|
| Home | `/` | Public | Landing page with info |
| Login | `/auth/login` | Public | Sign in for admin/owner |
| Register | `/auth/register` | Public | Create owner account |
| Company Registration | `/owner/register-company` | Owner | Register new company |
| Owner Dashboard | `/owner` | Owner | Manage company & DSAR |
| Admin Dashboard | `/admin` | Admin | Approve companies & DSAR |
| Public Company Page | `/c/[slug]` | Public | Submit DSAR (no login) |
| Stripe Webhook | `/api/webhooks/stripe` | Internal | Stripe events |
| Auth Login API | `/api/auth/login` | Internal | POST login |
| Auth Register API | `/api/auth/register` | Internal | POST register |

## Database Schema Quick View

### User
```sql
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  createdAt DateTime DEFAULT now(),
  updatedAt DateTime
)
```

### Company
```sql
CREATE TABLE "Company" (
  id TEXT PRIMARY KEY,
  ownerId TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  slug TEXT UNIQUE,
  subscriptionStatus TEXT DEFAULT 'inactive',
  stripeCustomerId TEXT UNIQUE,
  stripeSubscriptionId TEXT,
  createdAt DateTime DEFAULT now()
)
```

### DsarRequest
```sql
CREATE TABLE "DsarRequest" (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  requesterEmail TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  createdAt DateTime DEFAULT now()
)
```

## Common Tasks

### Create Admin Account
```bash
# Edit .env
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD="strong-password"

# Restart app - auto-creates on startup
npm run dev
```

### Reset Database
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Add New Page Route
```typescript
// src/app/[route]/page.tsx
export default function Page() {
  return <div>New page</div>;
}
```

### Add Database Field
```prisma
// prisma/schema.prisma
model Company {
  // Add new field
  newField String?
}
```

Then migrate:
```bash
npx prisma migrate dev --name add_new_field
```

### Test Stripe Locally
```bash
# Install Stripe CLI
stripe login

# Start webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Test event
stripe trigger payment_intent.succeeded
```

## API Request Examples

### Login (Owner/Admin)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dsar.local",
    "password": "admin123"
  }'
```

### Register (Owner)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@company.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file path | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Session encryption key | `super-secret-key` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key (visible) | `pk_test_xxx` |
| `STRIPE_SECRET_KEY` | Stripe secret key (hidden) | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature secret | `whsec_xxx` |
| `ADMIN_EMAIL` | Default admin email | `admin@dsar.local` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |

## File Structure Legend

- `app/` - Next.js App Router pages & routes
- `components/` - Reusable React components
- `lib/` - Utilities, auth, database
- `actions/` - Server actions (form processing)
- `api/` - API routes
- `prisma/` - Database schema & migrations
- `public/` - Static files

## Debugging Tips

### View Database
```bash
npx prisma studio
# Opens http://localhost:5555 for database explorer
```

### Check Logs
```bash
# Server logs in terminal
tail -f .next/logs/*.log
```

### Test Database Connection
```bash
npx prisma db execute --stdin < test.sql
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

## Performance Tips

1. **Database:** Add indexes to frequently queried fields
2. **API:** Use pagination for large datasets
3. **Frontend:** Use lazy loading for images
4. **Caching:** Implement Redis for sessions
5. **Monitoring:** Set up Sentry for errors

## Security Checklist

- [ ] Change admin password in production
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Sanitize user inputs (Zod does this)
- [ ] Use secure Stripe keys
- [ ] Rotate webhook secrets
- [ ] Enable CSRF protection
- [ ] Set security headers
- [ ] Regular backups

---

**For full documentation, see README.md and DEPLOYMENT.md**
