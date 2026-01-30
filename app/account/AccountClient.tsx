'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, User, MapPin, CreditCard, Palette, Heart, Check, X } from 'lucide-react'
import SavedItems from '@/components/account/SavedItems'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  provider: string | null
  emailVerified: Date | null
  phone: string | null
  role: string
  passwordHash: string | null
}

interface Address {
  id: string
  userId: string
  name: string
  phone: string | null
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

import type { Session } from 'next-auth'

interface AccountClientProps {
  user: User
  session: Session | any // Use any to avoid type conflicts with extended Session
}

export default function AccountClient({ user, session }: AccountClientProps) {
  const [activeSection, setActiveSection] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)

  const sections = [
    { id: 'personal', title: 'Personal Details', icon: User },
    { id: 'saved', title: 'Saved Items', icon: Heart },
    { id: 'shipping', title: 'Shipping Address', icon: MapPin },
    { id: 'payment', title: 'Payment Methods', icon: CreditCard },
    { id: 'style', title: 'Style Profile', icon: Palette }
  ]

  // Use real user data with fallbacks
  const displayName = user.name ?? session.user.name ?? ''
  const displayEmail = user.email ?? session.user.email ?? ''
  const displayPhone = user.phone ?? ''
  const displayAvatar = user.image ?? session.user.image ?? null

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Account Information
          </h1>
          <p className="text-lg text-warm-gray font-light">
            Manage your personal details, preferences, and account settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setActiveSection(isActive ? '' : section.id)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Icon className="w-5 h-5 text-carbon" />
                    <h2 className="font-serif text-xl font-light">{section.title}</h2>
                  </div>
                  {isActive ? (
                    <ChevronUp className="w-5 h-5 text-carbon" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-carbon" />
                  )}
                </button>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 p-6"
                  >
                    {section.id === 'personal' && (
                      <PersonalDetails 
                        isEditing={isEditing} 
                        setIsEditing={setIsEditing}
                        user={user}
                        displayName={displayName}
                        displayEmail={displayEmail}
                        displayPhone={displayPhone}
                      />
                    )}
                    {section.id === 'saved' && <SavedItems />}
                    {section.id === 'shipping' && <ShippingAddress displayName={displayName} />}
                    {section.id === 'payment' && <PaymentMethods />}
                    {section.id === 'style' && <StyleProfile />}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PersonalDetails({ 
  isEditing, 
  setIsEditing, 
  user, 
  displayName, 
  displayEmail, 
  displayPhone 
}: { 
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  user: User
  displayName: string
  displayEmail: string
  displayPhone: string
}) {
  const [formData, setFormData] = useState({
    name: displayName,
    phone: displayPhone
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[account] Update successful:', result)
        setIsEditing(false)
        // Optionally refresh the page or update local state
        window.location.reload()
      } else {
        console.error('[account] Update failed:', await response.text())
        alert('Failed to save changes. Please try again.')
      }
    } catch (error) {
      console.error('[account] Update error:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: displayName,
      phone: displayPhone
    })
    setIsEditing(false)
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setPasswordSuccess('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setIsChangingPassword(false)
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(result.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('[account] Password change error:', error)
      setPasswordError('Failed to change password. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordError('')
    setPasswordSuccess('')
    setIsChangingPassword(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">Personal Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm">{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={displayEmail}
            disabled={true}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          {!isChangingPassword ? (
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="w-full px-4 py-3 border border-gray-300 text-left hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-3">
              {user.passwordHash && (
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                />
              )}
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600">{passwordSuccess}</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelPasswordChange}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-carbon text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4 pt-4">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-2 border border-carbon text-carbon hover:bg-carbon hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-carbon text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

function ShippingAddress({ displayName }: { displayName: string }) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: displayName,
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false
  })

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses)
      }
    } catch (error) {
      console.error('[addresses] Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: displayName,
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      isDefault: false
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsAdding(true)
  }

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      phone: address.phone || '',
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    })
    setEditingId(address.id)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const url = '/api/account/addresses'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId 
        ? { id: editingId, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await fetchAddresses()
        resetForm()
      } else {
        const error = await response.json()
        alert(`Failed to save address: ${error.error}`)
      }
    } catch (error) {
      console.error('[addresses] Save error:', error)
      alert('Failed to save address. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/account/addresses?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAddresses()
        setDeleteConfirmId(null)
      } else {
        const error = await response.json()
        alert(`Failed to delete address: ${error.error}`)
      }
    } catch (error) {
      console.error('[addresses] Delete error:', error)
      alert('Failed to delete address. Please try again.')
    }
  }

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/account/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: address.id,
          name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          isDefault: true
        }),
      })

      if (response.ok) {
        await fetchAddresses()
      } else {
        const error = await response.json()
        alert(`Failed to set default address: ${error.error}`)
      }
    } catch (error) {
      console.error('[addresses] Set default error:', error)
      alert('Failed to set default address. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">Shipping Addresses</h3>
        {!isAdding && !editingId && (
          <button 
            onClick={handleAdd}
            className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add New Address</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="font-medium mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State/Province *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ZIP Code *</label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country *</label>
              <select
                required
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Spain">Spain</option>
                <option value="Italy">Italy</option>
                <option value="Peru">Peru</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="w-4 h-4 text-carbon border-gray-300 focus:ring-carbon"
              />
              <span className="text-sm">Set as default address</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={resetForm}
              disabled={isSaving}
              className="px-6 py-2 border border-carbon text-carbon hover:bg-carbon hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-carbon text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No addresses saved yet. Add your first address above.
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`border rounded-lg p-4 ${address.isDefault ? 'border-carbon bg-gray-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{address.name}</h4>
                    {address.isDefault && (
                      <span className="text-xs bg-carbon text-white px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {address.phone && (
                    <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address)}
                      disabled={isSaving}
                      className="text-xs text-carbon hover:text-black transition-colors disabled:opacity-50"
                    >
                      Set as Default
                    </button>
                  )}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(address)}
                      className="text-carbon hover:text-black transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {deleteConfirmId === address.id ? (
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleDelete(address.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirmId(address.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentMethods() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">Payment Methods</h3>
        <button className="flex items-center space-x-2 text-carbon hover:text-black transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Payment Method</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <button className="text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StyleProfile() {
  const stylePreferences = ['Minimal', 'Streetwear', 'Elegant', 'Vintage', 'Contemporary']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg font-light">Style Preferences</h3>
      <p className="text-sm text-gray-600 mb-6">
        Help Nigel curate better recommendations for you
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Style Preferences</label>
          <div className="flex flex-wrap gap-2">
            {stylePreferences.map((style) => (
              <button
                key={style}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-carbon hover:text-carbon transition-colors"
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tops</label>
            <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bottoms</label>
            <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Shoes</label>
            <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Favorite Brands or Curators</label>
          <textarea
            placeholder="e.g., Sofia Laurent, Acne Studios, minimal aesthetic..."
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-carbon text-white hover:bg-gray-800 transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
