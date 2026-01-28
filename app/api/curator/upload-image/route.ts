import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadCuratorImage } from '@/lib/supabase-storage'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a curator
    if (session.user.role !== 'CURATOR') {
      return NextResponse.json(
        { error: 'Only curators can upload images' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    if (!type || !['avatar', 'banner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be "avatar" or "banner"' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const result = await uploadCuratorImage(
      file, 
      session.user.id, 
      type as 'avatar' | 'banner'
    )

    return NextResponse.json({
      message: 'Image uploaded successfully',
      url: result.url,
      path: result.path
    })

  } catch (error) {
    console.error('Error uploading curator image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}
