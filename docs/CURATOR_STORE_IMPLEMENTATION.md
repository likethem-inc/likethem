# Curator Store Configuration - Implementation Summary

This document summarizes the implementation of data persistence and image storage for the curator store configuration page.

## Overview

The curator store settings page (`/dashboard/curator/store`) now supports:
- ✅ Real-time data loading from the database
- ✅ Persistent storage of curator profile information
- ✅ Image uploads (avatar and banner) to Supabase Storage
- ✅ Display of updated information on public curator pages

## Changes Made

### 1. Database Schema

**Added field to `CuratorProfile` model:**
```prisma
avatarImage String? // New field for curator profile picture
```

**Migration:**
- File: `prisma/migrations/20260128213337_add_curator_avatar_image/migration.sql`
- Adds `avatarImage` column to `curator_profiles` table

### 2. Backend API

#### `/api/curator/profile` (Enhanced)

**GET Method:**
- Returns current user's curator profile with all fields including `avatarImage`

**POST Method:**
- Creates new curator profile (existing functionality)

**PATCH Method:** *(NEW)*
- Updates curator profile
- Accepts: `storeName`, `bio`, `city`, `styleTags`, `avatarImage`, `bannerImage`, `instagram`, `twitter`, `youtube`, `websiteUrl`, `isPublic`
- Validates required fields
- Returns updated profile data

#### `/api/curator/upload-image` (NEW)

**POST Method:**
- Uploads curator images to Supabase Storage
- Accepts FormData with:
  - `image`: File (max 5MB, JPG/PNG/WebP)
  - `type`: 'avatar' or 'banner'
- Requires CURATOR role
- Returns public URL and storage path

### 3. Supabase Storage Integration

**New Utility File:** `lib/supabase-storage.ts`

Functions:
- `uploadCuratorImage(file, userId, type)`: Uploads image to Supabase Storage
- `deleteCuratorImage(path)`: Removes image from storage

**Storage Structure:**
```
curator-assets/
  └── [user-id]/
      ├── avatar-[timestamp].jpg
      └── banner-[timestamp].jpg
```

### 4. Frontend Updates

#### Store Settings Page (`app/dashboard/curator/store/page.tsx`)

**Data Loading:**
- Fetches real curator profile on component mount
- Displays loading state during fetch
- Handles errors with toast notifications

**Image Upload:**
- Preview images before upload
- Upload to Supabase Storage on save
- Support for both avatar and banner images
- File validation (size, type)

**Save Functionality:**
- Uploads images first if changed
- Updates profile via PATCH API
- Shows success/error feedback
- Clears unsaved changes flag on success

**State Management:**
- Tracks unsaved changes
- Warns before leaving with unsaved changes
- Loading states for individual operations

#### Public Curator Pages

**Updated Files:**
- `app/curator/[curatorSlug]/page.tsx`: Uses `avatarImage` field
- `app/curator/[curatorSlug]/product/[productSlug]/page.tsx`: Includes `avatarImage` in queries
- Both pages fall back to `user.image` if `avatarImage` is not set

## Setup Instructions

### 1. Database Migration

Run the migration to add the `avatarImage` field:

```bash
npx prisma migrate deploy
```

Or manually run the SQL:

```sql
ALTER TABLE "curator_profiles" ADD COLUMN "avatarImage" TEXT;
```

### 2. Supabase Storage Setup

Follow the instructions in `docs/SUPABASE_STORAGE_SETUP.md`:

1. Create the `curator-assets` bucket (public)
2. Set up RLS policies for authenticated uploads
3. Configure environment variables

**Required Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### 3. Regenerate Prisma Client

After pulling the schema changes:

```bash
npx prisma generate
```

## Usage

### For Curators

1. Navigate to `/dashboard/curator/store`
2. Update store information:
   - Store name
   - Bio/description
   - Location
   - Social media links
   - Style tags
3. Upload images:
   - Click the upload icon on avatar/banner
   - Select image (JPG, PNG, or WebP, max 5MB)
   - Preview appears immediately
4. Click "Save Changes"
5. Images upload to Supabase Storage
6. Profile updates in database
7. Changes appear on public curator page

### API Usage

#### Upload Image

```javascript
const formData = new FormData()
formData.append('image', file)
formData.append('type', 'avatar') // or 'banner'

const response = await fetch('/api/curator/upload-image', {
  method: 'POST',
  body: formData
})

const { url, path } = await response.json()
```

#### Update Profile

```javascript
const response = await fetch('/api/curator/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    storeName: 'My Store',
    bio: 'My bio',
    avatarImage: 'https://...',
    bannerImage: 'https://...',
    // ... other fields
  })
})
```

## Testing

### Manual Testing Steps

1. **Data Loading:**
   - Log in as a curator
   - Navigate to `/dashboard/curator/store`
   - Verify existing data loads correctly
   - Check loading state appears briefly

2. **Image Upload:**
   - Select a new avatar image
   - Verify preview displays
   - Click Save
   - Verify upload completes
   - Check public page shows new avatar

3. **Profile Update:**
   - Change store name
   - Update bio
   - Add social links
   - Click Save
   - Reload page
   - Verify changes persist

4. **Public Display:**
   - Navigate to `/curator/[your-slug]`
   - Verify avatar displays
   - Verify banner displays
   - Check all profile fields show correctly

## Success Criteria ✅

- [x] Form loads real data from database (not mock data)
- [x] Changes persist after page reload
- [x] Images upload to Supabase Storage
- [x] Image URLs save to `CuratorProfile` table
- [x] Images display on dashboard and public pages
- [x] Public curator page reflects all changes

## Files Modified

### Backend
- `app/api/curator/profile/route.ts` - Added PATCH method
- `app/api/curator/upload-image/route.ts` - NEW
- `lib/supabase-storage.ts` - NEW
- `prisma/schema.prisma` - Added avatarImage field
- `prisma/migrations/20260128213337_add_curator_avatar_image/migration.sql` - NEW

### Frontend
- `app/dashboard/curator/store/page.tsx` - Complete rewrite with API integration
- `app/curator/[curatorSlug]/page.tsx` - Updated to use avatarImage
- `app/curator/[curatorSlug]/product/[productSlug]/page.tsx` - Updated to include avatarImage

### Documentation
- `docs/SUPABASE_STORAGE_SETUP.md` - NEW
- `docs/CURATOR_STORE_IMPLEMENTATION.md` - This file

## Notes

- Images are stored in Supabase Storage under the `curator-assets` bucket
- Each user's images are in a subfolder: `curator-assets/[userId]/`
- The system supports both Supabase Storage (new) and existing Cloudinary setup
- Avatar falls back to `user.image` if `avatarImage` is not set
- All changes are backward compatible with existing data

## Troubleshooting

### Images not uploading
- Verify Supabase Storage bucket exists
- Check RLS policies are configured
- Verify SUPABASE_SERVICE_ROLE_KEY is set

### Profile not loading
- Check authentication session is valid
- Verify user has CURATOR role
- Check browser console for errors

### Changes not persisting
- Verify network requests complete
- Check API response for errors
- Ensure database migration ran successfully

## Future Enhancements

Potential improvements:
- Image cropping tool
- Multiple image sizes/thumbnails
- Cloudinary migration to Supabase
- Bulk image operations
- Image optimization
- CDN integration
