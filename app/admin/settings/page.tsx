'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import AdminPageShell from '@/components/admin/AdminPageShell'
import Toast, { ToastType } from '@/components/Toast'
import { Upload, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import type { 
  PaymentSettings, 
  PaymentSettingsFormData,
  PaymentSettingsResponse,
  UploadQRResponse 
} from '@/types/payment-settings'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingYape, setUploadingYape] = useState(false)
  const [uploadingPlin, setUploadingPlin] = useState(false)
  
  const [formData, setFormData] = useState<PaymentSettingsFormData>({
    yapeEnabled: false,
    yapePhoneNumber: '',
    yapeQRCode: null,
    yapeInstructions: 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
    plinEnabled: false,
    plinPhoneNumber: '',
    plinQRCode: null,
    plinInstructions: 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
    stripeEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    defaultPaymentMethod: 'stripe',
    commissionRate: 0.10,
  })

  const [yapePreview, setYapePreview] = useState<string | null>(null)
  const [plinPreview, setPlinPreview] = useState<string | null>(null)

  const [toast, setToast] = useState<{
    type: ToastType
    message: string
    isVisible: boolean
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  })

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message, isVisible: true })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payment-settings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment settings')
      }

      const data: PaymentSettingsResponse = await response.json()
      const settings = data.settings

      setFormData({
        yapeEnabled: settings.yapeEnabled,
        yapePhoneNumber: settings.yapePhoneNumber || '',
        yapeQRCode: settings.yapeQRCode,
        yapeInstructions: settings.yapeInstructions || 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
        plinEnabled: settings.plinEnabled,
        plinPhoneNumber: settings.plinPhoneNumber || '',
        plinQRCode: settings.plinQRCode,
        plinInstructions: settings.plinInstructions || 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
        stripeEnabled: settings.stripeEnabled,
        stripePublicKey: settings.stripePublicKey || '',
        stripeSecretKey: settings.stripeSecretKey || '',
        defaultPaymentMethod: settings.defaultPaymentMethod,
        commissionRate: settings.commissionRate,
      })

      setYapePreview(settings.yapeQRCode)
      setPlinPreview(settings.plinQRCode)

    } catch (error) {
      console.error('Error fetching settings:', error)
      showToast('error', 'Failed to load payment settings')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Fetch payment settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleInputChange = (field: keyof PaymentSettingsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    paymentMethod: 'yape' | 'plin'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size must be less than 5MB')
      return
    }

    // Set preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (paymentMethod === 'yape') {
        setYapePreview(reader.result as string)
      } else {
        setPlinPreview(reader.result as string)
      }
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadQRCode(file, paymentMethod)
  }

  const uploadQRCode = async (file: File, paymentMethod: 'yape' | 'plin') => {
    const setUploading = paymentMethod === 'yape' ? setUploadingYape : setUploadingPlin

    try {
      setUploading(true)

      const formDataToSend = new FormData()
      formDataToSend.append('file', file)
      formDataToSend.append('paymentMethod', paymentMethod)

      const response = await fetch('/api/admin/payment-settings/upload-qr', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload QR code')
      }

      const data: UploadQRResponse = await response.json()
      
      // Update form data with new URL
      if (paymentMethod === 'yape') {
        setFormData(prev => ({ ...prev, yapeQRCode: data.url }))
      } else {
        setFormData(prev => ({ ...prev, plinQRCode: data.url }))
      }

      showToast('success', `${paymentMethod.toUpperCase()} QR code uploaded successfully`)
    } catch (error) {
      console.error('Error uploading QR code:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to upload QR code')
      
      // Reset preview on error
      if (paymentMethod === 'yape') {
        setYapePreview(formData.yapeQRCode)
      } else {
        setPlinPreview(formData.plinQRCode)
      }
    } finally {
      setUploading(false)
    }
  }

  const removeQRCode = (paymentMethod: 'yape' | 'plin') => {
    if (paymentMethod === 'yape') {
      setFormData(prev => ({ ...prev, yapeQRCode: null }))
      setYapePreview(null)
    } else {
      setFormData(prev => ({ ...prev, plinQRCode: null }))
      setPlinPreview(null)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validation
      if (formData.yapeEnabled && !formData.yapePhoneNumber) {
        showToast('error', 'Yape phone number is required when Yape is enabled')
        return
      }

      if (formData.plinEnabled && !formData.plinPhoneNumber) {
        showToast('error', 'Plin phone number is required when Plin is enabled')
        return
      }

      if (formData.commissionRate < 0 || formData.commissionRate > 1) {
        showToast('error', 'Commission rate must be between 0 and 100%')
        return
      }

      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      showToast('success', 'Payment settings saved successfully')
      await fetchSettings() // Refresh data
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const isUploading = uploadingYape || uploadingPlin

  if (loading) {
    return (
      <AdminPageShell
        title="Platform Settings"
        subtitle="Configure platform settings, features, and integrations"
      >
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell
      title="Platform Settings"
      subtitle="Configure payment methods and platform settings"
    >
      <div className="space-y-6">
        {/* Yape Settings */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Yape Configuration</h2>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.yapeEnabled}
                  onChange={(e) => handleInputChange('yapeEnabled', e.target.checked)}
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {formData.yapeEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.yapePhoneNumber}
                onChange={(e) => handleInputChange('yapePhoneNumber', e.target.value)}
                placeholder="+51 999 999 999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={!formData.yapeEnabled}
              />
            </div>

            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code
              </label>
              
              {yapePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={yapePreview}
                    alt="Yape QR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48 object-contain border border-gray-200 rounded-lg"
                  />
                  {formData.yapeEnabled && (
                    <button
                      onClick={() => removeQRCode('yape')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={uploadingYape}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {uploadingYape && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-4">No QR code uploaded</p>
                </div>
              )}

              {formData.yapeEnabled && (
                <div className="mt-3">
                  <label className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingYape ? 'Uploading...' : yapePreview ? 'Change QR Code' : 'Upload QR Code'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'yape')}
                      className="hidden"
                      disabled={uploadingYape}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG or WEBP. Max size 5MB.
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Instructions
              </label>
              <textarea
                value={formData.yapeInstructions}
                onChange={(e) => handleInputChange('yapeInstructions', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={!formData.yapeEnabled}
                placeholder="Instructions for customers..."
              />
            </div>
          </div>
        </div>

        {/* Plin Settings */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Plin Configuration</h2>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.plinEnabled}
                  onChange={(e) => handleInputChange('plinEnabled', e.target.checked)}
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {formData.plinEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.plinPhoneNumber}
                onChange={(e) => handleInputChange('plinPhoneNumber', e.target.value)}
                placeholder="+51 999 999 999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={!formData.plinEnabled}
              />
            </div>

            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code
              </label>
              
              {plinPreview ? (
                <div className="relative inline-block">
                  <Image
                    src={plinPreview}
                    alt="Plin QR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48 object-contain border border-gray-200 rounded-lg"
                  />
                  {formData.plinEnabled && (
                    <button
                      onClick={() => removeQRCode('plin')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={uploadingPlin}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {uploadingPlin && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-4">No QR code uploaded</p>
                </div>
              )}

              {formData.plinEnabled && (
                <div className="mt-3">
                  <label className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingPlin ? 'Uploading...' : plinPreview ? 'Change QR Code' : 'Upload QR Code'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'plin')}
                      className="hidden"
                      disabled={uploadingPlin}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG or WEBP. Max size 5MB.
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Instructions
              </label>
              <textarea
                value={formData.plinInstructions}
                onChange={(e) => handleInputChange('plinInstructions', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={!formData.plinEnabled}
                placeholder="Instructions for customers..."
              />
            </div>
          </div>
        </div>

        {/* Stripe Settings */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Stripe Configuration</h2>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.stripeEnabled}
                  onChange={(e) => handleInputChange('stripeEnabled', e.target.checked)}
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {formData.stripeEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publishable Key
              </label>
              <input
                type="text"
                value={formData.stripePublicKey}
                onChange={(e) => handleInputChange('stripePublicKey', e.target.value)}
                placeholder="pk_live_..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                disabled={!formData.stripeEnabled}
              />
              <p className="mt-1 text-xs text-gray-500">
                Your Stripe publishable key (starts with pk_)
              </p>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={formData.stripeSecretKey}
                onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                placeholder="sk_live_..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                disabled={!formData.stripeEnabled}
              />
              <p className="mt-1 text-xs text-gray-500">
                Your Stripe secret key (starts with sk_). Keep this secure!
              </p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Default Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Payment Method
              </label>
              <select
                value={formData.defaultPaymentMethod}
                onChange={(e) => handleInputChange('defaultPaymentMethod', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="stripe">Stripe</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The payment method shown by default to customers
              </p>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.commissionRate * 100}
                  onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) / 100)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <span className="absolute right-4 top-2 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Platform commission rate for curator sales (0-100%)
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving || isUploading}
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </AdminPageShell>
  )
}
