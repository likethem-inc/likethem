# Store Deletion Feature Implementation

## Overview
Updated the curator settings page (`/app/dashboard/curator/settings/page.tsx`) to implement the store deletion feature. This replaces the previous "Delete Account" functionality with a more granular "Delete Store" feature that removes the curator store while keeping the user account active.

## Changes Made

### 1. New State Variables (Lines 240-252)
Added three new state variables to manage the deletion process:

```typescript
const [deletionCheckData, setDeletionCheckData] = useState<{
  canDelete: boolean
  ordersCount: number
  collaborationsCount: number
  productsCount: number
  followersCount: number
  blockers: {
    hasOrders: boolean
    hasCollaborations: boolean
  }
} | null>(null)
const [isCheckingDeletion, setIsCheckingDeletion] = useState(false)
const [deletionError, setDeletionError] = useState<string | null>(null)
```

### 2. New `checkDeletion` Function (Lines 550-572)
Added a function to check if the store can be deleted:
- Calls `/api/curator/store/check-deletion` endpoint
- Stores the result including products count, followers count, and blockers
- Handles loading and error states

### 3. Updated `deleteAccount` Function (Lines 574-604)
Replaced the old implementation with:
- Validation that checks if deletion is allowed based on API response
- Calls `/api/curator/store/delete` endpoint with DELETE method
- Proper error handling with user feedback
- Redirects to homepage on success

### 4. useEffect Hook (Lines 607-611)
Added a useEffect that automatically checks deletion status when the modal opens:
```typescript
useEffect(() => {
  if (showDeleteModal) {
    checkDeletion()
  }
}, [showDeleteModal])
```

### 5. Updated Danger Zone Section (Lines 1469-1498)
Changed the UI to reflect store deletion:
- Title changed from "Delete Account" to "Delete Store"
- Updated description to mention that the account remains active but role changes to BUYER
- Button text changed to "Delete My Store"

### 6. Enhanced Delete Modal (Lines 1524-1673)
Completely rebuilt the modal with:
- **Loading State**: Shows spinner while checking deletion status
- **Error State**: Displays error message if check fails
- **Deletion Summary**: Shows what will be deleted (products count, followers count)
- **Blockers Warning**: Displays red alert if deletion is blocked due to orders or collaborations
- **Account Status Info**: Blue info box explaining the account will remain active
- **Conditional Input**: Only shows DELETE confirmation input if deletion is allowed
- **Disabled Button**: Delete button is disabled if:
  - `canDelete` is false
  - User hasn't typed "DELETE"
  - Operation is in progress

## API Integration

### GET `/api/curator/store/check-deletion`
Returns:
```typescript
{
  canDelete: boolean
  ordersCount: number
  collaborationsCount: number
  productsCount: number
  followersCount: number
  blockers: {
    hasOrders: boolean
    hasCollaborations: boolean
  }
}
```

### DELETE `/api/curator/store/delete`
Success response:
```typescript
{
  success: true
  message: "Store deleted successfully"
}
```

Error response (400):
```typescript
{
  error: "Cannot delete store with existing orders"
  ordersCount: number
}
```

## User Experience Flow

1. User clicks "Delete My Store" button in Danger Zone
2. Modal opens and automatically checks deletion status
3. Modal displays:
   - Loading spinner (if checking)
   - Error message (if check failed)
   - Summary of what will be deleted
   - Warning if deletion is blocked
   - Info about account remaining active
4. If deletion is allowed:
   - User types "DELETE" to confirm
   - Clicks "Confirm Deletion" button
5. Store is deleted and user is redirected to homepage

## Security Features

- Requires exact "DELETE" text confirmation
- Double-checks deletion eligibility on both client and server
- Prevents deletion if orders or collaborations exist
- Maintains user account and changes role to BUYER

## Styling
All changes maintain the existing design system:
- Red color scheme for danger zone
- Gray for neutral information
- Blue for informational messages
- Consistent spacing and animations
- Responsive layout preserved

## Testing Checklist

- [ ] Modal opens and checks deletion status automatically
- [ ] Loading state displays correctly
- [ ] Error handling works for API failures
- [ ] Deletion summary shows correct counts
- [ ] Blockers display when orders or collaborations exist
- [ ] Delete button is disabled when deletion not allowed
- [ ] Confirmation input validation works
- [ ] Successful deletion redirects to homepage
- [ ] Account remains active after store deletion
- [ ] User role changes to BUYER after deletion
