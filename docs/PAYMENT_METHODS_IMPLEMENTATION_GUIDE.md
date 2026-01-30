# Payment Methods Configuration - Implementation Guide

## 🎯 Feature Overview

This guide details how to implement a comprehensive payment methods management system for LikeThem, specifically for configuring Plin and Yape payment options alongside Stripe.

**Goal**: Allow admins to configure payment methods (Yape, Plin, Stripe) with custom settings like phone numbers and QR codes, which will be dynamically displayed to buyers during checkout.

---

## 📋 Current State Analysis

### ✅ What's Already Built

1. **Checkout UI** (`app/checkout/page.tsx`):
   - Radio buttons for Stripe, Yape, and Plin
   - Manual payment section with QR code display
   - Transaction code input
   - Payment proof upload functionality
   - File upload integration with Supabase Storage

2. **Database Order Model**:
   - Fields for `paymentMethod`, `paymentProof`, `transactionCode`
   - Ready to store payment data

3. **File Upload System**:
   - Supabase Storage integration (`lib/storage.ts`)
   - Upload API endpoint (`/api/upload`)
   - Support for image uploads (QR codes, payment proofs)

4. **Admin Infrastructure**:
   - Admin dashboard structure
   - `AdminPageShell` component
   - Role-based access control

### ❌ What's Missing

1. **Admin Settings Page**: Currently just a stub
2. **Payment Settings Database Model**: No table to store configuration
3. **Payment Settings API**: No endpoints to manage settings
4. **Dynamic Configuration**: Checkout uses hardcoded values
5. **Order Creation API**: `POST /api/orders` endpoint doesn't exist
6. **Order Verification UI**: No admin interface to approve manual payments

---

## 🗄️ Database Schema Changes

### New Model: PaymentSettings

Add this to `prisma/schema.prisma`:

```prisma
model PaymentSettings {
  id                    String   @id @default(cuid())
  
  // Yape Configuration
  yapeEnabled           Boolean  @default(false)
  yapePhoneNumber       String?
  yapeQRCode            String?  // URL to Supabase Storage
  yapeInstructions      String?  // Custom instructions for buyers
  
  // Plin Configuration
  plinEnabled           Boolean  @default(false)
  plinPhoneNumber       String?
  plinQRCode            String?  // URL to Supabase Storage
  plinInstructions      String?  // Custom instructions for buyers
  
  // Stripe Configuration
  stripeEnabled         Boolean  @default(true)
  stripePublicKey       String?
  stripeSecretKey       String?  // Encrypted in production
  
  // Global Settings
  defaultPaymentMethod  String   @default("stripe") // "stripe" | "yape" | "plin"
  commissionRate        Float    @default(0.10)     // Platform commission (10%)
  
  // Metadata
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  updatedBy             String?  // User ID of admin who last updated
  
  @@map("payment_settings")
}
```

### Migration Steps

```bash
# 1. Add model to schema.prisma
# 2. Create and run migration
npx prisma migrate dev --name add_payment_settings

# 3. Generate Prisma Client
npx prisma generate

# 4. Seed initial settings (optional)
# Create prisma/seed-payment-settings.ts
```

### Seed Script Example

Create `prisma/seed-payment-settings.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if settings already exist
  const existing = await prisma.paymentSettings.findFirst()
  
  if (existing) {
    console.log('Payment settings already exist')
    return
  }
  
  // Create default settings
  const settings = await prisma.paymentSettings.create({
    data: {
      yapeEnabled: false,
      yapePhoneNumber: '+51 999 888 777',
      yapeInstructions: 'Scan the QR code with your Yape app or send payment to the phone number above.',
      plinEnabled: false,
      plinPhoneNumber: '+51 999 888 777',
      plinInstructions: 'Scan the QR code with your Plin app or send payment to the phone number above.',
      stripeEnabled: true,
      defaultPaymentMethod: 'stripe',
      commissionRate: 0.10
    }
  })
  
  console.log('Created payment settings:', settings.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run with:
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-payment-settings.ts
```

---

## 🔌 API Implementation

### 1. Admin Payment Settings API

**File**: `app/api/admin/payment-settings/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/payment-settings - Fetch current settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get settings (create if not exists)
    let settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          yapeEnabled: false,
          plinEnabled: false,
          stripeEnabled: true,
          defaultPaymentMethod: 'stripe',
          commissionRate: 0.10
        }
      })
    }
    
    return NextResponse.json({ settings })
    
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/admin/payment-settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (data.commissionRate !== undefined) {
      if (data.commissionRate < 0 || data.commissionRate > 1) {
        return NextResponse.json(
          { error: 'Commission rate must be between 0 and 1' },
          { status: 400 }
        )
      }
    }
    
    // Get existing settings
    let settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      // Create new settings
      settings = await prisma.paymentSettings.create({
        data: {
          ...data,
          updatedBy: session.user.id
        }
      })
    } else {
      // Update existing settings
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: {
          ...data,
          updatedBy: session.user.id,
          updatedAt: new Date()
        }
      })
    }
    
    return NextResponse.json({
      message: 'Payment settings updated successfully',
      settings
    })
    
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

### 2. QR Code Upload API

**File**: `app/api/admin/payment-settings/upload-qr/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToSupabase } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('qrCode') as File
    const paymentMethod = formData.get('paymentMethod') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!['yape', 'plin'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }
    
    // Validate file size (2MB max for QR codes)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }
    
    // Upload to Supabase Storage
    const uploadResult = await uploadToSupabase(file, 'payment-qr-codes')
    
    return NextResponse.json({
      message: 'QR code uploaded successfully',
      url: uploadResult.url,
      publicId: uploadResult.publicId
    })
    
  } catch (error) {
    console.error('Error uploading QR code:', error)
    return NextResponse.json(
      { error: 'Failed to upload QR code' },
      { status: 500 }
    )
  }
}
```

### 3. Public Payment Methods API

**File**: `app/api/payment-methods/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/payment-methods - Public endpoint for checkout
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      // Return defaults if no settings configured
      return NextResponse.json({
        methods: {
          stripe: { enabled: true },
          yape: { enabled: false },
          plin: { enabled: false }
        },
        defaultMethod: 'stripe'
      })
    }
    
    // Build response with only enabled methods
    const methods: any = {}
    
    if (settings.stripeEnabled) {
      methods.stripe = {
        enabled: true,
        publicKey: settings.stripePublicKey || process.env.NEXT_PUBLIC_STRIPE_KEY
      }
    }
    
    if (settings.yapeEnabled) {
      methods.yape = {
        enabled: true,
        phoneNumber: settings.yapePhoneNumber,
        qrCodeUrl: settings.yapeQRCode,
        instructions: settings.yapeInstructions
      }
    }
    
    if (settings.plinEnabled) {
      methods.plin = {
        enabled: true,
        phoneNumber: settings.plinPhoneNumber,
        qrCodeUrl: settings.plinQRCode,
        instructions: settings.plinInstructions
      }
    }
    
    return NextResponse.json({
      methods,
      defaultMethod: settings.defaultPaymentMethod,
      commissionRate: settings.commissionRate
    })
    
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

### 4. Order Creation API

**File**: `app/api/orders/route.ts` (UPDATE existing GET with POST)

```typescript
// Add to existing route.ts file

import { uploadToSupabase } from '@/lib/storage'

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await request.json()
    
    // Validate payment method
    const settings = await prisma.paymentSettings.findFirst()
    const paymentMethod = data.paymentMethod
    
    if (paymentMethod === 'yape' && !settings?.yapeEnabled) {
      return NextResponse.json(
        { error: 'Yape payments are currently disabled' },
        { status: 400 }
      )
    }
    
    if (paymentMethod === 'plin' && !settings?.plinEnabled) {
      return NextResponse.json(
        { error: 'Plin payments are currently disabled' },
        { status: 400 }
      )
    }
    
    // Validate cart items exist and calculate totals
    const items = data.items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }
    
    // Fetch products to validate prices and availability
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      include: {
        curator: true
      }
    })
    
    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Some products are no longer available' },
        { status: 400 }
      )
    }
    
    // Calculate totals
    let subtotal = 0
    const validatedItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId)
      if (!product) throw new Error('Product not found')
      
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      }
    })
    
    const commission = subtotal * (settings?.commissionRate || 0.10)
    const curatorAmount = subtotal - commission
    
    // For simplicity, assume single curator order
    // In production, you'd want to split orders by curator
    const curatorId = products[0].curatorId
    
    // Determine order status based on payment method
    const status = paymentMethod === 'stripe' ? 'PENDING' : 'PENDING_VERIFICATION'
    
    // Create order with shipping address
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        curatorId: curatorId,
        status: status,
        totalAmount: subtotal,
        commission: commission,
        curatorAmount: curatorAmount,
        paymentMethod: paymentMethod,
        transactionCode: data.transactionCode || null,
        paymentProof: data.paymentProof || null,
        items: {
          create: validatedItems
        },
        shippingAddress: {
          create: {
            name: data.shippingAddress.name,
            email: data.shippingAddress.email,
            phone: data.shippingAddress.phone,
            address: data.shippingAddress.address,
            city: data.shippingAddress.city,
            state: data.shippingAddress.state,
            zipCode: data.shippingAddress.zipCode,
            country: data.shippingAddress.country
          }
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } }
              }
            }
          }
        },
        shippingAddress: true
      }
    })
    
    // TODO: Send email notifications
    // TODO: If Stripe, create payment intent
    
    return NextResponse.json({
      message: 'Order created successfully',
      order
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

---

## 🎨 Admin UI Implementation

### Admin Settings Page

**File**: `app/admin/settings/page.tsx`

Replace the stub with a full implementation:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminPageShell from '@/components/admin/AdminPageShell'
import { 
  Save, 
  Upload, 
  CreditCard, 
  Smartphone, 
  QrCode,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface PaymentSettings {
  id?: string
  // Yape
  yapeEnabled: boolean
  yapePhoneNumber: string
  yapeQRCode: string | null
  yapeInstructions: string
  // Plin
  plinEnabled: boolean
  plinPhoneNumber: string
  plinQRCode: string | null
  plinInstructions: string
  // Stripe
  stripeEnabled: boolean
  stripePublicKey: string
  stripeSecretKey: string
  // Global
  defaultPaymentMethod: string
  commissionRate: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    yapeEnabled: false,
    yapePhoneNumber: '+51 ',
    yapeQRCode: null,
    yapeInstructions: 'Scan the QR code with your Yape app or send payment to the phone number above.',
    plinEnabled: false,
    plinPhoneNumber: '+51 ',
    plinQRCode: null,
    plinInstructions: 'Scan the QR code with your Plin app or send payment to the phone number above.',
    stripeEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    defaultPaymentMethod: 'stripe',
    commissionRate: 0.10
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [yapeQRFile, setYapeQRFile] = useState<File | null>(null)
  const [plinQRFile, setPlinQRFile] = useState<File | null>(null)
  const [yapeQRPreview, setYapeQRPreview] = useState<string | null>(null)
  const [plinQRPreview, setPlinQRPreview] = useState<string | null>(null)
  
  // Fetch current settings
  useEffect(() => {
    fetchSettings()
  }, [])
  
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/payment-settings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment settings')
      }
      
      const data = await response.json()
      setSettings(data.settings)
      setYapeQRPreview(data.settings.yapeQRCode)
      setPlinQRPreview(data.settings.plinQRCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      
      // Upload QR codes if new files selected
      let yapeQRUrl = settings.yapeQRCode
      let plinQRUrl = settings.plinQRCode
      
      if (yapeQRFile) {
        const formData = new FormData()
        formData.append('qrCode', yapeQRFile)
        formData.append('paymentMethod', 'yape')
        
        const uploadResponse = await fetch('/api/admin/payment-settings/upload-qr', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload Yape QR code')
        }
        
        const uploadData = await uploadResponse.json()
        yapeQRUrl = uploadData.url
      }
      
      if (plinQRFile) {
        const formData = new FormData()
        formData.append('qrCode', plinQRFile)
        formData.append('paymentMethod', 'plin')
        
        const uploadResponse = await fetch('/api/admin/payment-settings/upload-qr', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload Plin QR code')
        }
        
        const uploadData = await uploadResponse.json()
        plinQRUrl = uploadData.url
      }
      
      // Update settings
      const updateData = {
        ...settings,
        yapeQRCode: yapeQRUrl,
        plinQRCode: plinQRUrl
      }
      
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }
      
      const data = await response.json()
      setSettings(data.settings)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleYapeQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setYapeQRFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setYapeQRPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handlePlinQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPlinQRFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPlinQRPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  if (isLoading) {
    return (
      <AdminPageShell title="Payment Settings" subtitle="Configure payment methods">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carbon"></div>
        </div>
      </AdminPageShell>
    )
  }
  
  return (
    <AdminPageShell 
      title="Payment Settings" 
      subtitle="Configure payment methods for the platform"
    >
      {/* Success Toast */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Payment settings saved successfully!</span>
        </motion.div>
      )}
      
      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="text-red-800">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Yape Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-medium">Yape Settings</h2>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.yapeEnabled}
                onChange={(e) => setSettings({ ...settings, yapeEnabled: e.target.checked })}
                className="w-5 h-5 text-purple-600"
              />
              <span className="text-sm font-medium">Enable Yape</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                value={settings.yapePhoneNumber}
                onChange={(e) => setSettings({ ...settings, yapePhoneNumber: e.target.value })}
                placeholder="+51 999 888 777"
                disabled={!settings.yapeEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">QR Code</label>
              <div className="flex items-center space-x-4">
                {yapeQRPreview && (
                  <img 
                    src={yapeQRPreview} 
                    alt="Yape QR" 
                    className="w-16 h-16 object-cover border border-gray-200 rounded"
                  />
                )}
                <label className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      {yapeQRFile ? yapeQRFile.name : 'Upload QR Code'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleYapeQRChange}
                    disabled={!settings.yapeEnabled}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Instructions for Buyers</label>
              <textarea
                value={settings.yapeInstructions}
                onChange={(e) => setSettings({ ...settings, yapeInstructions: e.target.value })}
                disabled={!settings.yapeEnabled}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Plin Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-medium">Plin Settings</h2>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.plinEnabled}
                onChange={(e) => setSettings({ ...settings, plinEnabled: e.target.checked })}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-sm font-medium">Enable Plin</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                value={settings.plinPhoneNumber}
                onChange={(e) => setSettings({ ...settings, plinPhoneNumber: e.target.value })}
                placeholder="+51 999 888 777"
                disabled={!settings.plinEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">QR Code</label>
              <div className="flex items-center space-x-4">
                {plinQRPreview && (
                  <img 
                    src={plinQRPreview} 
                    alt="Plin QR" 
                    className="w-16 h-16 object-cover border border-gray-200 rounded"
                  />
                )}
                <label className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      {plinQRFile ? plinQRFile.name : 'Upload QR Code'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePlinQRChange}
                    disabled={!settings.plinEnabled}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Instructions for Buyers</label>
              <textarea
                value={settings.plinInstructions}
                onChange={(e) => setSettings({ ...settings, plinInstructions: e.target.value })}
                disabled={!settings.plinEnabled}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Stripe Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-medium">Stripe Settings</h2>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripeEnabled}
                onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                className="w-5 h-5 text-indigo-600"
              />
              <span className="text-sm font-medium">Enable Stripe</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Publishable Key</label>
              <input
                type="text"
                value={settings.stripePublicKey}
                onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                placeholder="pk_..."
                disabled={!settings.stripeEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Secret Key</label>
              <input
                type="password"
                value={settings.stripeSecretKey}
                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                placeholder="sk_..."
                disabled={!settings.stripeEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Global Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium mb-6">Global Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Default Payment Method</label>
              <select
                value={settings.defaultPaymentMethod}
                onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-carbon"
              >
                <option value="stripe">Stripe</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.commissionRate * 100}
                onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) / 100 })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-carbon"
              />
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-carbon text-white px-8 py-3 rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AdminPageShell>
  )
}
```

---

## 🛍️ Update Checkout Page

**File**: `app/checkout/page.tsx`

Update to fetch payment methods dynamically:

```typescript
// Add to imports
interface PaymentMethodsData {
  methods: {
    stripe?: { enabled: boolean; publicKey?: string }
    yape?: { enabled: boolean; phoneNumber?: string; qrCodeUrl?: string; instructions?: string }
    plin?: { enabled: boolean; phoneNumber?: string; qrCodeUrl?: string; instructions?: string }
  }
  defaultMethod: string
}

// Add state
const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsData | null>(null)
const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true)

// Fetch payment methods on mount
useEffect(() => {
  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data)
        // Set default payment method
        setPaymentMethod(data.defaultMethod)
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }
  fetchPaymentMethods()
}, [])

// Update payment method radio buttons section (around line 455-520)
{/* Payment Method Selection */}
<div className="border border-gray-200 rounded-lg p-6">
  <div className="flex items-center space-x-3 mb-6">
    <CreditCard className="w-5 h-5 text-carbon" />
    <h2 className="font-serif text-2xl font-light">Payment Method</h2>
  </div>

  {isLoadingPaymentMethods ? (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-carbon mx-auto"></div>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Stripe Option */}
      {paymentMethods?.methods.stripe?.enabled && (
        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-carbon transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={(e) => setPaymentMethod('stripe')}
            className="text-carbon"
          />
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-carbon" />
            <div>
              <div className="font-medium">Credit Card</div>
              <div className="text-sm text-gray-500">Secure payment via Stripe</div>
            </div>
          </div>
        </label>
      )}

      {/* Yape Option */}
      {paymentMethods?.methods.yape?.enabled && (
        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-carbon transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="yape"
            checked={paymentMethod === 'yape'}
            onChange={(e) => setPaymentMethod('yape')}
            className="text-carbon"
          />
          <div className="flex items-center space-x-3">
            <QrCode className="w-5 h-5 text-carbon" />
            <div>
              <div className="font-medium">Yape</div>
              <div className="text-sm text-gray-500">Pay with Yape mobile wallet</div>
            </div>
          </div>
        </label>
      )}

      {/* Plin Option */}
      {paymentMethods?.methods.plin?.enabled && (
        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-carbon transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="plin"
            checked={paymentMethod === 'plin'}
            onChange={(e) => setPaymentMethod('plin')}
            className="text-carbon"
          />
          <div className="flex items-center space-x-3">
            <QrCode className="w-5 h-5 text-carbon" />
            <div>
              <div className="font-medium">Plin</div>
              <div className="text-sm text-gray-500">Pay with Plin mobile wallet</div>
            </div>
          </div>
        </label>
      )}
    </div>
  )}

  {/* Manual Payment Instructions */}
  {(paymentMethod === 'yape' || paymentMethod === 'plin') && paymentMethods && (
    <div className="mt-6 p-6 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-4">
        Pay with {paymentMethod === 'yape' ? 'Yape' : 'Plin'}
      </h3>
      
      {/* QR Code */}
      {paymentMethods.methods[paymentMethod]?.qrCodeUrl && (
        <div className="text-center mb-6">
          <img
            src={paymentMethods.methods[paymentMethod]?.qrCodeUrl}
            alt={`${paymentMethod} QR Code`}
            className="w-48 h-48 mx-auto border border-gray-200 rounded-lg object-contain"
          />
        </div>
      )}

      {/* Phone Number */}
      {paymentMethods.methods[paymentMethod]?.phoneNumber && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Send payment to this number:
          </label>
          <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="font-mono">
              {paymentMethods.methods[paymentMethod]?.phoneNumber}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {paymentMethods.methods[paymentMethod]?.instructions && (
        <p className="text-sm text-gray-600 mb-6">
          {paymentMethods.methods[paymentMethod]?.instructions}
        </p>
      )}

      {/* Rest of the manual payment form remains the same */}
      {/* Transaction Code */}
      {/* Payment Proof Upload */}
    </div>
  )}
</div>
```

---

## ✅ Testing Checklist

### Database
- [ ] Prisma migration runs successfully
- [ ] PaymentSettings table created
- [ ] Seed script populates default settings

### Admin API
- [ ] GET /api/admin/payment-settings returns settings
- [ ] PUT /api/admin/payment-settings updates settings
- [ ] POST /api/admin/payment-settings/upload-qr uploads QR codes to Supabase
- [ ] Only ADMIN users can access endpoints

### Public API
- [ ] GET /api/payment-methods returns enabled methods
- [ ] Disabled methods are excluded from response
- [ ] QR URLs are publicly accessible

### Admin UI
- [ ] Settings page loads current configuration
- [ ] Enable/disable toggles work
- [ ] QR code upload shows preview
- [ ] Phone number and instructions are editable
- [ ] Save button updates all settings
- [ ] Success/error toasts display correctly

### Checkout
- [ ] Payment methods fetch from API on load
- [ ] Only enabled methods show in checkout
- [ ] Correct QR codes display for Yape/Plin
- [ ] Dynamic phone numbers display
- [ ] Order creation includes payment data
- [ ] Payment proof uploads successfully

### Order Management
- [ ] Orders with status PENDING_VERIFICATION appear in admin
- [ ] Payment proof images are viewable
- [ ] Order details show correct payment method

---

## 🚀 Deployment Notes

### Environment Variables
Add to production `.env`:
```bash
# Supabase Storage (required for QR codes and payment proofs)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (optional, for future Stripe integration)
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Database Migration
```bash
# On production
npm run build
npx prisma generate
npx prisma migrate deploy
```

### Supabase Storage Setup
1. Create bucket `likethem-assets` if not exists
2. Create folder `payment-qr-codes` for QR code images
3. Set bucket to public or configure RLS policies

---

## 📚 Additional Features (Future Enhancements)

1. **Multiple Payment Accounts**: Allow curators to set their own Yape/Plin numbers
2. **Payment Proof Gallery**: Admin view to batch review payment proofs
3. **Automated Verification**: Integrate with payment APIs for auto-confirmation
4. **Email Notifications**: Send payment instructions via email after order
5. **Payment Analytics**: Track which methods are most used
6. **Refund Management**: Handle refunds for manual payments

---

**Last Updated**: January 30, 2025
**Feature Status**: Ready for Implementation
**Estimated Development Time**: 2-3 days
