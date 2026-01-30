import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// POST /api/curator/payment-settings/upload-qr - Upload QR code for payment method
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!curatorProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const paymentMethod = formData.get('paymentMethod') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!paymentMethod || !['yape', 'plin'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Must be "yape" or "plin"' },
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

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `qrs/${curatorProfile.id}_${paymentMethod}_${timestamp}.${fileExtension}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('likethem-assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[curator/upload-qr] Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('likethem-assets')
      .getPublicUrl(fileName)

    const qrCodeUrl = urlData.publicUrl

    // Update payment settings with QR code URL
    const fieldName = paymentMethod === 'yape' ? 'yapeQRCode' : 'plinQRCode'
    
    const settings = await prisma.paymentSettings.upsert({
      where: { curatorId: curatorProfile.id },
      update: {
        [fieldName]: qrCodeUrl,
        updatedBy: session.user.id
      },
      create: {
        curatorId: curatorProfile.id,
        [fieldName]: qrCodeUrl,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      url: qrCodeUrl,
      settings
    })
  } catch (error) {
    console.error('[curator/upload-qr] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to upload QR code' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
