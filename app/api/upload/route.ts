import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToSupabase } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.error('Upload API: No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Upload API: Session found for user:', session.user.id, 'Role:', session.user.role)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      return NextResponse.json(
        { error: 'Image upload service not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const folder = formData.get('folder') as string || 'products'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(async (file) => {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`)
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image.`)
      }

      // Upload to Supabase Storage
      return uploadToSupabase(file, folder)
    })

    const uploadResults = await Promise.all(uploadPromises)

    return NextResponse.json({
      message: 'Images uploaded successfully',
      images: uploadResults
    })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    )
  }
} 