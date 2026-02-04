'use client'

import { useState, useCallback } from 'react'

export interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  stockQuantity: number
  sku?: string | null
  product?: {
    id: string
    title: string
    slug: string
    price: number
    images?: Array<{ url: string; altText: string | null }>
  }
}

export interface VariantMap {
  [size: string]: {
    [color: string]: {
      id: string
      stockQuantity: number
      available: boolean
    }
  }
}

/**
 * Custom hook for managing inventory operations
 */
export function useInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all variants for the curator
   */
  const fetchInventory = useCallback(async (productId?: string) => {
    try {
      setLoading(true)
      setError(null)

      const url = productId
        ? `/api/curator/inventory?productId=${productId}`
        : '/api/curator/inventory'

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch inventory')
      }

      return data.data.variants as ProductVariant[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create or update multiple variants
   */
  const upsertVariants = useCallback(
    async (productId: string, variants: Array<{ size: string; color: string; stockQuantity: number; sku?: string }>) => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/curator/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId, variants })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create/update variants')
        }

        return data.data.variants as ProductVariant[]
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Update a single variant
   */
  const updateVariant = useCallback(async (variantId: string, stockQuantity: number, sku?: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/curator/inventory/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stockQuantity, sku })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update variant')
      }

      return data.data.variant as ProductVariant
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a variant
   */
  const deleteVariant = useCallback(async (variantId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/curator/inventory/${variantId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete variant')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Download inventory as CSV
   */
  const downloadInventoryCSV = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/curator/inventory/csv')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to download inventory')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Upload inventory via CSV
   */
  const uploadInventoryCSV = useCallback(async (csvData: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/curator/inventory/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload inventory')
      }

      return {
        success: true,
        summary: data.summary as {
          totalProcessed: number
          created: number
          updated: number
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Download CSV template
   */
  const downloadCSVTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/curator/inventory/csv/template')

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'inventory-template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  /**
   * Get variants for a product (public endpoint)
   */
  const getProductVariants = useCallback(async (productSlug: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/products/${productSlug}/variants`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product variants')
      }

      return {
        variants: data.variants as ProductVariant[],
        variantMap: data.variantMap as VariantMap
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchInventory,
    upsertVariants,
    updateVariant,
    deleteVariant,
    downloadInventoryCSV,
    uploadInventoryCSV,
    downloadCSVTemplate,
    getProductVariants
  }
}
