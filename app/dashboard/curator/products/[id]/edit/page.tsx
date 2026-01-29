'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Save,
  Eye
} from 'lucide-react'

interface ProductForm {
  name: string
  price: string
  description: string
  curatorNote: string
  tags: string[]
  sizes: string[]
  colors: string[]
  images: File[]
  imagePreviews: string[]
  existingImages: Array<{
    id: string
    url: string
    altText?: string
    order: number
  }>
}

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const availableColors = ['Black', 'White', 'Navy', 'Camel', 'Gray', 'Beige', 'Brown', 'Green', 'Blue', 'Red', 'Pink', 'Yellow']

// Helper function to safely parse tags/sizes/colors from string format
const parseArrayField = (field: string | null | undefined): string[] => {
  if (!field) return []
  
  // If it's already an array, return it
  if (Array.isArray(field)) return field
  
  // If it's a string, try to parse it
  if (typeof field === 'string') {
    // If it's a comma-separated string, split it
    if (field.includes(',')) {
      return field.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    // If it's a JSON string, try to parse it
    try {
      const parsed = JSON.parse(field)
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string')
      }
    } catch (e) {
      // If JSON parsing fails, treat it as a single item
      return field.trim() ? [field.trim()] : []
    }
  }
  
  return []
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [productId, setProductId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: '',
    description: '',
    curatorNote: '',
    tags: [],
    sizes: [],
    colors: [],
    images: [],
    imagePreviews: [],
    existingImages: []
  })
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing product data
  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            alert('Product not found')
            router.push('/dashboard/curator/products')
            return
          }
          throw new Error('Failed to load product')
        }
        
        const product = await response.json()
        
        // Set form data from existing product
        setProductId(product.id)
        setForm({
          name: product.title || '',
          price: product.price?.toString() || '',
          description: product.description || '',
          curatorNote: product.curatorNote || '',
          tags: parseArrayField(product.tags),
          sizes: parseArrayField(product.sizes),
          colors: parseArrayField(product.colors),
          images: [],
          imagePreviews: [],
          existingImages: product.images || []
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading product:', error)
        alert('Failed to load product')
        router.push('/dashboard/curator/products')
      }
    }

    loadProduct()
  }, [params.id, router])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    const totalImages = form.images.length + form.existingImages.length
    if (validFiles.length + totalImages > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    const newImages = [...form.images, ...validFiles]
    setForm(prev => ({ ...prev, images: newImages }))

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm(prev => ({
          ...prev,
          imagePreviews: [...prev.imagePreviews, e.target?.result as string]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }))
  }

  const removeExistingImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const toggleColor = (color: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalImages = form.images.length + form.existingImages.length
    if (!form.name || !form.price || !form.description || totalImages === 0) {
      alert('Please fill in all required fields and have at least one image')
      return
    }

    setIsSubmitting(true)
    
    try {
      let allImages = [...form.existingImages]
      
      // Upload new images if any
      if (form.images.length > 0) {
        const formData = new FormData()
        form.images.forEach((image) => {
          formData.append('images', image)
        })
        formData.append('folder', 'store/products')

        console.log('Uploading new images to Supabase Storage...')
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error('Upload failed:', errorData)
          throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()
        console.log('Upload successful:', uploadData)
        
        const uploadedImages = uploadData.images.map((img: any) => ({
          url: img.url,
          altText: img.altText
        }))
        
        allImages = [...allImages.map(img => ({ url: img.url, altText: img.altText })), ...uploadedImages]
      } else {
        // No new images, just use existing ones
        allImages = form.existingImages.map(img => ({ url: img.url, altText: img.altText }))
      }

      // Update the product
      const productData = {
        title: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: 'Fashion', // Default category for now
        tags: form.tags.join(','),
        sizes: form.sizes.join(','),
        colors: form.colors.join(','),
        stockQuantity: 1, // Default stock
        curatorNote: form.curatorNote,
        images: allImages
      }

      console.log('Updating product...')
      const productResponse = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      if (!productResponse.ok) {
        const errorData = await productResponse.json()
        console.error('Product update failed:', errorData)
        throw new Error(errorData.error || 'Failed to update product')
      }

      const result = await productResponse.json()
      console.log('Product updated successfully:', result)
      
      // Show success message
      alert('Product updated successfully!')
      
      // Redirect to products page
      router.push('/dashboard/curator/products')
      
    } catch (error) {
      console.error('Error updating product:', error)
      alert(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
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
                href="/dashboard/curator/products"
                className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-light">Edit Product</h1>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
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
                <h2 className="font-serif text-xl font-light mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                      placeholder="e.g., Oversized Wool Coat"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                      placeholder="Describe the product, materials, fit, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why I Chose This Piece
                    </label>
                    <textarea
                      value={form.curatorNote}
                      onChange={(e) => setForm(prev => ({ ...prev, curatorNote: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                      placeholder="Share your personal thoughts on why this piece is special..."
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-serif text-xl font-light mb-6">Tags</h2>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                      placeholder="Add a tag (e.g., minimal, winter, oversized)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizes & Colors */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-serif text-xl font-light mb-6">Sizes & Colors</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Available Sizes</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                            form.sizes.includes(size)
                              ? 'bg-carbon text-white border-carbon'
                              : 'border-gray-300 text-gray-700 hover:border-carbon'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Available Colors</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                            form.colors.includes(color)
                              ? 'bg-carbon text-white border-carbon'
                              : 'border-gray-300 text-gray-700 hover:border-carbon'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
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
              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-serif text-xl font-light mb-6">Product Images *</h2>
                
                <div className="space-y-4">
                  {/* Existing Images */}
                  {form.existingImages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">Current Images</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {form.existingImages.map((image, index) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt={image.altText || `Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {(form.images.length + form.existingImages.length) < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-carbon transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload more images
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WebP up to 5MB each (max 5 images)
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* New Image Previews */}
                  {form.imagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">New Images</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {form.imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-serif text-xl font-light mb-6">Preview</h2>
                
                {form.name && form.price && (form.imagePreviews.length > 0 || form.existingImages.length > 0) ? (
                  <div className="space-y-4">
                    <img
                      src={form.imagePreviews[0] || form.existingImages[0]?.url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-carbon">{form.name}</h3>
                      <p className="font-serif text-lg font-light text-carbon">
                        ${parseFloat(form.price) || 0}
                      </p>
                      {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Preview will appear here</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !form.name || !form.price || (form.images.length + form.existingImages.length) === 0}
                  className="w-full py-3 px-6 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Product</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Your changes will be saved immediately
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  )
}
