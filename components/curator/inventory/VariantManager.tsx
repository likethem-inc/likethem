'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Save, AlertCircle, Package } from 'lucide-react'

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
      const response = await fetch('/api/curator/products')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products')
      }

      setProducts(data.products || [])
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
        sku: `${product.id.slice(0, 8)}-${sizes[0] || 'OS'}-${colors[0] || 'DEF'}`
      })
    } else {
      // Create all size/color combinations
      for (const size of sizes) {
        for (const color of colors) {
          generatedVariants.push({
            size,
            color,
            stockQuantity: 0,
            sku: `${product.id.slice(0, 8)}-${size}-${color.slice(0, 3).toUpperCase()}`
          })
        }
      }
    }
    
    setVariants(generatedVariants)
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants(prev => 
      prev.map((v, i) => i === index ? { ...v, [field]: value } : v)
    )
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const addCustomVariant = () => {
    setVariants(prev => [...prev, {
      size: '',
      color: '',
      stockQuantity: 0,
      sku: ''
    }])
  }

  const handleSave = async () => {
    if (!selectedProduct) return
    
    // Validate variants
    for (const variant of variants) {
      if (!variant.size || !variant.color) {
        alert('All variants must have size and color specified')
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
      
      alert('Variants saved successfully!')
      
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">Choose a Product</p>
              <p className="text-sm text-blue-800 mt-1">
                Select a product below to generate and manage its variants
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create a product first before managing variants
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>Sizes: {parseArrayField(product.sizes).length || 0}</span>
                    <span>•</span>
                    <span>Colors: {parseArrayField(product.colors).length || 0}</span>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}
