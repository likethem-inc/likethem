'use client'

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface CSVImportExportProps {
  onImportSuccess?: () => void
}

export default function CSVImportExport({ onImportSuccess }: CSVImportExportProps) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message?: string
    summary?: {
      totalProcessed: number
      created: number
      updated: number
    }
    errors?: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = async () => {
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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to download template')
    }
  }

  const handleDownloadInventory = async () => {
    try {
      setDownloading(true)
      const response = await fetch('/api/curator/inventory/csv')
      if (!response.ok) {
        throw new Error('Failed to download inventory')
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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to download inventory')
    } finally {
      setDownloading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    try {
      setUploading(true)
      setImportResult(null)

      // Read file content
      const fileContent = await file.text()

      // Upload to server
      const response = await fetch('/api/curator/inventory/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData: fileContent })
      })

      const data = await response.json()

      if (!response.ok) {
        setImportResult({
          success: false,
          message: data.error || 'Failed to import inventory',
          errors: data.errors || []
        })
        return
      }

      setImportResult({
        success: true,
        message: data.message,
        summary: data.summary
      })

      // Call success callback
      if (onImportSuccess) {
        onImportSuccess()
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Import/Export Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bulk Import/Export
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Export Inventory</h4>
            <p className="text-sm text-gray-600">
              Download your current inventory as a CSV file
            </p>
            <button
              onClick={handleDownloadInventory}
              disabled={downloading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {downloading ? 'Downloading...' : 'Download Inventory CSV'}
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Import Inventory</h4>
            <p className="text-sm text-gray-600">
              Upload a CSV file to update inventory in bulk
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload Inventory CSV'}
            </button>
          </div>
        </div>

        {/* Template Download */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">CSV Template</h4>
              <p className="text-sm text-gray-600 mt-1">
                Download a template to see the required format
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div
          className={`rounded-lg p-6 ${
            importResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {importResult.success ? (
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {importResult.success ? 'Import Successful' : 'Import Failed'}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {importResult.message}
              </p>

              {importResult.summary && (
                <div className="mt-3 space-y-1 text-sm text-green-800">
                  <p>• Total processed: {importResult.summary.totalProcessed}</p>
                  <p>• Created: {importResult.summary.created}</p>
                  <p>• Updated: {importResult.summary.updated}</p>
                </div>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-red-900">Errors:</p>
                  <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setImportResult(null)}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format</h4>
        <p className="text-sm text-blue-800 mb-3">
          Your CSV file should have the following columns:
        </p>
        <div className="bg-white rounded border border-blue-200 p-3">
          <code className="text-xs text-gray-800 font-mono">
            productSlug,size,color,stock,sku
          </code>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-medium">•</span>
            <span><strong>productSlug:</strong> The unique slug of your product</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">•</span>
            <span><strong>size:</strong> The size variant (e.g., S, M, L, XL)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">•</span>
            <span><strong>color:</strong> The color variant (e.g., Red, Blue, Black)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">•</span>
            <span><strong>stock:</strong> The quantity in stock (must be a number)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">•</span>
            <span><strong>sku:</strong> Optional SKU code</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
