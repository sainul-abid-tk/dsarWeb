# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Visit http://localhost:3000 (or 3000 if available)

## Vercel Deployment (Recommended)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial DSAR Portal setup"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Configure environment variables (see below)
6. Click "Deploy"

### Step 3: Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
DATABASE_URL=file:./data/prod.db
NEXTAUTH_SECRET=[generate-strong-random-string]
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=[strong-password]
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 4: Database Migration
After first deployment:
1. Connect to your vercel deployment
2. Run migrations via CLI:
```bash
vercel env pull
npx prisma migrate deploy
```

Or run migrations automatically by adding to `vercel.json`:
```json
{
  "buildCommand": "npx prisma migrate deploy && next build",
  "outputDirectory": ".next"
}
```

## Stripe Setup

### Test Mode Setup (Free, No Payment Required)
1. Go to [stripe.com/test](https://stripe.com/test)
2. Copy test keys into `.env`
3. Use test card: `4242 4242 4242 4242`
4. Webhook testing: Use Stripe CLI locally

### Production Setup
1. Create Stripe account and verify business
2. Get live API keys from Dashboard
3. Create a Price:
   - Go to Stripe Dashboard → Prices
   - Click "Create price"
   - Choose "Recurring" → Monthly
   - Set price (e.g., $10)
   - Copy the Price ID
4. Update `.env` with `NEXT_PUBLIC_STRIPE_PRICE_ID`
5. Configure webhooks:
   - Dashboard → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Test Webhook Locally
```bash
# Install Stripe CLI from https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy signing secret to STRIPE_WEBHOOK_SECRET

# In another terminal:
npm run dev

# Test payment:
stripe trigger payment_intent.succeeded
```

## Database Migrations

### Create New Migration
```bash
npx prisma migrate dev --name description_of_change
```

### Deploy Migrations
```bash
npx prisma migrate deploy
```

## Production Checklist

- [ ] Environment variables set in production
- [ ] Database backup strategy in place
- [ ] Stripe webhooks configured
- [ ] Email service configured (SendGrid, etc.)
- [ ] HTTPS enabled
- [ ] Monitoring/logging set up
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Session management upgraded to NextAuth.js
- [ ] Error tracking (Sentry, etc.) configured

## Scaling Recommendations

### Database
- Migrate from SQLite to PostgreSQL
- Use connection pooling (Supabase, Railway)
- Add read replicas for analytics

### Authentication
- Upgrade to NextAuth.js with database sessions
- Add OAuth providers (Google, GitHub)
- Implement refresh token rotation

### File Storage
- Move file uploads to S3/Cloudinary
- Implement CDN for static assets
- Add virus scanning for uploads

### Performance
- Add Redis for session/cache
- Implement request rate limiting
- Add background job queue (Bull, Upstash)

### Monitoring
- Set up Datadog/New Relic monitoring
- Configure Sentry for error tracking
- Add uptime monitoring (Pingdom)

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Locked
```bash
# SQLite file issue, delete and recreate
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Stripe Test Card Declined
- Use correct test card: `4242 4242 4242 4242`
- Future expiry date
- Any 3-digit CVC
- Check webhook secret is correct

### Webhook Not Firing
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Use `stripe logs` to debug:
  ```bash
  stripe logs tail --follow
  ```

## Disaster Recovery

### Backup Strategy
```bash
# Backup database
cp prisma/dev.db backup-$(date +%Y%m%d).db

# Export data to JSON
npx prisma db push
```

### Restore from Backup
```bash
# Stop app
# Restore backup
cp backup-date.db prisma/dev.db
# Restart app
```

## Performance Monitoring

### Key Metrics
- Page load time
- DSAR submission success rate
- Admin approval time
- Stripe payment failure rate

### Tools
- Vercel Analytics
- Web Vitals
- Stripe Dashboard

## Security Hardening

### For Production
1. Enable HTTPS only (set in headers)
2. Rotate admin password regularly
3. Use strong NEXTAUTH_SECRET
4. Implement rate limiting on auth endpoints
5. Add request logging and monitoring
6. Enable CSRF protection
7. Set security headers in `next.config.js`

Example security headers:
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ]
    }
  ]
}
```

---

For questions or issues, open a GitHub issue or check the main README.md
