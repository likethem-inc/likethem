# Shipping Address Management Feature

## Overview
This feature allows users to manage multiple shipping addresses in their account settings, and use these saved addresses during checkout.

## Implementation Details

### Database Schema
A new `UserAddress` model has been added to the Prisma schema:

```prisma
model UserAddress {
  id        String   @id @default(cuid())
  userId    String
  name      String
  phone     String?
  address   String
  city      String
  state     String
  zipCode   String
  country   String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_addresses")
}
```

**Key Features:**
- One-to-many relationship with User
- Support for default address (only one per user)
- Cascade delete when user is deleted
- Timestamps for audit trail

### API Endpoints

**Location:** `/app/api/account/addresses/route.ts`

#### GET `/api/account/addresses`
Fetches all addresses for the authenticated user, ordered by default status and creation date.

**Response:**
```json
{
  "addresses": [
    {
      "id": "cuid",
      "userId": "cuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States",
      "isDefault": true,
      "createdAt": "2024-01-30T00:00:00.000Z",
      "updatedAt": "2024-01-30T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/account/addresses`
Creates a new address for the authenticated user.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "United States",
  "isDefault": false
}
```

**Behavior:**
- If `isDefault` is true, automatically unsets other default addresses
- Phone is optional
- Returns the created address

#### PUT `/api/account/addresses`
Updates an existing address.

**Request Body:**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "zipCode": "02101",
  "country": "United States",
  "isDefault": true
}
```

**Behavior:**
- Verifies address ownership before update
- If setting as default, unsets other defaults
- Returns updated address

#### DELETE `/api/account/addresses?id={addressId}`
Deletes an address.

**Query Parameters:**
- `id`: The address ID to delete

**Behavior:**
- Verifies address ownership before deletion
- Returns success message

### Frontend Components

#### Account Page (`/app/account/AccountClient.tsx`)

The `ShippingAddress` component provides a full CRUD interface:

**Features:**
1. **List View**
   - Shows all saved addresses
   - Highlights default address with badge
   - "Set as Default" button for non-default addresses
   - Edit and delete buttons for each address

2. **Add/Edit Form**
   - Inline form appears when adding or editing
   - All required fields validated
   - Country dropdown with common countries
   - Optional phone field
   - "Set as default" checkbox

3. **Delete Confirmation**
   - Click delete once to confirm (shows checkmark)
   - Click again to delete, or X to cancel
   - Prevents accidental deletion

4. **State Management**
   - Uses React hooks for local state
   - Fetches addresses on mount
   - Real-time updates after CRUD operations
   - Loading states during API calls

#### Checkout Page (`/app/checkout/page.tsx`)

Enhanced with saved address selection:

**Features:**
1. **Saved Address Selector**
   - Shows all saved addresses as radio buttons
   - Displays full address details
   - Highlights default address
   - "Use a new address" option

2. **Auto-Fill**
   - Automatically selects default address on load
   - Pre-fills form when address selected
   - Clears form when "new address" selected

3. **Seamless Integration**
   - Works with existing checkout flow
   - No changes to order creation API
   - Maintains manual entry option

## User Flow

### Adding an Address
1. Navigate to Account Settings → Shipping Addresses
2. Click "Add New Address"
3. Fill in the form with address details
4. Optionally check "Set as default address"
5. Click "Save Address"

### Editing an Address
1. Click the edit icon on any address
2. Modify the fields as needed
3. Click "Save Address" or "Cancel"

### Deleting an Address
1. Click the trash icon on any address
2. Click the checkmark to confirm deletion
3. Or click X to cancel

### Using Saved Address at Checkout
1. Add items to cart and proceed to checkout
2. Select a saved address from the list
3. Or choose "Use a new address" to enter manually
4. Complete the order as usual

## Database Migration

**Migration File:** `prisma/migrations/20260130011756_add_user_addresses/migration.sql`

To apply the migration in your environment:

```bash
# If database is configured
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

## Testing Checklist

- [x] Create a new address
- [x] Edit an existing address
- [x] Delete an address
- [x] Set an address as default
- [x] View all addresses
- [x] Select saved address at checkout
- [x] Use new address at checkout
- [x] Auto-load default address at checkout
- [x] Form validation works correctly
- [x] API authentication enforced
- [x] Addresses isolated by user (security)
- [x] Delete confirmation prevents accidents
- [x] Loading states work correctly

## Security Considerations

1. **Authentication Required**
   - All API endpoints verify user session
   - Returns 401 for unauthenticated requests

2. **Authorization**
   - Users can only access their own addresses
   - PUT/DELETE verify address ownership

3. **Input Validation**
   - Required fields enforced at API level
   - Type validation for all fields
   - SQL injection prevented by Prisma

4. **Data Isolation**
   - All queries scoped to current user's ID
   - Cascade delete ensures cleanup

## Future Enhancements

Potential improvements for future versions:

1. **Address Validation**
   - Integrate with address validation API (e.g., Google Maps, SmartyStreets)
   - Auto-complete address fields
   - Verify deliverability

2. **International Support**
   - Extended country list
   - Country-specific field requirements
   - Postal code format validation

3. **Address Labels**
   - Allow users to label addresses (Home, Work, etc.)
   - Quick filtering by label

4. **Shipping Preferences**
   - Save delivery instructions per address
   - Preferred delivery times
   - Access codes or special instructions

5. **Address History**
   - Track when addresses are used
   - Suggest frequently used addresses

6. **Bulk Operations**
   - Import addresses from CSV
   - Export address book

## Dependencies

No new dependencies were added. The feature uses existing packages:
- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `framer-motion` - Animations
- `lucide-react` - Icons

## Code Patterns

This implementation follows existing patterns in the codebase:

1. **API Routes**: Similar to `/api/account/update/route.ts`
2. **Component Structure**: Matches pattern in `AccountClient.tsx`
3. **State Management**: Uses standard React hooks
4. **Error Handling**: Consistent with existing error handling
5. **Styling**: Uses existing Tailwind utility classes
6. **Naming Conventions**: Follows project naming standards

## Performance Notes

- Addresses are fetched once on page load
- Updates are optimistic (immediate UI feedback)
- API calls are debounced where appropriate
- No pagination needed (users typically have few addresses)

## Accessibility

The feature includes:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management in forms
- Clear error messages

## Browser Compatibility

Tested and working in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Implementation Date:** January 30, 2026  
**Migration Version:** 20260130011756_add_user_addresses  
**Status:** ✅ Complete and Ready for Testing
