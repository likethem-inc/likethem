'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, AlertCircle, ArrowRight, Package, CreditCard, QrCode } from 'lucide-react'
import { useT } from '@/hooks/useT'

interface OrderConfirmationProps {
  orderId?: string
  status?: string
}

export default function OrderConfirmationPage() {
  const t = useT()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const status = searchParams.get('status')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, fetchOrder])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          icon: Clock,
          title: t('orderConfirmation.paymentPending.title'),
          description: t('orderConfirmation.paymentPending.description'),
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'PAID':
        return {
          icon: CheckCircle,
          title: t('orderConfirmation.paymentConfirmed.title'),
          description: t('orderConfirmation.paymentConfirmed.description'),
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'REJECTED':
        return {
          icon: AlertCircle,
          title: t('orderConfirmation.paymentRejected.title'),
          description: t('orderConfirmation.paymentRejected.description'),
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: CheckCircle,
          title: t('orderConfirmation.orderConfirmed.title'),
          description: t('orderConfirmation.orderConfirmed.description'),
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
    }
  }

  const statusInfo = getStatusInfo(status || 'PENDING')

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Status Icon and Title */}
          <div className="mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 mb-6`}>
              <statusInfo.icon className={`w-10 h-10 ${statusInfo.color}`} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
              {statusInfo.title}
            </h1>
            <p className="text-lg text-warm-gray font-light mb-8 max-w-2xl mx-auto">
              {statusInfo.description}
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-50 rounded-lg p-8 mb-8"
            >
              <h2 className="font-serif text-2xl font-light mb-6">{t('orderConfirmation.orderDetails.title')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-medium mb-3">{t('orderConfirmation.orderInfo.title')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderConfirmation.orderInfo.orderId')}</span>
                      <span className="font-mono">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderConfirmation.orderInfo.date')}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderConfirmation.orderInfo.status')}</span>
                      <span className="capitalize">{order.status.replace('_', ' ').toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderConfirmation.orderInfo.total')}</span>
                      <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">{t('orderConfirmation.shippingAddress.title')}</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="font-medium mb-4">{t('orderConfirmation.itemsOrdered.title')}</h3>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
                      <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                          alt={item.product.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">{t('orderConfirmation.itemsOrdered.quantity', { quantity: item.quantity })}</p>
                        {item.size && <p className="text-sm text-gray-600">{t('orderConfirmation.itemsOrdered.size', { size: item.size })}</p>}
                        {item.color && <p className="text-sm text-gray-600">{t('orderConfirmation.itemsOrdered.color', { color: item.color })}</p>}
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {status === 'PENDING_PAYMENT' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-medium text-blue-800 mb-3">{t('orderConfirmation.nextSteps.title')}</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>{t('orderConfirmation.nextSteps.pending.step1')}</p>
                  <p>{t('orderConfirmation.nextSteps.pending.step2')}</p>
                  <p>{t('orderConfirmation.nextSteps.pending.step3')}</p>
                  <p>{t('orderConfirmation.nextSteps.pending.step4')}</p>
                </div>
              </div>
            )}

            {status === 'PAID' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-medium text-green-800 mb-3">{t('orderConfirmation.nextSteps.paid.title')}</h3>
                <div className="text-sm text-green-700 space-y-2">
                  <p>{t('orderConfirmation.nextSteps.paid.step1')}</p>
                  <p>{t('orderConfirmation.nextSteps.paid.step2')}</p>
                  <p>{t('orderConfirmation.nextSteps.paid.step3')}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center space-x-2 bg-carbon text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                <Package className="w-4 h-4" />
                <span>{t('orderConfirmation.actions.viewOrders')}</span>
              </Link>
              
              <Link
                href="/explore"
                className="inline-flex items-center space-x-2 bg-white text-carbon border border-carbon px-6 py-3 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{t('orderConfirmation.actions.continueShopping')}</span>
              </Link>
            </div>

            {/* Support Contact */}
            <div className="text-sm text-gray-500">
              <p>{t('orderConfirmation.support')}{' '}
                <a href={`mailto:${t('orderConfirmation.supportEmail')}`} className="text-carbon hover:underline">
                  {t('orderConfirmation.supportEmail')}
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 
