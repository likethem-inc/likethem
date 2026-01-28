# Manual Testing Guide - User Registration

## Pre-requisites
- Application running on http://localhost:3000
- Database accessible
- Environment variables configured

## Test Cases

### Test Case 1: Successful Registration with Email and Password

**Objective**: Verify user can create an account with name, email, and password

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Fill in the form:
   - Full name: "Test User"
   - Email address: "test@example.com"
   - Password: "TestPass123"
   - Confirm password: "TestPass123"
3. Click "Create account" button

**Expected Result**:
- ✅ Loading indicator appears
- ✅ User account is created in database
- ✅ User is automatically logged in
- ✅ Redirected to home page (/)
- ✅ User name appears in header (UserChip component)

**How to Verify**:
- Check that you're logged in (name should appear in top-right corner)
- Try to access /account page - should work without redirect to login

---

### Test Case 2: Password Mismatch Validation

**Objective**: Verify that password confirmation validation works

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Fill in the form:
   - Full name: "Test User"
   - Email address: "test2@example.com"
   - Password: "TestPass123"
   - Confirm password: "DifferentPass456"
3. Click "Create account" button

**Expected Result**:
- ✅ Error message appears: "Passwords do not match"
- ✅ No API request is sent to server
- ✅ User remains on signup page
- ✅ Form is not cleared

**How to Verify**:
- Check browser DevTools Network tab - no POST request to /api/auth/signup
- Error message should be visible in red alert box

---

### Test Case 3: Password Too Short Validation

**Objective**: Verify minimum password length enforcement

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Fill in the form:
   - Full name: "Test User"
   - Email address: "test3@example.com"
   - Password: "Short1"  (6 characters)
   - Confirm password: "Short1"
3. Click "Create account" button

**Expected Result**:
- ✅ Error message appears: "Password must be at least 8 characters long"
- ✅ No API request is sent
- ✅ User remains on signup page

**How to Verify**:
- Check browser DevTools Network tab - no POST request to /api/auth/signup

---

### Test Case 4: Duplicate Email Registration

**Objective**: Verify that duplicate emails are rejected

**Steps**:
1. First, create a user with email "duplicate@example.com"
2. Try to register again with the same email:
   - Full name: "Another User"
   - Email address: "duplicate@example.com"
   - Password: "TestPass123"
   - Confirm password: "TestPass123"
3. Click "Create account" button

**Expected Result**:
- ✅ Error message appears: "User with this email already exists"
- ✅ API returns 400 status code
- ✅ No new user created in database
- ✅ User remains on signup page

**How to Verify**:
- Check browser DevTools Network tab - POST request returns 400
- Check database - only one user with that email exists

---

### Test Case 5: Empty Name Field

**Objective**: Verify that name field is required

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Fill in the form:
   - Full name: "" (empty)
   - Email address: "test5@example.com"
   - Password: "TestPass123"
   - Confirm password: "TestPass123"
3. Click "Create account" button

**Expected Result**:
- ✅ Error message appears: "Name is required"
- ✅ No API request is sent
- ✅ User remains on signup page

**How to Verify**:
- Check browser DevTools Network tab - no POST request

---

### Test Case 6: Invalid Email Format

**Objective**: Verify email format validation

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Fill in the form:
   - Full name: "Test User"
   - Email address: "notanemail" (no @ symbol)
   - Password: "TestPass123"
   - Confirm password: "TestPass123"
3. Click "Create account" button

**Expected Result**:
- ✅ Error message appears: "Please enter a valid email address"
- ✅ No API request is sent
- ✅ User remains on signup page

**How to Verify**:
- Check browser DevTools Network tab - no POST request

---

### Test Case 7: Registration Without Google

**Objective**: Verify user can register without using Google OAuth

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. **Do NOT click** "Continue with Google" button
3. Instead, fill in the email/password form:
   - Full name: "Test User No Google"
   - Email address: "nogoogle@example.com"
   - Password: "TestPass123"
   - Confirm password: "TestPass123"
4. Click "Create account" button

**Expected Result**:
- ✅ User can successfully register using email/password
- ✅ No Google OAuth flow is triggered
- ✅ User is created with provider: "credentials" (not "google")
- ✅ User has passwordHash in database (not null)

**How to Verify**:
- Check database: User should have passwordHash field populated
- Check database: User provider should be NULL or "credentials"

---

### Test Case 8: Toggle Password Visibility

**Objective**: Verify password visibility toggle works

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Type a password in the "Password" field
3. Click the eye icon button to the right of the password field
4. Observe the password field
5. Click the eye icon again

**Expected Result**:
- ✅ First click: Password becomes visible (plain text)
- ✅ Eye icon changes to EyeOff icon
- ✅ Second click: Password becomes hidden again (dots)
- ✅ Eye icon changes back to Eye icon
- ✅ Same behavior for "Confirm password" field

**How to Verify**:
- Visually confirm password text visibility changes
- Input type attribute changes between "password" and "text"

---

### Test Case 9: Auto-Login After Registration

**Objective**: Verify user is automatically logged in after successful registration

**Steps**:
1. Navigate to http://localhost:3000/auth/signup
2. Register a new user:
   - Full name: "Auto Login Test"
   - Email address: "autologin@example.com"
   - Password: "TestPass123"
   - Confirm password: "TestPass123"
3. Click "Create account" button
4. Wait for redirect

**Expected Result**:
- ✅ User is created in database
- ✅ User is automatically signed in (NextAuth session created)
- ✅ User is redirected to home page or intended destination
- ✅ User name appears in header
- ✅ Can access protected routes like /account

**How to Verify**:
- Check browser cookies - should have next-auth session token
- Check header - user name should be displayed
- Navigate to /account - should not redirect to signin

---

### Test Case 10: Navigation from Sign In to Sign Up

**Objective**: Verify users can navigate from sign in page to sign up page

**Steps**:
1. Navigate to http://localhost:3000/auth/signin
2. Look for "Don't have an account? Sign up" link at the bottom
3. Click the "Sign up" link

**Expected Result**:
- ✅ "Sign up" link is visible on signin page
- ✅ Clicking link navigates to /auth/signup
- ✅ No errors or broken links

**How to Verify**:
- Visually confirm the link exists
- Confirm navigation works correctly
- URL should change to /auth/signup

---

## Testing Checklist

Before marking the feature as complete, verify:

- [ ] User can access signup page at /auth/signup
- [ ] Form has all required fields: Name, Email, Password, Confirm Password
- [ ] Password validation requires minimum 8 characters
- [ ] Password confirmation validation prevents mismatches
- [ ] Duplicate email prevention works
- [ ] Password is hashed in database (not stored in plain text)
- [ ] User can register without using Google OAuth
- [ ] User is automatically logged in after registration
- [ ] User is redirected appropriately after registration
- [ ] All error messages are clear and helpful
- [ ] Loading states are shown during API calls
- [ ] Password visibility toggle works
- [ ] Link from signin to signup exists and works
- [ ] Form validation messages are in Spanish (if applicable)
- [ ] Mobile responsive design works

## Database Verification

To verify a user was created correctly, check the database:

```sql
-- Check if user exists
SELECT id, email, name, role, provider, passwordHash IS NOT NULL as has_password 
FROM users 
WHERE email = 'test@example.com';

-- Verify password is hashed (not plain text)
SELECT passwordHash FROM users WHERE email = 'test@example.com';
-- passwordHash should be a bcrypt hash (starts with $2a$ or $2b$)

-- Check user role
SELECT role FROM users WHERE email = 'test@example.com';
-- Should be 'BUYER'
```

## Success Criteria (From Issue)

✅ **Criterion 1**: User can register without Google authentication
- Implemented: Email/password registration exists independently of Google OAuth

✅ **Criterion 2**: User can register with Name, Email, and Password
- Implemented: All three fields are required and validated

✅ **Criterion 3**: Password confirmation validation exists to prevent errors
- Implemented: Two password fields with validation that they match

## Known Limitations

None - all requirements are fully implemented.

## Security Verification

- [ ] Password is hashed with bcrypt before storage
- [ ] Password is never sent back to client in API responses
- [ ] Minimum password length is enforced (8 characters)
- [ ] Email uniqueness is enforced at database level
- [ ] CSRF protection is enabled via NextAuth
- [ ] Session tokens are HttpOnly cookies
- [ ] No SQL injection vulnerabilities (using Prisma ORM)
