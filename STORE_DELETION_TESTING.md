# Store Deletion Feature - Testing Guide

## How to Test the Implementation

### Prerequisites
- Have a curator account with access to `/dashboard/curator/settings`
- Ensure the API endpoints are working:
  - `GET /api/curator/store/check-deletion`
  - `DELETE /api/curator/store/delete`

### Test Scenarios

#### 1. Basic Flow - Store Can Be Deleted
**Setup:** Curator with no orders and no collaborations

**Steps:**
1. Navigate to `/dashboard/curator/settings`
2. Click on "Danger Zone" tab
3. Verify text says "Delete Store" (not "Delete Account")
4. Click "Delete My Store" button
5. **Expected:** Modal opens with:
   - Title: "Delete Store"
   - Loading spinner appears briefly
   - "What will be deleted" section shows:
     - X products
     - Y followers
   - Blue info box: "Your account will remain active..."
   - Red warning box: "To confirm deletion, type DELETE..."
   - Input field is visible
6. Type "DELETE" in the input field
7. **Expected:** "Confirm Deletion" button becomes enabled
8. Click "Confirm Deletion"
9. **Expected:** 
   - Button shows loading state ("Deleting...")
   - After success, redirects to homepage (/)

#### 2. Store Cannot Be Deleted - Has Orders
**Setup:** Curator with at least one order

**Steps:**
1. Follow steps 1-4 from Test 1
2. **Expected:** Modal shows:
   - Loading spinner (briefly)
   - "What will be deleted" section
   - RED warning box: "Cannot delete store:"
     - "You have X existing order(s)"
   - Blue info box still shows
   - NO input field appears
   - "Confirm Deletion" button is DISABLED
3. Try clicking the disabled button
4. **Expected:** Button does not respond (disabled state)

#### 3. Store Cannot Be Deleted - Has Collaborations
**Setup:** Curator with active collaborations

**Steps:**
1. Follow steps 1-4 from Test 1
2. **Expected:** Modal shows:
   - RED warning box: "Cannot delete store:"
     - "You have X active collaboration(s)"
   - "Confirm Deletion" button is DISABLED

#### 4. Store Cannot Be Deleted - Has Both
**Setup:** Curator with orders AND collaborations

**Steps:**
1. Follow steps 1-4 from Test 1
2. **Expected:** Modal shows both warnings:
   - "You have X existing order(s)"
   - "You have X active collaboration(s)"

#### 5. API Error Handling
**Setup:** Temporarily break API endpoint

**Steps:**
1. Open modal
2. **Expected:** Error message displays in red box
3. Delete button remains disabled

#### 6. Confirmation Validation
**Setup:** Store can be deleted

**Steps:**
1. Open modal
2. Type "delete" (lowercase) in input
3. **Expected:** Button remains disabled
4. Type "DEL" (incomplete)
5. **Expected:** Button remains disabled
6. Type "DELETE" exactly
7. **Expected:** Button becomes enabled

#### 7. Cancel Flow
**Setup:** Any state

**Steps:**
1. Open modal
2. Type some text in input field
3. Click "Cancel" button
4. **Expected:** 
   - Modal closes
   - Input field is cleared
   - deletionCheckData is reset
5. Open modal again
6. **Expected:** Fresh check is performed (loading state appears)

### Edge Cases to Test

#### Empty Store
- **Curator with 0 products, 0 followers**
- Should show "0 products" and "0 followers"
- Should still allow deletion

#### Large Numbers
- **Curator with 100+ products/followers**
- Numbers should display correctly with proper pluralization

#### Network Issues
- **Slow connection**
- Loading state should display properly
- User should not be able to spam the delete button

### Visual Testing

1. **Loading State**
   - Spinner should be centered and visible
   - No flash of content before loading

2. **Color Coding**
   - Red: Danger actions and blockers
   - Blue: Informational messages
   - Gray: Neutral content

3. **Button States**
   - Disabled: Opacity 50%, no hover effect, cursor-not-allowed
   - Enabled: Full opacity, hover effect, cursor-pointer
   - Loading: Spinner animation, "Deleting..." text

4. **Responsive Design**
   - Modal should be centered on all screen sizes
   - Text should be readable on mobile
   - Buttons should not overlap on small screens

### Database Verification

After successful deletion:
1. Check `curatorProfile` table - profile should be deleted
2. Check `product` table - curator's products should be deleted
3. Check `follow` table - follows should be deleted
4. Check `user` table - user should still exist with role = 'BUYER'

### Error Messages to Verify

| Scenario | Expected Message |
|----------|------------------|
| Not authenticated | "Unauthorized" |
| No curator profile | "Curator profile not found" |
| Has orders | "Cannot delete store with existing orders" |
| Has collaborations | "Cannot delete store with active collaborations" |
| Network error | "Failed to check deletion status" |

## Accessibility Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter key should work on buttons
   - Escape key should close modal (if implemented)

2. **Screen Readers**
   - All buttons should have descriptive text
   - Error messages should be announced
   - Loading states should be indicated

## Performance Testing

1. **API Response Time**
   - Check deletion should complete in < 2 seconds
   - Delete operation should complete in < 5 seconds

2. **UI Responsiveness**
   - No lag when opening modal
   - Smooth animations
   - No flash of unstyled content

## Security Testing

1. **Authorization**
   - Cannot delete another user's store
   - Must be authenticated
   - Must have CURATOR role

2. **Validation**
   - Server-side checks cannot be bypassed
   - DELETE confirmation is required
   - Cannot delete with blockers even if client is modified

## Regression Testing

Ensure existing functionality still works:
- [ ] Other settings tabs work correctly
- [ ] Store Info tab saves properly
- [ ] Notifications tab functions
- [ ] Security tab for password change
- [ ] Privacy settings update
- [ ] Payment methods configuration
- [ ] Success toast appears for other operations
- [ ] Navigation between tabs is smooth
- [ ] Back button works properly

## Known Limitations

- User cannot undo store deletion
- Must manually recreate store if deleted accidentally
- Orders and collaborations block deletion (by design)

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Smooth user experience
✅ Clear error messages
✅ Proper state management
✅ Database consistency maintained
