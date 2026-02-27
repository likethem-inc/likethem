'use client'

import { useState } from 'react'
import { useT } from '@/hooks/useT'
import InventoryList from '@/components/curator/inventory/InventoryList'
import CSVImportExport from '@/components/curator/inventory/CSVImportExport'
import VariantManager from '@/components/curator/inventory/VariantManager'

export default function InventoryPage() {
  const t = useT()
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
          <h1 className="text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('inventory.subtitle')}
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
              {t('inventory.tabs.list')}
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'variants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('inventory.tabs.variants')}
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('inventory.tabs.import')}
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
            {t('inventory.help.title')}
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <strong>{t('inventory.help.step1.title')}</strong> {t('inventory.help.step1.desc')}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <strong>{t('inventory.help.step2.title')}</strong> {t('inventory.help.step2.desc')}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <strong>{t('inventory.help.step3.title')}</strong> {t('inventory.help.step3.desc')}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <strong>{t('inventory.help.step4.title')}</strong> {t('inventory.help.step4.desc')}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </div>
              <div>
                <strong>{t('inventory.help.step5.title')}</strong> {t('inventory.help.step5.desc')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
