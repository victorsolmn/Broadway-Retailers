# Broadway Sellers

**Launch new products with trust. Broadway certifies, you grow.**

A production-quality B2B seller onboarding and management platform built with Next.js 15, TypeScript, Prisma, and NextAuth.

![Broadway Sellers](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-teal)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### For Sellers
- **Broadway Certification**: Pre-market review process with certified badge for trusted sellers
- **Application Tracking**: Real-time status updates with transparent approval flow
- **Product Management**: Full catalog CRUD with bulk CSV upload support
- **Fee Simulator**: SKU-level profit calculator with margin warnings
- **Financial Management**: Bank details, settlements ledger, GST-ready invoices
- **Shipping Addresses**: Multiple pickup/return address management
- **Insights Dashboard**: Sales, orders, returns, and account health metrics
- **Support System**: Ticketing with SLA tracking
- **RTO Shield**: Address validation, COD OTP, prepaid nudges (mock)

### For Admins
- **Application Review Console**: Approve, reject, or request clarifications
- **Messaging System**: Direct communication with applicants
- **Timeline Tracking**: Full application lifecycle visibility

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | Prisma ORM + SQLite |
| Authentication | NextAuth v5 (magic link) |
| UI Components | shadcn/ui + Tailwind CSS |
| Forms | react-hook-form + zod |
| State Management | React Query + Zustand |
| Charts | Recharts |
| Icons | lucide-react |
| Animation | framer-motion |
| Email | Mock system (→ /tmp/emails) |
| File Uploads | Next.js routes (→ /public/uploads) |

## 📁 Project Structure

```
broadway-sellers/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/          # Magic link authentication
│   │   └── verify-request/   # Email verification page
│   ├── api/
│   │   ├── auth/             # NextAuth handlers
│   │   ├── applications/     # Application CRUD
│   │   └── upload/           # File upload handling
│   ├── apply/                # Seller application form
│   ├── status/               # Application status tracker
│   ├── support/              # Support & ticketing
│   ├── app/                  # Protected seller routes
│   │   ├── home/             # Onboarding checklist
│   │   ├── catalog/          # Product management
│   │   ├── finance/          # Payments & settlements
│   │   ├── addresses/        # Shipping addresses
│   │   ├── insights/         # Analytics dashboard
│   │   └── settings/         # Account settings
│   ├── admin/                # Admin console
│   ├── page.tsx              # Marketing landing
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── landing/              # Landing page components
│   ├── application/          # Application flow components
│   └── shared/               # Reusable components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth configuration
│   ├── email.ts              # Mock email service
│   ├── analytics.ts          # Event tracking
│   ├── validations/          # Zod schemas
│   └── utils.ts              # Utility functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migration history
│   └── seed.ts               # Seed script
├── public/
│   ├── uploads/              # User uploaded files
│   └── templates/            # CSV templates
└── tmp/
    ├── emails/               # Mock email preview
    └── invoices/             # Generated invoices
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, pnpm, or yarn
- Git

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd /tmp/broadway-sellers
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   The `.env` file should contain:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Initialize the database**
   ```bash
   npm run db:migrate
   ```

5. **Seed demo data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 👤 Demo Credentials

The seed script creates two demo users:

### Admin User
- **Email**: `admin@broadway.local`
- **Role**: Admin (access to admin console)

### Demo Seller
- **Email**: `seller@brand.local`
- **Role**: Seller (approved, with full onboarding data)
- **Features**:
  - 6 demo products across Fashion & Footwear
  - 2 completed settlements + 1 pending
  - Bank details configured
  - Pickup & return addresses set up
  - 80% onboarding checklist complete

### Authentication

This app uses **magic link authentication** (email-based, passwordless).

1. Enter your email on `/auth/sign-in`
2. Check `/tmp/emails/` folder for the magic link HTML file
3. Open the file and click the link (or copy the URL)

## 📊 Database Management

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (dev)
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Reset database and re-seed
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🗺️ Key Routes

### Public
- `/` - Marketing landing page
- `/apply` - Seller application (KYC form)
- `/apply/review` - Submission confirmation
- `/auth/sign-in` - Sign in with magic link

### Protected (Sellers)
- `/status` - Application tracking
- `/app/home` - Onboarding checklist hub
- `/app/catalog` - Product management
- `/app/finance` - Payments & invoices
- `/app/addresses` - Shipping addresses
- `/app/insights` - Analytics dashboard
- `/app/settings` - Account settings
- `/support` - Support tickets

### Admin
- `/admin` - Application review console

## 📧 Mock Email System

Emails are written to `tmp/emails/` as HTML files for development.

**Email Types**:
- Application submitted
- Application approved/rejected
- Clarification needed
- Status changed
- Magic link authentication

**Preview emails**: Open HTML files in browser from `tmp/emails/`

## 📤 File Uploads

- **Location**: `public/uploads/`
- **Max size**: 5MB per file
- **Max files**: 5 per application
- **Allowed types**: PDF, JPG, PNG, WEBP

## 🎨 UI Components

Built with **shadcn/ui** + **Tailwind CSS v4**:

- Button, Card, Input, Label, Textarea
- Select, Checkbox, Dialog, Tabs
- Progress, Badge, Alert, Sonner (toast)
- Table, Dropdown, Separator

**Icons**: lucide-react
**Animations**: framer-motion (subtle, 150-250ms)

## 🔐 Authentication & Authorization

- **Provider**: NextAuth v5 with Prisma adapter
- **Strategy**: Database sessions + email magic link
- **Roles**: `seller`, `admin`

**Route Protection**:
- Middleware checks authentication
- `/app/*` requires approved seller account
- `/admin` requires admin role

## 📝 Data Models

### Core Entities
- **User** - Auth identity (email, role)
- **SellerProfile** - KYC data (GST, company details)
- **SellerApplication** - Application lifecycle
- **SellerAccount** - Post-approval account
- **Product** - Catalog items
- **Settlement** - Payment ledger
- **Address** - Shipping addresses
- **SupportTicket** - Support requests
- **AnalyticsEvent** - Event tracking

See `prisma/schema.prisma` for full schema.

## 🧪 Development Workflow

1. **Make schema changes**
   ```bash
   # Edit prisma/schema.prisma
   npm run db:migrate
   ```

2. **Add new routes**
   ```bash
   # Create files in app/ directory
   # Next.js handles routing automatically
   ```

3. **Add UI components**
   ```bash
   npx shadcn@latest add <component-name>
   ```

4. **Test locally**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

## 🎯 Key Features Implementation Status

| Feature | Status | Route |
|---------|--------|-------|
| Marketing Landing | ✅ Complete | `/` |
| Seller Application | ✅ Complete | `/apply` |
| Application Status Tracker | ✅ Complete | `/status` |
| Magic Link Auth | ✅ Complete | `/auth/sign-in` |
| File Upload API | ✅ Complete | `/api/upload` |
| Application API | ✅ Complete | `/api/applications` |
| Admin Console | 🚧 Pending | `/admin` |
| Post-Approval Home | 🚧 Pending | `/app/home` |
| Catalog Management | 🚧 Pending | `/app/catalog` |
| CSV Bulk Upload | 🚧 Pending | `/app/catalog` |
| Fee Simulator | 🚧 Pending | `/app/catalog` |
| Finance Module | 🚧 Pending | `/app/finance` |
| Addresses Management | 🚧 Pending | `/app/addresses` |
| Insights Dashboard | 🚧 Pending | `/app/insights` |
| Support System | 🚧 Pending | `/support` |
| Settings | 🚧 Pending | `/app/settings` |
| Email Preview UI | 🚧 Pending | `/dev/emails` |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Session secret | (generate random) |

### Tailwind Theme

Customized in `app/globals.css`:
- Primary color: Black/White (high contrast)
- Rounded corners: 0.625rem (10px)
- Smooth animations: 150-250ms

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
npm run db:reset

# Regenerate Prisma Client
npm run db:generate
```

### Module Not Found Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://authjs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

This is a prototype project. To extend it:

1. Add new routes in `app/` directory
2. Create API endpoints in `app/api/`
3. Add Prisma models in `prisma/schema.prisma`
4. Use shadcn/ui for new components
5. Follow TypeScript strict mode

## 📄 License

MIT

## ✨ Next Steps

To complete the full spec, implement:

1. **Admin Console** (`/admin`)
   - Application list with filters
   - Approve/reject actions
   - Message threading

2. **Seller Dashboard** (`/app/*`)
   - Onboarding checklist
   - Product CRUD with CSV upload
   - Fee simulator component
   - Finance module
   - Addresses management
   - Insights dashboard with Recharts
   - Settings (team, notifications, API keys)

3. **Support System** (`/support`)
   - Ticket creation form
   - Ticket list and detail views

4. **Email Preview** (`/dev/emails`)
   - List all mock emails
   - Preview in iframe

5. **Polish**
   - Empty states
   - Loading skeletons
   - Error boundaries
   - Mobile optimization
   - Accessibility audit

---

**Built with ❤️ for Broadway**
