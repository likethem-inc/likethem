'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MoreVertical, Eye, Edit, Trash2, Power } from 'lucide-react'

interface ProductDropdownMenuProps {
  productId: string
  isActive: boolean
  onStatusChange: (productId: string) => Promise<void>
  onDelete?: (productId: string) => void
}

export default function ProductDropdownMenu({
  productId,
  isActive,
  onStatusChange,
  onDelete
}: ProductDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      await onStatusChange(productId)
      setIsOpen(false)
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(productId)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-carbon transition-colors"
        disabled={isLoading}
        aria-label="Product actions menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* View */}
          <Link
            href={`/product/${productId}`}
            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Eye className="w-4 h-4" />
            <span>Ver producto</span>
          </Link>

          {/* Edit */}
          <Link
            href={`/dashboard/curator/products/${productId}/edit`}
            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </Link>

          {/* Divider */}
          <div className="my-1 border-t border-gray-200"></div>

          {/* Toggle Status */}
          <button
            onClick={handleToggleStatus}
            disabled={isLoading}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Power className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Cambiando...'
                : isActive
                ? 'Cambiar a Inactivo'
                : 'Cambiar a Activo'}
            </span>
          </button>

          {/* Delete (Optional) */}
          {onDelete && (
            <>
              <div className="my-1 border-t border-gray-200"></div>
              <button
                onClick={handleDelete}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
