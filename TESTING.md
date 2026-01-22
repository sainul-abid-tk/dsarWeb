# Testing Guide

## Test Credentials

### Admin Account
- **Email:** admin@dsar.local
- **Password:** admin123
- **Role:** Admin
- **Auto-created:** Yes (on first app startup)

### Owner Account (Create via UI)
1. Navigate to `/auth/register`
2. Create email: `owner@testcompany.com`
3. Set password: `testpassword123`

### Stripe Test Cards
| Card | Status | Use Case |
|------|--------|----------|
| 4242 4242 4242 4242 | Success | Successful payment |
| 4000 0000 0000 0002 | Declined | Failed payment testing |
| 4000 0000 0000 0341 | 3D Secure | Requires 3D Secure |
| 5555 5555 5555 4444 | Success | Alternative valid card |

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)

## Test Flows

### 1. Admin Login & Company Approval

#### Step 1: Login as Admin
1. Go to http://localhost:3000/auth/login
2. Enter: admin@dsar.local / admin123
3. Should redirect to `/admin`

#### Step 2: View Dashboard
1. See "Pending Company Approvals" section
2. See "All DSAR Requests" section

#### Step 3: Approve a Company
1. Wait for an owner to register a company (see Test Flow 2)
2. Click "Approve" on pending company
3. Slug should be generated (e.g., "acme-ltd-a1b2")
4. Public URL becomes: http://localhost:3000/c/acme-ltd-a1b2

### 2. Owner Registration & Company Setup

#### Step 1: Create Owner Account
1. Go to http://localhost:3000/auth/register
2. Fill in:
   - Email: owner@testcompany.com
   - Password: testpassword123
   - Confirm: testpassword123
3. Click "Create Account"

#### Step 2: Register Company
1. Should redirect to `/owner/register-company`
2. Fill in company details:
   - Company Name: Acme Corp (required)
   - Address: 123 Main St, San Francisco, CA
   - Email: contact@acmecorp.com
   - Phone: +1 (555) 123-4567
   - Employees: 150
   - Field: Software Development
   - Representation: EU & UK
3. Click "Register Company"
4. Should redirect to `/owner` showing "pending" status

#### Step 3: Check Admin Dashboard
1. Go to `/admin` (login with admin account if needed)
2. See company in "Pending Company Approvals"
3. Click "Approve"
4. Check owner dashboard - slug should be generated

#### Step 4: Subscribe & Activate
1. Return to `/owner` (login as owner)
2. See "Subscribe" button
3. Click "Subscribe"
4. Should redirect to Stripe Checkout
5. Use test card: 4242 4242 4242 4242
6. Complete payment
7. Check subscription status updates to "active"

### 3. Public DSAR Submission

#### Step 1: Access Public Page
1. Get slug from admin dashboard (e.g., "acme-corp-xyz")
2. Go to http://localhost:3000/c/acme-corp-xyz
3. Should see company details (no login required)

#### Step 2: Check Portal Status
- **If subscription inactive:**
  - See "Portal Inactive" message
  - No DSAR form
- **If subscription active:**
  - See "Submit DSAR Request" form

#### Step 3: Submit DSAR (if active)
1. Fill form with:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1-555-987-6543
   - Request: "Please provide all personal data you hold on me"
2. Click "Submit DSAR Request"
3. See success message

#### Step 4: View in Owner Dashboard
1. Go to `/owner` (login as owner)
2. See DSAR request in list
3. Click "Update Status" to change from "open" to "in_progress", etc.

#### Step 5: View in Admin Dashboard
1. Go to `/admin` (login as admin)
2. See DSAR in "All DSAR Requests"
3. Click "Update Status" to change status

### 4. DSAR Lifecycle

#### Statuses
- **open** - Initial status when submitted
- **in_progress** - Owner is working on request
- **in_review** - Being reviewed by admin
- **closed** - Request completed

#### Test Status Updates
1. Owner Dashboard:
   - Go to `/owner`
   - Click "Update Status" on a DSAR
   - Change status to "in_progress"
   - Submit
2. Admin Dashboard:
   - Go to `/admin`
   - Click "Update Status" on a DSAR
   - Change status to "closed"
   - Submit

### 5. Error Handling

#### Test Invalid Inputs
1. Try registering with invalid email
   - See validation error
2. Try submitting DSAR with missing fields
   - See required field errors
3. Try accessing admin page as non-admin
   - Should be redirected or see error

#### Test Edge Cases
1. **Duplicate Company Name**
   - Allow multiple companies with same name
2. **Duplicate Email**
   - Should prevent duplicate owner registrations
3. **Invalid Status Transitions**
   - Try setting invalid status
   - Should see error

## API Testing (curl)

### Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dsar.local",
    "password": "admin123"
  }'
```

### Register API
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

## Database Testing

### View Database (Prisma Studio)
```bash
npx prisma studio
# Opens http://localhost:5555
```

### Query with Prisma CLI
```bash
npx prisma db execute --stdin
# Paste SQL queries

SELECT * FROM "User";
SELECT * FROM "Company";
SELECT * FROM "DsarRequest";
```

### Reset Database
```bash
# Delete database
rm prisma/dev.db

# Recreate
npx prisma migrate dev --name init

# Admin auto-created on app restart
```

## Performance Testing

### Load Testing
```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/

# Using wrk (better)
wrk -t4 -c100 -d30s http://localhost:3000/
```

### Database Query Performance
```bash
# Check slow queries
npx prisma studio
# Use the built-in query explorer
```

## Stripe Testing

### Test Webhook Locally
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy webhook secret to STRIPE_WEBHOOK_SECRET

# In another terminal
npm run dev

# Test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
```

### Monitor Webhook
```bash
stripe logs tail --follow
```

## Accessibility Testing

### Screen Reader Testing
- Test with NVDA (Windows) or VoiceOver (Mac)
- Check form labels are properly associated
- Verify heading hierarchy

### Keyboard Navigation
- Tab through all interactive elements
- Verify focus states are visible
- Test form submission with keyboard

## Security Testing

### Password Testing
- Test bcryptjs hashing:
  ```javascript
  import { hashPassword, verifyPassword } from "@/lib/auth";
  const hash = await hashPassword("password");
  await verifyPassword("password", hash); // true
  ```

### Session Testing
- Clear cookies and verify logout
- Test session expiration
- Verify role-based access control

### Input Validation
- Try XSS payloads in forms
  - `<script>alert('xss')</script>`
  - Should be escaped or rejected
- Try SQL injection in company name
  - Should be safely handled by Prisma

## Browser Testing

### Tested Browsers
- Chrome/Chromium (primary)
- Firefox
- Safari (macOS)
- Edge

### Mobile Testing
- Use Chrome DevTools device emulation
- Test on actual mobile devices
- Check responsive layout (Tailwind)

## Checklist - All Features

- [ ] **Authentication**
  - [ ] Admin login works
  - [ ] Owner registration works
  - [ ] Invalid credentials rejected
  - [ ] Session persists across pages

- [ ] **Company Management**
  - [ ] Owner can register company
  - [ ] Company appears pending
  - [ ] Admin can approve
  - [ ] Slug generated on approval
  - [ ] Public URL accessible

- [ ] **Subscriptions**
  - [ ] Subscribe button visible for approved companies
  - [ ] Stripe checkout works
  - [ ] Payment successful updates subscription
  - [ ] Without subscription, portal shows inactive
  - [ ] With subscription, DSAR form enabled

- [ ] **DSAR Submission**
  - [ ] End user can access public page
  - [ ] Form validation works
  - [ ] Submission successful
  - [ ] Email confirmation sent (stub logs)

- [ ] **DSAR Management**
  - [ ] Owner sees their requests
  - [ ] Admin sees all requests
  - [ ] Status can be updated
  - [ ] Timestamps are accurate

- [ ] **UI/UX**
  - [ ] Pages load without errors
  - [ ] Forms are user-friendly
  - [ ] Error messages are clear
  - [ ] Mobile responsive

- [ ] **Database**
  - [ ] Data persists on page reload
  - [ ] Relationships work correctly
  - [ ] No duplicate entries
  - [ ] Indexes improve query performance

## Known Limitations

1. **Session Management**
   - Basic cookie-based auth for demo
   - Production should use NextAuth.js with DB sessions

2. **File Uploads**
   - Schema ready but uploads not implemented
   - Use S3/Cloudinary in production

3. **Email Notifications**
   - Stub implementation (logs to console)
   - Use SendGrid/Mailgun in production

4. **Stripe**
   - Test mode only (no real charges)
   - Mock webhook handling

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser/OS
4. Error messages (from console)
5. Database state (if relevant)

---

For more details, see README.md and DEPLOYMENT.md
