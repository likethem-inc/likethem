# LikeThem Repository Overview

## 📋 Executive Summary

LikeThem is an exclusive fashion marketplace where influencers curate products. The platform is built with modern web technologies and follows a modular architecture.

---

## 🛠️ Technologies Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API (Cart, etc.)
- **Authentication**: NextAuth.js v4

### Backend
- **Runtime**: Node.js (≥20)
- **Database**: PostgreSQL
- **ORM**: Prisma 6.12.0
- **API**: Next.js API Routes (REST)

### Infrastructure
- **Image Storage**: Supabase Storage (bucket: `likethem-assets`)
- **Alternative Image Service**: Cloudinary (configured but secondary)
- **Deployment**: Vercel-ready
- **Email**: Resend

### Key Dependencies
```json
{
  "@prisma/client": "^6.12.0",
  "@supabase/supabase-js": "^2.75.1",
  "next-auth": "^4.24.11",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "date-fns": "^4.1.0",
  "i18next": "^25.8.0",
  "react-i18next": "^16.5.4"
}
```

---

## 📁 Project Structure

```
likethem/
├── app/                          # Next.js App Router (pages & layouts)
│   ├── (auth)/                   # Authentication routes
│   │   ├── auth/                 # signin, signup, forgot-password
│   │   └── account/              # User account settings
│   ├── admin/                    # Admin dashboard
│   │   ├── settings/             # Platform settings (STUB)
│   │   ├── curators/             # Curator management
│   │   ├── products/             # Product moderation
│   │   ├── users/                # User management
│   │   └── seller-applications/  # Review applications
│   ├── dashboard/curator/        # Curator dashboard
│   │   ├── settings/             # ⭐ Store settings (48KB file)
│   │   ├── products/             # Product management
│   │   ├── orders/               # Order management
│   │   ├── analytics/            # Stats & analytics
│   │   ├── collaborations/       # Collaborations
│   │   └── store/                # Store customization
│   ├── checkout/                 # ⭐ Checkout page (31KB)
│   ├── cart/                     # Shopping cart
│   ├── explore/                  # Browse curators
│   ├── curator/[slug]/           # Curator store page
│   ├── product/[slug]/           # Product detail page
│   ├── orders/                   # Order history
│   ├── api/                      # API Routes (see below)
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   │   ├── AdminPageShell.tsx
│   │   ├── curators/
│   │   ├── products/
│   │   └── users/
│   ├── curator/                  # Curator dashboard components
│   ├── cart/                     # Cart components
│   ├── product/                  # Product display components
│   ├── ui/                       # Reusable UI components
│   └── [various].tsx             # Top-level shared components
│
├── contexts/                     # React Context providers
│   └── CartContext.tsx           # Shopping cart state
│
├── lib/                          # Utility functions & services
│   ├── auth.ts                   # ⭐ Auth helpers (18KB)
│   ├── storage.ts                # ⭐ Supabase file uploads
│   ├── supabase-server.ts        # Supabase server client
│   ├── supabase-storage.ts       # Storage utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── mailer.ts                 # Email service (Resend)
│   ├── cloudinary.ts             # Cloudinary integration
│   ├── admin/                    # Admin utilities
│   ├── curators/                 # Curator utilities
│   └── [various].ts              # Other utilities
│
├── prisma/                       # Database
│   ├── schema.prisma             # ⭐ Database schema (344 lines)
│   ├── migrations/               # Migration history
│   ├── seed.ts                   # Database seeder
│   └── seed-orders.ts            # Order seeder
│
├── types/                        # TypeScript definitions
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── hooks/                        # Custom React hooks
├── locales/                      # i18n translations
├── public/                       # Static assets
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
    └── SUPABASE_STORAGE_SETUP.md # Storage configuration guide
```

---

## 🗄️ Database Models (Prisma Schema)

### Core Entities

#### **User Model**
- Primary user table for all roles (ADMIN, CURATOR, BUYER)
- Fields: `id`, `email`, `passwordHash`, `role`, `name`, `image`, `phone`
- Relations: CuratorProfile (1:1), Orders, CartItems, Favorites, Follows, Addresses

#### **CuratorProfile Model**
- Extended profile for curators (influencers/sellers)
- **Store Settings**:
  - `storeName`, `slug`, `bio`, `avatarImage`, `bannerImage`
  - `city`, `country`, `styleTags`
  - Social links: `instagram`, `tiktok`, `youtube`, `twitter`
- **Preferences**:
  - `isPublic`, `isEditorsPick`
  - Notifications: `notifyFollowers`, `notifyFavorites`, `notifyCollaborations`, `notifyOrders`
  - Privacy: `showSales`, `showEarnings`, `allowCollaborations`
- **Payment**: `stripeAccountId`, `stripeAccountStatus`
- Relations: Products, Orders (as seller), Followers, Collaborations

#### **Product Model**
- Core product entity
- Fields: `title`, `description`, `price`, `category`, `tags`, `sizes`, `colors`
- `stockQuantity`, `isActive`, `isFeatured`, `curatorNote`, `slug`
- Relations: ProductImages (1:many), OrderItems, CartItems, Favorites

#### **ProductImage Model**
- Product images with ordering
- Fields: `url`, `altText`, `order`
- Stored in Supabase Storage

#### **Order Model** ⭐
- **Payment Fields**:
  - `paymentMethod`: string (stripe, yape, plin)
  - `paymentProof`: string (URL to uploaded screenshot)
  - `transactionCode`: string (manual payment reference)
  - `stripePaymentIntentId`: Stripe integration
  - `stripeTransferId`: Payout tracking
- Fields: `status`, `totalAmount`, `commission`, `curatorAmount`
- Relations: OrderItems, ShippingAddress, Buyer, Curator

#### **ShippingAddress Model**
- Order shipping details
- Fields: `name`, `email`, `phone`, `address`, `city`, `state`, `zipCode`, `country`

#### **UserAddress Model**
- Saved addresses for users
- Fields: same as ShippingAddress + `isDefault`
- Supports multiple saved addresses per user

#### **Other Models**
- `CartItem`: Shopping cart persistence
- `Favorite`: Product favorites/likes
- `WishlistItem`: User wishlists
- `Follow`: Curator followers
- `Collaboration`: Curator partnerships
- `SellerApplication`: Curator applications
- `Account`, `Session`, `VerificationToken`: NextAuth tables

### Enums
```prisma
enum Role {
  ADMIN
  CURATOR
  BUYER
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 🔌 API Routes Structure

```
/api/
├── auth/
│   ├── [...nextauth]/       # NextAuth endpoints
│   ├── register/            # POST - User registration
│   ├── signup/              # POST - Alternative signup
│   ├── forgot-password/     # POST - Password reset request
│   └── reset-password/      # POST - Password reset confirm
│
├── admin/                   # Admin-only endpoints
│   ├── users/
│   │   ├── GET - List users
│   │   └── [id]/role/       # PATCH - Update user role
│   ├── curators/[id]/
│   │   ├── editors-pick/    # PATCH - Set editor's pick
│   │   ├── visibility/      # PATCH - Public/private
│   │   └── identity/        # GET - Curator identity
│   ├── products/[id]/
│   │   └── status/          # PATCH - Approve/reject products
│   └── seller-applications/[id]/
│       ├── approve/         # POST - Approve application
│       └── reject/          # POST - Reject application
│
├── curator/                 # Curator endpoints
│   ├── profile/             # GET/PUT - Curator profile & settings
│   ├── products/            # Product management
│   │   └── [id]/
│   │       ├── GET/PUT/DELETE
│   │       └── status/      # PATCH - Activate/deactivate
│   ├── stats/               # GET - Dashboard analytics
│   ├── upload-image/        # POST - Image upload (profile/banner)
│   ├── apply/               # POST - Curator application
│   └── decision/            # POST - Application decision
│
├── account/                 # User account management
│   ├── addresses/           # GET/POST - Saved addresses
│   ├── update/              # PUT - Profile update
│   └── change-password/     # POST - Password change
│
├── products/
│   ├── GET - List products
│   └── [slug]/              # GET - Product details
│
├── curators/
│   ├── [slug]/              # GET - Curator profile
│   └── discover/            # GET - Browse curators
│
├── orders/
│   ├── GET - List user orders  # ⭐ See implementation at line 10-61
│   └── [id]/                # GET - Order details
│
├── cart/                    # GET/POST/DELETE - Cart operations
├── wishlist/                # GET/POST/DELETE - Wishlist
├── follow/curators/         # POST/DELETE - Follow curators
├── upload/                  # ⭐ POST - General file upload
├── search/                  # GET - Search functionality
└── health/                  # GET - Health check
```

---

## 🎯 Current Payment Implementation

### Payment Methods Supported
The checkout page (`app/checkout/page.tsx`) currently supports:
1. **Stripe** (credit/debit cards) - Integration pending
2. **Yape** (Peruvian mobile wallet) - Manual verification
3. **Plin** (Peruvian mobile wallet) - Manual verification

### Payment Flow for Yape/Plin (Current)

**Checkout Page** (`app/checkout/page.tsx`):
```typescript
// Line 28-30
const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'yape' | 'plin'>('stripe')
const [paymentProof, setPaymentProof] = useState<File | null>(null)
const [transactionCode, setTransactionCode] = useState('')
```

**Manual Payment UI** (Lines 522-620):
- Shows QR code image: `/payment-qr/${paymentMethod}-qr.svg`
- Displays phone number: `+51 999 888 777` (hardcoded)
- Transaction code input field
- Payment proof upload (screenshot/PDF)
- File validation: JPG, PNG, PDF (max 5MB)

**Order Creation** (Lines 139-228):
1. Upload payment proof to Supabase Storage (if provided)
2. Create order via `POST /api/orders` with:
   - Payment method
   - Transaction code
   - Payment proof URL
3. Redirect to order confirmation

### Order Storage (Database)
```prisma
model Order {
  paymentMethod         String?   # "stripe", "yape", "plin"
  paymentProof          String?   # URL to uploaded screenshot
  transactionCode       String?   # Manual payment reference
  stripePaymentIntentId String?   # For Stripe integration
  status                String    # PENDING, CONFIRMED, etc.
}
```

---

## 📤 File Upload System

### Supabase Storage (`lib/storage.ts`)

**Bucket**: `likethem-assets`

**Upload Function**:
```typescript
async function uploadToSupabase(file: File, folder: string = ''): Promise<UploadResult>
```
- Generates unique filename: `{timestamp}-{random}.{ext}`
- File path: `{folder}/{filename}`
- Returns: `{ url, publicId, altText }`
- Max file size: 5MB (enforced in API route)
- Allowed types: images (image/*)

**API Route** (`app/api/upload/route.ts`):
- **Endpoint**: `POST /api/upload`
- **Auth**: Required (NextAuth session)
- **Form Data**: 
  - `images`: File[] (max 5 files)
  - `folder`: string (optional, default: 'products')
- **Validation**:
  - File size: ≤ 5MB per file
  - File type: Must be image/*
  - Max files: 5 per request
- **Response**: `{ message, images: [{ url, publicId, altText }] }`

**Usage Locations**:
1. **Curator Settings** (`dashboard/curator/settings/page.tsx`):
   - Profile image upload
   - Banner image upload
   - Uses: `POST /api/curator/upload-image`
   
2. **Product Management**:
   - Product images (up to 5)
   - Uses: `POST /api/upload?folder=products`
   
3. **Checkout** (`app/checkout/page.tsx`):
   - Payment proof upload
   - Uses: `POST /api/upload?folder=payment-proofs`

**Folder Structure in Supabase**:
```
likethem-assets/
├── products/         # Product images
├── payment-proofs/   # Yape/Plin screenshots
├── profiles/         # Curator avatars
└── banners/          # Store banners
```

---

## ⚙️ Settings Management

### Admin Settings
**Location**: `app/admin/settings/page.tsx`

**Status**: 🚧 **STUB IMPLEMENTATION**
```typescript
// Current implementation (22 lines)
export default async function SettingsPage() {
  await requireAdmin()
  
  return (
    <AdminPageShell title="Platform Settings">
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <h3>Coming Soon</h3>
        <p>Platform settings are under development.</p>
      </div>
    </AdminPageShell>
  )
}
```

**What Should Be Here**:
- Platform-wide configuration
- Payment gateway settings (Stripe keys, Yape/Plin phone numbers)
- Email templates
- Commission rates
- Feature flags

### Curator Settings
**Location**: `app/dashboard/curator/settings/page.tsx`

**Status**: ✅ **FULLY IMPLEMENTED** (48KB, ~1400 lines)

**Tabs**:
1. **Store Info** (`activeTab: 'store'`):
   - Store name, slug, bio
   - Profile image & banner upload
   - Social media links (Instagram, TikTok, YouTube, Twitter)
   - Location (city, country)
   
2. **Notifications** (`activeTab: 'notifications'`):
   - `notifyFollowers`: New followers
   - `notifyFavorites`: Product favorites
   - `notifyCollaborations`: Collaboration requests
   - `notifyOrders`: New orders
   
3. **Security** (`activeTab: 'security'`):
   - Change password form
   - Current password verification
   
4. **Privacy** (`activeTab: 'privacy'`):
   - `isPublic`: Store visibility
   - `showSales`: Show sales stats publicly
   - `showEarnings`: Show earnings publicly
   - `allowCollaborations`: Accept collaboration requests
   
5. **Danger Zone** (`activeTab: 'danger'`):
   - Delete store/account
   - Requires confirmation

**API Integration**:
- `GET/PUT /api/curator/profile` - Load/save settings
- `POST /api/curator/upload-image` - Image uploads
- `POST /api/account/change-password` - Password change

**Data Source**: `CuratorProfile` model in database

---

## 🛍️ Checkout Flow

### Current Implementation (`app/checkout/page.tsx`)

**Step 1: Shipping Information**
- Saved addresses selection (from `UserAddress` model)
- Or enter new address
- Fields: name, email, phone, address, city, state, zip, country

**Step 2: Payment Method**
- Radio buttons for: Stripe, Yape, Plin
- Default: Stripe

**Step 3: Manual Payment (Yape/Plin)**
If Yape or Plin selected:
- Display QR code image
- Show phone number: `+51 999 888 777`
- Transaction code input (optional)
- Payment proof upload (optional):
  - Accepts: JPG, PNG, PDF
  - Max size: 5MB
  - Uploads to `payment-proofs/` folder

**Step 4: Order Summary**
- Cart items with thumbnails
- Subtotal, shipping, tax
- Total amount
- "Place Order" button

**Step 5: Order Creation**
```typescript
const orderData = {
  items: [...],
  shippingAddress: {...},
  paymentMethod: 'yape' | 'plin' | 'stripe',
  transactionCode: '...',
  paymentProof: 'https://supabase.../payment-proofs/...',
  totalAmount: total
}

const response = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
})
```

**Step 6: Confirmation**
- Redirect to `/order-confirmation?orderId=xxx`
- Clear cart

### Missing Backend Implementation
❌ `POST /api/orders` - Order creation endpoint not found
- Needs to be implemented to handle order creation
- Should validate payment data
- Should create order with PENDING status
- Should handle payment proof storage

---

## 🔐 Authentication & Authorization

### NextAuth Configuration (`lib/auth.ts`, 18KB)

**Providers**:
- Credentials (email + password with bcrypt)
- Google OAuth (configured but needs client ID/secret)

**Session Strategy**: JWT

**Database Adapter**: Prisma Adapter

**User Roles**: 
- ADMIN (full access)
- CURATOR (seller dashboard)
- BUYER (default, shopping only)

**Protected Routes**:
- Admin: `/admin/*` - requires ADMIN role
- Curator: `/dashboard/curator/*` - requires CURATOR role
- Checkout: `/checkout` - requires authenticated user

**Middleware** (`middleware.ts`):
- Handles i18n locale routing
- Auth checking (NextAuth)

---

## 🌍 Internationalization

**Library**: i18next + react-i18next

**Locales Directory**: `locales/`

**Supported Languages**: 
- Check `locales/` folder for available languages

**API**: `GET /api/i18n/locale` - Switch language

---

## 🎨 Styling & UI

### Tailwind Configuration
**Theme Colors** (from README):
- Background: `#FFFFFF` (pure white)
- Text: `#1A1A1A` (carbon black)
- Accent: Custom carbon color
- Neutrals: Gray, beige tones

**Typography**:
- Serif: For headings (Playfair Display style)
- Sans: Inter, Helvetica Neue

**Design Philosophy**:
- Minimalist, editorial style
- Inspired by: Net-a-Porter, SSENSE, By Far

### Component Libraries
- **Framer Motion**: Page transitions, animations
- **Lucide React**: Icon set
- Custom components in `components/` directory

---

## 📊 Key Features Status

| Feature | Status | Location |
|---------|--------|----------|
| User Authentication | ✅ Complete | `lib/auth.ts`, `app/auth/` |
| Curator Registration | ✅ Complete | `app/apply/`, `app/sell/` |
| Product Management | ✅ Complete | `app/dashboard/curator/products/` |
| Shopping Cart | ✅ Complete | `contexts/CartContext.tsx` |
| Checkout (UI) | ✅ Complete | `app/checkout/page.tsx` |
| Checkout (Backend) | ❌ Incomplete | `POST /api/orders` missing |
| Yape/Plin Support | ⚠️ Partial | UI ready, backend needs work |
| Payment Proof Upload | ✅ Complete | Supabase Storage integration |
| Admin Dashboard | ✅ Complete | `app/admin/` |
| Admin Settings | ❌ Stub only | `app/admin/settings/page.tsx` |
| Curator Settings | ✅ Complete | `app/dashboard/curator/settings/` |
| Stripe Integration | ❌ Not started | Pending |
| Order Management | ⚠️ Partial | Read-only, no creation |
| Email Notifications | ⚠️ Configured | Resend setup, needs templates |

---

## 🚀 Development Commands

```bash
# Development server
npm run dev                  # Start on port 3000

# Database
npx prisma generate         # Generate Prisma Client
npx prisma db push          # Push schema changes
npx prisma studio           # GUI for database
npx prisma migrate dev      # Create migration

# Scripts
npm run promote:curator     # Promote user to curator role
npm run seed:orders         # Seed test orders
npm run verify:storage      # Verify Supabase Storage setup

# Build
npm run build               # Production build
npm start                   # Production server

# Deployment
vercel                      # Deploy to Vercel
```

---

## 🔧 Environment Variables

```bash
# Database (PostgreSQL)
DATABASE_URL="postgres://..."        # Pooled connection (PgBouncer)
DIRECT_URL="postgres://..."          # Direct connection (for migrations)

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Supabase Storage (required for image uploads)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Cloudinary (optional, alternative to Supabase)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Stripe (for future implementation)
# STRIPE_SECRET_KEY="sk_..."
# STRIPE_PUBLISHABLE_KEY="pk_..."
```

---

## 📝 Implementation Notes for Payment Methods Feature

### What Needs to Be Built

#### 1. **Admin Settings Page** (High Priority)
**File**: `app/admin/settings/page.tsx`

**Requirements**:
- Create form to manage platform-wide payment settings
- Store payment configuration in database (new model needed)
- Sections:
  - **Yape Settings**: Phone number, QR code upload, enabled/disabled
  - **Plin Settings**: Phone number, QR code upload, enabled/disabled
  - **Stripe Settings**: API keys, enabled/disabled
  - **Global Settings**: Default payment method, commission rates

**Database Model Needed**:
```prisma
model PaymentSettings {
  id                    String   @id @default(cuid())
  // Yape
  yapeEnabled           Boolean  @default(false)
  yapePhoneNumber       String?
  yapeQRCode            String?  // URL to Supabase Storage
  // Plin
  plinEnabled           Boolean  @default(false)
  plinPhoneNumber       String?
  plinQRCode            String?  // URL to Supabase Storage
  // Stripe
  stripeEnabled         Boolean  @default(false)
  stripePublicKey       String?
  stripeSecretKey       String?
  // Global
  defaultPaymentMethod  String   @default("stripe")
  commissionRate        Float    @default(0.10)
  updatedAt             DateTime @updatedAt
  updatedBy             String?  // Admin user ID
}
```

#### 2. **API Endpoint for Payment Settings**
**File**: `app/api/admin/payment-settings/route.ts`

**Endpoints**:
- `GET /api/admin/payment-settings` - Fetch current settings
- `PUT /api/admin/payment-settings` - Update settings (admin only)
- `POST /api/admin/payment-settings/qr-upload` - Upload QR codes

#### 3. **Public API for Checkout**
**File**: `app/api/payment-methods/route.ts`

**Endpoint**:
- `GET /api/payment-methods` - Returns enabled payment methods with necessary data (phone numbers, QR URLs)

**Response**:
```json
{
  "stripe": {
    "enabled": true,
    "publicKey": "pk_..."
  },
  "yape": {
    "enabled": true,
    "phoneNumber": "+51 999 888 777",
    "qrCodeUrl": "https://..."
  },
  "plin": {
    "enabled": true,
    "phoneNumber": "+51 999 888 777",
    "qrCodeUrl": "https://..."
  }
}
```

#### 4. **Update Checkout Page**
**File**: `app/checkout/page.tsx`

**Changes**:
- Fetch payment methods from API on mount
- Show only enabled payment methods
- Use dynamic phone numbers and QR codes (not hardcoded)
- Hide payment method if disabled in admin settings

#### 5. **Order Creation Endpoint**
**File**: `app/api/orders/route.ts`

**New Endpoint**:
- `POST /api/orders` - Create order with payment data
- Validate payment method is enabled
- Store payment proof URL
- Set initial status based on payment method:
  - Stripe: PENDING (awaiting Stripe confirmation)
  - Yape/Plin: PENDING_VERIFICATION (awaiting admin review)

#### 6. **Order Management for Admins**
**File**: `app/admin/orders/page.tsx`

**Features**:
- List orders with PENDING_VERIFICATION status
- View payment proof images
- Approve/reject manual payments
- Update order status

#### 7. **Curator Settings - Payment Methods** (Optional)
**File**: `app/dashboard/curator/settings/page.tsx`

**Enhancement**:
- Add tab for curator-specific payment preferences
- Allow curators to set their own Yape/Plin numbers (if platform allows)
- Or just display platform's payment methods

---

## 🎯 Recommended Implementation Order

1. **Phase 1: Database & API Setup**
   - Create `PaymentSettings` model
   - Run Prisma migration
   - Create admin payment settings API
   - Seed default settings

2. **Phase 2: Admin UI**
   - Build admin settings page
   - QR code upload functionality
   - Enable/disable toggles
   - Phone number inputs

3. **Phase 3: Public API**
   - Create public payment methods endpoint
   - Add caching for performance

4. **Phase 4: Checkout Integration**
   - Update checkout page to fetch payment methods
   - Dynamic rendering based on enabled methods
   - Replace hardcoded values

5. **Phase 5: Order Processing**
   - Implement order creation endpoint
   - Payment proof handling
   - Status management

6. **Phase 6: Order Management**
   - Admin order review page
   - Approve/reject functionality
   - Notifications to buyer

---

## 📚 Additional Resources

- **Supabase Storage Setup**: `docs/SUPABASE_STORAGE_SETUP.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **README**: `README.md`

---

## 🤝 Contributing Guidelines

### Code Style
- TypeScript strict mode
- Use Prisma for all database operations
- Follow Next.js 14 App Router patterns
- Use server components where possible
- Client components only when needed (interactivity, hooks)

### Component Patterns
- Server components: async functions, direct DB access
- Client components: marked with `'use client'`, use hooks
- Shared components: in `components/` directory
- Page-specific components: in `components/[feature]/`

### File Naming
- Components: PascalCase (e.g., `CuratorSettings.tsx`)
- Utilities: camelCase (e.g., `auth.ts`)
- API routes: `route.ts` in feature folders
- Pages: `page.tsx` in route folders

### Git Workflow
- Feature branches
- Descriptive commit messages
- Pull requests for review

---

**Last Updated**: January 30, 2025
**Repository**: likethem
**Documentation Version**: 1.0.0
