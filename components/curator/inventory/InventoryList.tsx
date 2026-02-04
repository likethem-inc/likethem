'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  stockQuantity: number
  sku?: string | null
  product: {
    id: string
    title: string
    slug: string
    price: number
    images: Array<{ url: string; altText: string | null }>
  }
}

interface InventoryListProps {
  onEdit?: (variant: ProductVariant) => void
}

export default function InventoryList({ onEdit }: InventoryListProps) {
  const { t } = useTranslation()
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingStock, setUpdatingStock] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/curator/inventory')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch inventory')
      }

      setVariants(data.data.variants || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateVariantStock = async (variantId: string, newStock: number) => {
    if (newStock < 0) {
      alert('Stock quantity cannot be negative')
      return
    }

    try {
      setUpdatingStock(prev => ({ ...prev, [variantId]: true }))
      
      const response = await fetch(`/api/curator/inventory/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stockQuantity: newStock })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stock')
      }

      // Update local state
      setVariants(prev =>
        prev.map(v =>
          v.id === variantId ? { ...v, stockQuantity: newStock } : v
        )
      )

      // Show success message
      alert('Stock updated successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update stock')
    } finally {
      setUpdatingStock(prev => ({ ...prev, [variantId]: false }))
    }
  }

  const filteredVariants = variants.filter(variant =>
    variant.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (variant.sku && variant.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-medium">Error loading inventory</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchInventory}
          className="mt-3 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by product, size, color, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredVariants.length} variant{filteredVariants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Inventory table */}
      {filteredVariants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {searchTerm ? 'No variants match your search' : 'No inventory found'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {!searchTerm && 'Add products and variants to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {variant.product.images[0] && (
                          <img
                            src={variant.product.images[0].url}
                            alt={variant.product.images[0].altText || ''}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {variant.product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${variant.product.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {variant.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {variant.color}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value)
                          if (!isNaN(newValue)) {
                            // Update local state immediately for better UX
                            setVariants(prev =>
                              prev.map(v =>
                                v.id === variant.id ? { ...v, stockQuantity: newValue } : v
                              )
                            )
                          }
                        }}
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value)
                          if (!isNaN(newValue) && newValue !== variant.stockQuantity) {
                            updateVariantStock(variant.id, newValue)
                          }
                        }}
                        disabled={updatingStock[variant.id]}
                        className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          variant.stockQuantity <= 0
                            ? 'border-red-300 bg-red-50'
                            : variant.stockQuantity < 5
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(variant)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock status legend */}
      <div className="flex items-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-red-300 bg-red-50 rounded"></div>
          <span>Out of stock</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-300 bg-yellow-50 rounded"></div>
          <span>Low stock (&lt; 5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
          <span>In stock</span>
        </div>
      </div>
    </div>
  )
}
