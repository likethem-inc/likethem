# Supabase Storage Setup for Curator Assets

This document explains how to configure Supabase Storage for curator profile images (avatars and banners).

## Prerequisites

- Access to your Supabase project dashboard
- Service role key configured in `.env` as `SUPABASE_SERVICE_ROLE_KEY`
- Public URL configured in `.env` as `NEXT_PUBLIC_SUPABASE_URL`

## Setup Instructions

### 1. Create the Storage Bucket

1. Log in to your Supabase dashboard at https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Storage** in the left sidebar
4. Click **New Bucket**
5. Create a new bucket with the following settings:
   - **Name**: `curator-assets`
   - **Public bucket**: Yes (enable public access)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### 2. Configure Storage Policies

To allow authenticated curators to upload and manage their images, set up the following RLS (Row Level Security) policies:

#### Policy 1: Allow authenticated users to upload files

```sql
CREATE POLICY "Curators can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'curator-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Allow public read access

```sql
CREATE POLICY "Public can view all curator images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'curator-assets');
```

#### Policy 3: Allow users to update their own files

```sql
CREATE POLICY "Curators can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'curator-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Allow users to delete their own files

```sql
CREATE POLICY "Curators can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'curator-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Verify Configuration

After setting up the bucket and policies, verify:

1. The bucket `curator-assets` appears in your Storage dashboard
2. The bucket is marked as **Public**
3. All four policies are active in the Storage Policies section

## Usage

### Image Upload API

The application provides an API endpoint for uploading curator images:

**Endpoint**: `POST /api/curator/upload-image`

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `image`: File (max 5MB, JPG/PNG/WebP)
  - `type`: String ('avatar' or 'banner')

**Response**:
```json
{
  "message": "Image uploaded successfully",
  "url": "https://[project-id].supabase.co/storage/v1/object/public/curator-assets/[user-id]/banner-[timestamp].jpg",
  "path": "[user-id]/banner-[timestamp].jpg"
}
```

### Storage Structure

Images are organized by user ID:

```
curator-assets/
├── [user-id-1]/
│   ├── avatar-1234567890.jpg
│   └── banner-1234567890.jpg
├── [user-id-2]/
│   ├── avatar-9876543210.png
│   └── banner-9876543210.png
└── ...
```

## Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

## Troubleshooting

### Images not uploading

1. Check that the bucket exists and is public
2. Verify the service role key is correct
3. Check browser console for error messages
4. Verify RLS policies are enabled

### Images not displaying

1. Ensure the bucket is marked as public
2. Check the public read policy is active
3. Verify the URL returned from the upload API is accessible

### Permission errors

1. Check that the user is authenticated
2. Verify the user has the CURATOR role
3. Check RLS policies match the user's ID

## Related Files

- **Storage Utilities**: `/lib/supabase-storage.ts`
- **Upload API**: `/app/api/curator/upload-image/route.ts`
- **Profile API**: `/app/api/curator/profile/route.ts`
- **Store Settings UI**: `/app/dashboard/curator/store/page.tsx`
