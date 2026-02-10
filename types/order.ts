/**
 * Type definitions for Order API
 * Used for order creation and management
 */

export type PaymentMethod = 'stripe' | 'yape' | 'plin';

export type OrderStatus = 
  | 'PENDING' 
  | 'PENDING_VERIFICATION'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'REJECTED'
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED'
  | 'REFUNDED';

/**
 * Item in cart for order creation
 */
export interface OrderItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  curatorId: string;
}

/**
 * Shipping address for order
 */
export interface ShippingAddressInput {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Request body for POST /api/orders
 */
export interface CreateOrderRequest {
  items: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  paymentMethod: PaymentMethod;
  transactionCode?: string;
  paymentProof?: string;
}

/**
 * Response from POST /api/orders
 */
export interface CreateOrderResponse {
  success: boolean;
  orders: Order[];
  message: string;
}

/**
 * Order with full relations
 */
export interface Order {
  id: string;
  buyerId: string;
  curatorId: string;
  status: string;
  totalAmount: number;
  commission: number;
  curatorAmount: number;
  paymentMethod: string | null;
  transactionCode: string | null;
  paymentProof: string | null;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  curator?: {
    id: string;
    storeName: string;
  };
}

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  product?: {
    id: string;
    title: string;
    images?: Array<{
      url: string;
      altText: string | null;
    }>;
  };
}

/**
 * Shipping address
 */
export interface ShippingAddress {
  id: string;
  orderId: string;
  name: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Order validation error
 */
export interface OrderValidationError {
  field: string;
  message: string;
}

/**
 * Error response from order API
 */
export interface OrderErrorResponse {
  error: string;
  details?: OrderValidationError[];
}
