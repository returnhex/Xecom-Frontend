import {
  ItemCondition,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ReturnStatus,
  ShipmentStatus,
} from "@/constants/enum";

// ========================================
// ORDER MANAGEMENT
// ========================================

export type TOrder = {
  id: string;
  tenantId?: string | null;
  customerId: string;
  addressId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  subtotal: string;
  taxAmount: string;
  shippingCost: string;
  discount: string;
  total: string;
  currency: string;
  notes?: string | null;
  internalNotes?: string | null;
  couponCode?: string | null;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  placedAt: string;
  updatedAt: string;
  customer?: {
    user?: {
      name?: string;
      email?: string;
      phoneNumber?: string;
    };
  };
  address?: {
    street?: string;
    postalCode?: string;
    thana?: {
      name?: string;
      district?: {
        name?: string;
        division?: {
          name?: string;
          country?: {
            name?: string;
          };
        };
      };
    };
  };
  orderItems?: TOrderItem[];
};

export type TOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product?: {
    name?: string;
    images?: {
      imageUrl: string;
      isFeatured: boolean;
    }[];
  };
  variant?: {
    sku?: string;
  };
};

export type TPayment = {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  provider: string;
  providerTransactionId?: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  failureReason?: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
};

export type TShipment = {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string | null;
  shippingMethod: string;
  status: ShipmentStatus;
  shippedAt?: string | null;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  cost?: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
};

export type TOrderReturn = {
  id: string;
  orderId: string;
  returnNumber: string;
  status: ReturnStatus;
  reason: string;
  refundAmount: string;
  restockingFee: string;
  approvedAt?: string | null;
  processedAt?: string | null;
  refundedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TReturnItem = {
  id: string;
  returnId: string;
  orderItemId: string;
  quantity: number;
  reason?: string | null;
  condition: ItemCondition;
};

export type TShippingMethod = {
  id: string;
  tenantId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  cost?: string | null;
  estimatedDays?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
