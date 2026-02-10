'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Truck } from "lucide-react"
import { useT } from "@/hooks/useT"

interface OrderActionsProps {
  orderId: string
  status: string
  courier?: string | null
  trackingNumber?: string | null
  estimatedDeliveryDate?: Date | string | null
}

export function OrderActions({ 
  orderId, 
  status, 
  courier, 
  trackingNumber, 
  estimatedDeliveryDate
}: OrderActionsProps) {
  const router = useRouter()
  const t = useT()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const canCancel = status !== 'SHIPPED' && status !== 'DELIVERED' && status !== 'CANCELLED'
  const hasShippingInfo = status === 'SHIPPED' || status === 'DELIVERED'

  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('order.actions.cancelError'))
      }
      
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('order.actions.cancelError'))
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Shipping Information */}
      {hasShippingInfo && (courier || trackingNumber || estimatedDeliveryDate) && (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">{t('order.actions.shippingInfoTitle')}</h3>
            </div>
            <div className="space-y-2">
              {courier && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('order.actions.courier')}</span>
                  <span className="text-sm font-medium">{courier}</span>
                </div>
              )}
              {trackingNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('order.actions.trackingNumber')}</span>
                  <span className="text-sm font-medium font-mono">{trackingNumber}</span>
                </div>
              )}
              {estimatedDeliveryDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('order.actions.estimatedDelivery')}</span>
                  <span className="text-sm font-medium">
                    {new Date(estimatedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cancel Button */}
      {canCancel && !showConfirm && (
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
        >
          {t('order.actions.cancelOrder')}
        </Button>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <Card className="rounded-2xl border-destructive">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{t('order.actions.cancelTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {status === 'PAID' 
                  ? t('order.actions.cancelConfirmPaid')
                  : t('order.actions.cancelConfirmDefault')
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                {t('order.actions.keepOrder')}
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {isLoading ? t('order.actions.cancelling') : t('order.actions.confirmCancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
