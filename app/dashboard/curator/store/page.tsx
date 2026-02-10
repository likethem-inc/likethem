'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Save, 
  Upload, 
  Globe, 
  Instagram, 
  Twitter, 
  Youtube,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
  ArrowLeft,
  X,
  Check,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useT } from '@/hooks/useT'

interface StoreProfile {
  name: string
  bio: string
  city: string
  style: string
  avatar: string
  banner: string
  isEditorPick: boolean
  isPublic: boolean
  socialLinks: {
    instagram?: string
    twitter?: string
    youtube?: string
    website?: string
  }
  badges: string[]
  tags: string[]
  slug?: string
}

const availableTags = [
  'Minimal', 'Streetwear', 'Vintage', 'Luxury', 'Casual', 'Formal',
  'Oversized', 'Fitted', 'Neutral', 'Colorful', 'Monochrome', 'Patterned',
  'Sustainable', 'Handmade', 'Contemporary', 'Classic', 'Trendy', 'Timeless'
]

export default function StorePage() {
  const t = useT()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<StoreProfile>({
    name: '',
    bio: '',
    city: '',
    style: '',
    avatar: '',
    banner: '',
    isEditorPick: false,
    isPublic: true,
    socialLinks: {},
    badges: [],
    tags: []
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch curator profile on mount
  useEffect(() => {
    async function fetchProfile() {
      if (status === 'loading') return
      
      if (!session?.user) {
        router.push('/auth/signin')
        return
      }

      try {
        const response = await fetch('/api/curator/profile')
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        const curatorProfile = data.curatorProfile

        // Parse styleTags if it's a JSON string
        let tags: string[] = []
        if (curatorProfile.styleTags) {
          try {
            tags = JSON.parse(curatorProfile.styleTags)
          } catch {
            tags = []
          }
        }

        setProfile({
          name: curatorProfile.storeName || '',
          bio: curatorProfile.bio || '',
          city: curatorProfile.city || '',
          style: tags.join(', ') || '',
          avatar: curatorProfile.avatarImage || curatorProfile.user?.image || '',
          banner: curatorProfile.bannerImage || '',
          isEditorPick: curatorProfile.isEditorsPick || false,
          isPublic: curatorProfile.isPublic ?? true,
          socialLinks: {
            instagram: curatorProfile.instagram || '',
            twitter: curatorProfile.twitter || '',
            youtube: curatorProfile.youtube || '',
            website: curatorProfile.websiteUrl || ''
          },
          badges: [],
          tags: tags,
          slug: curatorProfile.slug
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        setErrorMessage('Failed to load profile')
        setShowErrorToast(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session, status, router])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t('dashboard.store.saveError'))
      setShowErrorToast(true)
      return
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setErrorMessage(t('dashboard.store.saveError'))
      setShowErrorToast(true)
      return
    }

    // Store file for later upload
    setAvatarFile(file)

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
      setHasUnsavedChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t('dashboard.store.saveError'))
      setShowErrorToast(true)
      return
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setErrorMessage(t('dashboard.store.saveError'))
      setShowErrorToast(true)
      return
    }

    // Store file for later upload
    setBannerFile(file)

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string)
      setHasUnsavedChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleFieldChange = (field: keyof StoreProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }))
    setHasUnsavedChanges(true)
  }

  const toggleTag = (tag: string) => {
    const newTags = profile.tags.includes(tag)
      ? profile.tags.filter(t => t !== tag)
      : [...profile.tags, tag]
    
    setProfile(prev => ({ ...prev, tags: newTags }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      let avatarUrl = profile.avatar
      let bannerUrl = profile.banner

      // Upload avatar image if changed
      if (avatarFile) {
        setIsUploadingAvatar(true)
        const formData = new FormData()
        formData.append('image', avatarFile)
        formData.append('type', 'avatar')
        
        const uploadResponse = await fetch('/api/curator/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || t('dashboard.store.saveError'))
        }

        const uploadData = await uploadResponse.json()
        avatarUrl = uploadData.url
        setIsUploadingAvatar(false)
      }
      
      // Upload banner image if changed
      if (bannerFile) {
        setIsUploadingBanner(true)
        const formData = new FormData()
        formData.append('image', bannerFile)
        formData.append('type', 'banner')
        
        const uploadResponse = await fetch('/api/curator/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || t('dashboard.store.saveError'))
        }

        const uploadData = await uploadResponse.json()
        bannerUrl = uploadData.url
        setIsUploadingBanner(false)
      }

      // Prepare update data
      const updateData = {
        storeName: profile.name,
        bio: profile.bio,
        city: profile.city,
        styleTags: JSON.stringify(profile.tags),
        avatarImage: avatarUrl,
        bannerImage: bannerUrl,
        instagram: profile.socialLinks.instagram,
        twitter: profile.socialLinks.twitter,
        youtube: profile.socialLinks.youtube,
        websiteUrl: profile.socialLinks.website,
        isPublic: profile.isPublic
      }

      // Save to API
      const response = await fetch('/api/curator/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('dashboard.store.saveError'))
      }

      const data = await response.json()
      
      // Update local state with saved data
      setProfile(prev => ({
        ...prev,
        avatar: avatarUrl,
        banner: bannerUrl
      }))
      
      setHasUnsavedChanges(false)
      setAvatarFile(null)
      setBannerFile(null)
      setAvatarPreview(null)
      setBannerPreview(null)
      
      // Show success toast
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.store.saveError'))
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 5000)
    } finally {
      setIsSaving(false)
      setIsUploadingAvatar(false)
      setIsUploadingBanner(false)
    }
  }

  const togglePublic = () => {
    setProfile(prev => ({ ...prev, isPublic: !prev.isPublic }))
    setHasUnsavedChanges(true)
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm(t('dashboard.store.unsavedChanges'))) {
        window.location.href = '/dashboard/curator'
      }
    } else {
      window.location.href = '/dashboard/curator'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-carbon mx-auto mb-4" />
          <p className="text-gray-600">{t('dashboard.store.subtitle')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/curator"
                className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {profile.slug && (
                <a
                  href={`/curator/${profile.slug}`}
                  target="_blank"
                  className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t('dashboard.store.preview')}</span>
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h1 className="font-serif text-3xl font-light mb-2">{t('dashboard.store.title')}</h1>
            <p className="text-gray-600">
              {t('dashboard.store.subtitle')}
            </p>
          </div>

          {/* Status Badge */}
          {profile.isEditorPick && (
            <div className="mt-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">{t('dashboard.store.storeSettings.editorsPick')}</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.basicInfo.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.store.basicInfo.storeName')} *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder={t('dashboard.store.basicInfo.storeNamePlaceholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.name.length}/50 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.store.basicInfo.bio')} *
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    maxLength={280}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                    placeholder={t('dashboard.store.basicInfo.bioPlaceholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('dashboard.store.basicInfo.bioHint', { current: profile.bio.length, max: 280 })}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.store.basicInfo.city')}
                    </label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                      placeholder={t('dashboard.store.basicInfo.cityPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.store.basicInfo.style')}
                    </label>
                    <input
                      type="text"
                      value={profile.style}
                      onChange={(e) => handleFieldChange('style', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                      placeholder={t('dashboard.store.basicInfo.stylePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.styleTags.title')}</h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {t('dashboard.store.styleTags.description')}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm transition-colors ${
                        profile.tags.includes(tag)
                          ? 'bg-carbon text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.socialLinks.title')}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <input
                    type="text"
                    value={profile.socialLinks.instagram || ''}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder={t('dashboard.store.socialLinks.instagramPlaceholder')}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    value={profile.socialLinks.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder={t('dashboard.store.socialLinks.twitterPlaceholder')}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={profile.socialLinks.youtube || ''}
                    onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder={t('dashboard.store.socialLinks.youtubePlaceholder')}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={profile.socialLinks.website || ''}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder={t('dashboard.store.socialLinks.websitePlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Store Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.storeSettings.title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('dashboard.store.storeSettings.visibility')}</h3>
                    <p className="text-sm text-gray-600">
                      {profile.isPublic ? t('dashboard.store.storeSettings.public') : t('dashboard.store.storeSettings.private')}
                    </p>
                  </div>
                  <button
                    onClick={togglePublic}
                    className="flex items-center space-x-2"
                  >
                    {profile.isPublic ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('dashboard.store.storeSettings.editorsPick')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('dashboard.store.storeSettings.editorNote')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.isEditorPick && (
                      <Star className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-500">
                      {profile.isEditorPick ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Profile Photo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.profileImages.avatar')}</h2>
              
              <div className="space-y-4">
                <div className="relative mx-auto w-32 h-32">
                  <Image
                    src={avatarPreview || profile.avatar}
                    alt="Profile"
                    fill
                    sizes="128px"
                    className="object-cover rounded-full"
                  />
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-carbon text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    {t('dashboard.store.profileImages.uploadAvatar')}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.profileImages.banner')}</h2>
              
              <div className="space-y-4">
                <div className="relative w-full h-32">
                  <Image
                    src={bannerPreview || profile.banner}
                    alt="Banner"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover rounded-lg"
                  />
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-carbon text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {t('dashboard.store.profileImages.recommended')}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">{t('dashboard.store.badges.title')}</h2>
              
              <div className="space-y-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-800">{badge}</span>
                  </div>
                ))}
                
                {profile.badges.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No badges yet
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="w-full py-3 px-6 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('dashboard.store.saving')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('dashboard.store.save')}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCancel}
                  className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('dashboard.store.discardChanges')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50"
        >
          <Check className="w-5 h-5" />
          <span>{t('dashboard.store.saveSuccess')}</span>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50"
        >
          <X className="w-5 h-5" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setShowErrorToast(false)}
            className="ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  )
} 