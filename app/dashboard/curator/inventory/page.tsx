'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InventoryList from '@/components/curator/inventory/InventoryList'
import CSVImportExport from '@/components/curator/inventory/CSVImportExport'
import VariantManager from '@/components/curator/inventory/VariantManager'

export default function InventoryPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'list' | 'variants' | 'import'>('list')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleImportSuccess = () => {
    // Refresh the inventory list
    setRefreshKey(prev => prev + 1)
    // Switch to list view to see the changes
    setActiveTab('list')
  }

  const handleVariantsSuccess = () => {
    // Refresh the inventory list
    setRefreshKey(prev => prev + 1)
    // Switch to list view to see the changes
    setActiveTab('list')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">
            Manage stock levels for all your product variants
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory List
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'variants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Variants
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Import/Export
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'list' ? (
            <InventoryList key={refreshKey} />
          ) : activeTab === 'variants' ? (
            <VariantManager onSuccess={handleVariantsSuccess} />
          ) : (
            <CSVImportExport onImportSuccess={handleImportSuccess} />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How Inventory Management Works
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <strong>Create Variants First:</strong> Before products appear in inventory, you need to create variants for each size/color combination. Use the "Manage Variants" tab to generate variants for your products.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <strong>Variant-Based Tracking:</strong> Inventory is tracked for each unique combination of size and color. This ensures accurate stock levels for specific variants.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <strong>Stock Reservation:</strong> Stock is only reduced when an order is paid for, not when items are added to cart. This prevents overselling.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <strong>Bulk Management:</strong> Use CSV import/export for managing large inventories efficiently. Perfect for updating stock across multiple products at once.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </div>
              <div>
                <strong>Real-time Updates:</strong> Changes to stock levels are reflected immediately. Customers will see accurate availability when browsing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
