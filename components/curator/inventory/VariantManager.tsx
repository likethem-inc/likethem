'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Save, AlertCircle, Package } from 'lucide-react'
import Toast, { ToastType } from '@/components/Toast'

interface Product {
  id: string
  title: string
  sizes: string
  colors: string
  images: Array<{ url: string }>
}

interface Variant {
  size: string
  color: string
  stockQuantity: number
  sku: string
}

interface VariantManagerProps {
  productId?: string
  onClose?: () => void
  onSuccess?: () => void
}

export default function VariantManager({ productId, onClose, onSuccess }: VariantManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [selectedVariantIndexes, setSelectedVariantIndexes] = useState<Set<number>>(new Set())
  const [bulkMode, setBulkMode] = useState<'add' | 'set'>('add')
  const [bulkValue, setBulkValue] = useState('')
  const [toast, setToast] = useState<{ type: ToastType; message: string; isVisible: boolean }>({
    type: 'success',
    message: '',
    isVisible: false
  })

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message, isVisible: true })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId)
      if (product) {
        selectProduct(product)
      }
    }
  }, [productId, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : null
      
      if (!response.ok) {
        throw new Error(data?.error || `Failed to fetch products (${response.status})`)
      }

      const productsPayload = Array.isArray(data)
        ? data
        : data?.products || data?.data || []

      setProducts(productsPayload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const parseArrayField = (field: string): string[] => {
    if (!field) return []
    
    // Handle comma-separated strings
    if (field.includes(',')) {
      return field.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    // Try to parse JSON array
    try {
      const parsed = JSON.parse(field)
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string')
      }
    } catch (e) {
      // Not JSON, treat as single item
      return field.trim() ? [field.trim()] : []
    }
    
    return []
  }

  const buildSku = (product: Product, size: string, color: string) => {
    const normalize = (value: string) =>
      value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    const sizePart = normalize(size) || 'SIZE'
    const colorPart = normalize(color) || 'COLOR'

    return `${product.id}-${sizePart}-${colorPart}`
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    
    // Parse sizes and colors
    const sizes = parseArrayField(product.sizes)
    const colors = parseArrayField(product.colors)
    
    // Generate all combinations
    const generatedVariants: Variant[] = []
    
    if (sizes.length === 0 || colors.length === 0) {
      // If no sizes or colors, create a default variant
      generatedVariants.push({
        size: sizes[0] || 'One Size',
        color: colors[0] || 'Default',
        stockQuantity: 0,
        sku: buildSku(product, sizes[0] || 'One Size', colors[0] || 'Default')
      })
    } else {
      // Create all size/color combinations
      for (const size of sizes) {
        for (const color of colors) {
          generatedVariants.push({
            size,
            color,
            stockQuantity: 0,
            sku: buildSku(product, size, color)
          })
        }
      }
    }
    
    setVariants(generatedVariants)
    setSelectedVariantIndexes(new Set())
    setBulkValue('')

    loadExistingVariants(product.id, generatedVariants)
  }

  const loadExistingVariants = async (productId: string, baseVariants: Variant[]) => {
    try {
      const response = await fetch(`/api/curator/inventory?productId=${productId}`)
      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : null

      if (!response.ok) {
        throw new Error(data?.error || `Failed to load inventory (${response.status})`)
      }

      const payload = data?.data ?? data
      const existingVariants = payload?.variants || []

      if (existingVariants.length === 0) {
        return
      }

      const existingMap = new Map(
        existingVariants.map((variant: any) => [
          `${variant.size}::${variant.color}`,
          variant
        ])
      )

      setVariants(prev => {
        const source = prev.length > 0 ? prev : baseVariants
        return source.map(variant => {
          const existing = existingMap.get(`${variant.size}::${variant.color}`)
          if (!existing) {
            return variant
          }

          return {
            ...variant,
            stockQuantity: existing.stockQuantity ?? variant.stockQuantity,
            sku: existing.sku ?? variant.sku
          }
        })
      })
    } catch (err) {
      console.error('Error loading existing variants:', err)
      showToast('error', err instanceof Error ? err.message : 'Failed to load inventory')
    }
  }

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(productSearch.toLowerCase())
  )

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants(prev => 
      prev.map((v, i) => i === index ? { ...v, [field]: value } : v)
    )
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
    setSelectedVariantIndexes(new Set())
  }

  const addCustomVariant = () => {
    setVariants(prev => [...prev, {
      size: '',
      color: '',
      stockQuantity: 0,
      sku: ''
    }])
  }

  const toggleVariantSelection = (index: number) => {
    setSelectedVariantIndexes(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedVariantIndexes.size === variants.length) {
      setSelectedVariantIndexes(new Set())
    } else {
      setSelectedVariantIndexes(new Set(variants.map((_, index) => index)))
    }
  }

  const applyBulkStock = () => {
    if (selectedVariantIndexes.size === 0) {
      showToast('error', 'Select at least one variant to update')
      return
    }

    const amount = Number(bulkValue)
    if (!Number.isFinite(amount) || amount < 0) {
      showToast('error', 'Enter a valid stock quantity')
      return
    }

    setVariants(prev =>
      prev.map((variant, index) => {
        if (!selectedVariantIndexes.has(index)) {
          return variant
        }

        const nextStock = bulkMode === 'add'
          ? variant.stockQuantity + amount
          : amount

        return {
          ...variant,
          stockQuantity: nextStock
        }
      })
    )
  }

  const handleSave = async () => {
    if (!selectedProduct) return
    
    // Validate variants
    for (const variant of variants) {
      if (!variant.size || !variant.color) {
        showToast('error', 'All variants must have size and color specified')
        return
      }
    }
    
    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch('/api/curator/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          variants: variants.map(v => ({
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity,
            sku: v.sku || null
          }))
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save variants')
      }
      
      showToast('success', 'Variants saved successfully!')
      
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset selection
      setSelectedProduct(null)
      setVariants([])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save variants')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Loading products">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="sr-only">Loading products...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Product Variants</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage size/color combinations for your products
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!selectedProduct ? (
        /* Product Selection */
        <div className="space-y-4">
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search products by name"
            />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create a product first before managing variants
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products match your search</p>
              <p className="text-sm text-gray-500 mt-2">
                Try a different name or clear the search
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-20 h-14 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-14 bg-gray-100 rounded-md" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{product.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>Sizes: {parseArrayField(product.sizes).length || 0}</span>
                      <span>•</span>
                      <span>Colors: {parseArrayField(product.colors).length || 0}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Variant Management */
        <div className="space-y-6">
          {/* Selected Product Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            {selectedProduct.images[0] && (
              <img
                src={selectedProduct.images[0].url}
                alt={selectedProduct.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{selectedProduct.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {variants.length} variant{variants.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null)
                setVariants([])
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Variants Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={variants.length > 0 && selectedVariantIndexes.size === variants.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Select all variants"
                />
                <span>{selectedVariantIndexes.size} selected</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bulkMode}
                  onChange={(event) => setBulkMode(event.target.value as 'add' | 'set')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Bulk stock mode"
                >
                  <option value="add">Add</option>
                  <option value="set">Set</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={bulkValue}
                  onChange={(event) => setBulkValue(event.target.value)}
                  placeholder="Quantity"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Bulk stock quantity"
                />
                <button
                  onClick={applyBulkStock}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-neutral-900 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU (Optional)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variants.map((variant, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVariantIndexes.has(index)}
                          onChange={() => toggleVariantSelection(index)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select variant ${index + 1}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="S, M, L..."
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Black, Red..."
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional SKU"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={addCustomVariant}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Variant</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || variants.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Variants</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
