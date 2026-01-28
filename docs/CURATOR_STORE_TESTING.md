# Testing Guide for Curator Store Configuration

This guide provides step-by-step instructions for testing the new curator store configuration functionality.

## Prerequisites

1. **Supabase Storage Setup:**
   - Follow `docs/SUPABASE_STORAGE_SETUP.md` to create the `curator-assets` bucket
   - Configure RLS policies as documented
   - Verify environment variables are set

2. **Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```

3. **User Account:**
   - Have a user account with CURATOR role
   - If needed, promote a user to curator via admin panel or script

## Test Scenarios

### 1. Initial Page Load

**Steps:**
1. Log in as a curator
2. Navigate to `/dashboard/curator/store`

**Expected Results:**
- ✅ Loading spinner appears briefly
- ✅ Form populates with existing curator profile data
- ✅ Store name matches database value (not "Isabella's Edit")
- ✅ Bio, city, and social links display correctly
- ✅ Existing banner/avatar images display (if set)
- ✅ Style tags are pre-selected
- ✅ "Save Changes" button is disabled until changes are made

### 2. Avatar Upload

**Steps:**
1. Click the upload button on the avatar section
2. Select a JPG/PNG image (< 5MB)
3. Observe the preview
4. Click "Save Changes"

**Expected Results:**
- ✅ Image preview appears immediately after selection
- ✅ "Save Changes" button becomes enabled
- ✅ Save operation shows progress
- ✅ Success toast appears
- ✅ New avatar displays after save
- ✅ Page reload shows the saved avatar
- ✅ Public curator page (`/curator/[slug]`) displays new avatar

**Error Cases:**
- File > 5MB: Shows error toast "File size must be less than 5MB"
- Wrong file type: Shows error toast about file type
- Upload fails: Shows error toast with failure message

### 3. Banner Upload

**Steps:**
1. Click the upload button on the banner section
2. Select a JPG/PNG image (< 5MB)
3. Observe the preview
4. Click "Save Changes"

**Expected Results:**
- ✅ Image preview appears immediately
- ✅ Save operation completes successfully
- ✅ New banner displays in the form
- ✅ Public curator page shows new banner

### 4. Profile Information Update

**Steps:**
1. Change the store name
2. Update the bio
3. Add/change city
4. Modify social media links
5. Click "Save Changes"

**Expected Results:**
- ✅ Changes save successfully
- ✅ Success toast appears
- ✅ Reload page shows updated values
- ✅ Public curator page reflects changes

### 5. Style Tags Selection

**Steps:**
1. Click various style tags to select/deselect
2. Observe tag highlighting
3. Click "Save Changes"

**Expected Results:**
- ✅ Selected tags have dark background
- ✅ Tags save as JSON array in database
- ✅ Tags persist after reload
- ✅ Public page might display selected tags (depends on implementation)

### 6. Visibility Toggle

**Steps:**
1. Click the visibility toggle (Public/Private)
2. Save changes

**Expected Results:**
- ✅ Toggle state changes visually
- ✅ Setting saves to database
- ✅ When private, public page returns 404

### 7. Unsaved Changes Warning

**Steps:**
1. Make any change (e.g., edit store name)
2. Click "Back to Dashboard" or try to navigate away

**Expected Results:**
- ✅ Browser shows confirmation dialog
- ✅ Warning message mentions unsaved changes
- ✅ Can cancel to stay on page
- ✅ Can confirm to leave (changes lost)

### 8. Cancel Button

**Steps:**
1. Make changes
2. Click "Cancel" button

**Expected Results:**
- ✅ Shows confirmation if changes exist
- ✅ Redirects to dashboard on confirmation

### 9. Preview Store Link

**Steps:**
1. Click "Preview My Store" in the header

**Expected Results:**
- ✅ Opens public curator page in new tab
- ✅ URL matches curator's slug
- ✅ Page displays with correct information

### 10. Multiple Image Uploads

**Steps:**
1. Upload new avatar
2. Upload new banner
3. Change other profile fields
4. Click "Save Changes"

**Expected Results:**
- ✅ Both images upload successfully
- ✅ Profile fields save correctly
- ✅ All changes persist after reload

## API Testing

### Upload Image Endpoint

```bash
# Test avatar upload
curl -X POST http://localhost:3000/api/curator/upload-image \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "image=@/path/to/avatar.jpg" \
  -F "type=avatar"
```

**Expected Response:**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://[project].supabase.co/storage/v1/object/public/curator-assets/[user-id]/avatar-[timestamp].jpg",
  "path": "[user-id]/avatar-[timestamp].jpg"
}
```

### Update Profile Endpoint

```bash
# Test profile update
curl -X PATCH http://localhost:3000/api/curator/profile \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Test Store",
    "bio": "Test bio",
    "city": "Test City",
    "styleTags": "[\"Minimal\", \"Modern\"]",
    "isPublic": true
  }'
```

**Expected Response:**
```json
{
  "message": "Curator profile updated successfully",
  "curatorProfile": {
    "id": "...",
    "storeName": "Test Store",
    "bio": "Test bio",
    ...
  }
}
```

## Database Verification

After making changes, verify in Supabase or PostgreSQL:

```sql
-- Check curator profile
SELECT 
  id, 
  "storeName", 
  bio, 
  "avatarImage", 
  "bannerImage", 
  "isPublic"
FROM curator_profiles 
WHERE "userId" = 'YOUR_USER_ID';

-- Check uploaded files in storage
-- (View in Supabase Storage dashboard under curator-assets bucket)
```

## Common Issues and Solutions

### Issue: Images not uploading

**Possible Causes:**
- Supabase bucket not created
- RLS policies not configured
- Wrong service role key

**Solution:**
- Follow `docs/SUPABASE_STORAGE_SETUP.md` step by step
- Verify environment variables
- Check browser console for specific errors

### Issue: Profile not loading

**Possible Causes:**
- User doesn't have CURATOR role
- Session expired
- API endpoint error

**Solution:**
- Verify user role in database
- Log out and log back in
- Check server logs for API errors

### Issue: Changes not persisting

**Possible Causes:**
- Database migration not run
- Network request failing
- Validation errors

**Solution:**
- Run `npx prisma migrate deploy`
- Check Network tab in browser DevTools
- Look for error toasts or console messages

### Issue: Avatar not showing on public page

**Possible Causes:**
- avatarImage field is null
- Image URL is invalid
- Supabase bucket is not public

**Solution:**
- Check curator_profiles.avatarImage in database
- Verify image URL is accessible
- Ensure bucket has public read policy

## Success Metrics

All tests should result in:
- ✅ No console errors
- ✅ Successful API responses (200/201)
- ✅ Data persists in database
- ✅ Images visible in Supabase Storage
- ✅ Public pages display updated content
- ✅ Proper error handling for edge cases

## Reporting Issues

When reporting issues, include:
1. Step-by-step reproduction
2. Browser console errors
3. Network request/response (from DevTools)
4. Database state (if relevant)
5. Environment (dev/staging/production)
