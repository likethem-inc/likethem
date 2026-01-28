import { getSupabaseServer } from './supabase-server';

export interface UploadResult {
  url: string;
  publicId: string;
  altText: string;
}

const BUCKET_NAME = 'likethem-assets';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and metadata
 */
export async function uploadToSupabase(
  file: File,
  folder: string = ''
): Promise<UploadResult> {
  try {
    const supabase = getSupabaseServer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      publicId: data.path,
      altText: file.name,
    };
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param publicId - The path/publicId of the file to delete
 */
export async function deleteFromSupabase(publicId: string): Promise<void> {
  try {
    const supabase = getSupabaseServer();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([publicId]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteFromSupabase:', error);
    throw error;
  }
}

/**
 * Check if the products bucket exists and is properly configured
 */
export async function checkBucketExists(): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error checking buckets:', error);
      return false;
    }

    return data?.some((bucket) => bucket.name === BUCKET_NAME) || false;
  } catch (error) {
    console.error('Error in checkBucketExists:', error);
    return false;
  }
}
