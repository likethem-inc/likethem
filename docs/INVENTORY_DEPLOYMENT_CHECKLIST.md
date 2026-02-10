# Inventory Management System - Deployment Checklist

## Pre-Deployment

### 1. Code Review
- [ ] All new files are committed to git
- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive

### 2. Database Preparation
- [ ] Review migration file: `20260204045044_add_product_variants/migration.sql`
- [ ] Backup production database (if applicable)
- [ ] Test migration in staging environment
- [ ] Verify rollback plan

### 3. Environment Setup
- [ ] Ensure DATABASE_URL is configured
- [ ] Ensure DIRECT_URL is configured (if using Prisma)
- [ ] Check Node.js version (>=20)
- [ ] Verify Prisma version matches (6.12.0)

## Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Run Database Migration
```bash
# For development
npx prisma migrate dev

# For production
npx prisma migrate deploy
```

Expected output:
```
✓ Applied migration: 20260204045044_add_product_variants
```

### Step 4: Verify Migration
```bash
# Check if table was created
npx prisma studio
# Look for "product_variants" table
```

Or using SQL:
```sql
SELECT * FROM product_variants LIMIT 1;
```

### Step 5: Initialize Variants (Optional)
```bash
# If you have existing products with stock
npm run init:variants
```

This will:
- Find products without variants
- Create variants based on their sizes/colors
- Distribute existing stock

### Step 6: Build Application
```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
```

### Step 7: Start Application
```bash
# Development
npm run dev

# Production
npm start
```

### Step 8: Verify Deployment
- [ ] Application starts without errors
- [ ] No database connection errors
- [ ] No Prisma client errors

## Post-Deployment Testing

### 1. API Endpoints
Test each endpoint to ensure they work:

```bash
# Set your auth cookie
export AUTH_COOKIE="your-session-cookie-here"

# Test get inventory
curl http://localhost:3000/api/curator/inventory \
  -H "Cookie: $AUTH_COOKIE"

# Test CSV template download
curl http://localhost:3000/api/curator/inventory/csv/template \
  -H "Cookie: $AUTH_COOKIE" \
  -o template.csv

# Test product variants (public)
curl http://localhost:3000/api/products/YOUR_PRODUCT_SLUG/variants
```

### 2. UI Testing
- [ ] Navigate to `/dashboard/curator/inventory`
- [ ] Verify inventory list loads
- [ ] Test inline stock editing
- [ ] Test search functionality
- [ ] Download inventory CSV
- [ ] Download CSV template
- [ ] Upload CSV file
- [ ] Verify error handling

### 3. Order Flow Testing
- [ ] Create a new order
- [ ] Verify size/color validation
- [ ] Verify stock availability check
- [ ] Complete payment
- [ ] Verify stock reduction
- [ ] Check database for updated stock

### 4. Performance Testing
- [ ] Test with large product catalog (100+ products)
- [ ] Test CSV import with 1000+ rows
- [ ] Monitor database query performance
- [ ] Check API response times

## Verification Checklist

### Database
- [ ] `product_variants` table exists
- [ ] Foreign key constraint to `products` exists
- [ ] Unique constraint on (productId, size, color) exists
- [ ] Indexes are created properly

### API Endpoints
- [ ] GET `/api/curator/inventory` - Returns 200
- [ ] POST `/api/curator/inventory` - Creates variants
- [ ] PUT `/api/curator/inventory/[id]` - Updates variant
- [ ] DELETE `/api/curator/inventory/[id]` - Deletes variant
- [ ] GET `/api/curator/inventory/csv` - Downloads CSV
- [ ] POST `/api/curator/inventory/csv` - Uploads CSV
- [ ] GET `/api/curator/inventory/csv/template` - Downloads template
- [ ] GET `/api/products/[slug]/variants` - Returns variants

### UI Components
- [ ] Inventory list displays correctly
- [ ] Stock editing works
- [ ] Search/filter works
- [ ] CSV upload/download works
- [ ] Error messages display properly
- [ ] Loading states work

### Order Integration
- [ ] Order creation validates variants
- [ ] Stock reduces on payment
- [ ] Insufficient stock is caught
- [ ] Missing variants are caught
- [ ] Transaction rollback works on error

## Rollback Plan

If issues occur, follow these steps:

### 1. Revert Migration
```bash
# Note: This will delete the product_variants table and all data
npx prisma migrate resolve --rolled-back 20260204045044_add_product_variants
```

### 2. Revert Code Changes
```bash
git revert <commit-hash>
# Or
git reset --hard <previous-commit>
```

### 3. Restore Database (if backed up)
```bash
# Using pg_restore (PostgreSQL)
pg_restore -d your_database backup_file.dump
```

### 4. Regenerate Prisma Client
```bash
npx prisma generate
```

### 5. Rebuild Application
```bash
npm run build
```

## Monitoring

### Key Metrics to Watch

1. **API Response Times**
   - Target: < 200ms for inventory list
   - Target: < 100ms for single variant update
   - Target: < 500ms for CSV import

2. **Database Performance**
   - Monitor product_variants table size
   - Watch for slow queries
   - Check index usage

3. **Error Rates**
   - Watch for 404s (variant not found)
   - Watch for 400s (validation errors)
   - Watch for 500s (server errors)

4. **User Activity**
   - Track CSV imports
   - Track stock updates
   - Track order creation failures

### Log Files to Monitor

```bash
# Application logs
tail -f logs/app.log

# Database logs
tail -f logs/postgres.log

# Error logs
tail -f logs/error.log
```

## Troubleshooting

### Issue: Migration Fails

**Symptoms**: `npx prisma migrate deploy` fails

**Solutions**:
1. Check database connection
2. Verify user permissions
3. Check for naming conflicts
4. Review migration SQL manually

### Issue: Prisma Client Not Updated

**Symptoms**: `ProductVariant` type not found

**Solutions**:
```bash
npx prisma generate
npm run build
```

### Issue: Stock Not Reducing

**Symptoms**: Orders created but stock unchanged

**Solutions**:
1. Check transaction logs
2. Verify order status is correct
3. Check size/color in order items
4. Review order creation code

### Issue: CSV Import Fails

**Symptoms**: Upload returns errors

**Solutions**:
1. Verify CSV format matches template
2. Check product slugs exist
3. Verify curator ownership
4. Check for invalid stock values

### Issue: Inventory Page Not Loading

**Symptoms**: 404 or blank page

**Solutions**:
1. Verify route: `/dashboard/curator/inventory`
2. Check user authentication
3. Verify curator role
4. Review browser console errors

## Support Contacts

- **Database Issues**: DBA Team
- **Frontend Issues**: Frontend Team
- **API Issues**: Backend Team
- **Business Logic**: Product Team

## Documentation Links

- [Complete Guide](./INVENTORY_MANAGEMENT_GUIDE.md)
- [Quick Reference](./INVENTORY_QUICK_REFERENCE.md)
- [Implementation Summary](./INVENTORY_IMPLEMENTATION_README.md)
- [Architecture Diagram](./INVENTORY_ARCHITECTURE_VISUAL.md)

## Success Criteria

Deployment is successful when:
- ✅ All database migrations applied
- ✅ Application starts without errors
- ✅ All API endpoints return expected responses
- ✅ UI components load and function properly
- ✅ Order creation works with variant validation
- ✅ Stock reduces correctly on payment
- ✅ CSV import/export works
- ✅ No critical errors in logs
- ✅ Performance metrics within acceptable range

## Sign-Off

- [ ] Database migration completed by: _____________ Date: _______
- [ ] Application deployed by: _____________ Date: _______
- [ ] Testing completed by: _____________ Date: _______
- [ ] Documentation reviewed by: _____________ Date: _______
- [ ] Deployment approved by: _____________ Date: _______

---

## Notes

Add any deployment-specific notes here:

```
Example:
- Deployed to production on 2024-02-04
- Migration took 2.3 seconds
- Initial variants created for 150 products
- No issues encountered
```

---

**Last Updated**: 2024-02-04
**Version**: 1.0.0
