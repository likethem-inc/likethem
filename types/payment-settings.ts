/**
 * Payment Settings Types
 * Used across admin payment settings UI and API routes
 */

export interface PaymentSettings {
  id: string
  yapeEnabled: boolean
  yapePhoneNumber: string | null
  yapeQRCode: string | null
  yapeInstructions: string | null
  plinEnabled: boolean
  plinPhoneNumber: string | null
  plinQRCode: string | null
  plinInstructions: string | null
  stripeEnabled: boolean
  stripePublicKey: string | null
  stripeSecretKey: string | null
  defaultPaymentMethod: string
  commissionRate: number
  createdAt: string | Date
  updatedAt: string | Date
  updatedBy: string | null
}

export interface PaymentSettingsFormData {
  yapeEnabled: boolean
  yapePhoneNumber: string
  yapeQRCode: string | null
  yapeInstructions: string
  plinEnabled: boolean
  plinPhoneNumber: string
  plinQRCode: string | null
  plinInstructions: string
  stripeEnabled: boolean
  stripePublicKey: string
  stripeSecretKey: string
  defaultPaymentMethod: 'stripe' | 'yape' | 'plin'
  commissionRate: number
}

export interface PaymentSettingsUpdateRequest {
  yapeEnabled?: boolean
  yapePhoneNumber?: string
  yapeInstructions?: string
  plinEnabled?: boolean
  plinPhoneNumber?: string
  plinInstructions?: string
  stripeEnabled?: boolean
  stripePublicKey?: string
  stripeSecretKey?: string
  defaultPaymentMethod?: 'stripe' | 'yape' | 'plin'
  commissionRate?: number
}

export interface PaymentSettingsResponse {
  settings: PaymentSettings
}

export interface UploadQRResponse {
  message: string
  url: string
  paymentMethod: 'yape' | 'plin'
  settings: PaymentSettings
}

export type PaymentMethodType = 'stripe' | 'yape' | 'plin'

export interface PaymentMethodConfig {
  enabled: boolean
  phoneNumber?: string
  qrCode?: string
  instructions?: string
  publicKey?: string
  secretKey?: string
}
