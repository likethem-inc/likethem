import { getSupabaseServer } from './supabase-server'

const CURATOR_ASSETS_BUCKET = 'curator-assets'

export interface UploadResult {
  url: string
  path: string
}

/**
 * Upload a curator image (avatar or banner) to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user ID of the curator
 * @param type - Type of image ('avatar' or 'banner')
 * @returns The public URL and path of the uploaded image
 */
export async function uploadCuratorImage(
  file: File,
  userId: string,
  type: 'avatar' | 'banner'
): Promise<UploadResult> {
  const supabase = getSupabaseServer()

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }

  // Validate file type
  if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
    throw new Error('Please upload a JPG, PNG, or WebP file')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${type}-${timestamp}.${fileExt}`

  // Convert file to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(CURATOR_ASSETS_BUCKET)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(CURATOR_ASSETS_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path
  }
}

/**
 * Delete a curator image from Supabase Storage
 * @param path - The path of the file to delete
 */
export async function deleteCuratorImage(path: string): Promise<void> {
  const supabase = getSupabaseServer()

  const { error } = await supabase.storage
    .from(CURATOR_ASSETS_BUCKET)
    .remove([path])

  if (error) {
    console.error('Supabase delete error:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
