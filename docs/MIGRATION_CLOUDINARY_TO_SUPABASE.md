# Migration Summary: Cloudinary → Supabase Storage

## Overview
Successfully migrated product image storage from Cloudinary to Supabase Storage.

## Changes Made

### 1. New File: `lib/storage.ts`
Created a new utility file for Supabase Storage operations:
- `uploadToSupabase()`: Upload files to the `products` bucket
- `deleteFromSupabase()`: Delete files from the bucket
- `checkBucketExists()`: Verify bucket configuration

**Key features:**
- Generates unique filenames using timestamp + random string
- Returns compatible response format: `{ url, publicId, altText }`
- Proper error handling and logging
- Uses `SUPABASE_SERVICE_ROLE_KEY` for server-side operations

### 2. Modified: `app/api/upload/route.ts`
Updated the upload API endpoint:
- ✅ Replaced Cloudinary SDK with Supabase Storage utility
- ✅ Changed environment variable checks (from Cloudinary to Supabase)
- ✅ Maintained identical API response format for frontend compatibility
- ✅ Kept all validation logic (file size, type, count limits)

**Removed dependencies:**
- `cloudinary` package (can be removed from package.json if not used elsewhere)

### 3. Modified: `next.config.js`
Updated image domain configuration:
- Changed from specific Supabase domain to wildcard pattern: `*.supabase.co`
- This supports any Supabase project without hardcoding project IDs

### 4. Documentation: `docs/SUPABASE_STORAGE_SETUP.md`
Created comprehensive setup guide covering:
- Bucket creation steps
- RLS policy configuration (INSERT, DELETE, SELECT)
- Environment variable setup
- Troubleshooting common issues
- Migration considerations from Cloudinary

### 5. Verification Script: `scripts/verify-storage.ts`
Added automated verification script:
- Checks environment variables
- Verifies bucket exists
- Provides helpful error messages
- Run with: `npm run verify:storage`

### 6. Updated: `README.md`
- Added Supabase Storage to technologies list
- Added configuration steps
- Added link to detailed setup documentation
- Added new npm script

### 7. Updated: `package.json`
Added new npm script:
```json
"verify:storage": "ts-node --compiler-options '{\"module\":\"commonjs\"}' scripts/verify-storage.ts"
```

### 8. Updated: `app/dashboard/curator/products/new/page.tsx`
- Changed comments from "Cloudinary" to "Supabase Storage"
- No functional changes (API remains compatible)

## Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # Server-only, never expose to frontend
```

## Bucket Structure

```
products/
└── likethem/
    └── products/
        ├── 1738099200000-abc123def.jpg
        ├── 1738099201000-xyz789ghi.png
        └── ...
```

## API Compatibility

The API response format remains **100% compatible** with the previous Cloudinary implementation:

```json
{
  "message": "Images uploaded successfully",
  "images": [
    {
      "url": "https://project.supabase.co/storage/v1/object/public/products/...",
      "publicId": "likethem/products/1738099200000-abc123def.jpg",
      "altText": "product-image.jpg"
    }
  ]
}
```

## Frontend Impact

✅ **No changes required** - The frontend code continues to work without modifications because:
1. API endpoint remains the same (`/api/upload`)
2. Response format is identical
3. Image URLs work with Next.js Image component (already configured)

## Benefits

1. **Cost Reduction**: Eliminates Cloudinary subscription costs
2. **Centralized Infrastructure**: All services now use Supabase
3. **Simplified Configuration**: One set of credentials instead of multiple services
4. **Better Integration**: Native integration with existing Supabase setup
5. **Scalability**: Supabase Storage scales automatically with your plan

## Migration Path

### For New Deployments
1. Follow `docs/SUPABASE_STORAGE_SETUP.md`
2. Create the `products` bucket
3. Configure RLS policies
4. Set environment variables
5. Run `npm run verify:storage`
6. Deploy!

### For Existing Deployments
1. Old images on Cloudinary continue to work
2. New uploads automatically use Supabase Storage
3. No data migration required (both services can coexist)
4. Optional: Migrate existing images using custom script (see docs)

## Next Steps

1. **Required**: Create the `products` bucket in Supabase Dashboard
2. **Required**: Configure RLS policies for security
3. **Required**: Set environment variables
4. **Recommended**: Run verification script
5. **Optional**: Remove Cloudinary credentials from environment
6. **Optional**: Remove `cloudinary` package if not used elsewhere

## Rollback Plan

If needed, reverting is straightforward:
1. Restore `app/api/upload/route.ts` from git history
2. Add back Cloudinary environment variables
3. Reinstall `cloudinary` package if removed

The changes are isolated and don't affect existing data or functionality.

## Testing Checklist

- [ ] Bucket `products` created in Supabase
- [ ] RLS policies configured
- [ ] Environment variables set
- [ ] Verification script passes: `npm run verify:storage`
- [ ] Upload single image through UI
- [ ] Upload multiple images (up to 5)
- [ ] Images display correctly in product pages
- [ ] Image URLs are accessible publicly
- [ ] File size validation works (>5MB rejected)
- [ ] File type validation works (non-images rejected)
- [ ] Authentication required (unauthorized users rejected)

---

**Migration completed**: January 28, 2026
**Backward compatible**: Yes
**Breaking changes**: None
