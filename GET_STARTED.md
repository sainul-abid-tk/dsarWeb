# 🚀 Get Started with DSAR Portal

Welcome! Follow this guide to get the app running in minutes.

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd dsar-port
npm install
```

### 2. Create Database
```bash
npx prisma migrate dev --name init
```

### to Auto-create admin

- `node prisma/seed.mjs` - Auto-create admin
### 3. Start App
```bash
npm run dev
```

Visit: **http://localhost:3000** (or 3000 if port in use)

## 🎯 Test the App (2 minutes)

### Admin Login
1. Go to http://localhost:3000/auth/login
2. Email: `admin@dsar.local`
3. Password: `admin123`
4. See admin dashboard with empty pending companies

### Create Test Owner
1. Click "Create a company account"
2. Or go to http://localhost:3000/auth/register
3. Use: `owner@company.com` / `password123`
4. Fill company details:
   - Name: "Test Company"
   - Address: "123 Main St"
   - Employees: 50
   - Field: "Software"
   - Representation: EU_UK
5. Submit

### Admin Approves Company
1. Login as admin (admin@dsar.local)
2. See "Test Company" pending
3. Click "Approve"
4. Slug generated: `test-company-xxxx`

### Access Public Page
1. Go to: http://localhost:3000/c/test-company-xxxx
2. See company details
3. See message: "Portal Inactive" (no subscription yet)

### Subscribe
1. Login as owner (owner@company.com)
2. Dashboard shows subscription status: "inactive"
3. Click "Subscribe Now"
4. Stripe Checkout (test mode)
5. Use card: `4242 4242 4242 4242`
6. Any future date, any CVC

### Submit DSAR
1. Go to public page again
2. Now see DSAR form (subscription active)
3. Fill form:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1-555-123-4567
   - Request: "Please provide my data"
4. Submit

### View DSAR Requests
1. **As Owner:** http://localhost:3000/owner
   - See submitted request
   - Click "Update Status" to change state
2. **As Admin:** http://localhost:3000/admin
   - See all DSAR requests
   - Can update status

## 📋 Features Checklist

- ✅ **Authentication**
  - Admin login
  - Owner registration
  - Session management

- ✅ **Company Management**
  - Owner registers company
  - Admin approves/rejects
  - Unique public URLs
  - Auto-generated slugs

- ✅ **Subscriptions**
  - Stripe test mode
  - Subscription status tracking
  - Portal activation

- ✅ **DSAR Portal**
  - Public submission form
  - Status lifecycle (open → closed)
  - Admin/Owner dashboards
  - Request management

## 🔐 Test Credentials

| User | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@dsar.local | admin123 | /admin |
| Owner | Create via /auth/register | your choice | /owner |

## 💳 Stripe Test Cards

| Card | Result | Use |
|------|--------|-----|
| 4242 4242 4242 4242 | Success | Test payments |
| 4000 0000 0000 0002 | Decline | Test failures |

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)

## 📂 Project Structure

```
dsar-port/
├── src/
│   ├── app/           # Pages & routes
│   ├── actions/       # Server actions
│   ├── api/          # API endpoints
│   ├── components/   # UI components
│   └── lib/          # Utilities
├── prisma/           # Database schema
├── .env             # Environment variables
├── README.md        # Full documentation
└── TESTING.md       # Testing guide
```

## 🐛 Troubleshooting

### Port 3000 already in use?
- App automatically uses 3000
- Or kill process: `lsof -ti:3000 | xargs kill`

### Database locked?
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Build errors?
```bash
rm -rf .next
npm run build
```

### Changes not showing?
```bash
# Clear cache
rm -rf .next
npm run dev
```

## 📚 Next Steps

1. **Read Full Documentation**
   - [README.md](README.md) - Complete guide
   - [TESTING.md](TESTING.md) - Test flows
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production

2. **Explore Code**
   - `/src/app/` - Page components
   - `/src/app/actions/` - Server-side logic
   - `/prisma/schema.prisma` - Database model

3. **Customize**
   - Update `/src/app/page.tsx` for landing page
   - Modify UI in `/src/components/ui.tsx`
   - Add new routes in `/src/app/[route]/`

4. **Deploy**
   - See [DEPLOYMENT.md](DEPLOYMENT.md)
   - Vercel one-click deploy recommended

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💡 Tips

1. **Use Prisma Studio to see database**
   ```bash
   npx prisma studio
   ```
   Opens interactive database browser at http://localhost:5555

2. **Check TypeScript errors**
   - VS Code shows errors inline
   - Or run: `npx tsc --noEmit`

3. **View database directly**
   ```bash
   sqlite3 prisma/dev.db
   SELECT * FROM "User";
   ```

4. **Test API with curl**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dsar.local","password":"admin123"}'
   ```

## ✨ What You Get

- 🔐 **Production-ready auth** (bcryptjs, session management)
- 📊 **Complete DSAR lifecycle** (create, track, update status)
- 💳 **Stripe integration** (test mode ready, webhooks supported)
- 🎨 **Professional UI** (Tailwind + custom components)
- ✅ **Input validation** (Zod schemas)
- 🚀 **Server-side logic** (Next.js Server Actions)
- 📱 **Responsive design** (mobile-friendly)
- 🗄️ **SQLite database** (Prisma ORM)
- 📝 **TypeScript** (type-safe)
- 🧪 **Test-ready** (includes test flows)

## 🚀 Ready to Deploy?

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Vercel one-click deploy
- PostgreSQL setup
- Production checklist
- Stripe production setup
- Security hardening

---

**Need help?** Check:
1. [README.md](README.md) - Full documentation
2. [TESTING.md](TESTING.md) - Detailed test flows
3. [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
4. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Command reference

**Happy building! 🎉**
