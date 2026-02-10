# Quick Start: Product Variants & Inventory

## 📦 What Are Product Variants?

Variants are the specific combinations of size and color for your products. 

**Example**: A "Red T-Shirt" product with sizes (S, M, L) and colors (Red, Black) creates **6 variants**:
- Small Red
- Small Black  
- Medium Red
- Medium Black
- Large Red
- Large Black

Each variant can have its own stock quantity!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Your Product
1. Go to **Dashboard → Products → Add Product**
2. Fill in product details
3. Select available sizes (S, M, L, etc.)
4. Select available colors
5. Save product

✅ Your product is created!

### Step 2: Create Variants
1. Go to **Dashboard → Inventory**
2. Click the **"Manage Variants"** tab
3. Click on your product
4. See all variants auto-generated!
5. Set stock quantity for each variant
6. Click **"Save Variants"**

✅ Your variants are created!

### Step 3: View Inventory
1. Click the **"Inventory List"** tab
2. See all your variants with stock levels
3. Edit stock quantities as needed

✅ Your inventory is live!

---

## 💡 Common Scenarios

### Scenario 1: New Product

```
✅ Create product with sizes and colors
✅ Go to Manage Variants
✅ Set stock for each variant
✅ Done!
```

### Scenario 2: Product Already Exists

```
✅ Go to Inventory → Manage Variants
✅ Select existing product
✅ Generate variants
✅ Set stock quantities
✅ Done!
```

### Scenario 3: Update Stock Levels

**Option A - Individual Update**
```
✅ Go to Inventory → Inventory List
✅ Edit stock field directly
✅ Change saves automatically
```

**Option B - Bulk Update**
```
✅ Go to Inventory → Import/Export
✅ Export CSV
✅ Edit in Excel/Sheets
✅ Import updated CSV
```

### Scenario 4: Add New Size/Color

```
✅ Go to Products → Edit Product
✅ Add new size or color
✅ Go to Manage Variants
✅ Select product again
✅ New variants auto-generated
✅ Set stock for new variants
```

---

## 📊 Inventory Tab Overview

### Tab 1: Inventory List
**What it does**: Shows all your product variants with stock levels

**Use it for**:
- Viewing current stock
- Quick stock updates
- Checking low stock items

### Tab 2: Manage Variants
**What it does**: Creates and manages variant combinations

**Use it for**:
- Setting up new products
- Adding new size/color options
- Customizing variant SKUs

### Tab 3: Import/Export
**What it does**: Bulk operations via CSV

**Use it for**:
- Updating many products at once
- Backing up inventory data
- Large-scale stock adjustments

---

## 🎯 Best Practices

### ✅ DO

- **Create variants immediately** after adding a product
- **Set realistic stock quantities** to avoid overselling
- **Use SKUs** for better tracking (optional but recommended)
- **Check inventory regularly** to restock popular items
- **Export backups** before major changes

### ❌ DON'T

- Don't forget to create variants (products won't show in inventory!)
- Don't set stock to negative numbers
- Don't delete variants with active orders
- Don't update stock during high-traffic times

---

## 🔧 Troubleshooting

### Q: My product doesn't show in inventory
**A**: Create variants first!
1. Go to **Manage Variants** tab
2. Select your product
3. Save the generated variants

### Q: I don't see all size/color combinations
**A**: Check your product settings
1. Edit product
2. Verify sizes and colors are selected
3. Go back to Manage Variants
4. Regenerate variants

### Q: Can I have different prices for different variants?
**A**: Currently, all variants share the product's base price. Different pricing per variant is a future feature.

### Q: What happens to stock when someone orders?
**A**: Stock is reduced only when payment is confirmed, not when added to cart.

### Q: Can I delete variants?
**A**: Yes, use the "Remove" button in Manage Variants. But be careful with variants that have order history!

---

## 📱 Mobile/Tablet Tips

- Inventory tables scroll horizontally
- Use landscape mode for better view
- Tap fields to edit on mobile
- CSV import/export works on all devices

---

## ⚡ Pro Tips

### Tip 1: Use Consistent Naming
```
✅ Good: S, M, L, XL
❌ Bad: Small, Med, Large, Extra-Large
```

### Tip 2: Standard Color Names
```
✅ Good: Black, White, Navy, Red
❌ Bad: Midnight Dark, Snow White, Ocean Blue
```

### Tip 3: SKU Format
```
Format: PRODUCT-SIZE-COLOR
Example: SHIRT-M-BLK
```

### Tip 4: Stock Buffer
```
Set stock: 100 units
Display to customers: 95 units (5 unit buffer)
```

### Tip 5: Low Stock Alerts
```
< 5 units = Yellow warning
0 units = Red alert
```

---

## 🎓 Advanced Features

### Edit Product Variants
Variants are defined on the product itself:
1. Click **"Editar producto"** button
2. Update sizes and colors on the product
3. Save the product
4. Return here to set stock and SKU

### Bulk SKU Generation
Auto-generated SKUs use this format:
```
{productId}-{size}-{color}
Example: clxyz123-M-BLK
```

You can edit these to match your system!

### CSV Headers
When importing, use these column names:
```
product_id, size, color, stock_quantity, sku
```

---

## 📈 Inventory Reports

### Stock Status Colors

🔴 **Red Background** = Out of Stock (0 units)
- Immediate action needed
- Hide from store or mark "Out of Stock"

🟡 **Yellow Background** = Low Stock (< 5 units)  
- Restock soon
- Consider ordering more

⚪ **White Background** = In Stock (5+ units)
- All good!
- Monitor sales velocity

---

## 🆘 Need Help?

1. Check the help section on the Inventory page
2. Read the full documentation: `INVENTORY_VARIANT_SOLUTION.md`
3. View visual guide: `INVENTORY_VISUAL_GUIDE.md`
4. Contact support if issues persist

---

## ✨ Summary Checklist

Before your products go live:

- [ ] Product created with sizes and colors
- [ ] Variants generated via Manage Variants tab
- [ ] Stock quantities set for all variants
- [ ] SKUs configured (if using them)
- [ ] Inventory verified in Inventory List tab
- [ ] Low stock items restocked
- [ ] Backup CSV exported

**That's it!** Your inventory is ready to go! 🎉

---

## 📅 Maintenance Schedule

**Daily**: Check Inventory List for low stock
**Weekly**: Review best-selling variants
**Monthly**: Export inventory backup
**Quarterly**: Clean up unused variants

---

*Last updated: 2024*
*Version: 1.0*
