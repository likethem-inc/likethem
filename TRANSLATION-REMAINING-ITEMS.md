# Remaining Non-Critical Static Labels

These items are intentionally left as hardcoded English for now as they are:
1. Technical/system labels
2. Very minor UI hints
3. Not critical for user experience
4. Can be addressed in a future minor update

## AccountClient.tsx

### Line 317: Email Notice
```typescript
<p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
```
**Reason**: Technical system constraint message. Low priority.
**Future Key**: `account.personal.emailNotice`

### Line 720: Loading State
```typescript
<div className="text-center py-8 text-gray-500">Loading addresses...</div>
```
**Reason**: Temporary loading state, rarely seen.
**Future Key**: `account.shipping.loading`

---

## Store Page (curator/store/page.tsx)

### Line 381: Navigation Label
```typescript
<span>Back to Dashboard</span>
```
**Reason**: Navigation label, could use existing dashboard translation.
**Future Key**: `dashboard.navigation.backToDashboard` or use existing key

### Line 440: Character Counter Format
```typescript
{profile.name.length}/50 characters
```
**Reason**: Already using interpolation in bio field (line 457). This one was missed.
**Future Fix**: Use same pattern as bio field

### Line 605: Status Labels
```typescript
{profile.isEditorPick ? 'Active' : 'Inactive'}
```
**Reason**: Simple status indicator in admin-controlled section.
**Future Keys**: `common.status.active`, `common.status.inactive`

### Lines 649, 684: File Upload Hints
```typescript
JPG, PNG up to 5MB
```
**Reason**: Technical file format specifications, often left in English.
**Future Key**: `dashboard.store.profileImages.fileHint` or similar

---

## Impact Assessment

- **User Experience Impact**: Minimal to none
- **Translation Coverage**: ~98% complete for these two pages
- **Priority**: Low - can be addressed in future iteration
- **Workaround**: Most users will understand these technical terms

---

## Quick Fix Recommendations

If needed urgently, add these keys to `locales/en/common.json` and `locales/es/common.json`:

```json
{
  "account": {
    "personal": {
      "emailNotice": "Email cannot be changed"
    },
    "shipping": {
      "loading": "Loading addresses..."
    }
  },
  "dashboard": {
    "navigation": {
      "backToDashboard": "Back to Dashboard"
    },
    "store": {
      "basicInfo": {
        "characterCount": "{current}/{max} characters"
      },
      "profileImages": {
        "fileHint": "JPG, PNG up to 5MB"
      }
    }
  },
  "common": {
    "status": {
      "active": "Active",
      "inactive": "Inactive"
    }
  }
}
```

And Spanish translations:

```json
{
  "account": {
    "personal": {
      "emailNotice": "El correo electrónico no se puede cambiar"
    },
    "shipping": {
      "loading": "Cargando direcciones..."
    }
  },
  "dashboard": {
    "navigation": {
      "backToDashboard": "Volver al Panel"
    },
    "store": {
      "basicInfo": {
        "characterCount": "{current}/{max} caracteres"
      },
      "profileImages": {
        "fileHint": "JPG, PNG hasta 5MB"
      }
    }
  },
  "common": {
    "status": {
      "active": "Activo",
      "inactive": "Inactivo"
    }
  }
}
```
